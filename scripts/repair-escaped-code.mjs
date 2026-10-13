import fs from "node:fs";
import vm from "node:vm";

const file = new URL("../data/exercises.json", import.meta.url);
const data = JSON.parse(fs.readFileSync(file, "utf8"));
let repaired = 0;
let changedTests = 0;

function normalizeCode(value) {
  if (typeof value !== "string") return value;
  return value.replaceAll("\\\\n", "\n").replaceAll("\\\\t", "\t");
}

for (const e of data) {
  const original = e.solution;
  try {
    new vm.Script(original);
  } catch {
    const fixed = normalizeCode(original);
    if (fixed !== original) {
      try {
        new vm.Script(fixed);
        e.solution = fixed;
        repaired++;
      } catch {}
    }
  }
  for (const test of e.tests ?? []) {
    if (typeof test.expected === "string" && test.expected.includes("\\n")) {
      const fixed = test.expected.replaceAll("\\\\n", "\n").replaceAll("\\\\t", "\t");
      if (fixed !== test.expected) {
        test.expected = fixed;
        changedTests++;
      }
    }
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`REPAIRED escaped solutions=${repaired}; test outputs=${changedTests}`);
