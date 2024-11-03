import { useState, useMemo, useEffect } from "react";

let step3_time = -1;
const step3_listener: MutationCallback = entries => {
    if(entries.some(x => ((x.target as Element).parentNode as Element).id === "count")) console.log("[bench:react] Step 3 took: " + (performance.now() - step3_time) + "ms.");
}

new MutationObserver(step3_listener).observe(document.body, { childList: true, subtree: true, characterData: true });

export default function Counter(props: { initial?: number }) {
    console.log("✨ Hey! Welcome to %c%s%c!", "color: rgb(88, 196, 220)", "React", "", "Notice how this is logged every single time you update the counter!");
    const [count, setCount] = useState(props.initial ?? 0);
    const preview = useMemo(() => count + 1, [count]);
    useEffect(() => console.log("✨ Updated count:", count), [count]);
    return <>
        <h1>Benchmark</h1>
        <h4>Here's some longer text, including some <strong style={{ color: "#bd34fe" }}>styled inline text</strong> right here.</h4>
        <h4 style={{ marginTop: 0, marginBottom: "16px", letterSpacing: "-0.25px", fontWeight: "normal" }}>
            Big style here
        </h4>
        <div>Next number: {preview}</div>
        <button id="count" style={{ marginTop: "4px" }} onClick={() => (step3_time = performance.now(), setCount(count + 1))}>
            Current is: {count}
        </button>
    </>
}