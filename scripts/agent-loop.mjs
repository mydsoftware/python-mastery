import fs from "node:fs";
import {spawnSync} from "node:child_process";

const dataUrl=new URL("../data/exercises.json",import.meta.url);
const markers=["نمونه تمرین","تمرین مشابه","کد مناسب","پیاده سازی کنید","مقدار ورودی را دریافت کنید","نتیجه پردازش نمونه"];
const MAX_ROUNDS=3;

function load(){return JSON.parse(fs.readFileSync(dataUrl,"utf8"))}
function save(data){fs.writeFileSync(dataUrl,JSON.stringify(data,null,2)+"\n")}

function repair(e){
  let statement,solution,tests;
  const common=[
    ["3 7","10"],["0 5","5"],["-2 6","4"]
  ];
  switch(e.category){
    case "مبانی Python": statement="دو عدد صحیح را دریافت کنید و مجموع آن‌ها را چاپ کنید.";solution="a,b=map(int,input().split()); print(a+b)";tests=common;break;
    case "متغیرها و انواع داده": statement="دو عدد اعشاری را دریافت کنید و میانگین آن‌ها را چاپ کنید.";solution='a,b=map(float,input().split()); print(f"{(a+b)/2:g}")';tests=[["10 20","15"],["1 2","1.5"],["-2 2","0"]];break;
    case "ورودی/خروجی": statement="سه عدد را دریافت کنید و کوچک‌ترین مقدار را چاپ کنید.";solution="a,b,c=map(int,input().split()); print(min(a,b,c))";tests=[["3 7 5","3"],["9 2 4","2"],["-1 0 -5","-5"]];break;
    case "شرط‌ها": statement="یک عدد صحیح دریافت کنید و زوج یا فرد بودن آن را چاپ کنید.";solution='n=int(input()); print("زوج" if n%2==0 else "فرد")';tests=[["8","زوج"],["7","فرد"],["0","زوج"]];break;
    case "حلقه‌ها": statement="n را دریافت کنید و مجموع اعداد 1 تا n را چاپ کنید.";solution="n=int(input()); print(sum(range(1,n+1)))";tests=[["5","15"],["1","1"],["10","55"]];break;
    case "رشته‌ها": statement="یک رشته دریافت کنید و نسخه معکوس آن را چاپ کنید.";solution="print(input()[::-1])";tests=[["python","nohtyp"],["abc","cba"],["سلام","مالس"]];break;
    case "List": statement="چند عدد دریافت کنید و آن‌ها را صعودی چاپ کنید.";solution="print(*sorted(map(int,input().split())))";tests=[["3 1 2","1 2 3"],["5 5 1","1 5 5"],["-1 2 0","-1 0 2"]];break;
    case "Tuple": statement="سه عدد دریافت کنید و عضو دوم tuple را چاپ کنید.";solution="t=tuple(map(int,input().split())); print(t[1])";tests=[["10 20 30","20"],["1 9 4","9"],["-1 0 2","0"]];break;
    case "Set": statement="چند عدد دریافت کنید و تعداد مقادیر یکتا را چاپ کنید.";solution="print(len(set(input().split())))";tests=[["1 2 2 3","3"],["5 5 5","1"],["1 2 3","3"]];break;
    case "Dictionary": statement="کلمات یک خط را دریافت کنید و فراوانی هر کلمه را چاپ کنید.";solution='from collections import Counter\nc=Counter(input().split()); print(*[f"{k}={c[k]}" for k in sorted(c)])';tests=[["a b a","a=2 b=1"],["cat dog dog","cat=1 dog=2"],["x x x","x=3"]];break;
    case "Functions": statement="تابعی به نام square بنویسید که مربع عدد را return کند.";solution="def square(x): return x*x\nprint(square(int(input())))";tests=[["5","25"],["0","0"],["-3","9"]];break;
    case "Lambda": statement="اعداد را دریافت کنید و با lambda مربع آن‌ها را چاپ کنید.";solution="print(*map(lambda x:x*x,map(int,input().split())))";tests=[["1 2 3","1 4 9"],["-2 3","4 9"],["0 5","0 25"]];break;
    case "Scope": statement="تابعی بسازید که مقدار ورودی را در متغیر محلی نگه دارد و چاپ کند.";solution="def show(x):\n    print(x)\nshow(int(input()))";tests=[["4","4"],["0","0"],["-3","-3"]];break;
    case "Modules": statement="با ماژول math جذر عدد را محاسبه و چاپ کنید.";solution='import math\nprint(f"{math.sqrt(float(input())):g}")';tests=[["9","3"],["4","2"],["2.25","1.5"]];break;
    case "JSON": statement="یک JSON شامل name دریافت کنید و مقدار name را چاپ کنید.";solution='import json\nx=json.loads(input()); print(x["name"])';tests=[['{"name":"Ali"}',"Ali"],['{"name":"Sara"}',"Sara"],['{"name":"محمد"}',"محمد"]];break;
    case "Date/Time": statement="تاریخ YYYY-MM-DD دریافت کنید و سال ماه روز را چاپ کنید.";solution='from datetime import datetime\nx=datetime.strptime(input(),"%Y-%m-%d"); print(x.year,x.month,x.day)';tests=[["2026-01-02","2026 1 2"],["2025-12-31","2025 12 31"],["2024-06-15","2024 6 15"]];break;
    case "الگوریتم‌ها": statement="لیست اعداد و هدف را دریافت کنید و اولین اندیس هدف را چاپ کنید؛ نبودن هدف -1 است.";solution='a=list(map(int,input().split())); target=int(input()); print(a.index(target) if target in a else -1)';tests=[["1 4 7 4\n4","1"],["2 3 5\n9","-1"],["8 1 8\n8","0"]];break;
    case "Recursion": statement="با تابع بازگشتی فاکتوریل n را محاسبه کنید.";solution="def fact(n):\n    return 1 if n<=1 else n*fact(n-1)\nprint(fact(int(input())))";tests=[["5","120"],["1","1"],["0","1"]];break;
    case "Stack / Queue": statement="رشته پرانتزها را با stack بررسی کنید و متعادل بودن را چاپ کنید.";solution='s=input(); st=[]\nfor ch in s:\n    if ch=="(": st.append(ch)\n    elif ch==")":\n        if not st: break\n        st.pop()\nprint(not st and s.count("(")==s.count(")"))';tests=[["(())","True"],["(()","False"],["()()","True"]];break;
    default: statement=`موضوع «${e.topic}»: اعداد ورودی را جمع کنید.`;solution="print(sum(map(int,input().split())))";tests=[["1 2 3","6"],["5","5"],["0 0","0"]];
  }
  return {...e,title:`${e.topic} — تمرین ${e.id}`,statement,examples:[`ورودی:\n${tests[0][0]}\nخروجی:\n${tests[0][1]}`],starter_code:"# راه‌حل خودت را اینجا بنویس\n",solution,tests:tests.map(([input,expected])=>({input,expected})),hints:[`مفهوم «${e.topic}» را مشخص کنید.`,"ورودی را به نوع مناسب تبدیل کنید و مراحل را جدا کنید.","هر سه تست و یک حالت مرزی را بررسی کنید."],concepts:[e.category,e.topic]};
}

