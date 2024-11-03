/**
 * This module is the Lucidity compiler itself, used by the CLI.
 * @module
 */

import * as parser from "npm:@babel/parser@7.26.2";
// @deno-types="npm:@types/babel__generator@7.6.8"
import gen from "npm:@babel/generator@7.26.2";
// @deno-types="npm:@types/babel__traverse@7.20.6"
import traverse from "npm:@babel/traverse@7.25.9";
import * as t from "npm:@babel/types@7.26.0";
// @deno-types="npm:@types/babel__core@7.20.5"
import babelTransform from "npm:@babel/core@7.26.0";
import tsPlugin from "npm:@babel/plugin-transform-typescript@7.25.9";
import { DOM_ATTRS } from "./constants.ts";

type Function = t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression;

/**
 * Transforms Lucidity (TSX) code.
 * @param code The code to transform.
 * @returns The transformed code.
 */
export function lucidity(code: string): string {
    const ast: t.File = parser.parse(code, {
        allowAwaitOutsideFunction: true,
        sourceType: "module",
        plugins: ["typescript", "jsx"],
        attachComment: true
    });

    // if(ast.comments?.[0]?.value?.trim?.() === "@lucidity/ignore") {
    //     if(!Deno.args.includes("--force-out")) console.warn("warn: whole file is ignored, not outputting. include --force-out to output an empty file.");
    //     if(Deno.args.includes("--force-out")) await Deno.writeTextFile(outfile, "");
    //     Deno.exit(0);
    // }

    const def = (x: t.Statement) => x.type === "ExportDefaultDeclaration" && (
        x.declaration.type === "ArrowFunctionExpression" ||
        x.declaration.type === "FunctionDeclaration" ||
        x.declaration.type === "FunctionExpression"
    );

    const beforeFunc = ast.program.body.slice(0, ast.program.body.findIndex(def));

    const imported: string[] = [];

    for (let i = 0; i < beforeFunc.length; i++) {
        const stmt = beforeFunc[i];
        if(stmt.type === "ImportDeclaration" && stmt.source.value === "@lucidity/core") {
            imported.push(...stmt.specifiers.filter(x => x.type === "ImportSpecifier" && x.imported.type === "Identifier").map(x => ((x as t.ImportSpecifier).imported as t.Identifier).name));
            beforeFunc.splice(i, 1);
        }
    }

    const func = ((ast.program.body.find(def) as t.ExportDefaultDeclaration)?.declaration as Function);

    const body = func ? (func.body.type === "BlockStatement" ? func.body.body : [t.expressionStatement(func.body)]) : [];

    const registry: Record<string, number> = {};
    const next = (elType: string) => registry[elType] != null ? ++registry[elType] : registry[elType] = 0;
    const signals: [get: string, set: string][] = [];

    const out: t.Statement[] = [];
    let effect = 0;
    let deps: string[] = [];
    let depsUsed = false;
    const inlines: Record<string, (args: t.CallExpression['arguments']) => t.Expression> = {
        mount(args) {
            return t.callExpression(
                t.memberExpression(
                    args[0] as t.Expression,
                    t.identifier("append")
                ),
                // ...(x => Array.isArray(x) ? x : [x])(arg)
                [t.spreadElement(t.callExpression(
                    t.arrowFunctionExpression(
                        [t.identifier("x")],
                        t.conditionalExpression(
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier("Array"),
                                    t.identifier("isArray")
                                ),
                                [t.identifier("x")]
                            ),
                            t.identifier("x"),
                            t.arrayExpression([t.identifier("x")])
                        )
                    ),
                    [t.callExpression(args[1] as t.Expression, [])]
                ))]
            );
        }
    }

    for (const stmt of ast.program.body) {
        if(stmt.type !== "ExportDefaultDeclaration") traverse.default(t.file(t.program([stmt])), { Expression(path) { path.replaceWith(transform(path.node as t.Expression)); } });
    }

    for (const stmt of body) {
        if(stmt.type !== "ReturnStatement" && stmt.type !== "ExpressionStatement" && stmt.type !== "VariableDeclaration") continue;
        if(stmt.type === "ReturnStatement") {
            if(stmt.argument != null) {
                stmt.argument = transform(stmt.argument);
                out.push(stmt);
                break;
            }
            else throw new TypeError("Unexpected empty return statement in top level of non-ignored component " + ((func as t.FunctionDeclaration | t.FunctionExpression)?.id?.name ?? "<anonymous>"));
        }
        if(stmt.type === "VariableDeclaration") {
            const d = stmt.declarations[0];
            if(d.id.type === "ArrayPattern" && d.init && d.init.type === "CallExpression" && d.init.callee.type === "Identifier" && d.init.callee.name === "createSignal" && imported.includes("createSignal")) {
                const { name } = (d.id.elements[0] as t.Identifier);
                const { name: setName } = (d.id.elements[1] as t.Identifier);
                out.push(t.variableDeclaration("let", [
                    t.variableDeclarator(t.identifier("sig$" + name), d.init.arguments[0] as t.Expression),
                ]));
                out.push(t.variableDeclaration("let", [
                    t.variableDeclarator(t.identifier("sigl$" + name), t.arrayExpression()),
                ]));
                signals.push([name, setName]);
                continue;
            } else if(d.id.type === "Identifier" && d.init && d.init.type === "CallExpression" && d.init.callee.type === "Identifier" && d.init.callee.name === "createMemo" && imported.includes("createMemo")) {
                // memos are lies- they are really just a signal and an effect
                // prevents repetitive code or confusion
                const { name } = d.id;
                deps = [];
                depsUsed = true;
                const transformed = transform(d.init.arguments[0] as t.Expression);
                depsUsed = false;
                out.push(t.variableDeclaration("let", [
                    t.variableDeclarator(t.identifier("sig$" + name), t.callExpression(transformed, []) as t.Expression),
                ]));
                out.push(t.variableDeclaration("let", [
                    t.variableDeclarator(t.identifier("sigl$" + name), t.arrayExpression()),
                ]));
                signals.push([name, "memo_setter$" + name]);
                imported.push("createEffect");
                out.push(t.expressionStatement(transform(t.callExpression(
                    t.identifier("createEffect"),
                    [arrow(
                        t.callExpression(
                            t.identifier("memo_setter$" + name),
                            [t.callExpression(transformed, [])]
                        )
                    )]
                ), undefined, deps)));
                continue;
            }
            out.push(stmt);
            continue;
        }
        out.push(t.expressionStatement(transform(stmt.expression)));
    }

    function decl(name: string, initializer?: t.Expression) {
        out.push(t.variableDeclaration("let", [t.variableDeclarator(t.identifier(name), initializer)]));
    }

    function transform(expr: t.Expression | t.JSXIdentifier | t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXEmptyExpression, noTraverse?: true, forceDeps?: string[]): t.Expression {
        switch(expr.type) {
            case "ArrowFunctionExpression": {
                if(expr.body.type === "BlockStatement") {
                    expr.body = t.blockStatement(expr.body.body.map(x => x.type === "ExpressionStatement" ? t.expressionStatement(transform(x.expression)) : x));
                } else {
                    expr.body = transform(expr.body);
                }
                return expr;
            }
            case "CallExpression":
                if(expr.callee.type === "Identifier" && expr.callee.name === "createEffect" && imported.includes("createEffect")) {
                    deps = [];
                    depsUsed = true;
                    const transformed = transform(expr.arguments[0] as t.ArrowFunctionExpression);
                    depsUsed = false;
                    if(forceDeps) deps = forceDeps;
                    const name = "effect$" + effect++ + "$" + deps.join("__");
                    decl(name, transformed);
                    const result = t.sequenceExpression(deps.map(x => t.callExpression(
                        t.memberExpression(
                            t.identifier("sigl$" + x),
                            t.identifier("push")
                        ),
                        [t.identifier(name)]
                    )));
                    return result;
                }
                if(expr.callee.type === "Identifier" && expr.callee.name in inlines && imported.includes(expr.callee.name)) {
                    return inlines[expr.callee.name](expr.arguments);
                }
                if(signals.find(([g]) => g === (expr.callee as t.Identifier).name)) { // getter
                    if(depsUsed) deps.push((expr.callee as t.Identifier).name);
                    return t.identifier("sig$" + (expr.callee as t.Identifier).name);
                } else if(signals.find(([,s]) => s === (expr.callee as t.Identifier).name)) { // setter
                    const name = signals.find(([,s]) => s === (expr.callee as t.Identifier).name)![0];
                    return t.sequenceExpression([
                        t.assignmentExpression(
                            "=",
                            t.identifier("sig$" + name),
                            transform(expr.arguments[0] as t.Expression)
                        ),
                        t.callExpression(
                            t.identifier("$_e"),
                            [t.identifier("sig$" + name), t.identifier("sigl$" + name)]
                        )
                    ])
                }
                break;
            case "FunctionExpression":
            case "ArrayExpression":
            case "AssignmentExpression":
            case "BinaryExpression":
            case "ConditionalExpression":
            case "Identifier":
            case "StringLiteral":
            case "NumericLiteral":
            case "NullLiteral":
            case "BooleanLiteral":
            case "RegExpLiteral":
            case "LogicalExpression":
            case "MemberExpression":
            case "NewExpression":
            case "ObjectExpression":
            case "SequenceExpression":
            case "ParenthesizedExpression":
            case "ThisExpression":
            case "UnaryExpression":
            case "UpdateExpression":
            case "ClassExpression":
            case "ImportExpression":
            case "MetaProperty":
            case "Super":
            case "TaggedTemplateExpression":
            case "TemplateLiteral":
            case "YieldExpression":
            case "AwaitExpression":
            case "Import":
            case "BigIntLiteral":
            case "OptionalMemberExpression":
            case "OptionalCallExpression":
            case "TypeCastExpression":
                break;
            case "JSXElement": {
                const oName = expr.openingElement.name;
                const callee = (() => {
                    switch (oName.type) {
                        case "JSXIdentifier":
                            return t.identifier(oName.name);
                        case "JSXMemberExpression":
                            return oName as unknown as t.MemberExpression;
                        case "JSXNamespacedName":
                            return null!;
                    }
                })();
                const isDOM = oName.type === "JSXIdentifier" && oName.name[0]?.toLowerCase() === oName.name[0];
                const name = isDOM ? oName.name : "__custom__";
                const id = next(name);
                const varName = name + "$" + id;
                decl(varName, isDOM ? t.callExpression(t.identifier("$_el"), [t.stringLiteral(name)]) : t.callExpression(callee, [t.objectExpression([
                    ...[...expr.openingElement.attributes, t.jsxAttribute(t.jsxIdentifier("children"), t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), expr.children))].map(x => {
                        // TODO automatic memos
                        if(x.type === "JSXSpreadAttribute") {
                            return t.spreadElement(x.argument);
                        } else {
                            if(x.value && x.value.type === "JSXFragment") {
                                for (const ch of x.value.children)
                                    if(
                                        ch.type === "JSXExpressionContainer" &&
                                        ch.expression.type === "CallExpression" &&
                                        ch.expression.callee.type === "Identifier" &&
                                        signals.find(([g]) => (((ch as t.JSXExpressionContainer).expression as t.CallExpression).callee as t.Identifier).name === g)
                                    ) {
                                        if(depsUsed) deps.push("sig$" + ch.expression.callee.name);
                                        return t.objectMethod(
                                            "get",
                                            x.name.type === "JSXIdentifier" ? t.identifier(x.name.name) : t.stringLiteral(x.name.namespace + ":" + x.name.name),
                                            [],
                                            t.blockStatement([
                                                t.returnStatement(t.sequenceExpression([
                                                    t.assignmentExpression(
                                                        "=",
                                                        t.identifier("_lcdcl"),
                                                        t.identifier("sigl$" + ch.expression.callee.name)
                                                    ),
                                                    t.identifier("sig$" + ch.expression.callee.name)
                                                ]))
                                            ])
                                        );
                                    }
                            } else if(
                                x.value &&
                                x.value.type === "JSXExpressionContainer" &&
                                x.value.expression.type === "CallExpression" &&
                                x.value.expression.callee.type === "Identifier" &&
                                signals.find(([g]) => (((x.value as t.JSXExpressionContainer).expression as t.CallExpression).callee as t.Identifier).name === g)
                            ) {
                                if(depsUsed) deps.push("sig$" + x.value.expression.callee.name);
                                return t.objectMethod(
                                    "get",
                                    x.name.type === "JSXIdentifier" ? t.identifier(x.name.name) : t.stringLiteral(x.name.namespace + ":" + x.name.name),
                                    [],
                                    t.blockStatement([
                                        t.returnStatement(t.sequenceExpression([
                                            t.assignmentExpression(
                                                "=",
                                                t.identifier("_lcdcl"),
                                                t.identifier("sigl$" + x.value.expression.callee.name)
                                            ),
                                            t.identifier("sig$" + x.value.expression.callee.name)
                                        ]))
                                    ])
                                );
                            }
                            return t.objectProperty(
                                x.name.type === "JSXIdentifier"
                                    ? t.identifier(x.name.name)
                                    : t.stringLiteral(x.name.namespace + ":" + x.name.name),
                                transform(x.value ?? t.booleanLiteral(true))
                            );
                        }
                    })
                ])]));
                if(isDOM) {
                    out.push(
                        ...expr.openingElement.attributes.map(x => {
                            switch (x.type) {
                                case "JSXAttribute": {
                                    const name = x.name.name as string;
                                    return [DOM_ATTRS.includes(name) || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? t.stringLiteral(name) : t.identifier(name), x.value ? transform(x.value) : t.booleanLiteral(true)] as [t.Identifier | t.StringLiteral, t.Expression];
                                }
                                case "JSXSpreadAttribute":
                                    return x.argument;
                                }
                        }).map(x => {
                            if(Array.isArray(x)) {
                                // e.g. <x style={{ "margin-top": "5px" }} />
                                if(
                                    ((x[0].type === "Identifier" && x[0].name === "style") ||
                                    (x[0].type === "StringLiteral" && x[0].value === "style")) &&
                                    x[1].type === "ObjectExpression"
                                ) {
                                    return t.callExpression(
                                        t.memberExpression(
                                            t.identifier("Object"),
                                            t.identifier("assign")
                                        ),
                                        [
                                            t.memberExpression(
                                                t.identifier(varName),
                                                t.identifier("style")
                                            ),
                                            x[1]
                                        ]
                                    )
                                }
                                if(x[0].type === "StringLiteral" && DOM_ATTRS.includes(x[0].value)) {
                                    return t.callExpression(
                                        t.memberExpression(t.identifier(varName), t.identifier("setAttribute")),
                                        [x[0], (x[1].type === "BooleanLiteral" && x[1].value) ? t.stringLiteral("") : x[1]]
                                    );
                                }

                                return t.assignmentExpression(
                                    "=",
                                    t.memberExpression(t.identifier(varName), (x[0].type === "Identifier" && x[0].name.startsWith("on")) ? t.identifier(x[0].name.toLowerCase()) : x[0], x[0].type === "StringLiteral"),
                                    transform(x[1])!
                                );
                            } else {
                                // TODO: spread .setAttribute calls for v1 release(?)
                                return t.callExpression(
                                    t.memberExpression(t.identifier(varName), t.identifier("append")),
                                    [transform(x as t.Expression)!]
                                )
                            }
                        }).map(t.expressionStatement),
                        ...expr.children.map((x, i, { length: len }) => {
                            switch (x.type) {
                                case "JSXElement":
                                case "JSXFragment":
                                    return t.callExpression(
                                        t.memberExpression(
                                            t.identifier(varName),
                                            t.identifier("append")
                                        ),
                                        [transform(x)]
                                    );
                                case "JSXExpressionContainer": {
                                    // TODO: auto-generate memos if expressioncontainer is not just a sig() expression
                                    if(x.expression.type === "CallExpression" && signals.find(([g]) => g === ((x.expression as t.CallExpression).callee as t.Identifier).name)) {
                                        if(depsUsed) deps.push("sig$" + (x.expression.callee as t.Identifier).name);
                                        return t.sequenceExpression([
                                            t.assignmentExpression(
                                                "=",
                                                t.identifier("_lcdcl"),
                                                t.identifier("sigl$" + (x.expression.callee as t.Identifier).name)
                                            ),
                                            t.callExpression(
                                                t.identifier("$_c"),
                                                [t.identifier(varName), arrow(t.identifier("sig$" + (x.expression.callee as t.Identifier).name))]
                                            )
                                        ])
                                    }
                                    return t.callExpression(
                                        t.memberExpression(
                                            t.identifier(varName),
                                            t.identifier("append")
                                        ),
                                        [transform(x.expression)]
                                    );
                                }
                                case "JSXSpreadChild":
                                    return t.callExpression(
                                        t.memberExpression(
                                            t.identifier(varName),
                                            t.identifier("append")
                                        ),
                                        [t.spreadElement(transform(x.expression))]
                                    );
                                case "JSXText":
                                    if(x.value.trim() !== "") return t.callExpression(
                                        t.memberExpression(
                                            t.identifier(varName),
                                            t.identifier("append")
                                        ),
                                        [t.stringLiteral(
                                            (i === 0 && len === 1 // only child
                                                ? x.value.trim()
                                                : i === 0
                                                    ? x.value.trimStart()
                                                    : i === (len - 1) // last child
                                                        ? x.value.trimEnd()
                                                        : x.value) // anything in the middle
                                            .replace(/\s+/g, " ") // normalize multiple whitespaces to a single space
                                        )]
                                    );
                            }
                        // @ts-expect-error: Boolean is not properly typedefed for this use case
                        }).filter(Boolean).map(x => t.expressionStatement(x)),
                    );
                }
                return t.identifier(varName);
            }
            case "JSXFragment": {
                return t.arrayExpression(expr.children.map(x => transform(x))!);
            }
            case "JSXExpressionContainer": {
                if(expr.expression.type !== "JSXEmptyExpression") return expr.expression;
                return t.identifier("undefined");
            }
            case "JSXSpreadChild": {
                return expr.expression;
            }
            case "JSXText": {
                return t.stringLiteral(expr.value.replace(/\s+/g, " "));
            }
            case "JSXIdentifier": {
                return t.identifier(expr.name);
            }
            case "JSXEmptyExpression": {
                return t.valueToNode(undefined);
            }
            case "BindExpression":
            case "DoExpression":
            case "RecordExpression":
            case "TupleExpression":
            case "DecimalLiteral":
            case "ModuleExpression":
            case "TopicReference":
            case "PipelineTopicExpression":
            case "PipelineBareFunction":
            case "PipelinePrimaryTopicReference":
            case "TSInstantiationExpression":
            case "TSAsExpression":
            case "TSSatisfiesExpression":
            case "TSTypeAssertion":
            case "TSNonNullExpression":
                break;
        }
        if(!noTraverse) traverse.default(t.file(t.program([t.expressionStatement(expr)])), { Expression(path) { path.replaceWith(transform(path.node as never, true)) } });
        return expr;
    }

    function arrow(expr: t.Expression): t.ArrowFunctionExpression {
        return t.arrowFunctionExpression([], expr);
    }

    if(func) func.body = t.blockStatement(out);

    ast.program.body = [
        // globalThis._lcdcl ??= [];
        t.expressionStatement(t.assignmentExpression(
            "??=",
            t.memberExpression(t.identifier("globalThis"), t.identifier("_lcdcl")),
            t.arrayExpression()
        )),
        // let $_el = /*#__PURE__*/ (...a) => document.createElement(...a);
        t.variableDeclaration("let", [t.variableDeclarator(
            t.identifier("$_el"),
            t.addComment(
                t.callExpression(
                    t.memberExpression(
                        t.memberExpression(t.identifier("document"), t.identifier("createElement")),
                        t.identifier("bind")
                    ),
                    [t.identifier("document")]
                ),
                "leading",
                "#__PURE__"
            )
        )]),
        // let $_c = (x, v) => {
        //     let i = x.childNodes.length;
        //     x.append(v());
        //     return _lcdcl.push(v => x.childNodes[i].replaceWith?.(v));
        // }
        t.variableDeclaration("let", [t.variableDeclarator(
            t.identifier("$_c"),
            t.arrowFunctionExpression(
                [t.identifier("x"), t.identifier("v")],
                t.blockStatement([
                    t.variableDeclaration(
                        "let",
                        [t.variableDeclarator(
                            t.identifier("i"),
                            t.memberExpression(
                                t.memberExpression(t.identifier("x"), t.identifier("childNodes")),
                                t.identifier("length")
                            )
                        )]
                    ),
                    t.expressionStatement(t.callExpression(
                        t.memberExpression(t.identifier("x"), t.identifier("append")),
                        [t.callExpression(t.identifier("v"), [])]
                    )),
                    // we return so that minifers can optimize it into a (sequence, expression, like, this)
                    t.returnStatement(t.callExpression(
                        t.memberExpression(
                            t.identifier("_lcdcl"),
                            t.identifier("push")
                        ),
                        [t.arrowFunctionExpression(
                            [t.identifier("v")],
                            t.optionalCallExpression(
                                t.memberExpression(
                                    t.memberExpression(
                                        t.memberExpression(
                                            t.identifier("x"),
                                            t.identifier("childNodes")
                                        ),
                                        t.identifier("i"),
                                        true
                                    ),
                                    t.identifier("replaceWith")
                                ),
                                [t.identifier("v")],
                                true
                            )
                        )]
                    ))
                ])
            )
        )]),
        // let $_e = (x, y) => y.map(y => y(x));
        t.variableDeclaration("let", [t.variableDeclarator(
            t.identifier("$_e"),
            t.arrowFunctionExpression(
                [t.identifier("x"), t.identifier("y")],
                t.callExpression(
                    t.memberExpression(t.identifier("y"), t.identifier("map")),
                    [t.arrowFunctionExpression(
                        [t.identifier("y")],
                        t.callExpression(t.identifier("y"), [t.identifier("x")])
                    )],
                )
            ),
        )]),
        ...ast.program.body.filter(x => !(x.type === "ImportDeclaration" && x.source.value === "@lucidity/core"))
    ];
    return gen.default(babelTransform.transformSync(gen.default(ast).code, {
        plugins: [tsPlugin],
        ast: true
    })!.ast!, { sourceMaps: true }).code;
}