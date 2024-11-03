import "./index.css";
import { render } from 'solid-js/web';
import Counter from "./components/Counter.tsx";

// Step 1: Run the component
const step1_time = performance.now();
const run_comp = <Counter />;
console.log("[bench:solid] Step 1 took: " + (performance.now() - step1_time) + "ms.");

// Step 2: Mount the component
const step2_time = performance.now();
render(() => run_comp, document.getElementById("root")!);
console.log("[bench:solid] Step 2 took: " + (performance.now() - step2_time) + "ms.");