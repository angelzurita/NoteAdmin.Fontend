'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),kind={'disciplina-front':'disciplina','notes-lab':'notes','@skleros/web':'skleros','cuenta-lab':'cuenta'}[require('../package.json').name];assert.ok(kind);
const root=path.join(repo,kind==='notes'?'dist/NotesAdmin/browser':kind==='cuenta'?'public':'dist');
const out=process.env.LAB_EVIDENCE_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'ui-nav-'));fs.mkdirSync(out,{recursive:true,mode:0o700});process.env.LAB_EVIDENCE_DIR=out;
const lab={slug:'demo',nombre:'Demo ficticio',url:'https://demo.ficticio.invalid',tipo:'curso',icono:'🌐',portada:['#123456','#654321'],resumen:'Caso ficticio',categorias:['Prueba'],nivel:'Inicial',etiquetas:['Prueba'],contenido:'Un caso ficticio',aprenderas:['Navegar'],inscrito:true,inscritoDesde:null,ultima:null,veces:0};
const note={id:'n1',title:'Nota ficticia',content:'<p>Contenido ficticio</p>',categoryId:'c1',categoryName:'Ficticia',createdAt:'2026-10-20T00:00:00Z',updatedAt:'2026-10-20T00:00:00Z'};
const exercise={id:'ej1',name:'Press ficticio',nameEs:'Press ficticio',description:'Demostración ficticia',steps:[],muscleSlug:'chest',equipment:{code:'barbell',name:'Barbell'},difficulty:{code:'beginner',name:'Beginner'},secondaryMuscles:[]};
let writes=[],sesion=true;
function mock(p){
 if(p.endsWith('/config'))return {sso:false,ai:false,pagos:false,todoGratis:true};
 if(kind==='disciplina'){
  if(p.endsWith('/auth/me'))return {id:1,username:'ficticio',displayName:'Persona ficticia'};
  if(p.endsWith('/auth/status'))return {sso:false};
  if(p.endsWith('/labs/admin'))return {url:null};
  if(p.endsWith('/plan'))return {versions:[]};
  if(p.endsWith('/range'))return {checks:[],days:[],reviews:[]};
  if(p.endsWith('/labs'))return {apps:[lab]};
  if(p.endsWith('/labs/aprendizaje-cloud'))return {cloud:null};
  return {};
 }
 if(kind==='cuenta'){
  if(p.endsWith('/yo'))return {usuario:'ficticio',nombre:'Persona ficticia',email:null,admin:false,apps:[lab]};
  return {apps:[lab]};
 }
 if(kind==='notes'){
  if(p.endsWith('/notes'))return {success:true,data:[note]};
  if(p.endsWith('/notes/n1'))return {success:true,data:note};
  if(p.endsWith('/categories'))return {success:true,data:[{id:'c1',name:'Ficticia',description:''}]};
  return {success:true,data:[]};
 }
 if(p.endsWith('/muscles'))return {data:[{id:'chest',slug:'chest',name:'Pecho',nameEs:'Pecho',children:[]}]};
 if(p.includes('/exercises/muscle/'))return {data:[exercise],limited:false};
 if(p.endsWith('/exercises'))return {data:[exercise]};
 return {data:[]};
}
const mime={'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.glb':'model/gltf-binary','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://local'),p=u.pathname;
 if(p.startsWith('/api/')){
  if(['POST','PUT','DELETE','PATCH'].includes(req.method))writes.push({method:req.method,path:p});
  if(p.endsWith('/logout'))sesion=false;
  res.writeHead(!sesion&&p.endsWith('/yo')?401:200,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify(mock(p)));return;
 }
 let f=path.resolve(root,'.'+decodeURIComponent(p));if(!f.startsWith(root+path.sep)&&f!==root){res.writeHead(404);res.end();return;}
 if(!fs.existsSync(f)||!fs.statSync(f).isFile())f=path.join(root,'index.html');
 res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'text/html','Cache-Control':'no-store'});res.end(fs.readFileSync(f));
});
(async()=>{try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const evidence=await require('../test/navegacion-ui.cjs')('http://127.0.0.1:'+server.address().port,'fixture=ficticio',repo,kind);
 assert.equal(writes.length,0,'Atrás/Adelante no debe escribir ni crear entidades');
 fs.writeFileSync(out+'/resultado.json',JSON.stringify({ok:true,kind,evidence,writes,produccionModificada:false},null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify({ok:true,kind,casos:evidence.navegacion.casos,escrituras:writes.length,evidencia:out}));
}finally{await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
