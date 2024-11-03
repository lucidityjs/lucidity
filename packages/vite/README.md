# `@lucidity/vite`
The official Vite plugin for Lucidity. It is a very lightweight wrapper around the compiler currently.

## Examples
```ts
import lucidity from "@lucidity/vite";

export default {
    plugins: [lucidity()]
} satisfies import("vite").UserConfig;
```
