'use strict';
// Chromium real contra servidor y cuenta ficticios; no iniciar contra producción.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const out=process.env.LAB_EVIDENCE_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'lab-navegador-'));
fs.mkdirSync(out,{recursive:true,mode:0o700});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<150;i++){const r=await fn();if(r)return r;await pause(100);}throw Error('Tiempo agotado esperando interfaz');}
const save=(f,v)=>fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n',{mode:0o600});
async function browser(base, cookie, repo, name) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-' + name + '-'));
  const proc = spawn((process.env.CHROMIUM_PATH || path.join(os.homedir(), '.cache/ms-playwright/chromium-1140/chrome-linux/chrome')), ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  let ws, jsDiagnostico, cdpDiagnostico, etapa = 'arranque';
  const evidence = { capturas: [], vistas: [], clases: [], excepciones: [], redFallida: [], perfil: profile };
  try {
    await until(() => fs.existsSync(profile + '/DevToolsActivePort'));
    const p = fs.readFileSync(profile + '/DevToolsActivePort', 'utf8').split('\n')[0];
    const pages = await (await fetch('http://127.0.0.1:' + p + '/json/list')).json();
    ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.addEventListener('open', r, { once: true }); ws.addEventListener('error', j, { once: true }); });
    let seq = 0; const pending = new Map();
    ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id) { const a = pending.get(m.id); pending.delete(m.id); if (m.error) a.reject(Error(m.error.message)); else a.resolve(m.result); } if (m.method === 'Runtime.exceptionThrown') evidence.excepciones.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === 'Network.loadingFailed') evidence.redFallida.push(m.params.errorText); });
    const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
    const js = async expression => { const r = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
    jsDiagnostico=js; cdpDiagnostico=cdp;
    const shot = async label => { await pause(350); const s = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: false }); const file = out + '/' + name + '-' + label + '.png'; fs.writeFileSync(file, Buffer.from(s.data, 'base64'), { mode: 0o600 }); evidence.capturas.push(file); };
    ws.addEventListener('message', ev => {
      const m=JSON.parse(ev.data);
      if(m.method==='Page.javascriptDialogOpening' && m.params.type==='beforeunload')
        cdp('Page.handleJavaScriptDialog',{accept:true}).catch(()=>{});
    });
    await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Network.enable');
    await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const [cn, cv] = cookie.split('='); await cdp('Network.setCookie', { name: cn, value: cv, url: base, httpOnly: true, sameSite: 'Lax' });
    await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    const claims={sub:'ficticio',uid:'ficticio',name:'Persona ficticia',email:'persona@ficticio.invalid',plan:'premium',exp:Math.floor(Date.now()/1000)+3600};
    const fake=Buffer.from('{}').toString('base64url')+'.'+Buffer.from(JSON.stringify(claims)).toString('base64url')+'.ficticio';
    await cdp('Page.addScriptToEvaluateOnNewDocument',{source:'globalThis.__SKLEROS_API_URL__=location.origin+"/api";localStorage.setItem("access_token",'+JSON.stringify(fake)+');localStorage.setItem("skl_access",'+JSON.stringify(fake)+');'});
    await cdp('Page.navigate', { url: base+(name==='skleros'?'/?musculo=chest':'') });
    await until(() => js('document.readyState==="complete"'));
    await require('./escenario-navegacion.cjs')({js,cdp,until,shot,evidence,kind:name});
  } catch(e) {
    evidence.error={etapa,mensaje:e.message,stack:e.stack};
    if(jsDiagnostico) evidence.dom=await jsDiagnostico('({titulo:document.title,vista:[...document.querySelectorAll(".view.active")].map(e=>e.id),leccion:document.querySelector("#leccion")?.className,toast:document.querySelector("#toast")?.textContent,ejercicio:document.querySelector("#ejercicio")?.textContent,pie:document.querySelector("#leccionFootInner")?.textContent})').catch(()=>null);
    if(cdpDiagnostico){const s=await cdpDiagnostico('Page.captureScreenshot',{format:'png',fromSurface:false}).catch(()=>null);if(s)fs.writeFileSync(out+'/'+name+'-error.png',Buffer.from(s.data,'base64'),{mode:0o600});}
    save(out+'/'+name+'-error.json',evidence);throw e;
  } finally { if (ws) ws.close(); proc.kill('SIGTERM'); }
  return evidence;
}
module.exports=browser;
