const PYODIDE_VERSION="0.27.7";
const PYODIDE_MIRRORS=[
  `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
  `https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
];
const customMirror=localStorage.getItem("python-mastery-pyodide-mirror");
if(customMirror) PYODIDE_MIRRORS.unshift(customMirror.replace(/\\/?$/,"/"));

const categories=["مبانی Python","متغیرها و انواع داده","ورودی/خروجی","شرط‌ها","حلقه‌ها","رشته‌ها","List","Tuple","Set","Dictionary","Functions","Lambda","Scope","Modules","Exceptions","Files","OOP","Inheritance","Iterator / Generator","Decorator","Context Manager","Regex","JSON","Date/Time","الگوریتم‌ها","Recursion","Stack / Queue","Tree / Graph","Async","Type Hints","Dataclass / Enum","SQLite","Networking","Testing","Performance","Security","پروژه‌های ترکیبی"];
let exercises=[]; let current=0; let pyodide=null;
const solved=JSON.parse(localStorage.getItem("python-mastery-solved")||"[]");
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
function escapeHtml(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function buildExerciseRecord(e){return {id:e.id,title:e.title,level:e.level,category:e.category,topic:e.topic,statement:e.statement,examples:e.examples,starter_code:e.starter_code,solution:e.solution,tests:e.tests,hints:e.hints,concepts:e.concepts};}
function exportExercises(){const blob=new Blob([JSON.stringify(exercises.map(buildExerciseRecord),null,2)],{type:"application/json;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="exercises-1155.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function init(){
 try{const r=await fetch("./data/exercises.json",{cache:"no-store"});if(!r.ok)throw Error("خطا در دریافت دیتاست: "+r.status);exercises=await r.json();if(!Array.isArray(exercises)||exercises.length!==1155)throw Error("دیتاست باید دقیقاً ۱۱۵۵ تمرین داشته باشد.");}
 catch(err){console.error(err);$("exercise").innerHTML=`<div class="card"><h2>خطا در بارگذاری تمرین‌ها</h2><p>${escapeHtml(err.message||err)}</p></div>`;return;}
 $("category").innerHTML='<option value="">همه مباحث</option>'+categories.map(x=>`<option>${x}</option>`).join("");
 $("search").oninput=renderList;$("category").onchange=renderList;$("difficulty").onchange=renderList;renderList();renderExercise(0);updateProgress();
}
function filtered(){const q=$("search").value.trim().toLowerCase(),c=$("category").value,d=$("difficulty").value;return exercises.filter(e=>(!q||`${e.id} ${e.title} ${e.category} ${e.topic}`.toLowerCase().includes(q))&&(!c||e.category===c)&&(!d||e.level===d));}
function renderList(){const list=filtered();$("exerciseList").innerHTML=list.map(e=>`<div class="exercise-item ${e.id-1===current?"active":""}" data-id="${e.id-1}"><b>تمرین ${fa(e.id)}</b> — ${escapeHtml(e.title)}<small>${escapeHtml(e.level)} · ${escapeHtml(e.category)}</small></div>`).join("");document.querySelectorAll(".exercise-item").forEach(x=>x.onclick=()=>{current=+x.dataset.id;renderList();renderExercise(current)});}
function renderExercise(i){const e=exercises[i];if(!e)return;$("exercise").innerHTML=`<article class="card"><h2>تمرین ${fa(e.id)} — ${escapeHtml(e.title)}</h2><div class="meta"><span class="badge">سطح: ${escapeHtml(e.level)}</span><span class="badge">مبحث: ${escapeHtml(e.category)}</span></div><h3>مسئله</h3><p class="statement">${escapeHtml(e.statement)}</p><h3>مثال</h3><pre class="example">${escapeHtml((e.examples||[]).join("\n"))}</pre><h3>کد شما</h3><textarea id="editor" class="editor">${escapeHtml(e.starter_code||"")}</textarea><div class="actions"><button class="btn run" onclick="runCode()">▶ اجرای کد</button><button class="btn answer" onclick="toggleAnswer()">💡 جواب مسئله</button><button class="btn secondary" onclick="resetCode()">بازنشانی</button></div><div id="output" class="output">برای اجرای کد روی «اجرای کد» بزنید.</div><div id="answerBox" class="answer-box"><b>جواب مسئله</b><pre class="example">${escapeHtml(e.solution)}</pre></div><div class="tests"><h3>وضعیت تست</h3><div id="testList">${e.tests.map((t,n)=>`<div class="test">○ Test ${n+1}</div>`).join("")}</div></div><div class="hint"><h3>راهنمای مرحله‌ای</h3><ol>${e.hints.map(h=>`<li>${escapeHtml(h)}</li>`).join("")}</ol></div></article>`;const saved=localStorage.getItem("python-mastery-code-"+e.id);if(saved!==null)$('editor').value=saved;}
function toggleAnswer(){const b=$("answerBox");b.style.display=b.style.display==="block"?"none":"block";}
function resetCode(){localStorage.removeItem("python-mastery-code-"+exercises[current].id);renderExercise(current);}
async function loadPyodide(){if(pyodide)return pyodide;$("output").textContent="در حال بارگذاری Python...";for(const mirror of PYODIDE_MIRRORS){try{const script=document.createElement("script");script.src=mirror+"pyodide.js";document.head.appendChild(script);await new Promise((ok,no)=>{script.onload=ok;script.onerror=no});pyodide=await window.loadPyodide({indexURL:mirror});return pyodide;}catch(err){console.warn("Pyodide mirror failed",mirror,err);}}throw Error("هیچ‌کدام از mirrorهای Pyodide در دسترس نیستند.");}
async function runOne(py,code,test){const result=await py.runPythonAsync(`
import io, contextlib, builtins, traceback
_old_input=builtins.input
_out=io.StringIO()
builtins.input=lambda prompt="": ${JSON.stringify(test.input)}
_error=None
try:
    with contextlib.redirect_stdout(_out):
        exec(${JSON.stringify(code)}, {})
except Exception as _e:
    _error=f"{type(_e).__name__}: {_e}"
finally:
    builtins.input=_old_input
print(_out.getvalue().rstrip() if _error is None else "__PYTHON_ERROR__"+_error)
`);const value=String(result).trim();return value.startsWith("__PYTHON_ERROR__")?{error:value.slice(17),output:""}:{error:null,output:value};}
async function runCode(){const code=$("editor").value,e=exercises[current];localStorage.setItem("python-mastery-code-"+e.id,code);$("output").textContent="در حال اجرای Python...";try{const py=await loadPyodide();const results=[];for(const test of e.tests)results.push(await runOne(py,code,test));let passed=0;document.querySelectorAll(".test").forEach((el,i)=>{const r=results[i],ok=!r.error&&r.output===String(e.tests[i].expected).trim();el.textContent=(ok?"✅":"❌")+" Test "+(i+1)+(r.error?` — ${r.error}`:"");el.className="test "+(ok?"ok":"fail");if(ok)passed++;});$("output").textContent=results.map((r,i)=>`Test ${i+1}: ${r.error?"خطا: "+r.error:(r.output||"بدون خروجی")}`).join("\n");if(passed===e.tests.length&&!solved.includes(e.id)){solved.push(e.id);localStorage.setItem("python-mastery-solved",JSON.stringify(solved));updateProgress();}}catch(err){$("output").textContent="خطای اجرای محیط Python: "+(err.message||err);}}
function updateProgress(){$("progressText").textContent=fa(solved.length)+" / ۱۱۵۵";$('progressBar').style.width=(solved.length/1155*100)+"%";}
function savePyodideMirror(){const v=$("pyodideMirror").value.trim();if(v)localStorage.setItem("python-mastery-pyodide-mirror",v);else localStorage.removeItem("python-mastery-pyodide-mirror");location.reload();}
window.runCode=runCode;window.toggleAnswer=toggleAnswer;window.resetCode=resetCode;window.exportExercises=exportExercises;window.savePyodideMirror=savePyodideMirror;init();
