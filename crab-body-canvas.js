// Crab body drawing function converted from VectorCrab.tsx
function drawCrabBody(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Gradients
  const legGrad = ctx.createLinearGradient(0, 270, 400, 430);
  legGrad.addColorStop(0, '#FF9A66');
  legGrad.addColorStop(0.5, '#F05B32');
  legGrad.addColorStop(1, '#9E2A12');
  
  const clawGradR = ctx.createRadialGradient(340, 260, 10, 340, 280, 80);
  clawGradR.addColorStop(0, '#FF9A66');
  clawGradR.addColorStop(0.4, '#F05B32');
  clawGradR.addColorStop(1, '#9E2A12');
  
  const clawGradL = ctx.createRadialGradient(110, 250, 10, 110, 280, 80);
  clawGradL.addColorStop(0, '#FF9A66');
  clawGradL.addColorStop(0.4, '#F05B32');
  clawGradL.addColorStop(1, '#9E2A12');
  
  const stalkGrad = ctx.createLinearGradient(200, 0, 200, 255);
  stalkGrad.addColorStop(0, '#FF9A66');
  stalkGrad.addColorStop(1, '#C13115');
  
  const eyeGrad = ctx.createRadialGradient(155, 150, 5, 155, 160, 20);
  eyeGrad.addColorStop(0, '#555555');
  eyeGrad.addColorStop(0.3, '#111111');
  eyeGrad.addColorStop(1, '#000000');
  
  // === CRAB BODY BASE (Tight connection for limbs) ===
  ctx.beginPath();
  ctx.ellipse(200, 250, 40, 25, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#9E2A12';
  ctx.fill();
  
  // === BACK LEGS ===
  // Left Back Leg
  ctx.beginPath();
  ctx.moveTo(170, 270);
  ctx.quadraticCurveTo(80, 270, 40, 340);
  ctx.quadraticCurveTo(20, 400, 40, 430);
  ctx.quadraticCurveTo(60, 390, 70, 350);
  ctx.quadraticCurveTo(100, 300, 170, 300);
  ctx.closePath();
  ctx.fillStyle = legGrad;
  ctx.fill();
  ctx.strokeStyle = '#9E2A12';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Right Back Leg
  ctx.beginPath();
  ctx.moveTo(230, 270);
  ctx.quadraticCurveTo(320, 270, 360, 340);
  ctx.quadraticCurveTo(380, 400, 360, 430);
  ctx.quadraticCurveTo(340, 390, 330, 350);
  ctx.quadraticCurveTo(300, 300, 230, 300);
  ctx.closePath();
  ctx.fillStyle = legGrad;
  ctx.fill();
  ctx.stroke();
  
  // === FRONT LEGS ===
  // Left Front Leg
  ctx.beginPath();
  ctx.moveTo(180, 250);
  ctx.quadraticCurveTo(90, 240, 30, 300);
  ctx.quadraticCurveTo(0, 360, 20, 410);
  ctx.quadraticCurveTo(40, 360, 60, 310);
  ctx.quadraticCurveTo(100, 270, 180, 280);
  ctx.closePath();
  ctx.fillStyle = legGrad;
  ctx.fill();
  ctx.stroke();
  
  // Right Front Leg
  ctx.beginPath();
  ctx.moveTo(220, 250);
  ctx.quadraticCurveTo(310, 240, 370, 300);
  ctx.quadraticCurveTo(400, 360, 380, 410);
  ctx.quadraticCurveTo(360, 360, 340, 310);
  ctx.quadraticCurveTo(300, 270, 220, 280);
  ctx.closePath();
  ctx.fillStyle = legGrad;
  ctx.fill();
  ctx.stroke();
  
  // Leg spikes
  const spikes = [
    [100,260, 90,240, 110,255], [60,285, 45,270, 70,285], [25,330, 10,320, 35,335],
    [300,260, 310,240, 290,255], [340,285, 355,270, 330,285], [375,330, 390,320, 365,335]
  ];
  spikes.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(s[0], s[1]);
    ctx.lineTo(s[2], s[3]);
    ctx.lineTo(s[4], s[5]);
    ctx.closePath();
    ctx.fillStyle = '#FF9A66';
    ctx.fill();
  });
  
  // === MOUTH / MANDIBLES ===
  ctx.beginPath();
  ctx.ellipse(200, 265, 35, 25, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E8D2A6';
  ctx.fill();
  ctx.strokeStyle = '#BA8C56';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(185, 245);
  ctx.quadraticCurveTo(200, 280, 215, 245);
  ctx.strokeStyle = '#BA8C56';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(175, 255);
  ctx.quadraticCurveTo(200, 285, 225, 255);
  ctx.stroke();
  
  // Antennae
  ctx.beginPath();
  ctx.moveTo(190, 245);
  ctx.quadraticCurveTo(120, 120, 140, 60);
  ctx.strokeStyle = '#E8D2A6';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(210, 245);
  ctx.quadraticCurveTo(280, 120, 260, 60);
  ctx.stroke();
  
  // === EYE STALKS & EYES ===
  // Left Stalk
  ctx.beginPath();
  ctx.moveTo(175, 255);
  ctx.lineTo(150, 170);
  ctx.lineTo(170, 165);
  ctx.lineTo(195, 255);
  ctx.closePath();
  ctx.fillStyle = stalkGrad;
  ctx.fill();
  ctx.strokeStyle = '#9E2A12';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Right Stalk
  ctx.beginPath();
  ctx.moveTo(225, 255);
  ctx.lineTo(250, 170);
  ctx.lineTo(230, 165);
  ctx.lineTo(205, 255);
  ctx.closePath();
  ctx.fillStyle = stalkGrad;
  ctx.fill();
  ctx.stroke();
  
  // Eyes
  ctx.beginPath();
  ctx.arc(155, 160, 22, 0, Math.PI * 2);
  ctx.fillStyle = eyeGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(145, 150, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(160, 145, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  ctx.beginPath();
  ctx.arc(245, 160, 22, 0, Math.PI * 2);
  ctx.fillStyle = eyeGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(235, 150, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(250, 145, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // === LEFT CLAW (SMALLER) ===
  // Bottom Pincer
  ctx.beginPath();
  ctx.moveTo(80, 220);
  ctx.quadraticCurveTo(40, 160, 10, 180);
  ctx.quadraticCurveTo(0, 220, 40, 260);
  ctx.quadraticCurveTo(60, 250, 80, 220);
  ctx.closePath();
  ctx.fillStyle = clawGradL;
  ctx.fill();
  ctx.strokeStyle = '#9E2A12';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Top Pincer
  ctx.beginPath();
  ctx.moveTo(130, 240);
  ctx.quadraticCurveTo(140, 160, 100, 140);
  ctx.quadraticCurveTo(70, 160, 70, 210);
  ctx.quadraticCurveTo(90, 230, 130, 240);
  ctx.closePath();
  ctx.fillStyle = clawGradL;
  ctx.fill();
  ctx.stroke();
  
  // Main Base
  ctx.beginPath();
  ctx.moveTo(170, 260);
  ctx.quadraticCurveTo(190, 320, 140, 340);
  ctx.quadraticCurveTo(90, 350, 70, 300);
  ctx.quadraticCurveTo(60, 250, 110, 230);
  ctx.quadraticCurveTo(150, 210, 170, 260);
  ctx.closePath();
  ctx.fillStyle = clawGradL;
  ctx.fill();
  ctx.stroke();
  
  // Left Claw Ridge
  ctx.beginPath();
  ctx.moveTo(150, 260);
  ctx.quadraticCurveTo(110, 300, 90, 280);
  ctx.strokeStyle = '#C13115';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Left Claw Bumps
  const leftBumps = [[120,270,3],[140,280,4],[100,290,3.5],[110,310,3],[130,300,2.5]];
  leftBumps.forEach(b => {
    ctx.beginPath();
    ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2);
    ctx.fillStyle = '#FFF5D1';
    ctx.fill();
  });
  
  // === RIGHT CLAW (LARGER) ===
  // Bottom Pincer
  ctx.beginPath();
  ctx.moveTo(340, 200);
  ctx.quadraticCurveTo(380, 140, 410, 160);
  ctx.quadraticCurveTo(420, 210, 380, 250);
  ctx.quadraticCurveTo(360, 240, 340, 200);
  ctx.closePath();
  ctx.fillStyle = clawGradR;
  ctx.fill();
  ctx.stroke();
  
  // Top Pincer
  ctx.beginPath();
  ctx.moveTo(260, 220);
  ctx.quadraticCurveTo(240, 140, 290, 120);
  ctx.quadraticCurveTo(330, 140, 340, 200);
  ctx.quadraticCurveTo(320, 220, 260, 220);
  ctx.closePath();
  ctx.fillStyle = clawGradR;
  ctx.fill();
  ctx.stroke();
  
  // Main Base
  ctx.beginPath();
  ctx.moveTo(240, 260);
  ctx.quadraticCurveTo(220, 340, 280, 360);
  ctx.quadraticCurveTo(340, 370, 360, 310);
  ctx.quadraticCurveTo(370, 250, 320, 220);
  ctx.quadraticCurveTo(260, 200, 240, 260);
  ctx.closePath();
  ctx.fillStyle = clawGradR;
  ctx.fill();
  ctx.stroke();
  
  // Right Claw Ridge
  ctx.beginPath();
  ctx.moveTo(260, 260);
  ctx.quadraticCurveTo(300, 300, 340, 280);
  ctx.strokeStyle = '#C13115';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Right Claw Bumps
  const rightBumps = [
    [260,270,3],[280,280,4.5],[300,290,5],[320,300,6],[340,310,5],
    [270,300,4],[290,310,5.5],[310,320,6],[330,330,4],
    [280,330,4],[300,340,5],[320,350,4.5],[290,350,3],
    [250,310,3],[270,240,2.5],[290,250,3.5],[310,260,4]
  ];
  rightBumps.forEach(b => {
    ctx.beginPath();
    ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2);
    ctx.fillStyle = '#FFF5D1';
    ctx.fill();
  });
  
  ctx.restore();
}
