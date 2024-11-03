# `@lucidity/compiler`
The Lucidity compiler is responsible for making Lucidity... well, Lucidity!

It does what it says in the name; it compiles JSX and reactivity to raw JS and DOM calls. This is mostly done in one file, `src/mod.ts`.

> Note that `src/main.ts` is just the CLI code, it uses the compiler API in `src/mod.ts`.

## API examples
```ts
import { lucidity } from "@lucidity/compiler";
const code = await Deno.readTextFile("./myTestFile.tsx");
const out = lucidity(code);
// The Lucidity compiler also transforms TypeScript, so it is always safe to output to a .js file.
await Deno.writeTextFile("./myTestFile.js", out);
```