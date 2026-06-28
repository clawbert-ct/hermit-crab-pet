// Shell drawing functions converted from Erinem's Figma SVGs
// Each function draws a proper spiral shell on a canvas context

function drawBottleCap(ctx, scale) {
  // Tier 0 - still a flat bottle cap
  ctx.beginPath();
  ctx.ellipse(0, 0, 50, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#B0B0B0';
  ctx.fill();
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Crinkled edge
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rx = 52 + Math.sin(i * 3) * 3;
    const ry = 40 + Math.sin(i * 3) * 3;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * rx, Math.sin(angle) * ry, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#909090';
    ctx.fill();
  }
  // Text
  ctx.fillStyle = '#606060';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('COLA', 0, 3);
  // Dent
  ctx.beginPath();
  ctx.ellipse(10, -8, 8, 5, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fill();
}

function drawAmberConch(ctx, scale) {
  // Tier 1 - Shell 1 from SVG: amber spiral conch
  ctx.save();
  ctx.scale(scale, scale);
  ctx.rotate(0.26); // 15 degrees like original
  
  // Gradient
  const grad = ctx.createLinearGradient(-100, -100, 100, 100);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.5, '#d97706');
  grad.addColorStop(1, '#92400e');
  
  // Spiral whorls - body whorl (biggest)
  ctx.beginPath();
  ctx.moveTo(120, 40);
  ctx.bezierCurveTo(140, 40, 150, 60, 140, 80);
  ctx.bezierCurveTo(110, 70, 70, 70, 50, 80);
  ctx.bezierCurveTo(40, 60, 60, 40, 80, 40);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Second whorl
  ctx.beginPath();
  ctx.moveTo(140, 80);
  ctx.bezierCurveTo(160, 80, 170, 110, 160, 130);
  ctx.bezierCurveTo(120, 120, 70, 120, 40, 130);
  ctx.bezierCurveTo(30, 110, 20, 80, 50, 80);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Body whorl (bottom/biggest)
  ctx.beginPath();
  ctx.moveTo(160, 130);
  ctx.bezierCurveTo(170, 150, 150, 180, 100, 190);
  ctx.bezierCurveTo(70, 190, 30, 160, 40, 130);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Spire tip
  ctx.beginPath();
  ctx.moveTo(100, 15);
  ctx.bezierCurveTo(110, 15, 115, 25, 110, 40);
  ctx.lineTo(90, 40);
  ctx.bezierCurveTo(85, 25, 90, 15, 100, 15);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Spire top
  ctx.beginPath();
  ctx.moveTo(100, 5);
  ctx.bezierCurveTo(105, 5, 105, 10, 105, 15);
  ctx.lineTo(95, 15);
  ctx.bezierCurveTo(95, 10, 95, 5, 100, 5);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Aperture (opening)
  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.bezierCurveTo(80, 135, 100, 145, 110, 170);
  ctx.bezierCurveTo(90, 185, 60, 180, 50, 160);
  ctx.bezierCurveTo(45, 150, 50, 145, 60, 140);
  ctx.closePath();
  ctx.fillStyle = '#451a03';
  ctx.fill();
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Ridges
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.bezierCurveTo(80, 90, 120, 90, 130, 80);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(50, 130);
  ctx.bezierCurveTo(80, 140, 130, 140, 150, 130);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(55, 105);
  ctx.bezierCurveTo(80, 115, 120, 115, 145, 105);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  ctx.restore();
}

