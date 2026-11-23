const fs=require('fs'),vm=require('vm'),assert=require('assert');
let raf=new Map(),nextId=0,reduced=false,strokes=0,clears=0,segments=[],startPoint,endPoint;
const document={hidden:false,body:{},addEventListener(){},removeEventListener(){}};
const window={matchMedia:()=>({matches:reduced}),addEventListener(){},removeEventListener(){}};
const ctx={fillRect(){},clearRect(){clears++},beginPath(){},moveTo(x,y){startPoint={x,y}},lineTo(x,y){endPoint={x,y}},stroke(){strokes++;segments.push({a:startPoint,b:endPoint,width:this.lineWidth})}};
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
 for(let time=0;time<3000;time+=16){const frame=Array.from(raf.values());raf.clear();frame.forEach(fn=>fn(time))}
 await Promise.resolve();assert(!finished);assert(strokes>100);
 const frame=Array.from(raf.values());raf.clear();frame.forEach(fn=>fn(3032));await done;assert(canvas.hidden);assert.equal(raf.size,0);
 incoming.src='third.jpg';const cancelled=window.PaintReveal.show(image,incoming,canvas,stage);window.PaintReveal.cancel();await cancelled;assert(canvas.hidden);assert.equal(image.src,'third.jpg');assert.equal(raf.size,0);
 reduced=true;await window.PaintReveal.show(image,{...incoming,src:'fourth.jpg'},canvas,stage);assert(canvas.hidden);assert.equal(raf.size,0);
 assert(clears>=2);
 reduced=false;
 for(const [w,h] of [[1600,1000],[1000,1600],[1000,1000]]){
  segments=[];
  const running=window.PaintReveal.show(image,{src:'topdown.jpg',naturalWidth:w,naturalHeight:h},canvas,stage);
  for(let time=0;time<=3032;time+=32){const frame=Array.from(raf.values());raf.clear();frame.forEach(fn=>fn(time))}
  await running;
  assert(segments.length>100);
  const band=canvas.height/18;
  const main=segments.filter(s=>s.width>band);
  assert(main.some(s=>s.b.x>s.a.x)&&main.some(s=>s.b.x<s.a.x),'Pinceladas horizontais devem alternar o sentido');
  let previous=-Infinity;
  for(const s of main){const middle=(s.a.y+s.b.y)/2;assert(middle>=previous-band*.25,'Revelação deve avançar de cima para baixo');previous=middle;}
  assert((main[0].a.y+main[0].b.y)/2<canvas.height*.1);
  assert(previous>canvas.height*.9);
  const distance=(x,y,s)=>{const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y;const t=Math.max(0,Math.min(1,((x-s.a.x)*dx+(y-s.a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-s.a.x-t*dx,y-s.a.y-t*dy)};
  for(let ix=0;ix<=20;ix++)for(let iy=0;iy<=20;iy++)assert(segments.some(s=>distance(canvas.width*ix/20,canvas.height*iy/20,s)<=s.width/2),'Máscara deve revelar toda a imagem');
 }
 console.log('OK: pinceladas de cima para baixo e cobertura em 3 formatos, primeira obra imediata, duração de 3s, canvas limitado, cancelamento e movimento reduzido.');
})().catch(e=>{console.error(e);process.exitCode=1});
