import "./style.css";
import { mount } from "@lucidity/core";
import Counter from "./components/Counter.tsx";

// Step 1: Run the component
const step1_time = performance.now();
const run_comp = Counter({});
console.log("[bench:lucidity] Step 1 took: " + (performance.now() - step1_time) + "ms.");

// Step 2: Mount the component
const step2_time = performance.now();
mount(document.querySelector("#app")!, () => run_comp);
console.log("[bench:lucidity] Step 2 took: " + (performance.now() - step2_time) + "ms.");
