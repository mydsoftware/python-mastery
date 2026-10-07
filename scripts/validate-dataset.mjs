import fs from "node:fs";
const d=JSON.parse(fs.readFileSync(new URL("../data/exercises.json",import.meta.url),"utf8"));
const errors=[],warnings=[];const ids=new Set(),s=new Map(),o=new Map(),t=new Map();
if(d.length!==1155)errors.push(`Expected 1155 exercises, got ${d.length}`);
for(const e of d){
 if(!Number.isInteger(e.id)||e.id<1||e.id>1155||ids.has(e.id))errors.push(`invalid/duplicate id ${e.id}`);ids.add(e.id);
 for(const k of ["title","level","category","topic","statement","examples","starter_code","solution","tests","hints","concepts"])if(e[k]===undefined||e[k]===null||(typeof e[k]==="string"&&!e[k].trim()))errors.push(`#${e.id}: missing ${k}`);
 if(!Array.isArray(e.tests)||e.tests.length!==3)errors.push(`#${e.id}: exactly 3 tests required`);
 if(!Array.isArray(e.hints)||e.hints.length<3)errors.push(`#${e.id}: at least 3 hints required`);
 const raw=JSON.stringify(e);for(const m of ["نمونه تمرین","تمرین مشابه","کد مناسب","پیاده سازی کنید","مقدار ورودی را دریافت کنید","نتیجه پردازش نمونه"])if(raw.includes(m))errors.push(`#${e.id}: generic marker ${m}`);
 s.set(e.statement,(s.get(e.statement)||0)+1);o.set(e.solution,(o.get(e.solution)||0)+1);t.set(JSON.stringify(e.tests),(t.get(JSON.stringify(e.tests))||0)+1);
}
for(let i=1;i<=1155;i++)if(!ids.has(i))errors.push(`missing id ${i}`);
for(const [k,v] of s)if(v>5)warnings.push(`repeated statement x${v}: ${k}`);
for(const [k,v] of o)if(v>3)warnings.push(`repeated solution x${v}`);
for(const [k,v] of t)if(v>3)warnings.push(`repeated test suite x${v}`);
if(errors.length){console.error(errors.slice(0,200).join("\n"));process.exit(1)}
console.log(`VALID: 1155 exercises; warnings=${warnings.length}`);
if(warnings.length)console.warn(warnings.slice(0,50).join("\n"));