const fs=require('fs'),vm=require('vm'),assert=require('assert');
let raf=new Map(),nextId=0,reduced=false,strokes=0,clears=0;
const document={hidden:false,body:{},addEventListener(){},removeEventListener(){}};
const window={matchMedia:()=>({matches:reduced}),addEventListener(){},removeEventListener(){}};
const ctx={fillRect(){},clearRect(){clears++},beginPath(){},moveTo(){},lineTo(){},stroke(){strokes++}};
const canvas={style:{},hidden:true,getContext:()=>ctx};
const image={src:'',getAttribute(){return this.src||null}};
const stage={getBoundingClientRect:()=>({width:1800,height:1000})};
const context=vm.createContext({window,document,Promise,Math,getComputedStyle:()=>({getPropertyValue:()=> '#ede7da'}),requestAnimationFrame:fn=>{const id=++nextId;raf.set(id,fn);return id},cancelAnimationFrame:id=>raf.delete(id)});
vm.runInContext(fs.readFileSync('app/src/main/assets/paint-reveal.js','utf8'),context);
const incoming={src:'first.jpg',naturalWidth:1600,naturalHeight:1000};
(async()=>{
 await window.PaintReveal.show(image,incoming,canvas,stage);assert.equal(image.src,'first.jpg');assert(canvas.hidden);assert.equal(raf.size,0);
 incoming.src='second.jpg';const done=window.PaintReveal.show(image,incoming,canvas,stage);
 assert(!canvas.hidden);assert(canvas.width<=1024&&canvas.height<=768);
 let finished=false;done.then(()=>finished=true);
 for(let time=0;time<4000;time+=16){const frame=Array.from(raf.values());raf.clear();frame.forEach(fn=>fn(time))}
 await Promise.resolve();assert(!finished);assert(strokes>100);
 const frame=Array.from(raf.values());raf.clear();frame.forEach(fn=>fn(4032));await done;assert(canvas.hidden);assert.equal(raf.size,0);
 incoming.src='third.jpg';const cancelled=window.PaintReveal.show(image,incoming,canvas,stage);window.PaintReveal.cancel();await cancelled;assert(canvas.hidden);assert.equal(image.src,'third.jpg');assert.equal(raf.size,0);
 reduced=true;await window.PaintReveal.show(image,{...incoming,src:'fourth.jpg'},canvas,stage);assert(canvas.hidden);assert.equal(raf.size,0);
 assert(clears>=2);console.log('OK: primeira obra imediata, pinceladas de 4s, canvas limitado, cancelamento e movimento reduzido.');
})().catch(e=>{console.error(e);process.exitCode=1});