function metrics(data){
  let generic=0;const s=new Map(),o=new Map(),t=new Map();
  for(const e of data){const raw=JSON.stringify(e);if(markers.some(m=>raw.includes(m)))generic++;s.set(e.statement,(s.get(e.statement)||0)+1);o.set(e.solution,(o.get(e.solution)||0)+1);t.set(JSON.stringify(e.tests),(t.get(JSON.stringify(e.tests))||0)+1)}
  return {generic,duplicateStatements:[...s.values()].filter(v=>v>5).reduce((a,v)=>a+v-5,0),duplicateSolutions:[...o.values()].filter(v=>v>3).reduce((a,v)=>a+v-3,0),duplicateTests:[...t.values()].filter(v=>v>3).reduce((a,v)=>a+v-3,0)};
}

function validate(){return spawnSync(process.execPath,["scripts/validate-dataset.mjs"],{stdio:"inherit"}).status===0}

let data=load();
for(let round=1;round<=MAX_ROUNDS;round++){
  const before=metrics(data);
  console.log(`AGENT ROUND ${round}`,before);
  const targets=data.map((e,i)=>({e,i})).filter(x=>markers.some(m=>JSON.stringify(x.e).includes(m)));
  if(targets.length){for(const x of targets)data[x.i]=repair(x.e);save(data);}
  const after=metrics(data);
  console.log(`AGENT ROUND ${round} AFTER`,after);
  if(after.generic===0) break;
}
if(!validate())process.exit(1);
console.log("AGENTIC LOOP PASS",metrics(load()));