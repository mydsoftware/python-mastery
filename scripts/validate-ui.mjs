import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("app.js", "utf8");
const css = fs.readFileSync("styles.css", "utf8");
const worker = fs.readFileSync("pyodide-worker.js", "utf8");

const checks = [
  ["RTL document", /<html[^>]*lang=["']fa["'][^>]*dir=["']rtl["']/, index],
  ["skip link", /class=["']skip-link["']/, index],
  ["mobile menu", /id=["']menuButton["'][\s\S]*?toggleSidebar\(true\)/, index],
  ["mobile sidebar close", /aria-label=["']بستن فهرست تمرین‌ها["'][\s\S]*?toggleSidebar\(false\)/, index],
  ["exercise close button", /close-exercise[\s\S]*?closeExercise\(\)/, app],
  ["Escape handling", /e\.key===?["']Escape["'][\s\S]*?closeExercise\(\)/, app],
  ["run timeout", /setTimeout\(\(\)=>[\s\S]*?7000\)/, app],
  ["worker termination", /worker\.terminate\(\)/, app],
  ["clipboard fallback", /!navigator\.clipboard\?\.writeText/, app],
  ["live output", /role=["']status["'][\s\S]*?aria-live=["']polite["']/, app],
  ["reduced motion", /prefers-reduced-motion:reduce/, css],
  ["touch-sized buttons", /\.btn\{[^}]*min-height:44px/, css],
  ["worker module", /import\(b\+?["']pyodide\.mjs["']\)/, worker],
  ["worker returns result id", /postMessage\(\{id,results\}\)/, worker],
];

const failed = checks.filter(([, pattern, source]) => !pattern.test(source));
if (failed.length) {
  console.error("UI CONTRACT VALIDATION FAILED");
  for (const [name] of failed) console.error(`- ${name}`);
  process.exit(1);
}
console.log(`UI CONTRACT VALID: ${checks.length} checks passed`);
