# Vite + Lucidity + TS template
This package is a template for using Lucidity with Vite.

It uses a hybrid Deno/PNPM setup.

## Installing/Running
We use Deno for installing and running.
To install dependencies, run the following command:
```sh
deno install
```
To run the dev server, run the following command:
```sh
deno task dev
```
To update dependencies, we use `pnpm`:
```sh
pnpm update
deno install
```
Or, alternatively, run the following:
```sh
deno task upgrade
```
And to add new dependencies, we use both `pnpm` and `deno`:
```sh
# For NPM packages
pnpm add [-D] dep0 dep1 ... depn
# For JSR packages
pnpx jsr add [-D] @scope0/dep0 @scope1/dep1 ... @scopen/depn
# Always run deno install
deno install
```

## Notes
The main thing to point out here is that, if you check out `package.json`, there are zero `dependencies`. Only `devDependencies`.

This means that your (compiled) code is the only thing that is output.