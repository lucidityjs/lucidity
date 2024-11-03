import "./index.css";
import { createRoot } from "react-dom/client";
import Counter from "./components/Counter.tsx";

// Step 1: Run the component
const step1_time = performance.now();
const run_comp = <Counter />;
console.log("[bench:react] Step 1 took: " + (performance.now() - step1_time) + "ms.");

// Step 2: Mount the component
const step2_time = performance.now();
createRoot(document.getElementById('root')!).render(run_comp);
console.log("[bench:react] Step 2 took: " + (performance.now() - step2_time) + "ms.");
