const PYODIDE_VERSION="0.27.7";
const PYODIDE_MIRRORS=[
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
];
const PYODIDE_CUSTOM_MIRROR=localStorage.getItem("python-mastery-pyodide-mirror");
if(PYODIDE_CUSTOM_MIRROR) PYODIDE_MIRRORS.unshift(PYODIDE_CUSTOM_MIRROR.replace(/\\/?$/,"/"));

const categories=[
 "مبانی Python","متغیرها و انواع داده","ورودی/خروجی","شرط‌ها","حلقه‌ها","رشته‌ها",
 "List","Tuple","Set","Dictionary","Functions","Lambda","Scope","Modules","Exceptions",
 "Files","OOP","Inheritance","Iterator / Generator","Decorator","Context Manager","Regex",
 "JSON","Date/Time","الگوریتم‌ها","Recursion","Stack / Queue","Tree / Graph","Async",
 "Type Hints","Dataclass / Enum","SQLite","Networking","Testing","Performance","Security","پروژه‌های ترکیبی"
];

const topicPool={
 "مبانی Python":["اجرای اولین برنامه","کامنت‌گذاری","شناخت سینتکس","عبارت‌ها و عملگرها","خطاهای رایج"],
 "متغیرها و انواع داده":["تبدیل نوع","عدد صحیح و اعشاری","Boolean","None","رشته و عدد"],
 "ورودی/خروجی":["input","print","قالب‌بندی خروجی","چند ورودی","اعتبارسنجی ورودی"],
 "شرط‌ها":["زوج یا فرد","بزرگ‌تر از دو عدد","محدوده عددی","چند شرط","شرط تو در تو"],
 "حلقه‌ها":["شمارش","جمع اعداد","فیلتر کردن","حلقه تو در تو","break و continue"],
 "رشته‌ها":["برش رشته","شمارش حروف","جستجو","پاک‌سازی متن","Palindrome"],
 "List":["افزودن عضو","حذف عضو","مرتب‌سازی","فیلتر لیست","List Comprehension"],
 "Tuple":["دسترسی","Unpacking","تبدیل Tuple","Tuple تو در تو","کاربرد Tuple"],
 "Set":["حذف تکراری‌ها","اشتراک","اجتماع","تفاضل","عضویت"],
 "Dictionary":["ساخت Dictionary","دسترسی امن","شمارش فراوانی","مرتب‌سازی","Dictionary Comprehension"],
 "Functions":["پارامتر","return","مقدار پیش‌فرض","*args و **kwargs","تابع ترکیبی"],
 "Lambda":["مرتب‌سازی با lambda","map","filter","reduce","توابع کوتاه"],
 "Scope":["local","global","nonlocal","نام‌گذاری","closure"],
 "Modules":["import","ساخت ماژول","from import","alias","package"],
 "Exceptions":["try/except","چند exception","else/finally","raise","exception سفارشی"],
 "Files":["خواندن فایل","نوشتن فایل","append","CSV متنی","مدیریت encoding"],
 "OOP":["class","constructor","method","property","کپسوله‌سازی"],
 "Inheritance":["ارث‌بری","super","override","چندریختی","MRO"],
 "Iterator / Generator":["iterator","iter/next","generator","yield","generator expression"],
 "Decorator":["decorator ساده","پارامتر decorator","wrapper","چند decorator","حفظ metadata"],
 "Context Manager":["with","__enter__","__exit__","contextlib","مدیریت منبع"],
 "Regex":["pattern","search","findall","replace","اعتبارسنجی"],
 "JSON":["encode","decode","فایل JSON","ساختار تو در تو","اعتبارسنجی"],
 "Date/Time":["datetime","timedelta","فرمت تاریخ","مقایسه تاریخ","timezone"],
 "الگوریتم‌ها":["جستجوی خطی","جستجوی دودویی","مرتب‌سازی","شمارش","دو اشاره‌گر"],
 "Recursion":["فاکتوریل","فیبوناچی","جمع بازگشتی","جستجوی بازگشتی","تقسیم مسئله"],
 "Stack / Queue":["Stack","Queue","Deque","پرانتزهای متوازن","صف اولویت"],
 "Tree / Graph":["درخت","DFS","BFS","گراف بدون وزن","مسیر"],
 "Async":["async/await","gather","Task","timeout","producer/consumer"],
 "Type Hints":["annotation","Optional","Union","Generic","Protocol"],
 "Dataclass / Enum":["dataclass","field","Enum","IntEnum","ترکیب"],
 "SQLite":["connection","SELECT","INSERT","UPDATE","transaction"],
 "Networking":["URL","HTTP","socket","JSON API","timeout"],
 "Testing":["assert","unittest","pytest style","fixture concept","test case"],
 "Performance":["complexity","profiling","cache","generator","بهینه‌سازی"],
 "Security":["ورودی ناامن","path traversal","secrets","hash","اعتبارسنجی"],
 "پروژه‌های ترکیبی":["دفترچه مخاطبان","تحلیل متن","مدیریت هزینه","سیستم نمرات","گزارش‌ساز"]
};

