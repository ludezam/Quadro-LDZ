(function () {
 'use strict';
 let active = null;
 function cancel() { if (active) active(); }
 function show(image, incoming, canvas, stage) {
  cancel();
  const first = !image.getAttribute('src');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const box = stage.getBoundingClientRect();
  const iw = incoming.naturalWidth || incoming.width, ih = incoming.naturalHeight || incoming.height;
  if (first || reduced || document.hidden || !iw || !ih || !box.width || !box.height) {
   image.src = incoming.src; canvas.hidden = true; return Promise.resolve();
  }
  // Match object-fit: contain, so the brush never paints over the passe-partout.
  const fit = Math.min(box.width / iw, box.height / ih);
  const width = iw * fit, height = ih * fit;
  canvas.style.left = ((box.width - width) / 2) + 'px';
  canvas.style.top = ((box.height - height) / 2) + 'px';
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  const scale = Math.min(1, 1024 / width, 768 / height);
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) { image.src = incoming.src; canvas.hidden = true; return Promise.resolve(); }
  const paper = getComputedStyle(document.body).getPropertyValue('--paper').trim() || '#ede7da';
  ctx.fillStyle = paper; ctx.fillRect(0, 0, canvas.width, canvas.height);
  image.src = incoming.src; canvas.hidden = false;
  ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round';
  const rows = 18, band = canvas.height / rows, duration = 4000;
  function stroke(row, from, to) {
   const leftToRight = row % 2 === 0;
   const span = canvas.width + band * 2;
   const x = p => leftToRight ? -band + p * span : canvas.width + band - p * span;
   const y = p => band * (row + .5) + Math.sin(p * 5 + row * 1.7) * band * .12;
   ctx.strokeStyle = '#000'; ctx.lineWidth = band * 1.13;
   ctx.beginPath(); ctx.moveTo(x(from), y(from)); ctx.lineTo(x(to), y(to)); ctx.stroke();
   // Uneven bristles extend the wet edge instead of using a rectangular wipe.
   ctx.lineWidth = Math.max(1, band * .12);
   for (let bristle = 0; bristle < 10; bristle++) {
    const offset = (bristle - 4.5) * band * .15;
    const trail = (bristle % 3) * .013;
    ctx.beginPath(); ctx.moveTo(x(Math.max(0, from - trail)), y(from) + offset);
    ctx.lineTo(x(Math.max(0, to - trail)), y(to) + offset); ctx.stroke();
   }
  }
  return new Promise(resolve => {
   let frame = 0, start = null, last = -Infinity, progress = 0;
   const finish = () => {
    cancelAnimationFrame(frame); canvas.hidden = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (active === finish) active = null;
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('resize', finish); resolve();
   };
   const visibility = () => { if (document.hidden) finish(); };
   active = finish;
   document.addEventListener('visibilitychange', visibility);
   window.addEventListener('resize', finish);
   function draw(time) {
    if (active !== finish) return;
    if (start === null) start = time;
    if (time - last >= 32) {
     last = time;
     const next = Math.min(rows, (time - start) / duration * rows);
     while (progress < next) {
      const row = Math.floor(progress), end = Math.min(row + 1, next);
      stroke(row, progress - row, end - row); progress = end;
     }
     if (next >= rows) { finish(); return; }
    }
    frame = requestAnimationFrame(draw);
   }
   frame = requestAnimationFrame(draw);
  });
 }
 window.PaintReveal = { show, cancel };
})();
