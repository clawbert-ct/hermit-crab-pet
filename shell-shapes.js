// SHELL SHAPE GENERATOR — unique silhouette per tier type
// This function replaces the generic shape with type-specific ones

function drawShellShape(ctx, type, s) {
  const grad = ctx.createLinearGradient(0, 0, 400, 400);
  grad.addColorStop(0, s.highlight);
  grad.addColorStop(0.5, s.bg);
  grad.addColorStop(1, s.accent);
  
  ctx.beginPath();
  
  switch(type) {
    case 'spiral': // Tier 1: Amber conch with spiral whorls
      ctx.moveTo(200, 10);
      ctx.bezierCurveTo(280, 20, 340, 80, 330, 160);
      ctx.bezierCurveTo(310, 240, 240, 310, 160, 320);
      ctx.bezierCurveTo(80, 320, 30, 260, 50, 180);
      ctx.bezierCurveTo(70, 100, 120, 40, 200, 10);
      break;
      
    case 'spiked': // Tier 2: Pink with dramatic spikes
      ctx.moveTo(200, 30);
      ctx.bezierCurveTo(280, 60, 340, 160, 300, 260);
      ctx.bezierCurveTo(260, 340, 140, 340, 100, 260);
      ctx.bezierCurveTo(60, 180, 120, 60, 200, 30);
      break;
      
    case 'smooth': // Tier 3: Purple smooth teardrop
      ctx.moveTo(200, 15);
      ctx.bezierCurveTo(300, 40, 360, 150, 320, 260);
      ctx.bezierCurveTo(280, 340, 120, 340, 80, 260);
      ctx.bezierCurveTo(40, 150, 100, 40, 200, 15);
      break;
      
    case 'ridged': // Tier 4: Cyan with ridges
      ctx.moveTo(200, 20);
      ctx.bezierCurveTo(290, 40, 360, 140, 330, 250);
      ctx.bezierCurveTo(300, 340, 100, 340, 70, 250);
      ctx.bezierCurveTo(40, 140, 110, 40, 200, 20);
      break;
      
    case 'golden': // Tier 5: Crimson with triangular spires
      ctx.moveTo(180, 10);
      ctx.bezierCurveTo(260, 30, 340, 140, 310, 250);
      ctx.bezierCurveTo(280, 340, 120, 340, 90, 250);
      ctx.bezierCurveTo(60, 140, 100, 30, 180, 10);
      break;
      
    case 'green': // Tier 6: Green with glow
      ctx.moveTo(200, 10);
      ctx.bezierCurveTo(310, 40, 370, 160, 330, 270);
      ctx.bezierCurveTo(290, 350, 110, 350, 70, 270);
      ctx.bezierCurveTo(30, 160, 90, 40, 200, 10);
      break;
  }
  
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Spire tip for spiral type
  if (type === 'spiral') {
    ctx.beginPath();
    ctx.moveTo(200, 10);
    ctx.lineTo(195, -10);
    ctx.lineTo(205, -10);
    ctx.closePath();
    ctx.fillStyle = s.highlight;
    ctx.fill();
  }
  
  // Spikes for spiked type
  if (type === 'spiked') {
    const spikeAngles = [-0.8, -0.3, 0.3, 0.8, 1.3, 1.8, 2.3, 2.8];
    spikeAngles.forEach(a => {
      const bx = 200 + Math.cos(a) * 150;
      const by = 190 + Math.sin(a) * 130;
      const tx = 200 + Math.cos(a) * 190;
      const ty = 190 + Math.sin(a) * 170;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      ctx.lineTo(bx + Math.cos(a+0.3)*20, by + Math.sin(a+0.3)*20);
      ctx.fillStyle = s.bg;
      ctx.fill();
    });
  }
  
  // Dots for smooth type
  if (type === 'smooth') {
    [[180,100,6],[240,150,5],[160,200,5],[220,240,4],[190,170,3]].forEach(d => {
      ctx.beginPath();
      ctx.arc(d[0], d[1], d[2], 0, Math.PI * 2);
      ctx.fillStyle = s.highlight;
      ctx.globalAlpha = 0.6;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  
  // Ridges
  if (type === 'ridged') {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const y = 60 + i * 70;
      ctx.moveTo(80, y);
      ctx.bezierCurveTo(150, y + 25, 250, y + 25, 320, y);
      ctx.strokeStyle = s.accent;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  
  // Triangular spires for golden type
  if (type === 'golden') {
    [[160,80,170,40,180,80],[240,100,260,50,270,100],[300,200,320,160,330,220]].forEach(t => {
      ctx.beginPath();
      ctx.moveTo(t[0],t[1]);
      ctx.lineTo(t[2],t[3]);
      ctx.lineTo(t[4],t[5]);
      ctx.closePath();
      ctx.fillStyle = s.highlight;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  
  // Glow spots for green type
  if (type === 'green') {
    [[180,100,8],[240,160,6],[160,220,7],[220,260,5]].forEach(d => {
      ctx.beginPath();
      ctx.arc(d[0], d[1], d[2], 0, Math.PI * 2);
      ctx.fillStyle = s.highlight;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    });
    // Central glow
    ctx.beginPath();
    ctx.ellipse(200, 170, 80, 60, 0, 0, Math.PI * 2);
    ctx.fillStyle = s.highlight;
    ctx.globalAlpha = 0.15;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  // Aperture (dark hole) — all types
  ctx.beginPath();
  ctx.ellipse(200, 300, 60, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0500';
  ctx.fill();
  ctx.strokeStyle = s.highlight;
  ctx.lineWidth = 4;
  ctx.stroke();
}