function drawPinkMoonSnail(ctx, scale) {
  // Tier 2 - Shell 2 from SVG: pink moon snail with spines
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(10, 10);
  
  // Base gradient
  const baseGrad = ctx.createLinearGradient(20, 0, 160, 200);
  baseGrad.addColorStop(0, '#fdf2f8');
  baseGrad.addColorStop(0.4, '#f472b6');
  baseGrad.addColorStop(1, '#be185d');
  
  // Main shell body
  ctx.beginPath();
  ctx.moveTo(100, 20);
  ctx.bezierCurveTo(160, 50, 180, 120, 140, 160);
  ctx.bezierCurveTo(100, 180, 60, 160, 40, 120);
  ctx.bezierCurveTo(20, 80, 60, 40, 100, 20);
  ctx.closePath();
  ctx.fillStyle = baseGrad;
  ctx.fill();
  
  // Spines
  const spineColor = '#f472b6';
  const spineStroke = '#be185d';
  const spines = [
    { points: [150,60, 180,40, 160,75] },
    { points: [165,95, 195,90, 165,110] },
    { points: [155,130, 180,150, 145,145] },
    { points: [115,165, 125,190, 100,170] },
    { points: [60,155, 40,180, 70,145] },
    { points: [30,110, 5,115, 35,95] },
    { points: [40,65, 15,45, 50,55] },
    { points: [75,30, 60,5, 90,25] }
  ];
  spines.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(s.points[0], s.points[1]);
    ctx.lineTo(s.points[2], s.points[3]);
    ctx.lineTo(s.points[4], s.points[5]);
    ctx.closePath();
    ctx.fillStyle = spineColor;
    ctx.fill();
    ctx.strokeStyle = spineStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  
  // Spiral growth lines
  ctx.beginPath();
  ctx.moveTo(100, 20);
  ctx.bezierCurveTo(110, 50, 90, 80, 50, 100);
  ctx.strokeStyle = '#831843';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(130, 50);
  ctx.bezierCurveTo(130, 80, 110, 110, 70, 130);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(150, 90);
  ctx.bezierCurveTo(140, 120, 120, 140, 90, 160);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Aperture with lip
  const lipGrad = ctx.createLinearGradient(0, 0, 200, 0);
  lipGrad.addColorStop(0, '#f9a8d4');
  lipGrad.addColorStop(1, '#fda4af');
  
  ctx.beginPath();
  ctx.moveTo(80, 90);
  ctx.bezierCurveTo(120, 70, 140, 90, 130, 140);
  ctx.bezierCurveTo(120, 160, 90, 170, 70, 150);
  ctx.bezierCurveTo(60, 140, 70, 110, 80, 90);
  ctx.closePath();
  ctx.fillStyle = lipGrad;
  ctx.fill();
  ctx.strokeStyle = '#fff1f2';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Dark interior
  ctx.beginPath();
  ctx.moveTo(85, 100);
  ctx.bezierCurveTo(110, 90, 120, 105, 115, 130);
  ctx.bezierCurveTo(110, 145, 95, 150, 80, 140);
  ctx.bezierCurveTo(75, 130, 75, 115, 85, 100);
  ctx.closePath();
  ctx.fillStyle = '#4c0519';
  ctx.fill();
  
  ctx.restore();
}

function drawGoldenTurbano(ctx, scale) {
  // Tier 3 - Shell 5 from SVG: golden spotted shell
  ctx.save();
  ctx.scale(scale, scale);
  ctx.rotate(-0.26); // -15 degrees
  
  // Radial gradient
  const bgGrad = ctx.createRadialGradient(80, 80, 10, 100, 100, 130);
  bgGrad.addColorStop(0, '#fef08a');
  bgGrad.addColorStop(0.7, '#eab308');
  bgGrad.addColorStop(1, '#854d0e');
  
  // Main shell body
  ctx.beginPath();
  ctx.moveTo(100, 30);
  ctx.bezierCurveTo(160, 30, 180, 90, 160, 140);
  ctx.bezierCurveTo(130, 190, 70, 180, 40, 140);
  ctx.bezierCurveTo(10, 100, 40, 30, 100, 30);
  ctx.closePath();
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Spots pattern
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const sx = 40 + col * 28 + (row % 2) * 14;
      const sy = 40 + row * 28;
      const dist = Math.sqrt((sx - 100) * (sx - 100) + (sy - 100) * (sy - 100));
      if (dist < 85) {
        ctx.beginPath();
        ctx.arc(sx, sy, 5 + Math.sin(col + row) * 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
        ctx.fill();
      }
    }
  }
  
  // Growth ridges
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.bezierCurveTo(60, 100, 100, 80, 150, 90);
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(60, 160);
  ctx.bezierCurveTo(80, 130, 120, 120, 160, 125);
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // Highlight
  ctx.beginPath();
  ctx.moveTo(100, 35);
  ctx.bezierCurveTo(140, 35, 165, 75, 155, 110);
  ctx.bezierCurveTo(145, 70, 110, 45, 75, 55);
  ctx.bezierCurveTo(60, 60, 50, 70, 45, 80);
  ctx.bezierCurveTo(45, 60, 65, 35, 100, 35);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fill();
  
  // Aperture
  ctx.beginPath();
  ctx.moveTo(70, 120);
  ctx.bezierCurveTo(110, 110, 130, 140, 110, 170);
  ctx.bezierCurveTo(90, 190, 60, 160, 70, 120);
  ctx.closePath();
  ctx.fillStyle = '#fef9c3';
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Dark interior
  ctx.beginPath();
  ctx.moveTo(75, 130);
  ctx.bezierCurveTo(100, 125, 115, 145, 105, 165);
  ctx.bezierCurveTo(90, 180, 70, 155, 75, 130);
  ctx.closePath();
  ctx.fillStyle = '#450a0a';
  ctx.fill();
  
  ctx.restore();
}

