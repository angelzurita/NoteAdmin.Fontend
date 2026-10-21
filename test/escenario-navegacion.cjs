'use strict';
const assert=require('node:assert/strict');
module.exports=async({js,cdp,until,shot,evidence,kind})=>{
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 const click=async selector=>{await until(()=>js('!!document.querySelector('+JSON.stringify(selector)+')'));await js('document.querySelector('+JSON.stringify(selector)+').click()');};
 const campo=async(selector,valor)=>js('(()=>{const e=document.querySelector('+JSON.stringify(selector)+');const p=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,"value").set.call(e,'+JSON.stringify(valor)+');e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));})()');
 const atras=()=>js('history.back()'),adelante=()=>js('history.forward()');
 const elegir=async texto=>{await until(()=>js('[...document.querySelectorAll(".topbar .nav button")].some(e=>e.textContent.trim()==='+JSON.stringify(texto)+')'));await js('[...document.querySelectorAll(".topbar .nav button")].find(e=>e.textContent.trim()==='+JSON.stringify(texto)+').click()');};
 const ruta=()=>js('location.pathname+location.search+location.hash');
 const casos=[];
 if(kind==='cuenta'){
  await until(()=>js('document.querySelector("#nav")&&!document.querySelector("#nav").classList.contains("hidden")'));
  for(const width of [1440,390,320]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:width>400?1000:844,deviceScaleFactor:1,mobile:width<400});
   await click('[data-go=inicio]');await click('[data-go=labs]');await click('[data-go=cuenta]');
   await atras();await until(()=>js('document.querySelector("#v-labs").classList.contains("active")'));
   await adelante();await until(()=>js('document.querySelector("#v-cuenta").classList.contains("active")'));
   assert.equal(await js('document.documentElement.scrollWidth>innerWidth+1'),false);
  }
  await campo('#nomForm [name=nombre]','Borrador ficticio RAM');
  await click('[data-go=labs]');await atras();await until(()=>js('document.querySelector("#v-cuenta").classList.contains("active")'));
  assert.equal(await js('document.querySelector("#nomForm [name=nombre]").value'),'Borrador ficticio RAM');
  await click('[data-go=labs]');await click('[data-detalle]');
  await atras();await until(()=>js('!document.querySelector("#modal [role=dialog]")'));
  await adelante();await until(()=>js('!!document.querySelector("#modal [role=dialog]")'));
  assert.equal(await js('history.state.ruta.detalle'),'demo');
  casos.push('vistas-back-forward-3anchos','nombre-RAM','detalle-sin-inscribir');
  await click('[data-mb="1"]');
 }else if(kind==='disciplina'){
  await until(()=>js('!!document.querySelector(".topbar .nav")'));
  for(const width of [1440,390,320]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:width>400?1000:844,deviceScaleFactor:1,mobile:width<400});
   await elegir('Hoy');await elegir('Semana');await elegir('Horario');
   await atras();await until(()=>js('location.hash.startsWith("#semana")'));
   await adelante();await until(()=>js('location.hash.startsWith("#horario")'));
   assert.equal(await js('document.documentElement.scrollWidth>innerWidth+1'),false);
  }
  await js('[...document.querySelectorAll(".horario button")].find(e=>e.textContent.includes("Agregar actividad")).click()');
  const hora=await js('document.querySelector(".horario input[type=time]")?.value');
  if(hora!==undefined){
   await campo('.horario input[type=time]','08:35');
   await elegir('Progreso');await atras();await until(()=>js('location.hash.startsWith("#horario")'));
   assert.equal(await js('document.querySelector(".horario input[type=time]").value'),'08:35');
   casos.push('horario-RAM-sin-guardar');
  }
  await elegir('Laboratorios');
  await until(()=>js('!!document.querySelector(".lab-abrir")'));
  await click('.lab-abrir');await atras();await until(()=>js('!document.querySelector(".modal-bg")'));
  await adelante();await until(()=>js('!!document.querySelector(".modal-bg")'));
  casos.push('vistas-back-forward-3anchos','detalle-de-lab-sin-inscribir');
 }else if(kind==='notes'){
  await until(()=>js('!!document.querySelector("a[href=\\"/notes\\"]")'));
  for(const width of [1440,390,320]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:width>400?1000:844,deviceScaleFactor:1,mobile:width<400});
   await click('a[href="/notes"]');await until(()=>js('location.pathname==="/notes"'));
   await click('a[href="/categories"]');await until(()=>js('location.pathname==="/categories"'));
   await atras();await until(()=>js('location.pathname==="/notes"'));await adelante();await until(()=>js('location.pathname==="/categories"'));
   assert.equal(await js('document.documentElement.scrollWidth>innerWidth+1'),false);
  }
  await click('a[href="/notes"]');await click('a[href="/notes/create"]');
  await until(()=>js('!!document.querySelector("app-notes-create input")'));
  await campo('app-notes-create input','Título ficticio sin guardar');
  await js('window.confirm=()=>false');await atras();
  await until(()=>js('location.pathname==="/notes/create"'));
  assert.equal(await js('document.querySelector("app-notes-create input").value'),'Título ficticio sin guardar');
  await js('window.confirm=()=>true');await atras();await until(()=>js('location.pathname==="/notes"'));
  await adelante();await until(()=>js('location.pathname==="/notes/create"'));
  casos.push('router-back-forward-3anchos','cancelar-conserva-edicion','aceptar-descarta-sin-POST');
 }else if(kind==='skleros'){
  await until(()=>js('[...document.querySelectorAll("h3")].some(e=>e.textContent.includes("Press ficticio"))'));
  for(const width of [1440,390,320]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height:width>400?1000:844,deviceScaleFactor:1,mobile:width<400});
   await js('[...document.querySelectorAll("button")].find(e=>e.textContent.trim().includes("Barra")&&!e.textContent.includes("lateral")).click()');
   await until(()=>js('new URLSearchParams(location.search).get("equipo")==="barbell"'));
   await js('[...document.querySelectorAll("h3")].find(e=>e.textContent.includes("Press ficticio")).click()');
   await until(()=>js('new URLSearchParams(location.search).get("ejercicio")==="ej1"'));
   await atras();await until(()=>js('!new URLSearchParams(location.search).has("ejercicio")'));
   await adelante();await until(()=>js('new URLSearchParams(location.search).get("ejercicio")==="ej1"'));
   assert.equal(await js('document.documentElement.scrollWidth>innerWidth+1'),false);
   await atras();await until(()=>js('!new URLSearchParams(location.search).has("ejercicio")'));
  }
  await js('const f=document.createElement("form");f.id="guardFixture";f.innerHTML="<input value=\\"Ficticio\\">";document.body.append(f);');
  await campo('#guardFixture input','Borrador ficticio');
  const antes=await ruta();
  await js('window.confirm=()=>false');await atras();await until(async()=>await ruta()===antes);
  assert.equal(await js('document.querySelector("#guardFixture input").value'),'Borrador ficticio');
  await js('window.confirm=()=>true');await atras();await pause(150);
  await js('document.querySelector("#guardFixture").remove()');
  casos.push('musculo-equipo-ejercicio-back-forward-3anchos','guardia-edicion-fixture-DOM-cancelar-aceptar');
 }
 await pause(150);
 assert.equal(evidence.excepciones.length,0,JSON.stringify(evidence.excepciones));
 await shot('navegacion-320');
 evidence.navegacion={casos,anchos:[1440,390,320],gestosFisicosIOS:'Pendiente manual',API:'Mocks sintéticos locales; no sesiones ni datos productivos'};
};
