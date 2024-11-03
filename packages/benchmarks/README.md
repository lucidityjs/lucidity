# Lucidity, React, and Solid Benchmarks
This directory contains a basic counter benchmark for Lucidity, React, and Solid.
It is the exact same implementation across all three (with minor modifications for React as it has different naming conventions).

Each benchmark measures (precisely, with `performance`):
1. The time it takes to run the component itself for the first time.
2. The time it takes to just mount the run component from step 1.
3. The time it takes from the click event to be fired to the DOM nodes updating (not just state/signals).

For #3, press the button 10 times (until preview says 11 and the button says 10).

And run each benchmark three times and insert all of the results into `results.json`. Then, run `avg.ts` (in this directory) to get an idea of the comparisons. Note that you will need to add the bundle sizes manually in `avg.ts`.

Note that the benchmarks should always be run in development mode (with `deno task dev`) with no extra arguments or changes to any part of any file.

These three measurements should paint a good picture of the performance of each in many different situations.

More benchmarks may come in the future.