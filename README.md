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

## Current Limitations
While we try to iron out as many issues as possible, this project is still very early on in development. We appreciate any and all feedback! With that said, here are some limitations at the moment:
- Only one component per file is allowed
- Memos are a little buggy if there is a lot of nesting (may not ever be fixed; doesn't seem important)
- Compiler CLI options are limited
- No direct data fetching 
- With `@lucidity/vite`, HMR will just refresh the page whenever a file is updated
- No SSR support yet (basic support coming in v0.2)
- Reactivity between components is a little buggy (signals in props are not tracked in the DOM)

## License
Lucidity is licensed under the MIT license. Full license can be found at `LICENSE` in the root of this repository.