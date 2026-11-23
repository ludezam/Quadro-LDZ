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
  // Advance along the image diagonal. Parallel brush tracks cover the entire
  // rectangle as the wet edge travels from the top-left to the bottom-right.
  const rows = 18, duration = 4000;
  const length = Math.hypot(canvas.width, canvas.height);
  const ux = canvas.width / length, uy = canvas.height / length;
  const extent = canvas.width * canvas.height / length;
  const band = extent * 2 / rows;
  function stroke(row, from, to) {
   const track = -extent + band * (row + .5);
   const across = p => track + Math.sin(p * 5 + row * 1.7) * band * .06;
   const along = p => -band + p * (length + band * 2);
   const x = (p, offset = 0) => ux * along(p) - uy * (across(p) + offset);
   const y = (p, offset = 0) => uy * along(p) + ux * (across(p) + offset);
   ctx.strokeStyle = '#000'; ctx.lineWidth = band * 1.13;
   ctx.beginPath(); ctx.moveTo(x(from), y(from)); ctx.lineTo(x(to), y(to)); ctx.stroke();
   // Uneven bristles extend the wet edge instead of using a rectangular wipe.
   ctx.lineWidth = Math.max(1, band * .12);
   for (let bristle = 0; bristle < 10; bristle++) {
    const offset = (bristle - 4.5) * band * .15;
    const trail = (bristle % 3) * .013;
    const start = Math.max(0, from - trail), end = Math.max(0, to - trail);
    if (end <= start) continue;
    ctx.beginPath(); ctx.moveTo(x(start, offset), y(start, offset));
    ctx.lineTo(x(end, offset), y(end, offset)); ctx.stroke();
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
     const next = Math.min(1, (time - start) / duration);
     if (progress < next) {
      for (let row = 0; row < rows; row++) stroke(row, progress, next);
      progress = next;
     }
     if (next >= 1) { finish(); return; }
    }
    frame = requestAnimationFrame(draw);
   }
   frame = requestAnimationFrame(draw);
  });
 }
 window.PaintReveal = { show, cancel };
})();
