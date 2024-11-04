<div align="center">
    <picture>
        <source srcset="./assets/dark.svg" media="(prefers-color-scheme: dark)">
        <img src="./assets/light.svg" height="72" alt="Lucidity logo">
    </picture>
</div>
<hr>
<h3 align="center">Limitless performance, effortlessly delivered.</h3>
Lucidity is an all-in-one JavaScript UI framework that takes advantage of modern JS features and a unique architecture to deliver extreme performance.

## Getting Started
Install [Deno](https://deno.com) (or upgrade to v2.x if you're not already on it; the example depends on it) and run the following in a new directory:
```sh
deno run -A npm:degit lucidityjs/lucidity/packages/example
```
Then, install dependencies:
```sh
deno install
```
Then, to start the dev server, run:
```sh
deno task dev
```
More instructions can be found in the README.md file of the example.

## How It Works
Lucidity uses a unique architecture to deliver such fantastic performance. It really just boils down to a powerful compiler. It takes in JSX and reactive functions from `@lucidity/core` and compiles them into variables (yes, **signals/memos compile directly into variables**) and raw DOM calls.

The compiler is accessible at `packages/compiler`.

## Performance
We have developed a benchmarking app, identical across Lucidity, Solid, and React. Each app is in a directory under `packages/benchmarks`. It is a basic counter app, measuring how long it takes to run a component, mount said component, update the DOM after a state change, and the final bundle size.
Here are the results as of November 2, 2024:
![Benchmark results](/assets/perf-graph.png)
The bundle sizes (not included in this graph) are:
### Bundle Sizes (lower is better)
|Library|Normal|Gzipped|
|-|-|-|
|Lucidity|2.55kB|1.20kB|
|Solid|9.85kB|4.07kB|
|React|143.66kB|46.96kB|

## Examples
Below are some basic examples of using different aspects of Lucidity:
### Counter (Props, Signals, Memos, Styles)
```tsx
import { createSignal, createMemo } from "@lucidity/core";
export default function Counter(props: { initial?: number }) {
    const [value, setValue] = createSignal(props.initial ?? 0);
    const up = createMemo(() => value() + 1);
    const down = createMemo(() => value() - 1);
    return <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
        <button onClick={() => setValue(value() - 1)}>👎 {down()}</button>
        <span>Count is: {value()}</span>
        <button onClick={() => setValue(value() + 1)}>👍 {up()}</button>
    </div>
}
```
### Random Number Generator (Signals, Effects, Fragments)
```tsx
import { createSignal, createEffect } from "@lucidity/core";
export default function RNG() {
    const [num, setNum] = createSignal(Math.random());
    createEffect(() => console.log("New number:", num()))
    return <>
        <button onClick={() => setNum(Math.random())}>Generate a new number</button> 
        <span>Current number is: {num()}</span>
    </>
}
```
### Calculator - Advanced (Signals, Memos, Effects)
> Note that this temporarily uses an odd syntax to "manually" track dependencies. This is because block statements in memos are a little buggy right now and do not properly track dependencies. This workaround should work for most scenarios until it is fixed.
```tsx
import { createSignal, createMemo, createEffect } from "@lucidity/core";
export default function Calculator() {
    const [lhs, setLHS] = createSignal(0);
    const [op, setOp] = createSignal<"+" | "-" | "*" | "/" | "%" | "**">("+");
    const [rhs, setRHS] = createSignal(0);
    const output = createMemo(() => {
        // a workaround: manually call accessors of the deps
        // this will be fixed in v0.2!!
        // note that this doesn't affect performance :)
        op(); lhs(); rhs();
        // parse the values (they are strings by default)
        let nl = +lhs();
        let nr = +rhs();
        switch (op()) {
            case "+": return nl + nr;
            case "-": return nl - nr;
            case "*": return nl * nr;
            case "/": return nl / nr;
            case "%": return nl % nr;
            case "**": return nl ** nr;
        }
    })
    return <>
        <input type="number" onInput={ev => setLHS(ev.target.value)} value={0} />
        <select onChange={ev => setOp(ev.target.value)}>
            <option>+</option>
            <option>-</option>
            <option>*</option>
            <option>/</option>
            <option>%</option>
            <option>**</option>
        </select>
        <input type="number" onInput={ev => setRHS(ev.target.value)} value={0} />
        <span>Output: {output()}</span>
    </>
}
```
### Mounting Components to the DOM (`mount`)
```ts
import Component from "./components/Component.tsx";
import { mount } from "@lucidity/core";

mount(document.body, () => Component({}))
```

## Current Limitations
While we try to iron out as many issues as possible, this project is still very early on in development. We appreciate any and all feedback! With that said, here are some limitations at the moment:
- Only one component per file is allowed
- Memos do not properly track dependencies if the function does not directly return an expression.
- Compiler CLI options are limited
- No direct data fetching 
- With `@lucidity/vite`, HMR will just refresh the page whenever a file is updated
- No SSR support yet (basic support coming in v0.2)
- Reactivity between components is a little buggy (signals in props are not tracked in the DOM)

## License
Lucidity is licensed under the MIT license. Full license can be found at `LICENSE` in the root of this repository.