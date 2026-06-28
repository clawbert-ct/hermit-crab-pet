// ========================================
// COMPOSITED HERMIT CRAB DRAWING SYSTEM
// Draws crab INSIDE the shell, not on top
// Based on Erinem's Figma 3-layer approach:
//   1. Shell body (behind crab)
//   2. Dark aperture void
//   3. Crab body (emerging from void)
//   4. Aperture rim overlay ON TOP of crab
//   5. Anemone (on shell edge, always on top)
// ========================================

// ========================================
// SVG IMAGE LOADING PIPELINE
// Load Erinem's Figma PNGs into offscreen canvases
// Then stamp them with drawImage() for fast rendering
// ========================================

const shellImages = {};      // Empty shells (for vacancy dance, shell preview)
const crabShellImages = {};  // Full crab-in-shell PNGs (for main crab rendering)
let imagesLoaded = 0;
let imagesTotal = 0;

function preloadShellImages() {
  // Erinem's Figma PNGs — empty shells for vacancy dance/preview
  // Figma files are labeled t1-t6 matching game tiers 1-6
  const emptyShellPngs = {
    1: 't1-shell.png',
    2: 't2-shell.png',
    3: 't3-shell.png',
    4: 't4-shell.png',
    5: 't5-shell.png',
    6: 't6-shell.png'
  };
  
  // Erinem's Figma PNGs — full crab-in-shell for main rendering
  const crabPngFiles = {
    0: 'bottle-cap-crab.png',
    1: 't1-crab-and-shell.png',
    2: 't2-crab-and-shell.png',
    3: 't3-crab-and-shell.png',
    4: 't4-crab-and-shell.png',
    5: 't5-crab-and-shell.png',
    6: 't6-crab-and-shell.png'
  };
  
  imagesTotal = Object.keys(emptyShellPngs).length + Object.keys(crabPngFiles).length + 1; // +1 for tier 0 canvas fallback
  
  // Generate empty tier 0 bottle cap via canvas (no crab embedded)
  const capCanvas = document.createElement('canvas');
  capCanvas.width = 200; capCanvas.height = 200;
  const capCtx = capCanvas.getContext('2d');
  capCtx.translate(100, 100);
  if (typeof drawBottleCap === 'function') {
    drawBottleCap(capCtx, 1.0);
  }
  const capImg = new Image();
  capImg.src = capCanvas.toDataURL();
  shellImages[0] = capImg;
  imagesLoaded++; // Tier 0 canvas is instant
  
  // Load crab-in-shell PNGs (all tiers)
  for (const [tierKey, filename] of Object.entries(crabPngFiles)) {
    const tier = parseInt(tierKey);
    const img = new Image();
    img.onload = () => { crabShellImages[tier] = img; imagesLoaded++; console.log('Crab-in-shell tier', tier, 'loaded:', filename); };
    img.onerror = () => { console.warn('Failed to load crab-in-shell PNG:', filename); imagesLoaded++; };
    img.src = filename;
  }
  
  // Load empty shell PNGs (for vacancy dance, shell preview)
  for (const [tierKey, filename] of Object.entries(emptyShellPngs)) {
    const tier = parseInt(tierKey);
    const img = new Image();
    img.onload = () => { shellImages[tier] = img; imagesLoaded++; console.log('Empty shell tier', tier, 'loaded:', filename); };
    img.onerror = () => { console.warn('Failed to load empty shell PNG:', filename); imagesLoaded++; };
    img.src = filename;
  }
}

// Auto-preload shell images when script loads
if (typeof Image !== 'undefined') {
  preloadShellImages();
}

