import { createSignal, createMemo, createEffect } from "solid-js";

let step3_time = -1;
const step3_listener: MutationCallback = entries => {
    if(entries.some(x => (x.target as any).parentNode.id === "count")) console.log("[bench:solid] Step 3 took: " + (performance.now() - step3_time) + "ms.");
}

new MutationObserver(step3_listener).observe(document.body, { childList: true, subtree: true, characterData: true });

export default function Counter(props: { initial?: number }) {
    console.log("✨ Hey! Welcome to %c%s%c!", "color: #3A6FB6", "Solid", "", "Notice how this is only logged once!");
    const [count, setCount] = createSignal(props.initial ?? 0);
    const preview = createMemo(() => count() + 1);
    createEffect(() => console.log("✨ Updated count:", count()));
    return <>
        <h1>Benchmark</h1>
        <h4>Here's some longer text, including some <strong style={{ color: "#bd34fe" }}>styled inline text</strong> right here.</h4>
        <h4 style={{ "margin-top": 0, "margin-bottom": "16px", "letter-spacing": "-0.25px", "font-weight": "normal" }}>
            Big style here
        </h4>
        <div>Next number: {preview()}</div>
        <button id="count" style={{ "margin-top": "4px" }} onClick={() => (step3_time = performance.now(), setCount(count() + 1))}>
            Current is: {count()}
        </button>
    </>
}