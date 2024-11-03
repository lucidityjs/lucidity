# `@lucidity/core`
Typedefs for Lucidity core functions.

> Note that this package is quite literally just typedefs; implementations are in the compiler.
> In fact, though, `createX` (reactive) functions and `mount` have zero implementation. Reactive functions compile to variables, and `mount` compiles to DOM calls.

## Examples
```tsx
import { createSignal } from "@lucidity/core";

export default function Counter() {
    const [count, setCount] = createSignal(0);
    return <button onClick={() => setCount(count() + 1)}>Count is {count()}</button>
}
```
