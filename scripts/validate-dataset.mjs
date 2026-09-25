import fs from "node:fs";

const file = new URL("../data/exercises.json", import.meta.url);
const exercises = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const warnings = [];

if (!Array.isArray(exercises)) errors.push("Dataset is not an array.");
if (exercises.length !== 1155) errors.push(`Expected 1155 exercises, found ${exercises.length}.`);

const required = ["id","title","level","category","topic","statement","examples","starter_code","solution","tests","hints","concepts"];
const ids = new Set();
const titles = new Map();
const statements = new Map();

for (const e of exercises) {
  for (const key of required) {
    if (e[key] === undefined || e[key] === null || (typeof e[key] === "string" && !e[key].trim())) {
      errors.push(`Exercise ${e.id ?? "?"}: missing ${key}`);
    }
  }
  if (!Number.isInteger(e.id) || e.id < 1 || e.id > 1155) errors.push(`Invalid id: ${e.id}`);
  if (ids.has(e.id)) errors.push(`Duplicate id: ${e.id}`);
  ids.add(e.id);
  if (!Array.isArray(e.tests) || e.tests.length < 3) errors.push(`Exercise ${e.id}: fewer than 3 tests`);
  if (!Array.isArray(e.hints) || e.hints.length < 2) errors.push(`Exercise ${e.id}: fewer than 2 hints`);
  const title = String(e.title);
  const statement = String(e.statement);
  titles.set(title, (titles.get(title) || 0) + 1);
  statements.set(statement, (statements.get(statement) || 0) + 1);
}

for (let i=1;i<=1155;i++) if (!ids.has(i)) errors.push(`Missing id: ${i}`);
for (const [k,v] of titles) if (v>1) warnings.push(`Duplicate title x${v}: ${k}`);
for (const [k,v] of statements) if (v>5) warnings.push(`Repeated statement x${v}: ${k}`);

if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`VALID: ${exercises.length} exercises, ${ids.size} unique IDs.`);
