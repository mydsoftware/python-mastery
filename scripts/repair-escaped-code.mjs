import fs from "node:fs";

const file = new URL("../data/exercises.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
let repaired = 0;
let changedTests = 0;

function normalize(value) {
  if (typeof value !== "string") return value;
  return value.replaceAll("\\\\n", "\n").replaceAll("\\\\t", "\t");
}

for (const e of data) {
  if (typeof e.solution === "string" && e.solution.includes("\\\\n")) {
    e.solution = normalize(e.solution);
    repaired++;
  }
  for (const test of e.tests ?? []) {
    if (typeof test.expected === "string" && test.expected.includes("\\\\n")) {
      test.expected = normalize(test.expected);
      changedTests++;
    }
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`REPAIRED escaped solutions=${repaired}; test outputs=${changedTests}`);
