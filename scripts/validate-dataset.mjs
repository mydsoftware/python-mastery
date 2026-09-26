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
const solutions = new Map();
const testSignatures = new Map();
const expectedCategories = {
  "مبانی Python":32,"متغیرها و انواع داده":32,"ورودی/خروجی":32,"شرط‌ها":32,
  "حلقه‌ها":32,"رشته‌ها":32,"List":32,"Tuple":32,
  "Set":31,"Dictionary":31,"Functions":31,"Lambda":31,"Scope":31,"Modules":31,
  "Exceptions":31,"Files":31,"OOP":31,"Inheritance":31,"Iterator / Generator":31,
  "Decorator":31,"Context Manager":31,"Regex":31,"JSON":31,"Date/Time":31,
  "الگوریتم‌ها":31,"Recursion":31,"Stack / Queue":31,"Tree / Graph":31,"Async":31,
  "Type Hints":31,"Dataclass / Enum":31,"SQLite":31,"Networking":31,"Testing":31,
  "Performance":31,"Security":31,"پروژه‌های ترکیبی":31
};
const categoryCounts = new Map();

for (const e of exercises) {
  for (const key of required) {
    if (e[key] === undefined || e[key] === null || (typeof e[key] === "string" && !e[key].trim())) {
      errors.push(`Exercise ${e.id ?? "?"}: missing ${key}`);
    }
  }
  if (!Number.isInteger(e.id) || e.id < 1 || e.id > 1155) errors.push(`Invalid id: ${e.id}`);
  if (ids.has(e.id)) errors.push(`Duplicate id: ${e.id}`);
  ids.add(e.id);
  if (!Array.isArray(e.tests) || e.tests.length !== 3) errors.push(`Exercise ${e.id}: expected exactly 3 tests`);
  if (!Array.isArray(e.hints) || e.hints.length < 3) errors.push(`Exercise ${e.id}: fewer than 3 hints`);
  const title = String(e.title);
  const statement = String(e.statement);
  const solution = String(e.solution);
  const testSignature = JSON.stringify(e.tests);
  titles.set(title, (titles.get(title) || 0) + 1);
  statements.set(statement, (statements.get(statement) || 0) + 1);
  solutions.set(solution, (solutions.get(solution) || 0) + 1);
  testSignatures.set(testSignature, (testSignatures.get(testSignature) || 0) + 1);
  categoryCounts.set(e.category, (categoryCounts.get(e.category) || 0) + 1);

  const genericMarkers = [
    "نمونه تمرین",
    "تمرین مشابه",
    "کد مناسب",
    "پیاده سازی کنید",
    "مقدار ورودی را دریافت کنید"
  ];
  const searchable = `${e.statement} ${e.solution} ${e.starter_code}`;
  if (genericMarkers.some(marker => searchable.includes(marker))) {
    warnings.push(`Exercise ${e.id}: possible generic/template content`);
  }
}

for (let i=1;i<=1155;i++) if (!ids.has(i)) errors.push(`Missing id: ${i}`);
for (const [category,count] of Object.entries(expectedCategories)) {
  if ((categoryCounts.get(category) || 0) !== count) errors.push(`Category ${category}: expected ${count}, found ${categoryCounts.get(category) || 0}`);
}
for (const category of categoryCounts) {
  if (!(category[0] in expectedCategories)) errors.push(`Unexpected category: ${category[0]}`);
}
for (const [k,v] of titles) if (v>1) warnings.push(`Duplicate title x${v}: ${k}`);
for (const [k,v] of statements) if (v>5) warnings.push(`Repeated statement x${v}: ${k}`);
for (const [k,v] of solutions) if (v>3) warnings.push(`Repeated solution x${v}: ${k.slice(0,120)}`);
for (const [k,v] of testSignatures) if (v>3) warnings.push(`Repeated test suite x${v}: ${k.slice(0,160)}`);

if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`VALID: ${exercises.length} exercises, ${ids.size} unique IDs.`);
