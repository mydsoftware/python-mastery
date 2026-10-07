const PYODIDE_VERSION="0.27.7";
const MIRRORS=[`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,`https://fastly.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`];
const custom=localStorage.getItem("python-mastery-pyodide-mirror");if(custom)MIRRORS.unshift(custom.replace(/\\?\/$/,"/"));
let exercises=[],current=0,worker=null,seq=0,runTimer=null;
let solved=[];try{solved=JSON.parse(localStorage.getItem("python-mastery-solved")||"[]");if(!Array.isArray(solved))solved=[]}catch{solved=[]}
const $=id=>document.getElementById(id),fa=n=>String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]),esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
async function init(){
 try{
  const r=await fetch("./data/exercises.json",{cache:"no-store"});
  if(!r.ok)throw Error("دریافت دیتاست ناموفق بود.");
  exercises=await r.json();
  if(!Array.isArray(exercises)||exercises.length!==1155)throw Error("دیتاست باید ۱۱۵۵ تمرین داشته باشد.");
 }catch(e){$("exercise").innerHTML=`<div class="card"><h2>خطا</h2><p>${esc(e.message)}</p></div>`;return}
 $("category").innerHTML='<option value="">همه مباحث</option>'+[...new Set(exercises.map(e=>e.category))].map(x=>`<option>${esc(x)}</option>`).join("");
 $("search").oninput=renderList;$("category").onchange=renderList;$("difficulty").onchange=renderList;
 renderList();renderExercise(0);progress();
}
function renderList(){
 const q=$("search").value.toLowerCase().trim(),c=$("category").value,d=$("difficulty").value;
 const a=exercises.filter(e=>(!q||`${e.id} ${e.title} ${e.topic}`.toLowerCase().includes(q))&&(!c||e.category===c)&&(!d||e.level===d));
 $("exerciseList").innerHTML=a.length?a.map(e=>`<div class="exercise-item ${e.id-1===current?"active":""}" data-id="${e.id-1}" tabindex="0" role="button"><b>تمرین ${fa(e.id)}</b> — ${esc(e.title)}<small>${esc(e.level)} · ${esc(e.category)}</small></div>`).join(""):'<div class="output">تمرینی پیدا نشد.</div>';
 document.querySelectorAll(".exercise-item").forEach(x=>{x.onclick=()=>{current=+x.dataset.id;renderList();renderExercise(current)};x.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();x.click()}}});
}
function renderExercise(i){
 const e=exercises[i];if(!e)return;
 $("exercise").innerHTML=`<article class="card"><h2>تمرین ${fa(e.id)} — ${esc(e.title)}</h2><div class="meta"><span class="badge">سطح: ${esc(e.level)}</span><span class="badge">مبحث: ${esc(e.category)}</span></div><h3>مسئله</h3><p class="statement">${esc(e.statement)}</p><h3>مثال</h3><pre class="example">${esc(e.examples.join("\n"))}</pre><h3>کد شما</h3><textarea id="editor" class="editor" aria-label="ویرایشگر کد Python">${esc(e.starter_code)}</textarea><div class="actions"><button class="btn run" onclick="runCode()">▶ اجرای کد</button><button class="btn answer" onclick="toggleAnswer()">💡 جواب مسئله</button><button class="btn secondary" onclick="resetCode()">بازنشانی</button></div><div id="output" class="output" role="status">آماده اجرای Python در Worker.</div><div id="answerBox" class="answer-box"><b>جواب مسئله</b><pre class="example">${esc(e.solution)}</pre></div><div class="tests"><h3>وضعیت تست</h3><div id="testList">${e.tests.map((_,i)=>`<div class="test">○ Test ${i+1}</div>`).join("")}</div></div><div class="hint"><h3>راهنمای مرحله‌ای</h3><ol>${e.hints.map(h=>`<li>${esc(h)}</li>`).join("")}</ol></div></article>`;
 const s=localStorage.getItem("python-mastery-code-"+e.id);if(s!==null)$("editor").value=s;
 $("editor").addEventListener("keydown",ev=>{if((ev.ctrlKey||ev.metaKey)&&ev.key==="Enter"){ev.preventDefault();runCode()}});
}
function toggleAnswer(){const b=$("answerBox");b.style.display=b.style.display==="block"?"none":"block"}
function resetCode(){localStorage.removeItem("python-mastery-code-"+exercises[current].id);renderExercise(current)}
function newWorker(){if(worker)worker.terminate();worker=new Worker("./pyodide-worker.js",{type:"module"})}
function finishRun(){if(runTimer){clearTimeout(runTimer);runTimer=null}}
function runCode(){
 const e=exercises[current],code=$("editor").value;
 localStorage.setItem("python-mastery-code-"+e.id,code);$("output").textContent="در حال اجرای Python...";
 if(!worker)newWorker();
 const id=++seq;finishRun();
 runTimer=setTimeout(()=>{if(worker)worker.terminate();worker=null;$("output").textContent="⏱️ زمان اجرا تمام شد؛ Worker متوقف شد و اجرای بعدی Worker تازه می‌سازد.";runTimer=null},7000);
 worker.onmessage=ev=>{
  if(ev.data.id!==id)return;finishRun();
  if(ev.data.error){$("output").textContent="خطای Worker: "+ev.data.error;return}
  const rs=ev.data.results||[];let p=0;
  document.querySelectorAll(".test").forEach((el,i)=>{
   const expected=String(e.tests[i]?.expected??"").trim(),actual=String(rs[i]?.output??"").trim(),ok=!rs[i]?.error&&actual===expected;
   el.textContent=(ok?"✅":"❌")+" Test "+(i+1)+(rs[i]?.error?" — "+rs[i].error:"");el.className="test "+(ok?"ok":"fail");if(ok)p++;
  });
  $("output").textContent=rs.map((r,i)=>`Test ${i+1}: ${r?.error?"خطا: "+r.error:(r?.output||"بدون خروجی")}`).join("\n")||"نتیجه‌ای دریافت نشد.";
  if(p===e.tests.length&&!solved.includes(e.id)){solved.push(e.id);localStorage.setItem("python-mastery-solved",JSON.stringify(solved));progress()}
 };
 worker.onerror=()=>{finishRun();$("output").textContent="خطای Worker؛ اجرای بعدی با Worker تازه انجام می‌شود.";worker=null};
 worker.postMessage({id,code,tests:e.tests,mirrors:MIRRORS});
}
function progress(){const n=solved.length;$("progressText").textContent=fa(n)+" / ۱۱۵۵";$("progressBar").style.width=Math.min(100,n/1155*100)+"%"}
function exportExercises(){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([JSON.stringify(exercises,null,2)],{type:"application/json"}));a.href=u;a.download="exercises-1155.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function savePyodideMirror(){const v=$("pyodideMirror").value.trim();v?localStorage.setItem("python-mastery-pyodide-mirror",v):localStorage.removeItem("python-mastery-pyodide-mirror");location.reload()}
Object.assign(window,{runCode,toggleAnswer,resetCode,exportExercises,savePyodideMirror});init();