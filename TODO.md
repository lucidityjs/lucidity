# TODOs for Lucidity
This document contains a list of tasks (including historical ones from previous releases) that we would like to complete before certain releases.

## TODOs for Lucidity before 1.0 release
- [ ] multiple components per file? (rfc?)
- [ ] proper HMR (not just page reloading)
- [ ] full ssr!! (with a twist...)
- [ ] real hydration
- [ ] SVG support (createElementNS, maybe $_eln)

## TODOs for Lucidity before 0.2 release
- [ ] full reactive component props (\$_c(el$n, () => props[x] or props.x) on props property access, dynamically get name of first arg)
- [ ] fix "dangling signals" (_lcdcl is initialized to another listener arr when $_c is called with a non-reactive fn) (this is really just adding _lcdcl = [] to the start of the $_c fn)
- [ ] automatic memoization
- [ ] better compiler interface
- [ ] basic ssr!!
- [ ] "hydration" (replaceWith(...)) (yes this is hydration - said nobody ever)
- [ ] `isServer` inline from core
- [ ] `createResource` and related functions (something like const x = createResource(pfn) -> const [x, ressetter\$x] = createSignal(); pfn.then(resval => ressetter\$x(resval)).catch(resval => ressetter\$x(resval))) (maybe handle errors differently? rfc?)
- [ ] `@lucidity/components` package for utility components like `For`, `If` (and `Then`/`Else`), `Show`, `ClientOnly` (and maybe `<Suspense>`? integration w/ createResource?) that are *not* inlined - just a normal package (would serve as a good example of how to write libraries)
- [ ] reactive attrs on DOM els

## TODOs for Lucidity before 0.1 release
- [x] JSX children (x\$n.append(...) for text nodes and DOM nodes, _lcdcl = sigl\$y, \$_c(x\$n, sig\$y) for signal getters)
- [x] basic component props
- [x] memos
- [x] effects
- [x] setters (e.g. setMySig(x) -> (sig$mySig = x, $_e(sig\$mySig, sigl\$mySig)))
- [x] non-reactivity core functions (e.g. mount(...))
- [x] jsx attr mappings and distinction between properties on `Node`s and attributes
- [x] jsx typedefs
- [x] core typedefs
- [x] style objects (e.g. style={{ "margin-top": "5px" }} -> Object.assign(el$n.style, { "margin-top": "5px" }))
- [x] dev server w/ vite