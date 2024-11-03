import { createSignal, createMemo, createEffect } from "@lucidity/core";

// Notice how we don't destructure props. This is because, much like Solid, this will break our reactivity system.
// It shouldn't matter when we just want static data like here, but it is a good practice to not destructure, just in case.
export default function Counter(props: { initial?: number }) {
    console.log("✨ Hey! Welcome to %c%s%c!", "color: #FFDA81", "Lucidity", "", "Notice how this is only logged once!");
    const [count, setCount] = createSignal(props.initial ?? 0);
    const preview = createMemo(() => count() + 1);
    createEffect(() => console.log("✨ Updated count:", count()));
    return <>
        <h1 style={{ "margin-bottom": 0, "letter-spacing": "-2px" }}>Welcome to Lucidity!</h1>
        <h4
            style={{ "margin-top": 0, "margin-bottom": "16px", "letter-spacing": "-0.25px", "font-weight": "normal" }}
        >
            Here's a little counter component, taking advantage of signals, memos, and <strong style={{ color: "#bd34fe" }}>Vite</strong>!
        </h4>
        <h4 style={{ "margin-top": 0, "margin-bottom": "16px", "letter-spacing": "-0.25px", "font-weight": "normal" }}>
            (Hint: check the console!)
        </h4>
        <div>Next number: {preview()}</div>
        <button style={{ "margin-top": "4px" }} onClick={() => setCount(count() + 1)}>
            Current is: {count()}
        </button>
    </>
}