function drawTealNautilus(ctx, scale) {
  // Tier 4 - Shell 6 from SVG: teal nautilus with gold spirals
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(10, 10);
  
  // Teal gradient
  const grad = ctx.createLinearGradient(0, 0, 200, 200);
  grad.addColorStop(0, '#2dd4bf');
  grad.addColorStop(0.5, '#0ea5e9');
  grad.addColorStop(1, '#312e81');
  
  // Gold gradient for strokes
  const goldGrad = ctx.createLinearGradient(0, 200, 200, 0);
  goldGrad.addColorStop(0, '#fbbf24');
  goldGrad.addColorStop(0.5, '#fef3c7');
  goldGrad.addColorStop(1, '#d97706');
  
  // Main spiral body
  ctx.beginPath();
  ctx.moveTo(100, 20);
  ctx.bezierCurveTo(160, 20, 180, 80, 160, 130);
  ctx.bezierCurveTo(140, 180, 80, 180, 40, 140);
  ctx.bezierCurveTo(0, 100, 20, 40, 70, 20);
  ctx.bezierCurveTo(100, 10, 140, 20, 160, 60);
  ctx.bezierCurveTo(180, 100, 160, 140, 120, 150);
  ctx.bezierCurveTo(90, 160, 60, 140, 60, 110);
  ctx.bezierCurveTo(60, 80, 90, 60, 120, 70);
  ctx.bezierCurveTo(140, 80, 140, 110, 120, 120);
  ctx.bezierCurveTo(110, 125, 100, 120, 100, 110);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  
  // Gold spiral arms
  const arms = [
    [100,20, 110,40, 100,60, 70,20],
    [145,35, 130,60, 110,70, 95,35],
    [175,80, 140,90, 120,90, 130,50],
    [165,125, 130,115, 120,100, 150,85],
    [135,160, 110,140, 105,120, 135,115],
    [85,170, 80,140, 90,125, 115,135],
    [35,135, 50,115, 70,110, 85,140],
    [20,80, 50,85, 65,100, 50,125]
  ];
  arms.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.bezierCurveTo(a[2], a[3], a[4], a[5], a[6], a[7]);
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  // Highlight
  ctx.beginPath();
  ctx.moveTo(100, 25);
  ctx.bezierCurveTo(140, 25, 165, 70, 150, 115);
  ctx.bezierCurveTo(145, 80, 120, 50, 80, 40);
  ctx.bezierCurveTo(60, 35, 40, 40, 25, 55);
  ctx.bezierCurveTo(35, 35, 65, 25, 100, 25);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();
  
  // Aperture - deep dark
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.bezierCurveTo(40, 140, 80, 175, 110, 150);
  ctx.bezierCurveTo(90, 170, 50, 150, 60, 110);
  ctx.closePath();
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  
  // Bioluminescent glow (for deep-sea tier)
  const glowGrad = ctx.createRadialGradient(80, 120, 5, 80, 120, 30);
  glowGrad.addColorStop(0, 'rgba(45, 212, 191, 0.6)');
  glowGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)');
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(80, 120, 30, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();
  
  ctx.restore();
}

// Updated drawShellPreview using the new spiral shells
function drawShellPreview(x, y, tier, scale) {
  ctx.save();
  ctx.translate(x, y);
  
  if (tier === 0) {
    drawBottleCap(ctx, scale * 0.6);
  } else if (tier === 1) {
    drawAmberConch(ctx, scale * 0.45);
  } else if (tier === 2) {
    drawPinkMoonSnail(ctx, scale * 0.42);
  } else if (tier === 3) {
    drawGoldenTurbano(ctx, scale * 0.42);
  } else if (tier === 4) {
    drawTealNautilus(ctx, scale * 0.42);
  }
  
  ctx.restore();
}