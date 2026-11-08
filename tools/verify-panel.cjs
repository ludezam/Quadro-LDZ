const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root='app/src/main/assets/';
const catalog=JSON.parse(fs.readFileSync(root+'art/catalog.json'));
assert.equal(catalog.length,40);assert.equal(new Set(catalog.map(a=>a.file)).size,40);
assert.equal(catalog.filter(a=>a.brazilian).length,10);
for(const a of catalog){const b=fs.readFileSync(root+'art/'+a.file);assert.equal(b[0],255);assert.equal(b[1],216);assert.equal(a.license,'Public domain')}
const html=fs.readFileSync(root+'index.html','utf8');
assert(!html.includes('YouTube'));assert(!html.includes('iframe'));assert(!html.includes('filter:brightness'));
const elements={},timers=[],storage={},listeners={};let now=Date.now();
function element(id){return elements[id]||(elements[id]={id,hidden:id==='panel',disabled:false,textContent:'',value:'',tagName:'BUTTON',setAttribute(k,v){this[k]=v},focus(){},replaceChildren(){},append(){},querySelectorAll(){return []}})}
const classes=new Set();
const document={hidden:false,activeElement:element('next'),getElementById:element,body:{classList:{contains:k=>classes.has(k),toggle(k,v){if(v===undefined)v=!classes.has(k);if(v)classes.add(k);else classes.delete(k)}}},addEventListener(k,v){listeners[k]=v}};
class Clock extends Date{static now(){return now}}
const ctx=vm.createContext({console,document,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},Date:Clock,AbortController,setTimeout,clearTimeout,setInterval(fn,ms){timers.push({fn,ms})},fetch:async url=>{assert.equal(url,'art/catalog.json');return {ok:true,json:async()=>catalog}},Image:class{set src(v){fs.accessSync(root+v);this._src=v;queueMicrotask(()=>this.onload())}get src(){return this._src}},window:{addEventListener(){}},queueMicrotask});
storage.city=JSON.stringify({name:'Teste',id:1});
// Avoid a real weather request; the weather failure path is deliberately exercised.
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
async function settle(){await new Promise(resolve=>setImmediate(resolve))}
(async()=>{
 await settle();const images=new Set([elements.art.src]);
 for(let i=1;i<40;i++){await vm.runInContext('painting()',ctx);images.add(elements.art.src)}
 assert.equal(images.size,40);
 const before=elements.art.src;now+=14*60*1000;timers.filter(t=>t.ms===1000).forEach(t=>t.fn());await settle();assert.equal(elements.art.src,before);
 now+=60*1000;timers.filter(t=>t.ms===1000).forEach(t=>t.fn());await settle();assert.notEqual(elements.art.src,before);
 elements.theme.onclick();assert(classes.has('night'));assert.equal(elements.theme.textContent,'Modo claro');assert.equal(JSON.parse(storage.night),true);
 elements.theme.onclick();assert(!classes.has('night'));assert.equal(elements.theme.textContent,'Modo escuro');
 vm.runInContext("showWeather({current:{temperature_2m:23,weather_code:2},daily:{temperature_2m_min:[19],temperature_2m_max:[31],precipitation_probability_max:[70]}},false)",ctx);assert.equal(elements.status.hidden,true);
 console.log('OK: 40 JPEGs (10 brasileiros), ciclo completo, troca aos 15 min, temas persistidos e clima sem linha de atualização.');
})().catch(e=>{console.error(e);process.exitCode=1});
