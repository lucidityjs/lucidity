// Results are manually generated.
import results from "./results.json" with { type: "json" };
import * as colors from "jsr:@std/fmt/colors";
const avg = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;
const lucidity = {
    step1: avg(results.lucidity.map(x => x[0] as number)),
    step2: avg(results.lucidity.map(x => x[1] as number)),
    step3: avg(results.lucidity.map(x => x[2] as number[]).flat()),
};

const solid = {
    step1: avg(results.solid.map(x => x[0] as number)),
    step2: avg(results.solid.map(x => x[1] as number)),
    step3: avg(results.solid.map(x => x[2] as number[]).flat()),
};

const react = {
    step1: avg(results.react.map(x => x[0] as number)),
    step2: avg(results.react.map(x => x[1] as number)),
    step3: avg(results.react.map(x => x[2] as number[]).flat()),
};

const f = {
    Lucidity: colors.rgb24("Lucidity", 0xFFF3D6),
    Solid: colors.rgb24("Solid", 0x4A7FC9),
    React: colors.rgb24("React", 0x58C4DC)
}

console.log("AVERAGES");
console.log(`${f.Lucidity} ~`);
console.log("1.", lucidity.step1 + "ms");
console.log("2.", lucidity.step2 + "ms");
console.log("3.", lucidity.step3 + "ms");
console.log("2.55kB (gzip: 1.20kB) over 1 JS file");
console.log();
console.log(`${f.Solid} ~`);
console.log("1.", solid.step1 + "ms");
console.log("2.", solid.step2 + "ms");
console.log("3.", solid.step3 + "ms");
console.log("9.85kB (gzip: 4.07kB) over 1 JS file");
console.log();
console.log(`${f.React} ~`);
console.log("1.", react.step1 + "ms");
console.log("2.", react.step2 + "ms");
console.log("3.", react.step3 + "ms");
console.log("143.66kB (gzip: 46.96kB) over 1 JS file");
console.log();
console.log();
console.log();
console.log("RESULTS");
console.log("-------");
console.log(`${f.Lucidity} is:`);
console.log("├┬> " + (solid.step1 / lucidity.step1) + `x faster than ${f.Solid} on step 1`);
console.log("│└> " + (react.step1 / lucidity.step1) + `x faster than ${f.React} on step 1`);
console.log("│");
console.log("├┬> " + (solid.step2 / lucidity.step2) + `x faster than ${f.Solid} on step 2`);
console.log("│└> " + (react.step2 / lucidity.step2) + `x faster than ${f.React} on step 2`);
console.log("│");
console.log("└┬> " + (solid.step3 / lucidity.step3) + `x faster than ${f.Solid} on step 3`);
console.log(" └> " + (react.step3 / lucidity.step3) + `x faster than ${f.React} on step 3`);
console.log();
console.log(`This ${f.Lucidity} app is:`);
console.log("├┬> " + (9.85 / 2.55) + `x smaller than ${f.Solid}`);
console.log("│└> " + (143.66 / 2.55) + `x smaller than ${f.React}`);
console.log("│");
console.log("└┬> " + (4.07 / 1.20) + `x smaller than ${f.Solid} when gzipped`);
console.log(" └> " + (46.96 / 1.20) + `x smaller than ${f.React} when gzipped`);
console.log();
console.log(`${f.Lucidity} is (on average):`);
console.log("└┬> " + avg([solid.step1 / lucidity.step1, solid.step2 / lucidity.step2, solid.step3 / lucidity.step3]) + "x faster than " + f.Solid);
console.log(" └> " + avg([react.step1 / lucidity.step1, react.step2 / lucidity.step2, react.step3 / lucidity.step3]) + "x faster than " + f.React);