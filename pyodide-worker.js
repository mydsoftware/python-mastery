let py=null;
async function boot(mirrors){
  if(py)return py;
  let last;
  for(const b of mirrors){
    try{
      const m=await import(b+"pyodide.mjs");
      py=await m.loadPyodide({indexURL:b});
      return py;
    }catch(e){last=e}
  }
  throw last||Error("Pyodide unavailable");
}
self.onmessage=async e=>{
  const{id,code,tests,mirrors}=e.data;
  try{
    const p=await boot(mirrors),results=[];
    for(const t of tests){
      const input=String(t.input??"");
      const src=`import io,contextlib,builtins
_old=builtins.input
_out=io.StringIO()
_lines=iter(${JSON.stringify(input)}.splitlines())
builtins.input=lambda prompt="":next(_lines)
_err=None
try:
    with contextlib.redirect_stdout(_out):
        exec(${JSON.stringify(code)},{})
except Exception as ex:
    _err=f"{type(ex).__name__}: {ex}"
finally:
    builtins.input=_old
_result=(_out.getvalue().rstrip() if _err is None else "__PYTHON_ERROR__"+_err)
_result`;
      const v=String(await p.runPythonAsync(src)).trim();
      results.push(v.startsWith("__PYTHON_ERROR__")
        ?{error:v.slice(17),output:""}
        :{error:null,output:v});
    }
    self.postMessage({id,results});
  }catch(x){
    self.postMessage({id,error:String(x.message||x)});
  }
};