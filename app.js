const PYODIDE_VERSION="0.27.7";
const PYODIDE_MIRRORS=[
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
];

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

function buildExercises(){
  const list=[];
  let id=1;
  const per=[32,32,32,32,32,32,32,32,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31];
  categories.forEach((cat,ci)=>{
    const n=per[ci]||30;
    const topics=topicPool[cat]||["تمرین عملی"];
    for(let j=0;j<n;j++){
      const topic=topics[j%topics.length];
      const difficulty=j<Math.ceil(n*.45)?"آسان":j<Math.ceil(n*.82)?"متوسط":"سخت";
      const number=id++;
      list.push({
        id:number,title:`${topic} — سناریوی ${j+1}`,level:difficulty,category:cat,
        statement:makeStatement(cat,topic,j,difficulty),
        example:makeExample(cat,topic,j),
        starter:starterCode(cat,topic),
        answer:answerCode(cat,topic,j),
        tests:testsFor(cat,topic,j),
        hints:hintsFor(cat,topic)
      });
    }
  });
  return list.slice(0,1155);
}

function makeStatement(cat,topic,j,diff){
  const scenarios={
    "شرط‌ها":[
      "یک عدد دریافت کنید و مشخص کنید زوج است یا فرد.",
      "دو عدد دریافت کنید و بزرگ‌تر را چاپ کنید.",
      "سن کاربر را دریافت کنید و بر اساس بازه‌های مشخص، وضعیت او را تعیین کنید.",
      "سه عدد دریافت کنید و بزرگ‌ترین مقدار را بدون استفاده از sorted پیدا کنید.",
      "یک نمره دریافت کنید و با چند شرط، سطح آن را تعیین کنید."
    ],
    "حلقه‌ها":[
      "یک عدد n دریافت کنید و مجموع اعداد ۱ تا n را محاسبه کنید.",
      "تمام اعداد زوج بین ۱ تا n را چاپ کنید.",
      "تعداد ارقام یک عدد را با استفاده از حلقه پیدا کنید.",
      "مجموع اعداد ورودی را تا زمانی که عدد صفر وارد شود محاسبه کنید.",
      "یک الگوی ستاره‌ای n سطری تولید کنید."
    ],
    "رشته‌ها":[
      "یک متن دریافت کنید و تعداد حروف آن را بدون احتساب فاصله‌ها پیدا کنید.",
      "بررسی کنید آیا یک کلمه palindrome است یا خیر.",
      "تعداد رخداد یک حرف مشخص در متن را محاسبه کنید.",
      "تمام فاصله‌های اضافی ابتدای و انتهای متن را حذف کنید.",
      "کلمات یک جمله را بشمارید."
    ],
    "List":[
      "فهرستی از اعداد دریافت کنید و کوچک‌ترین مقدار را پیدا کنید.",
      "اعداد زوج یک فهرست را در فهرست جدید قرار دهید.",
      "اعضای تکراری فهرست را حذف کنید.",
      "فهرست را بدون استفاده از sorted به صورت صعودی مرتب کنید.",
      "دومین عدد بزرگ فهرست را پیدا کنید."
    ],
    "Dictionary":[
      "فراوانی هر حرف یک متن را با Dictionary محاسبه کنید.",
      "اطلاعات یک کاربر را با کلیدهای مشخص در Dictionary ذخیره کنید.",
      "کلید دارای بیشترین مقدار را پیدا کنید.",
      "دو Dictionary را با یکدیگر ادغام کنید.",
      "فهرستی از نام‌ها را به Dictionary شمارش فراوانی تبدیل کنید."
    ],
    "Functions":[
      "تابعی بنویسید که عدد را گرفته و زوج یا فرد بودن آن را برگرداند.",
      "تابعی بنویسید که میانگین چند عدد را محاسبه کند.",
      "تابعی با مقدار پیش‌فرض برای محاسبه قیمت نهایی بنویسید.",
      "تابعی بنویسید که بیشترین عضو یک فهرست را برگرداند.",
      "یک مسئله را به چند تابع کوچک تقسیم کنید."
    ],
    "Set":[
      "تکراری‌های یک فهرست را با Set حذف کنید.",
      "اشتراک دو مجموعه را پیدا کنید.",
      "اعضای موجود فقط در مجموعه اول را پیدا کنید.",
      "اجتماع دو مجموعه را تولید کنید.",
      "عضویت یک شناسه را در مجموعه بررسی کنید."
    ],
    "Tuple":[
      "اطلاعات یک شخص را در Tuple ذخیره و unpack کنید.",
      "دو Tuple را به هم متصل کنید.",
      "تعداد رخداد یک مقدار را در Tuple پیدا کنید.",
      "جایگاه یک مقدار را در Tuple پیدا کنید.",
      "یک Tuple تو در تو را پیمایش کنید."
    ],
    "Recursion":[
      "با recursion فاکتوریل یک عدد را محاسبه کنید.",
      "با recursion مجموع اعداد ۱ تا n را پیدا کنید.",
      "با recursion یک رشته را معکوس کنید.",
      "با recursion فیبوناچی nام را محاسبه کنید.",
      "با recursion تعداد ارقام یک عدد را پیدا کنید."
    ],
    "Stack / Queue":[
      "با Stack درست بودن پرانتزهای یک عبارت را بررسی کنید.",
      "یک Queue ساده با list پیاده‌سازی کنید.",
      "عنصر بالای Stack را بدون حذف آن مشاهده کنید.",
      "عملیات enqueue و dequeue را پیاده‌سازی کنید.",
      "یک صف اولویت ساده با ساختار مناسب بسازید."
    ]
  };
  const list=scenarios[cat]||[
    "یک مسئله عملی مرتبط با «"+topic+"» حل کنید و ورودی، پردازش و خروجی مشخص داشته باشید.",
    "یک برنامه Python برای «"+topic+"» بنویسید و حداقل یک حالت مرزی را مدیریت کنید.",
    "مفهوم «"+topic+"» را در یک سناریوی واقعی پیاده‌سازی کنید.",
    "راه‌حلی خوانا برای مسئله «"+topic+"» بنویسید و خروجی را مطابق مثال تولید کنید."
  ];
  return list[j%list.length]+" سطح: "+diff+"؛ راه‌حل باید قابل تست و خوانا باشد.";
}
function makeExample(cat,topic,j){
  if(cat==="شرط‌ها"&&topic==="زوج یا فرد") return "ورودی: 8\nخروجی: عدد زوج است";
  return `ورودی: نمونه ${j+1}\nخروجی: نتیجه پردازش نمونه ${j+1}`;
}
function starterCode(cat,topic){return `# جواب خودت را اینجا بنویس\n# مبحث: ${cat}\n\n`;}
function answerCode(cat,topic,j){
  const a={
    "شرط‌ها":`n = int(input())\nprint("عدد زوج است" if n % 2 == 0 else "عدد فرد است")`,
    "رشته‌ها":`text = input()\nprint(text.strip())`,
    "List":`items = list(map(int, input().split()))\nprint(items)`,
    "Functions":`def solve(value):\n    return value\n\nprint(solve(input()))`,
    "Dictionary":`text = input()\ncounts = {}\nfor ch in text:\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts)`
  };
  return a[cat]||`# راه‌حل نمونه تمرین ${j+1}\nvalue = input()\nprint(value)`;
}
function testsFor(cat,topic,j){
  return [
    {input:"8",expected:cat==="شرط‌ها"?"عدد زوج است":"8"},
    {input:"7",expected:cat==="شرط‌ها"?"عدد فرد است":"7"},
    {input:"0",expected:cat==="شرط‌ها"?"عدد زوج است":"0"}
  ];
}
function hintsFor(cat,topic){
  return [`ابتدا ورودی و نوع داده مورد نیاز را مشخص کنید.`,`منطق «${topic}» را به چند گام کوچک تقسیم کنید.`,`خروجی را دقیقاً مطابق مثال چاپ کنید و حالت‌های مرزی را بررسی کنید.`];
}

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
  const script=document.createElement("script"); script.src=PYODIDE_MIRRORS[0]+"pyodide.js";
  document.head.appendChild(script);
  await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=reject});
  pyodide=await window.loadPyodide({indexURL:PYODIDE_MIRRORS[0]});
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
    $("output").textContent=results.map((x,i)=>"Test "+(i+1)+": "+(x||"بدون خروجی")).join("\\n");
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
window.runCode=runCode;window.toggleAnswer=toggleAnswer;window.resetCode=resetCode;window.exportExercises=exportExercises;
init();