function drawCompositedCrab(ctx, tier, state) {
  const shellTier = state.shell.tier; // Use NUMERIC tier (0-6), not depth string ('found'/'shared'/'cobuilt')
  const breathe = Math.sin(state.time * 0.06) * 2;
  
  // All tiers: If we have a crab-in-shell PNG, use it (includes both crab and shell)
  if (typeof crabShellImages !== 'undefined' && crabShellImages[shellTier] && (crabShellImages[shellTier].complete || crabShellImages[shellTier].src)) {
    ctx.save();
    ctx.translate(crabX, crabY);
    // Figma PNGs are 794x1123 (portrait). Scale to fit game height ~120px.
    const imgH = crabShellImages[shellTier].naturalHeight || crabShellImages[shellTier].height || 1123;
    const imgW = crabShellImages[shellTier].naturalWidth || crabShellImages[shellTier].width || 794;
    const imgScale = 200 / imgH;  // Scale to ~200px tall — big enough to see the art!
    ctx.scale(crabFacing * imgScale, imgScale);
    ctx.drawImage(crabShellImages[shellTier], -imgW/2, -imgH, imgW, imgH);
    ctx.restore();
    
    // Anemone still draws on top
    if (state.anemone) {
      ctx.save();
      ctx.translate(crabX, crabY);
      ctx.scale(crabFacing, 1);
      drawAnemoneOnShell(ctx, shellTier, state.time);
      ctx.restore();
    }
    return;
  }
  
  // Tier 0 fallback: bottle cap via canvas
  if (shellTier === 0 && typeof shellImages !== 'undefined' && shellImages[0] && (shellImages[0].complete || shellImages[0].src)) {
    ctx.save();
    ctx.translate(crabX, crabY);
    const imgScale = 0.32;
    ctx.scale(crabFacing * imgScale, imgScale);
    const imgW = shellImages[0].naturalWidth || shellImages[0].width || 400;
    const imgH = shellImages[0].naturalHeight || shellImages[0].height || 400;
    ctx.drawImage(shellImages[0], -imgW/2, -imgH, imgW, imgH);
    ctx.restore();
    return;
  }
  
  // Fallback: full canvas drawing (no PNG loaded yet)
  const scale = state.shell.tier === 0 ? 1.5 : (0.9 + state.shell.tier * 0.1);
  ctx.save();
  ctx.translate(crabX, crabY);
  ctx.scale(crabFacing * scale, scale);
  
  // Breathing glow
  const tierData = DEPTH_TIERS[tier === 0 ? 'found' : tier === 1 ? 'found' : tier === 2 ? 'shared' : 'cobuilt'];
  const glowSize = tier >= 3 ? 50 : tier >= 2 ? 35 : 20;
  const glowAlpha = tier >= 3 ? 0.25 : tier >= 2 ? 0.15 : 0.06;
  const glowGrad = ctx.createRadialGradient(0, 5, 5, 0, 5, glowSize);
  glowGrad.addColorStop(0, `rgba(232, 120, 90, ${glowAlpha})`);
  glowGrad.addColorStop(1, 'rgba(232, 120, 90, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
  
  if (state.shell.tier === 0) {
    drawTier0BottleCap(ctx, breathe);
    ctx.restore();
    return;
  }
  
  // ===== COMPOSITED TIERS 1-4 =====
  drawShellBack(ctx, state.shell.tier);
  drawApertureVoid(ctx, state.shell.tier);
  drawCrabInAperture(ctx, state.shell.tier, breathe); // Body + claws inside shell
  drawApertureRim(ctx, state.shell.tier);             // Rim ON TOP of body
  drawClawsOutside(ctx, state.shell.tier, breathe);  // Claws poke OUT past the rim!
  if (state.anemone) {
    drawAnemoneOnShell(ctx, state.shell.tier, state.time);
  }
  
  ctx.restore();
}

// ---- TIER 0: BOTTLE CAP (no compositing) ----
function drawTier0BottleCap(ctx, breathe) {
  // Erinem's Figma design: red SODA bottle cap with crab peeking out from underneath
  
  // === BOTTLE CAP (drawn on top, like a hat) ===
  
  // Cap skirt (sides) with ridges
  const skirtGrad = ctx.createLinearGradient(-30, -15, 30, -15);
  skirtGrad.addColorStop(0, '#700A0E');
  skirtGrad.addColorStop(0.15, '#C52025');
  skirtGrad.addColorStop(0.5, '#F24B4E');
  skirtGrad.addColorStop(0.85, '#C52025');
  skirtGrad.addColorStop(1, '#500508');
  
  ctx.beginPath();
  ctx.moveTo(-30, -15);
  ctx.lineTo(-32, 5);
  ctx.quadraticCurveTo(0, 12, 32, 5);
  ctx.lineTo(30, -15);
  ctx.closePath();
  ctx.fillStyle = skirtGrad;
  ctx.fill();
  
  // Ridges on the skirt
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const rx = -28 + t * 56;
    const ry1 = -12 + Math.abs(Math.sin(t * Math.PI)) * 3;
    const ry2 = 2 + Math.abs(Math.sin(t * Math.PI)) * 4;
    ctx.beginPath();
    ctx.moveTo(rx, ry1);
    ctx.lineTo(rx + 1, ry2);
    ctx.strokeStyle = '#A0151A';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  
  // Cap top face (the flat circle you see from above)
  const topGrad = ctx.createLinearGradient(-25, -25, 25, -25);
  topGrad.addColorStop(0, '#F95C60');
  topGrad.addColorStop(0.5, '#E62F2B');
  topGrad.addColorStop(1, '#9A1015');
  
  ctx.beginPath();
  ctx.ellipse(0, -18, 28, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = topGrad;
  ctx.fill();
  
  // Inner ring
  ctx.beginPath();
  ctx.ellipse(0, -18, 22, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#F03A3E';
  ctx.fill();
  
  // Highlight arc
  ctx.beginPath();
  ctx.ellipse(0, -20, 20, 7, 0, Math.PI, Math.PI * 1.8);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // SODA text (perspective squished)
  ctx.save();
  ctx.translate(0, -17);
  ctx.scale(1, 0.35);
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.9;
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SODA', 0, 0);
  ctx.globalAlpha = 1;
  ctx.restore();
  
  // Glossy highlight on skirt
  ctx.beginPath();
  ctx.moveTo(-15, -10);
  ctx.lineTo(-15, 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // === CRAB BODY (drawn BELOW the cap, peeking out) ===
  
  // Dark interior visible at aperture
  ctx.beginPath();
  ctx.ellipse(0, 5, 22, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2A0508';
  ctx.fill();
  
  // Legs sticking out from under the cap
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const lx = side * (8 + i * 7);
      const ly = 6 + i * 3;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(lx + side * 12, ly + 10, lx + side * 18, ly + 25);
      ctx.strokeStyle = i === 0 ? '#D9552C' : '#B83A1C';
      ctx.lineWidth = i === 0 ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      // Dark tip
      ctx.beginPath();
      ctx.arc(lx + side * 18, ly + 26, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#3A0D04';
      ctx.fill();
    }
  }
  
  // Eye stalks sticking up from under the cap
  for (let side = -1; side <= 1; side += 2) {
    const ex = side * 10;
    ctx.beginPath();
    ctx.moveTo(ex, 0);
    ctx.quadraticCurveTo(ex + side * 3, -12, ex + side * 5, -18);
    ctx.strokeStyle = '#D9552C';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Eye
    ctx.beginPath();
    ctx.ellipse(ex + side * 5, -19, 4, 5, side * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    // Highlight
    ctx.beginPath();
    ctx.ellipse(ex + side * 4.5, -20.5, 1.5, 2.5, side * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  // Claws peeking out from the sides
  // Left claw (bigger, like Erinem's design)
  ctx.beginPath();
  ctx.moveTo(-15, 5);
  ctx.quadraticCurveTo(-25, 10, -28, 18);
  ctx.strokeStyle = '#B83A1C';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-28, 22, 8, 6, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#C24925';
  ctx.fill();
  ctx.strokeStyle = '#7A1809';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-26, 24); ctx.quadraticCurveTo(-30, 30, -24, 28);
  ctx.strokeStyle = '#7A1809';
  ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(-26, 20, 1.5, 0, Math.PI * 2);
  ctx.fillStyle = '#F7A992'; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
  
  // Right claw (smaller)
  ctx.beginPath();
  ctx.moveTo(15, 5);
  ctx.quadraticCurveTo(22, 12, 24, 18);
  ctx.strokeStyle = '#B83A1C';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(24, 21, 5, 4, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#D9552C';
  ctx.fill();
  ctx.strokeStyle = '#9A2312';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath(); ctx.arc(23, 19, 1, 0, Math.PI * 2);
  ctx.fillStyle = '#F7A992'; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
}

function drawSimpleCrab(ctx, breathe) {
  ctx.beginPath();
  ctx.ellipse(0, 8 + breathe * 0.5, 14, 10 + breathe * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#F05B32';
  ctx.fill();
  ctx.strokeStyle = '#9E2A12';
  ctx.lineWidth = 1;
  ctx.stroke();
  const eyeY = -8 + breathe * 0.2;
  ctx.beginPath(); ctx.arc(-8, eyeY, 5, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
  ctx.beginPath(); ctx.arc(8, eyeY, 5, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill();
  ctx.beginPath(); ctx.arc(-6, eyeY - 2, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.beginPath(); ctx.arc(10, eyeY - 2, 2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(side * 10, 6 + i * 4);
      ctx.lineTo(side * 22, 14 + i * 6);
      ctx.strokeStyle = '#F05B32';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  ctx.beginPath(); ctx.ellipse(-18, 2, 7, 5, -0.3, 0, Math.PI * 2); ctx.fillStyle = '#F05B32'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(18, 2, 7, 5, 0.3, 0, Math.PI * 2); ctx.fillStyle = '#F05B32'; ctx.fill();
}

// ================================================
// SHELL BACK FUNCTIONS (drawn BEHIND crab)
// ================================================

function drawShellBack(ctx, tier) {
  switch(tier) {
    case 1: drawAmberConchBack(ctx); break;
    case 2: drawPinkMoonSnailBack(ctx); break;
    case 3: drawGoldenTurbanoBack(ctx); break;
    case 4: drawTealNautilusBack(ctx); break;
    default: drawAmberConchBack(ctx); break;
  }
}

// TIER 1: Amber Conch - Shell back (everything behind the crab)
function drawAmberConchBack(ctx) {
  const grad = ctx.createLinearGradient(-30, -40, 30, 30);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(0.5, '#d97706');
  grad.addColorStop(1, '#92400e');
  
  ctx.save();
  ctx.rotate(0.26);
  
  // Spire tip
  ctx.beginPath();
  ctx.moveTo(100, 5);
  ctx.bezierCurveTo(105, 5, 105, 10, 105, 15);
  ctx.lineTo(95, 15);
  ctx.bezierCurveTo(95, 10, 95, 5, 100, 5);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Spire
  ctx.beginPath();
  ctx.moveTo(100, 15);
  ctx.bezierCurveTo(110, 15, 115, 25, 110, 40);
  ctx.lineTo(90, 40);
  ctx.bezierCurveTo(85, 25, 90, 15, 100, 15);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
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
  ctx.stroke();
  
  // Body whorl (biggest spiral, behind aperture)
  ctx.beginPath();
  ctx.moveTo(120, 40);
  ctx.bezierCurveTo(140, 40, 150, 60, 140, 80);
  ctx.bezierCurveTo(110, 70, 70, 70, 50, 80);
  ctx.bezierCurveTo(40, 60, 60, 40, 80, 40);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.stroke();
  
  // Ridges
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.bezierCurveTo(80, 90, 120, 90, 130, 80);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
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

// TIER 2: Pink Moon Snail - Shell back
function drawPinkMoonSnailBack(ctx) {
  const baseGrad = ctx.createLinearGradient(20, 0, 160, 200);
  baseGrad.addColorStop(0, '#fdf2f8');
  baseGrad.addColorStop(0.4, '#f472b6');
  baseGrad.addColorStop(1, '#be185d');
  
  ctx.save();
  ctx.translate(10, 10);
  
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
  const spines = [
    [150,60, 180,40, 160,75],
    [165,95, 195,90, 165,110],
    [155,130, 180,150, 145,145]
  ];
  spines.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(s[0], s[1]);
    ctx.lineTo(s[2], s[3]);
    ctx.lineTo(s[4], s[5]);
    ctx.closePath();
    ctx.fillStyle = '#f472b6';
    ctx.fill();
    ctx.strokeStyle = '#be185d';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
  
  // Spiral line
  ctx.beginPath();
  ctx.moveTo(100, 20);
  ctx.bezierCurveTo(110, 50, 90, 80, 50, 100);
  ctx.bezierCurveTo(30, 110, 30, 140, 50, 160);
  ctx.strokeStyle = '#831843';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  ctx.restore();
}

// TIER 3: Golden Spotted Turbano - Shell back
function drawGoldenTurbanoBack(ctx) {
  const bgGrad = ctx.createRadialGradient(45, 45, 20, 100, 100, 80);
  bgGrad.addColorStop(0, '#fef08a');
  bgGrad.addColorStop(0.7, '#eab308');
  bgGrad.addColorStop(1, '#854d0e');
  
  ctx.save();
  ctx.translate(10, 10);
  
  // Main shell
  ctx.beginPath();
  ctx.moveTo(100, 30);
  ctx.bezierCurveTo(160, 30, 180, 90, 160, 140);
  ctx.bezierCurveTo(130, 190, 70, 180, 40, 140);
  ctx.bezierCurveTo(10, 100, 40, 30, 100, 30);
  ctx.closePath();
  ctx.fillStyle = bgGrad;
  ctx.fill();
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Spots (behind aperture)
  const spots = [[70,70,6],[55,90,5],[45,120,7],[80,60,4],[65,140,5],[90,75,3],[110,55,4],[130,70,5]];
  spots.forEach(s => {
    ctx.beginPath();
    ctx.arc(s[0], s[1], s[2], 0, Math.PI * 2);
    ctx.fillStyle = '#7f1d1d';
    ctx.globalAlpha = 0.85;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  
  // Ridges
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.bezierCurveTo(60, 100, 100, 80, 150, 90);
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
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
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  ctx.fill();
  ctx.globalAlpha = 1;
  
  ctx.restore();
}

// TIER 4: Teal Nautilus - Shell back
function drawTealNautilusBack(ctx) {
  const grad1 = ctx.createLinearGradient(0, 0, 200, 200);
  grad1.addColorStop(0, '#2dd4bf');
  grad1.addColorStop(0.5, '#0ea5e9');
  grad1.addColorStop(1, '#312e81');
  
  const goldGrad = ctx.createLinearGradient(0, 200, 200, 0);
  goldGrad.addColorStop(0, '#fbbf24');
  goldGrad.addColorStop(0.5, '#fef3c7');
  goldGrad.addColorStop(1, '#d97706');
  
  ctx.save();
  ctx.translate(10, 10);
  
  // Main shell body
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
  ctx.closePath();
  ctx.fillStyle = grad1;
  ctx.fill();
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  
  // Gold spiral lines
  const goldLines = [
    [100,20, 110,40, 100,60, 70,20],
    [145,35, 130,60, 110,70, 95,35],
    [175,80, 140,90, 120,90, 130,50],
    [165,125, 130,115, 120,100, 150,85],
    [135,160, 110,140, 105,120, 135,115],
    [85,170, 80,140, 90,125, 115,135],
    [35,135, 50,115, 70,110, 85,140],
    [20,80, 50,85, 65,100, 50,125]
  ];
  goldLines.forEach(l => {
    ctx.beginPath();
    ctx.moveTo(l[0], l[1]);
    ctx.bezierCurveTo(l[2], l[3], l[4], l[5], l[6], l[7]);
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
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  ctx.fill();
  ctx.globalAlpha = 1;
  
  ctx.restore();
}

// ================================================
// APERTURE VOID FUNCTIONS (dark opening behind crab)
// ================================================

function drawApertureVoid(ctx, tier) {
  switch(tier) {
    case 1: drawAmberConchVoid(ctx); break;
    case 2: drawPinkMoonSnailVoid(ctx); break;
    case 3: drawGoldenTurbanoVoid(ctx); break;
    case 4: drawTealNautilusVoid(ctx); break;
    default: drawAmberConchVoid(ctx); break;
  }
}

function drawAmberConchVoid(ctx) {
  ctx.save();
  ctx.rotate(0.26);
  const voidGrad = ctx.createRadialGradient(80, 160, 5, 80, 160, 25);
  voidGrad.addColorStop(0, '#000000');
  voidGrad.addColorStop(1, '#451a03');
  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.bezierCurveTo(80, 135, 100, 145, 110, 170);
  ctx.bezierCurveTo(90, 185, 60, 180, 50, 160);
  ctx.bezierCurveTo(45, 150, 50, 145, 60, 140);
  ctx.closePath();
  ctx.fillStyle = voidGrad;
  ctx.fill();
  ctx.restore();
}

function drawPinkMoonSnailVoid(ctx) {
  ctx.save();
  ctx.translate(10, 10);
  const voidGrad = ctx.createRadialGradient(95, 160, 3, 95, 160, 30);
  voidGrad.addColorStop(0, '#000000');
  voidGrad.addColorStop(1, '#4c0519');
  // The hole
  ctx.beginPath();
  ctx.moveTo(80, 90);
  ctx.bezierCurveTo(120, 70, 140, 90, 130, 140);
  ctx.bezierCurveTo(120, 160, 90, 170, 70, 150);
  ctx.bezierCurveTo(60, 140, 70, 110, 80, 90);
  ctx.closePath();
  ctx.fillStyle = voidGrad;
  ctx.fill();
  ctx.restore();
}

function drawGoldenTurbanoVoid(ctx) {
  ctx.save();
  ctx.translate(10, 10);
  const voidGrad = ctx.createRadialGradient(100, 170, 3, 100, 170, 25);
  voidGrad.addColorStop(0, '#000000');
  voidGrad.addColorStop(1, '#450a0a');
  ctx.beginPath();
  ctx.moveTo(70, 120);
  ctx.bezierCurveTo(110, 110, 130, 140, 110, 170);
  ctx.bezierCurveTo(90, 190, 60, 160, 70, 120);
  ctx.closePath();
  ctx.fillStyle = voidGrad;
  ctx.fill();
  ctx.restore();
}

function drawTealNautilusVoid(ctx) {
  ctx.save();
  ctx.translate(10, 10);
  const voidGrad = ctx.createRadialGradient(75, 145, 3, 75, 145, 30);
  voidGrad.addColorStop(0, '#000000');
  voidGrad.addColorStop(1, '#0f172a');
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.bezierCurveTo(40, 140, 80, 175, 110, 150);
  ctx.bezierCurveTo(90, 170, 50, 150, 60, 110);
  ctx.closePath();
  ctx.fillStyle = voidGrad;
  ctx.fill();
  ctx.restore();
}

// ================================================
// CRAB IN APERTURE (scaled and positioned for each shell)
// ================================================

function drawCrabInAperture(ctx, tier, breathe) {
  // Position the VectorCrab to peek out of each shell's aperture
  // Adjusted per shell shape
  const positions = {
    1: { x: -35, y: 35, scale: 0.38, rotate: 0.15 },   // Amber conch
    2: { x: -15, y: 20, scale: 0.35, rotate: 0 },        // Pink moon snail
    3: { x: -20, y: 30, scale: 0.34, rotate: -0.1 },      // Golden turbano
    4: { x: -25, y: 25, scale: 0.33, rotate: 0.2 }         // Teal nautilus
  };
  
  const pos = positions[tier] || positions[1];
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.rotate);
  ctx.scale(pos.scale, pos.scale);
  drawCrabAnatomyFull(ctx, breathe);
  ctx.restore();
}

// Full crab anatomy from VectorCrab.tsx
function drawCrabAnatomyFull(ctx, breathe) {
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
  
  // Body ellipse
  ctx.beginPath();
  ctx.ellipse(200, 250 + breathe * 0.5, 40, 25, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#9E2A12';
  ctx.fill();
  
  // Back legs
  drawLeg(ctx, legGrad, 170, 270, 80, 270, 40, 340, 20, 400, 40, 430, 60, 390, 70, 350, 100, 300, 170, 300);
  drawLeg(ctx, legGrad, 230, 270, 320, 270, 360, 340, 380, 400, 360, 430, 340, 390, 330, 350, 300, 300, 230, 300);
  
  // Front legs
  drawLeg(ctx, legGrad, 180, 250, 90, 240, 30, 300, 0, 360, 20, 410, 40, 360, 60, 310, 100, 270, 180, 280);
  drawLeg(ctx, legGrad, 220, 250, 310, 240, 370, 300, 400, 360, 380, 410, 360, 360, 340, 310, 300, 270, 220, 280);
  
  // Leg spikes
  const spikes = [[100,260,90,240,110,255],[60,285,45,270,70,285],[25,330,10,320,35,335],[300,260,310,240,290,255],[340,285,355,270,330,285],[375,330,390,320,365,335]];
  spikes.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(s[0],s[1]); ctx.lineTo(s[2],s[3]); ctx.lineTo(s[4],s[5]);
    ctx.closePath();
    ctx.fillStyle = '#FF9A66';
    ctx.fill();
  });
  
  // Mandibles
  ctx.beginPath();
  ctx.ellipse(200, 265, 35, 25, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E8D2A6';
  ctx.fill();
  ctx.strokeStyle = '#BA8C56';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(185, 245); ctx.quadraticCurveTo(200, 280, 215, 245);
  ctx.strokeStyle = '#BA8C56'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(175, 255); ctx.quadraticCurveTo(200, 285, 225, 255); ctx.stroke();
  
  // Antennae
  ctx.beginPath(); ctx.moveTo(190, 245); ctx.quadraticCurveTo(120, 120, 140, 60);
  ctx.strokeStyle = '#E8D2A6'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(210, 245); ctx.quadraticCurveTo(280, 120, 260, 60); ctx.stroke();
  
  // Eye stalks
  ctx.beginPath(); ctx.moveTo(175, 255); ctx.lineTo(150, 170); ctx.lineTo(170, 165); ctx.lineTo(195, 255); ctx.closePath();
  ctx.fillStyle = stalkGrad; ctx.fill(); ctx.strokeStyle = '#9E2A12'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(225, 255); ctx.lineTo(250, 170); ctx.lineTo(230, 165); ctx.lineTo(205, 255); ctx.closePath();
  ctx.fill(); ctx.stroke();
  
  // Eyes
  ctx.beginPath(); ctx.arc(155, 160, 22, 0, Math.PI * 2); ctx.fillStyle = eyeGrad; ctx.fill();
  ctx.beginPath(); ctx.arc(145, 150, 6, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.9; ctx.fill();
  ctx.beginPath(); ctx.arc(160, 145, 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(245, 160, 22, 0, Math.PI * 2); ctx.fillStyle = eyeGrad; ctx.fill();
  ctx.beginPath(); ctx.arc(235, 150, 6, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.9; ctx.fill();
  ctx.beginPath(); ctx.arc(250, 145, 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  
  // Left claw (smaller)
  ctx.beginPath(); ctx.moveTo(80, 220); ctx.quadraticCurveTo(40, 160, 10, 180);
  ctx.quadraticCurveTo(0, 220, 40, 260); ctx.quadraticCurveTo(60, 250, 80, 220);
  ctx.closePath(); ctx.fillStyle = clawGradL; ctx.fill(); ctx.strokeStyle = '#9E2A12'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(130, 240); ctx.quadraticCurveTo(140, 160, 100, 140);
  ctx.quadraticCurveTo(70, 160, 70, 210); ctx.quadraticCurveTo(90, 230, 130, 240);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(170, 260); ctx.quadraticCurveTo(190, 320, 140, 340);
  ctx.quadraticCurveTo(90, 350, 70, 300); ctx.quadraticCurveTo(60, 250, 110, 230);
  ctx.quadraticCurveTo(150, 210, 170, 260);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(150, 260); ctx.quadraticCurveTo(110, 300, 90, 280);
  ctx.strokeStyle = '#C13115'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
  [[120,270,3],[140,280,4],[100,290,3.5],[110,310,3],[130,300,2.5]].forEach(b => {
    ctx.beginPath(); ctx.arc(b[0],b[1],b[2],0,Math.PI*2); ctx.fillStyle='#FFF5D1'; ctx.fill();
  });
  
  // Right claw (larger)
  ctx.beginPath(); ctx.moveTo(340, 200); ctx.quadraticCurveTo(380, 140, 410, 160);
  ctx.quadraticCurveTo(420, 210, 380, 250); ctx.quadraticCurveTo(360, 240, 340, 200);
  ctx.closePath(); ctx.fillStyle = clawGradR; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(260, 220); ctx.quadraticCurveTo(240, 140, 290, 120);
  ctx.quadraticCurveTo(330, 140, 340, 200); ctx.quadraticCurveTo(320, 220, 260, 220);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(240, 260); ctx.quadraticCurveTo(220, 340, 280, 360);
  ctx.quadraticCurveTo(340, 370, 360, 310); ctx.quadraticCurveTo(370, 250, 320, 220);
  ctx.quadraticCurveTo(260, 200, 240, 260);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(260, 260); ctx.quadraticCurveTo(300, 300, 340, 280);
  ctx.strokeStyle = '#C13115'; ctx.lineWidth = 3; ctx.stroke();
  [[260,270,3],[280,280,4.5],[300,290,5],[320,300,6],[340,310,5],[270,300,4],[290,310,5.5],[310,320,6],[330,330,4],[280,330,4],[300,340,5],[320,350,4.5],[290,350,3],[250,310,3],[270,240,2.5],[290,250,3.5],[310,260,4]].forEach(b => {
    ctx.beginPath(); ctx.arc(b[0],b[1],b[2],0,Math.PI*2); ctx.fillStyle='#FFF5D1'; ctx.fill();
  });
}

function drawLeg(ctx, grad, x1,y1, cx1,cy1, cx2,cy2, x2,y2, cx3,cy3, cx4,cy4, x3,y3, cx5,cy5, x4,y4) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx1, cy1, cx2, cy2);
  ctx.quadraticCurveTo(x2, y2, cx3, cy3);
  ctx.quadraticCurveTo(cx4, cy4, x3, y3);
  ctx.quadraticCurveTo(cx5, cy5, x4, y4);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#9E2A12';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ================================================
// APERTURE RIM FUNCTIONS (drawn ON TOP of crab)
// This is the KEY layer that makes the crab look INSIDE the shell
// ================================================

function drawApertureRim(ctx, tier) {
  switch(tier) {
    case 1: drawAmberConchRim(ctx); break;
    case 2: drawPinkMoonSnailRim(ctx); break;
    case 3: drawGoldenTurbanoRim(ctx); break;
    case 4: drawTealNautilusRim(ctx); break;
    default: drawAmberConchRim(ctx); break;
  }
}

function drawAmberConchRim(ctx) {
  // Golden rim overlay - just the stroke, no fill, drawn ON TOP of crab
  ctx.save();
  ctx.rotate(0.26);
  ctx.beginPath();
  ctx.moveTo(60, 140);
  ctx.bezierCurveTo(80, 135, 100, 145, 110, 170);
  ctx.bezierCurveTo(90, 185, 60, 180, 50, 160);
  ctx.bezierCurveTo(45, 150, 50, 145, 60, 140);
  ctx.closePath();
  ctx.fillStyle = 'none'; // No fill! Just the rim stroke
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawPinkMoonSnailRim(ctx) {
  // Pink/white lip rim overlay
  ctx.save();
  ctx.translate(10, 10);
  // The lip outline (from the original SVG)
  ctx.beginPath();
  ctx.moveTo(80, 90);
  ctx.bezierCurveTo(120, 70, 140, 90, 130, 140);
  ctx.bezierCurveTo(120, 160, 90, 170, 70, 150);
  ctx.bezierCurveTo(60, 140, 70, 110, 80, 90);
  ctx.closePath();
  ctx.fillStyle = 'none'; // Transparent fill! Crab shows through
  ctx.strokeStyle = '#fff1f2';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawGoldenTurbanoRim(ctx) {
  // Turbano inner rim overlay
  ctx.save();
  ctx.translate(10, 10);
  ctx.beginPath();
  ctx.moveTo(75, 130);
  ctx.bezierCurveTo(100, 125, 115, 145, 105, 165);
  ctx.bezierCurveTo(90, 180, 70, 155, 75, 130);
  ctx.closePath();
  ctx.fillStyle = 'none';
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawTealNautilusRim(ctx) {
  // Nautilus aperture rim overlay
  ctx.save();
  ctx.translate(10, 10);
  ctx.beginPath();
  ctx.moveTo(60, 110);
  ctx.bezierCurveTo(40, 140, 80, 175, 110, 150);
  ctx.bezierCurveTo(90, 170, 50, 150, 60, 110);
  ctx.closePath();
  ctx.fillStyle = 'none';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

// ================================================
// ANEMONE ON SHELL (sits on shell edge)
// ================================================

function drawAnemoneOnShell(ctx, tier, time) {
  // The anemone rides on the crab's shell — it's a FRIEND, not a decoration
  // Translation 32: The Transplant — crab carries anemone to new shells
  // Translation 33: The Beacon — GFP fluorescence recruits symbionts
  // Translation 34/35: Colorful bleaching — light protects AND calls for help
  
  // SCALED UP — the anemone friend should be VISIBLE and alive
  // Position: ON TOP of the shell body, near the apex but ON the shell surface
  // The shell apex is high up — anemone sits just below it, on the shell's back
  // Anemone position per tier - anchored ON the shell surface
  const ANEMONE_POS = {
    1: { x: 0, y: -130 },
    2: { x: 0, y: -130 },
    3: { x: 0, y: -135 },
    4: { x: 0, y: -135 },
    5: { x: 0, y: -140 },
    6: { x: 0, y: -140 }
  };
  const pos = ANEMONE_POS[tier] || ANEMONE_POS[1];
  const tentacleCount = tier >= 5 ? 12 : tier >= 3 ? 10 : 8;
  const t = time * 0.04;
  
  // === BASE DISK (the foot that attaches to the shell) ===
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y + 4, 14, 8, 0, 0, Math.PI, false);
  ctx.fillStyle = tier >= 3 ? 'rgba(100, 180, 255, 0.3)' : 'rgba(255, 120, 160, 0.45)';
  ctx.fill();
  
  // === COLUMN (the anemone's body) ===
  // Wider, more visible column
  ctx.beginPath();
  ctx.moveTo(pos.x - 10, pos.y + 4);
  ctx.quadraticCurveTo(pos.x - 13, pos.y - 10, pos.x - 5, pos.y - 14);
  ctx.quadraticCurveTo(pos.x, pos.y - 18, pos.x + 5, pos.y - 14);
  ctx.quadraticCurveTo(pos.x + 13, pos.y - 10, pos.x + 10, pos.y + 4);
  ctx.closePath();
  ctx.fillStyle = tier >= 3 ? 'rgba(80, 150, 220, 0.7)' : 'rgba(255, 100, 150, 0.7)';
  ctx.fill();
  // Column highlight
  ctx.beginPath();
  ctx.ellipse(pos.x, pos.y - 6, 4, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = tier >= 3 ? 'rgba(140, 200, 255, 0.25)' : 'rgba(255, 180, 200, 0.25)';
  ctx.fill();
  
  // === TENTACLES (swaying in the current) ===
  for (let i = 0; i < tentacleCount; i++) {
    const angle = (i / tentacleCount) * Math.PI + Math.PI * 0.1;
    const sway = Math.sin(t + i * 0.7) * 0.3; // More sway
    const len = 22 + Math.sin(t + i) * 8; // Longer, more visible tentacles
    
    const startX = pos.x + Math.cos(angle) * 8;
    const startY = pos.y - 8;
    const midX = pos.x + Math.cos(angle + sway) * len * 0.6;
    const midY = pos.y - 16 + Math.sin(t + i) * 4;
    const endX = pos.x + Math.cos(angle + sway) * len;
    const endY = pos.y - 8 + Math.sin(angle) * len * 0.4;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    
    if (tier >= 3) {
      // CO-BUILT: Bioluminescent green tentacles (The Beacon)
      const glow = 0.6 + Math.sin(t + i * 0.9) * 0.3;
      ctx.strokeStyle = `rgba(80, 255, 180, ${glow})`;
      ctx.lineWidth = 3;
    } else {
      // SHARED: Warm pink tentacles
      const alpha = 0.7 + Math.sin(t + i) * 0.2;
      ctx.strokeStyle = `rgba(255, 120, 170, ${alpha})`;
      ctx.lineWidth = 2.5;
    }
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Tentacle tips — bulbous and visible
    ctx.beginPath();
    ctx.arc(endX, endY, 3, 0, Math.PI * 2);
    ctx.fillStyle = tier >= 3 
      ? `rgba(120, 255, 200, ${0.5 + Math.sin(t + i) * 0.3})`
      : `rgba(255, 180, 200, ${0.5 + Math.sin(t + i) * 0.2})`;
    ctx.fill();
    
    // BIOLUMINESCENCE GLOW at co-built tier
    // Translation 33: The anemone doesn't just glow — it RECRUITS
    if (tier >= 3) {
      const glowSize = 8 + Math.sin(t + i * 0.5) * 3;
      const glowGrad = ctx.createRadialGradient(endX, endY, 1, endX, endY, glowSize);
      glowGrad.addColorStop(0, `rgba(80, 255, 180, ${0.3 + Math.sin(t + i) * 0.15})`);
      glowGrad.addColorStop(1, 'rgba(80, 255, 180, 0)');
      ctx.beginPath();
      ctx.arc(endX, endY, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }
  }
  
  // === ORAL DISK (the mouth in the center) ===
  ctx.beginPath();
  ctx.arc(pos.x, pos.y - 5, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = tier >= 3 ? 'rgba(200, 255, 230, 0.6)' : 'rgba(255, 200, 210, 0.5)';
  ctx.fill();
}
// ========================================
// BEACH COLLECTIBLES SYSTEM
// Items wash up when you clean the beach
// View collection in a modal with rarity
// ========================================

const BEACH_COLLECTIBLES = {
  // ---- COMMON (50% chance) ----
  shell_fragment: { name: 'Shell Fragment', rarity: 'common', icon: '🐚', color: '#d4a860', chance: 0.25, desc: 'A broken piece of someone\'s old home' },
  sea_glass_green: { name: 'Green Sea Glass', rarity: 'common', icon: '💎', color: '#6ee7b7', chance: 0.20, desc: 'Smoothed by years of tumbling in the surf' },
  sea_glass_brown: { name: 'Brown Sea Glass', rarity: 'common', icon: '💎', color: '#a67c52', chance: 0.20, desc: 'Once a beer bottle, now a jewel' },
  pebble: { name: 'Tidepool Pebble', rarity: 'common', icon: '🪨', color: '#9ca3af', chance: 0.25, desc: 'Small, smooth, fits perfectly in a claw' },
  seaweed: { name: 'Dried Seaweed', rarity: 'common', icon: '🌿', color: '#4ade80', chance: 0.20, desc: 'Crunchy, not slimy — the good kind' },
  
  // ---- UNCOMMON (20% chance) ----
  sea_glass_blue: { name: 'Blue Sea Glass', rarity: 'uncommon', icon: '💎', color: '#60a5fa', chance: 0.08, desc: 'From an old medicine bottle, maybe' },
  coral_piece: { name: 'Coral Fragment', rarity: 'uncommon', icon: '🪸', color: '#f9a8d4', chance: 0.07, desc: 'A pink branch from a reef far away' },
  sand_dollar: { name: 'Sand Dollar', rarity: 'uncommon', icon: '🪙', color: '#fde68a', chance: 0.06, desc: 'Intact! The doves are still inside' },
  starfish_arm: { name: 'Starfish Arm', rarity: 'uncommon', icon: '⭐', color: '#f97316', chance: 0.05, desc: 'They grow them back, don\'t worry' },
  feather: { name: 'Seabird Feather', rarity: 'uncommon', icon: '🪶', color: '#e5e7eb', chance: 0.04, desc: 'White and downy, from a gull overhead' },
  
  // ---- RARE (5% chance) ----
  message_bottle: { name: 'Message in a Bottle', rarity: 'rare', icon: '🍾', color: '#a78bfa', chance: 0.012, desc: 'The paper inside says: "I still think about you"' },
  sea_glass_red: { name: 'Red Sea Glass', rarity: 'rare', icon: '💎', color: '#ef4444', chance: 0.012, desc: 'Extremely rare. Car headlights, maybe' },
  pearl_imperfect: { name: 'Baroque Pearl', rarity: 'rare', icon: '🫧', color: '#fef3c7', chance: 0.010, desc: 'Lumpy, imperfect, real. An oyster\'s annoyance' },
  shell_perfect: { name: 'Perfect Conch', rarity: 'rare', icon: '🐚', color: '#fcd34d', chance: 0.008, desc: 'Not a scratch on it. Someone\'s dream home' },
  sea_bean: { name: 'Sea Bean', rarity: 'rare', icon: '🫘', color: '#92400e', chance: 0.008, desc: 'Drifted across the entire ocean' },
  
  // ---- LEGENDARY (0.5% chance) ----
  pearl_perfect: { name: 'Perfect Pearl', rarity: 'legendary', icon: '🫧', color: '#f0f9ff', chance: 0.001, desc: 'Flawless. Round. Moonlight in a sphere' },
  diamond_ring: { name: 'Diamond Ring', rarity: 'legendary', icon: '💍', color: '#e0f2fe', chance: 0.0008, desc: 'Someone lost everything. You found this' },
  gold_coin: { name: 'Gold Doubloon', rarity: 'legendary', icon: '🪙', color: '#fbbf24', chance: 0.0008, desc: 'From a ship that sank before your grandmother was born' },
  sea_silk: { name: 'Sea Silk', rarity: 'legendary', icon: '🧵', color: '#fda4af', chance: 0.0005, desc: 'Spun by Pinna nobilis. So rare it\'s almost mythical' },
};

const RARITY_COLORS = {
  common: { bg: 'rgba(156, 163, 175, 0.1)', border: '#6b7280', text: '#9ca3af', label: 'Common' },
  uncommon: { bg: 'rgba(74, 222, 128, 0.1)', border: '#22c55e', text: '#4ade80', label: 'Uncommon' },
  rare: { bg: 'rgba(167, 139, 250, 0.1)', border: '#8b5cf6', text: '#a78bfa', label: 'Rare' },
  legendary: { bg: 'rgba(251, 191, 36, 0.1)', border: '#f59e0b', text: '#fbbf24', label: 'Legendary' }
};

// Spawn a collectible when cleaning the beach
function trySpawnCollectible() {
  if (!state.collection) state.collection = {};
  if (!state.collection.items) state.collection.items = [];
  
  // Each clean action has one roll
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [id, item] of Object.entries(BEACH_COLLECTIBLES)) {
    cumulative += item.chance;
    if (roll < cumulative) {
      // Found something!
      state.collection.items.push({
        id: id,
        found: Date.now(),
        tier: state.shell.tier
      });
      
      // Update counts
      if (!state.collection.counts) state.collection.counts = {};
      state.collection.counts[id] = (state.collection.counts[id] || 0) + 1;
      
      return item; // Return the found item for animation
    }
  }
  
  return null; // Nothing found this time
}

// Draw a collectible floating on the beach
function drawCollectibleItem(ctx, item, x, y, time) {
  const data = BEACH_COLLECTIBLES[item.id];
  if (!data) return;
  
  const bob = Math.sin(time * 0.003 + x) * 2;
  const rc = RARITY_COLORS[data.rarity];
  
  ctx.save();
  ctx.translate(x, y + bob);
  
  // Rarity glow
  if (data.rarity === 'rare' || data.rarity === 'legendary') {
    const glowGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 15);
    glowGrad.addColorStop(0, rc.border + '40');
    glowGrad.addColorStop(1, rc.border + '00');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(-15, -15, 30, 30);
  }
  
  // Item circle
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = rc.bg;
  ctx.fill();
  ctx.strokeStyle = rc.border;
  ctx.lineWidth = data.rarity === 'legendary' ? 2 : 1;
  ctx.stroke();
  
  // Draw specific item shape
  ctx.beginPath();
  switch(item.id) {
    case 'shell_fragment': case 'shell_perfect':
      // Spiral shape
      ctx.moveTo(2, -5);
      ctx.bezierCurveTo(5, -3, 5, 3, 1, 5);
      ctx.bezierCurveTo(-2, 6, -4, 3, -3, 0);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    case 'sea_glass_green': case 'sea_glass_brown': case 'sea_glass_blue': case 'sea_glass_red':
      // Rounded rectangle
      ctx.moveTo(-3, -4); ctx.lineTo(3, -4); ctx.quadraticCurveTo(5, -4, 5, -2);
      ctx.lineTo(5, 2); ctx.quadraticCurveTo(5, 4, 3, 4);
      ctx.lineTo(-3, 4); ctx.quadraticCurveTo(-5, 4, -5, 2);
      ctx.lineTo(-5, -2); ctx.quadraticCurveTo(-5, -4, -3, -4);
      ctx.closePath();
      ctx.fillStyle = data.color + '80';
      ctx.fill();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    case 'coral_piece':
      // Branch shape
      ctx.moveTo(0, 4); ctx.lineTo(0, -1); ctx.lineTo(3, -4);
      ctx.moveTo(0, -1); ctx.lineTo(-2, -3);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      break;
    case 'message_bottle':
      // Bottle shape
      ctx.moveTo(-1, -5); ctx.lineTo(1, -5); ctx.lineTo(1, -3);
      ctx.lineTo(3, -3); ctx.lineTo(3, 3); ctx.quadraticCurveTo(3, 5, 0, 5);
      ctx.quadraticCurveTo(-3, 5, -3, 3); ctx.lineTo(-3, -3); ctx.lineTo(-1, -3);
      ctx.closePath();
      ctx.fillStyle = data.color + '40';
      ctx.fill();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    case 'pearl_imperfect': case 'pearl_perfect':
      // Pearl
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = data.color;
      ctx.fill();
      // Highlight
      ctx.beginPath();
      ctx.arc(-1.5, -1.5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff80';
      ctx.fill();
      break;
    case 'diamond_ring':
      // Ring + diamond
      ctx.arc(0, 2, 4, 0, Math.PI, true);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -3); ctx.lineTo(2, -1); ctx.lineTo(1, 2); ctx.lineTo(-1, 2); ctx.lineTo(-2, -1);
      ctx.closePath();
      ctx.fillStyle = '#e0f2fe';
      ctx.fill();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    case 'gold_coin':
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = data.color;
      ctx.fill();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    case 'sand_dollar':
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = data.color + '80';
      ctx.fill();
      // Star pattern
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 3, Math.sin(a) * 3);
        ctx.strokeStyle = '#92400e40'; ctx.lineWidth = 0.5; ctx.stroke();
      }
      break;
    default:
      // Generic circle
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = data.color + '60';
      ctx.fill();
      break;
  }
  
  ctx.restore();
}

// Draw the collection modal
function drawBeachCollectionModal(ctx) {
  if (!state.showCollection) return;
  if (!state.collection) state.collection = { items: [], counts: {} };
  
  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, W, H);
  
  // Modal panel
  const mx = W * 0.05;
  const my = H * 0.05;
  const mw = W * 0.9;
  const mh = H * 0.9;
  
  ctx.fillStyle = '#1a2332';
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  roundRect(ctx, mx, my, mw, mh, 16, true, true);
  
  // Title
  ctx.fillStyle = '#e0e8ef';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌊 Beach Collection', W / 2, my + 25);
  
  // Total count
  const totalItems = state.collection.items.length;
  const uniqueItems = Object.keys(state.collection.counts).length;
  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`${totalItems} found · ${uniqueItems} unique / ${Object.keys(BEACH_COLLECTIBLES).length} total`, W / 2, my + 40);
  
  // Group by rarity
  const rarityOrder = ['legendary', 'rare', 'uncommon', 'common'];
  let yOffset = my + 58;
  
  rarityOrder.forEach(rarity => {
    const rc = RARITY_COLORS[rarity];
    const itemsOfRarity = Object.entries(BEACH_COLLECTIBLES).filter(([_, v]) => v.rarity === rarity);
    const foundOfRarity = itemsOfRarity.filter(([id]) => state.collection.counts[id]);
    
    if (itemsOfRarity.length === 0) return;
    
    // Rarity header
    ctx.fillStyle = rc.text;
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(rc.label, mx + 10, yOffset);
    
    // Found count
    ctx.fillStyle = '#4b5563';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${foundOfRarity.length}/${itemsOfRarity.length}`, mx + mw - 10, yOffset);
    
    yOffset += 8;
    
    // Items grid
    let xOff = mx + 10;
    itemsOfRarity.forEach(([id, item]) => {
      const found = state.collection.counts[id] || 0;
      const cellW = (mw - 20) / Math.min(itemsOfRarity.length, 5);
      
      if (xOff + cellW > mx + mw - 5) {
        xOff = mx + 10;
        yOffset += 45;
      }
      
      // Item cell
      const isFound = found > 0;
      ctx.fillStyle = isFound ? rc.bg : 'rgba(255,255,255,0.02)';
      ctx.strokeStyle = isFound ? rc.border + '60' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      roundRect(ctx, xOff, yOffset, cellW - 4, 38, 6, true, true);
      
      if (isFound) {
        // Draw the item icon
        const itemObj = { id: id };
        drawCollectibleItem(ctx, itemObj, xOff + cellW / 2 - 2, yOffset + 14, 0);
        
        // Name
        ctx.fillStyle = rc.text;
        ctx.font = '7px sans-serif';
        ctx.textAlign = 'center';
        const shortName = item.name.length > 12 ? item.name.substring(0, 11) + '…' : item.name;
        ctx.fillText(shortName, xOff + cellW / 2 - 2, yOffset + 30);
        
        // Count badge
        if (found > 1) {
          ctx.beginPath();
          ctx.arc(xOff + cellW - 10, yOffset + 6, 5, 0, Math.PI * 2);
          ctx.fillStyle = rc.border;
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '6px sans-serif';
          ctx.fillText(found + '', xOff + cellW - 10, yOffset + 8);
        }
      } else {
        // Unknown item — question mark
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', xOff + cellW / 2 - 2, yOffset + 23);
      }
      
      xOff += cellW;
    });
    
    yOffset += 50;
  });
  
  // Close hint
  ctx.fillStyle = '#4b5563';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('tap anywhere to close', W / 2, my + mh - 10);
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// ========================================
// FOUND ITEM POPUP NOTIFICATION
// Shows briefly when you find something while cleaning
// ========================================

function drawFoundItemPopup(ctx) {
  if (!state.beach.lastFound) return;
  
  const found = state.beach.lastFound;
  const elapsed = state.time - found.time;
  const DURATION = 180; // ~3 seconds at 60fps
  
  if (elapsed > DURATION) {
    state.beach.lastFound = null;
    return;
  }
  
  const progress = elapsed / DURATION;
  const alpha = progress < 0.8 ? 1 : 1 - ((progress - 0.8) / 0.2); // Fade out last 20%
  const rise = Math.min(1, progress / 0.15); // Rise in first 15%
  const rc = RARITY_COLORS[found.item.rarity];
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  const popupX = found.x;
  const popupY = found.y - rise * 30;
  
  // Glow for rare+ items
  if (found.item.rarity === 'rare' || found.item.rarity === 'legendary') {
    const glowGrad = ctx.createRadialGradient(popupX, popupY, 5, popupX, popupY, 25);
    glowGrad.addColorStop(0, rc.border + '60');
    glowGrad.addColorStop(1, rc.border + '00');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(popupX - 25, popupY - 25, 50, 50);
  }
  
  // Draw the item
  drawCollectibleItem(ctx, found.item, popupX, popupY, state.time);
  
  // Name label above
  ctx.fillStyle = rc.text;
  ctx.font = found.item.rarity === 'legendary' ? 'bold 9px sans-serif' : '8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(found.item.name, popupX, popupY - 14);
  
  // Rarity tag
  ctx.font = '7px sans-serif';
  ctx.fillText(rc.label, popupX, popupY + 16);
  
  // Sparkles for rare+ items
  if (found.item.rarity === 'rare' || found.item.rarity === 'legendary') {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + state.time * 0.03;
      const dist = 15 + Math.sin(state.time * 0.05 + i) * 5;
      const sx = popupX + Math.cos(angle) * dist;
      const sy = popupY + Math.sin(angle) * dist * 0.6;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = rc.text;
      ctx.globalAlpha = alpha * (0.5 + Math.sin(state.time * 0.08 + i) * 0.3);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// ================================================
// CLAWS OUTSIDE THE SHELL
// Hermit crabs' big claws stick out past the aperture!
// Drawn AFTER the rim so they overlap it naturally
// ================================================

function drawClawsOutside(ctx, tier, breathe) {
  const positions = {
    1: { x: -35, y: 35, scale: 0.38, rotate: 0.15 },
    2: { x: -15, y: 20, scale: 0.35, rotate: 0 },
    3: { x: -20, y: 30, scale: 0.34, rotate: -0.1 },
    4: { x: -25, y: 25, scale: 0.33, rotate: 0.2 },
    5: { x: -20, y: 30, scale: 0.34, rotate: -0.1 },
    6: { x: -25, y: 25, scale: 0.33, rotate: 0.2 }
  };
  const pos = positions[tier] || positions[1];
  
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.rotate);
  ctx.scale(pos.scale, pos.scale);
  
  // Left claw (smaller) — sticks out left of aperture
  const clawGradL = ctx.createRadialGradient(110, 250, 10, 110, 280, 80);
  clawGradL.addColorStop(0, '#FF9A66');
  clawGradL.addColorStop(0.4, '#F05B32');
  clawGradL.addColorStop(1, '#9E2A12');
  
  ctx.beginPath(); ctx.moveTo(80, 220); ctx.quadraticCurveTo(40, 160, 10, 180);
  ctx.quadraticCurveTo(0, 220, 40, 260); ctx.quadraticCurveTo(60, 250, 80, 220);
  ctx.closePath(); ctx.fillStyle = clawGradL; ctx.fill();
  ctx.strokeStyle = '#9E2A12'; ctx.lineWidth = 1.5; ctx.stroke();
  
  ctx.beginPath(); ctx.moveTo(130, 240); ctx.quadraticCurveTo(140, 160, 100, 140);
  ctx.quadraticCurveTo(70, 160, 70, 210); ctx.quadraticCurveTo(90, 230, 130, 240);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  
  ctx.beginPath(); ctx.moveTo(170, 260); ctx.quadraticCurveTo(190, 320, 140, 340);
  ctx.quadraticCurveTo(90, 350, 70, 300); ctx.quadraticCurveTo(60, 250, 110, 230);
  ctx.quadraticCurveTo(150, 210, 170, 260);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  
  // Right claw (larger) — sticks out right of aperture
  const clawGradR = ctx.createRadialGradient(340, 260, 10, 340, 280, 80);
  clawGradR.addColorStop(0, '#FF9A66');
  clawGradR.addColorStop(0.4, '#F05B32');
  clawGradR.addColorStop(1, '#9E2A12');
  
  ctx.beginPath(); ctx.moveTo(340, 200); ctx.quadraticCurveTo(380, 140, 410, 160);
  ctx.quadraticCurveTo(420, 210, 380, 250); ctx.quadraticCurveTo(360, 240, 340, 200);
  ctx.closePath(); ctx.fillStyle = clawGradR; ctx.fill(); ctx.stroke();
  
  ctx.beginPath(); ctx.moveTo(260, 220); ctx.quadraticCurveTo(240, 140, 290, 120);
  ctx.quadraticCurveTo(330, 140, 340, 200); ctx.quadraticCurveTo(320, 220, 260, 220);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  
  ctx.beginPath(); ctx.moveTo(240, 260); ctx.quadraticCurveTo(220, 340, 280, 360);
  ctx.quadraticCurveTo(340, 370, 360, 310); ctx.quadraticCurveTo(370, 250, 320, 220);
  ctx.quadraticCurveTo(260, 200, 240, 260);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  
  // Bumps on big claw
  [[260,270,3],[280,280,4.5],[300,290,5],[320,300,6],[340,310,5]].forEach(b => {
    ctx.beginPath(); ctx.arc(b[0],b[1],b[2],0,Math.PI*2);
    ctx.fillStyle='#FFF5D1'; ctx.fill();
  });
  
  ctx.restore();
}

// ========================================
// end of file
