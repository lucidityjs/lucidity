/**
 * This module is the CLI for the Lucidity compiler.
 * @module
 */

import { crayon } from "jsr:@crayon/crayon@4.0.0-alpha.4";
import deno from "../deno.json" with { type: "json" };
import { lucidity } from "./mod.ts";

if(Deno.args.length === 0 || Deno.args.includes("-h") || Deno.args.includes("--help")) {
    console.log(crayon.yellow.underline(
        "Lucidity* / compiler"
    ));
    console.log(crayon.yellow("  Limitless performance, effortlessly delivered."));
    console.log(crayon.yellow("  version", deno.version));
    console.log(crayon.lightWhite("  powered by \x1b]8;;https://deno.com\x1b\\Deno\x1b]8;;\x1b\\ 🦖"));
    console.log();
    const help = {
        "[input:string] [output:string]": `Compile ${crayon.bold("input")} into ${crayon.bold("output")}.`,
        "<no args>, -h, --help": "Show this help message"
    };
    const pad = Object.keys(help).sort((a, b) => b.length - a.length)[0].length + 3;
    for (const [args, msg] of Object.entries(help)) {
        console.log("    " + crayon.lightCyan(args.padEnd(pad)) + msg);
    }
    Deno.exit(0);
}

if(Deno.args.length === 1) {
    console.error("error: not enough arguments");
    Deno.exit(1);
}

const filename = Deno.args[0];
const outfile = Deno.args[1];
const contents = await Deno.readTextFile(filename);
await Deno.writeTextFile(outfile, lucidity(contents));