function buildExerciseRecord(e){
  return {
    id:e.id,title:e.title,level:e.level,category:e.category,topic:e.title.split(" — ")[0],
    statement:e.statement,examples:[e.example],starter_code:e.starter,solution:e.answer,
    tests:e.tests,hints:e.hints,concepts:[e.category]
  };
}
function exportExercises(){
  const blob=new Blob([JSON.stringify(exercises.map(buildExerciseRecord),null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="exercises.json";a.click();
}
let exercises=[];
let current=0, pyodide=null;
const solved=JSON.parse(localStorage.getItem("python-mastery-solved")||"[]");

const $=id=>document.getElementById(id);
function fa(n){return String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);}
async function init(){
  try{
    const response=await fetch("./data/exercises.json",{cache:"no-store"});
    if(!response.ok) throw new Error("خطا در دریافت دیتاست: "+response.status);
    exercises=await response.json();
    if(!Array.isArray(exercises)||exercises.length!==1155) throw new Error("دیتاست باید دقیقاً ۱۱۵۵ تمرین داشته باشد.");
    exercises=exercises.map(e=>({...e,example:Array.isArray(e.examples)?e.examples.join("\n"):String(e.examples||""),starter:e.starter_code||"",answer:e.solution||""}));
  }catch(error){
    console.error(error);
    $("exercise").innerHTML='<div class="card"><h2>خطا در بارگذاری تمرین‌ها</h2><p>'+escapeHtml(String(error))+'</p></div>';
    return;
  }
  $("category").innerHTML='<option value="">همه مباحث</option>'+categories.map(x=>`<option>${x}</option>`).join("");
  renderList(); renderExercise(0); updateProgress();
  $("search").oninput=renderList; $("category").onchange=renderList; $("difficulty").onchange=renderList;
}
function filtered(){
  const q=$("search").value.trim().toLowerCase(), c=$("category").value, d=$("difficulty").value;
  return exercises.filter(e=>(!q||(`${e.id} ${e.title} ${e.category}`).toLowerCase().includes(q))&&(!c||e.category===c)&&(!d||e.level===d));
}
function renderList(){
  const list=filtered();
  $("exerciseList").innerHTML=list.map(e=>`<div class="exercise-item ${e.id-1===current?"active":""}" data-id="${e.id-1}">
    <b>تمرین ${fa(e.id)}</b> — ${e.title}<small>${e.level} · ${e.category}</small></div>`).join("");
  document.querySelectorAll(".exercise-item").forEach(x=>x.onclick=()=>{current=+x.dataset.id;renderList();renderExercise(current)});
}
function renderExercise(i){
  const e=exercises[i]; if(!e)return;
  $("exercise").innerHTML=`<article class="card">
    <h2>تمرین ${fa(e.id)} — ${e.title}</h2>
    <div class="meta"><span class="badge">سطح: ${e.level}</span><span class="badge">مبحث: ${e.category}</span></div>
    <h3>مسئله</h3><p class="statement">${e.statement}</p>
    <h3>مثال</h3><pre class="example">${e.example}</pre>
    <h3>کد شما</h3>
    <textarea id="editor" class="editor">${e.starter}</textarea>
    <div class="actions">
      <button class="btn run" onclick="runCode()">▶ اجرای کد</button>
      <button class="btn answer" onclick="toggleAnswer()">💡 جواب مسئله</button>
      <button class="btn secondary" onclick="resetCode()">بازنشانی</button>
    </div>
    <div id="output" class="output">برای اجرای کد روی «اجرای کد» بزنید.</div>
    <div id="answerBox" class="answer-box"><b>جواب مسئله</b><pre class="example">${escapeHtml(e.answer)}</pre></div>
    <div class="tests"><h3>وضعیت تست</h3><div id="testList">${e.tests.map((t,i)=>`<div class="test">○ Test ${i+1}</div>`).join("")}</div></div>
    <div class="hint"><h3>راهنمای مرحله‌ای</h3><ol>${e.hints.map(h=>`<li>${h}</li>`).join("")}</ol></div>
  </article>`;
  const saved=localStorage.getItem("python-mastery-code-"+e.id); if(saved)$("editor").value=saved;
}
function escapeHtml(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function toggleAnswer(){const b=$("answerBox");b.style.display=b.style.display==="block"?"none":"block";}
function resetCode(){localStorage.removeItem("python-mastery-code-"+exercises[current].id);renderExercise(current)}
async function loadPyodide(){
  if(pyodide)return pyodide;
  $("output").textContent="در حال بارگذاری Python...";
  for(const mirror of PYODIDE_MIRRORS){
    try{
      const script=document.createElement("script"); script.src=mirror+"pyodide.js";
      document.head.appendChild(script);
      await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject});
      pyodide=await window.loadPyodide({indexURL:mirror});
      return pyodide;
    }catch(error){ console.warn("Pyodide mirror failed:",mirror,error); }
  }
  throw new Error("هیچ‌کدام از mirrorهای Pyodide در دسترس نیستند.");
  return pyodide;
}
async function runCode(){
  const code=$("editor").value, e=exercises[current];
  localStorage.setItem("python-mastery-code-"+e.id,code);
  $("output").textContent="در حال اجرای Python...";
  try{
    const py=await loadPyodide();
    const results=[];
    for(const test of e.tests){
      const result=await py.runPythonAsync(`
import io, contextlib, builtins
_old = builtins.input
builtins.input = lambda prompt="": ${JSON.stringify(test.input)}
_out = io.StringIO()
try:
    with contextlib.redirect_stdout(_out):
        exec(${JSON.stringify(code)}, {})
    print(_out.getvalue().rstrip())
finally:
    builtins.input = _old
`);
      results.push(result.trim());
    }
    $("output").textContent=results.map((x,i)=>"Test "+(i+1)+": "+(x||"بدون خروجی")).join("\n");
    let passed=0;
    document.querySelectorAll(".test").forEach((el,i)=>{
      const ok=results[i]===String(e.tests[i].expected).trim();
      el.textContent=(ok?"✅":"❌")+" Test "+(i+1); el.className="test "+(ok?"ok":"fail"); if(ok)passed++;
    });
    if(passed===e.tests.length){if(!solved.includes(e.id)){solved.push(e.id);localStorage.setItem("python-mastery-solved",JSON.stringify(solved));updateProgress()}}
  }catch(err){$("output").textContent="خطا: "+err}
}
function updateProgress(){
  $("progressText").textContent=fa(solved.length)+" / ۱۱۵۵";
  $("progressBar").style.width=(solved.length/1155*100)+"%";
}
function savePyodideMirror(){
  const value=$("pyodideMirror").value.trim();
  if(value) localStorage.setItem("python-mastery-pyodide-mirror",value);
  else localStorage.removeItem("python-mastery-pyodide-mirror");
  location.reload();
}
window.runCode=runCode;window.toggleAnswer=toggleAnswer;window.resetCode=resetCode;window.exportExercises=exportExercises;window.savePyodideMirror=savePyodideMirror;
init();
