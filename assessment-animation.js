// Shell upgrade assessment animation — 5-stage ritual
// The MAIN CRAB walks toward the new shell, taps it, climbs on, tries it, and moves in.
// No separate tiny crab — this is YOUR crab doing the ritual.

function drawAssessmentAnimation(ctx, W, H, state) {
  if (!state.shell.upgrading) return;
  
  state.shell.upgradeProgress += 0.004;
  
  const stage = state.shell.upgradeProgress;
  const newTier = state.shell.nextShell ? state.shell.nextShell.tier : state.shell.tier;
  const tier = getDepthTier();
  
  // New shell position (where it washed up on the beach)
  const shellX = state.pendingShell ? state.pendingShell.x : W * 0.6;
  const shellY = state.pendingShell ? state.pendingShell.y : H * 0.62;
  
  // Stage labels
  const stageLabels = ['Approaching...', 'Tapping...', 'Climbing on...', 'Trying it on...', 'Moving in! ✨'];
  const currentStageIdx = Math.min(4, Math.floor(stage / 0.2));
  
  // Draw the NEW shell (the one the crab is assessing)
  ctx.save();
  ctx.translate(shellX, shellY);
  // Pulsing glow around the new shell to draw attention
  const glowPulse = 0.5 + Math.sin(state.time * 0.08) * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 215, 0, ${glowPulse * 0.15})`;
  ctx.fill();
  drawShellPreview(0, 0, newTier, 1.2);
  ctx.restore();
  
  // Move the MAIN CRAB through the assessment stages
  // The crab walks from its current position toward the new shell
  const startDist = 60; // How far away the crab starts
  const besideDist = 30; // How close it gets during tapping
  
  if (stage < 0.2) {
    // APPROACH: crab walks from left toward the new shell
    const t = stage / 0.2;
    const eased = t * t * (3 - 2 * t); // Smooth ease in-out
    crabX = shellX - startDist + (startDist - besideDist) * eased;
    crabY = H * 0.64 + (shellY - H * 0.64) * eased * 0.5;
    crabTargetX = crabX;
    crabTargetY = crabY;
  } else if (stage < 0.4) {
    // TAP: crab beside the shell, tapping it with claws
    crabX = shellX - besideDist;
    crabY = shellY + 5;
    crabTargetX = crabX;
    crabTargetY = crabY;
  } else if (stage < 0.6) {
    // CLIMB: crab on top of the new shell
    crabX = shellX - 5;
    crabY = shellY - 18;
    crabTargetX = crabX;
    crabTargetY = crabY;
  } else if (stage < 0.8) {
    // TRY: crab partially entering the new shell
    const t = (stage - 0.6) / 0.2;
    crabX = shellX;
    crabY = shellY - 10 + t * 8;
    crabTargetX = crabX;
    crabTargetY = crabY;
  } else {
    // MOVE IN! Crab is inside the new shell, sparkles!
    crabX = shellX;
    crabY = shellY;
    crabTargetX = crabX;
    crabTargetY = crabY;
    
    // Golden celebration sparkles
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 25;
      const sx = shellX + Math.cos(angle) * dist;
      const sy = shellY + Math.sin(angle) * dist;
      const sparkSize = 1 + Math.random() * 2.5;
      const alpha = 0.8 - (stage - 0.8) / 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${Math.max(0, alpha)})`;
      ctx.fill();
    }
  }
  
  // The main crab draws NORMALLY via drawCompositedCrab in the main loop
  // All we did here is move its position. The crab itself is drawn by
  // the render loop, not by this function.
  
  // Assessment progress bar — clean, at the top
  const barW = 120;
  const barH = 4;
  const barX = W/2 - barW/2;
  const barY = H * 0.08;
  
  // Background pill
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(barX - 15, barY - 14, barW + 30, 28, 8);
    ctx.fill();
  } else {
    ctx.fillRect(barX - 15, barY - 14, barW + 30, 28);
  }
  
  // Progress fill
  const progress = Math.min(stage / 0.8, 1);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(barX, barY, barW * progress, barH);
  
  // Stage label
  ctx.fillStyle = '#FFF';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stageLabels[currentStageIdx], W/2, barY + 16);
  ctx.textAlign = 'left';
  
  // Stage dots (5 dots for 5 stages)
  const dotY = barY + 10;
  const dotSpacing = 6;
  const dotStartX = W/2 - 2 * dotSpacing;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(dotStartX + i * dotSpacing, dotY, i <= currentStageIdx ? 2 : 1.5, 0, Math.PI * 2);
    ctx.fillStyle = i <= currentStageIdx ? '#FFD700' : 'rgba(255,255,255,0.3)';
    ctx.fill();
  }
  
  // Tapping claws overlay (only during Tap stage)
  if (stage >= 0.2 && stage < 0.4) {
    const tapCycle = Math.sin((stage - 0.2) * Math.PI * 16);
    ctx.save();
    ctx.translate(shellX - 10, shellY - 8);
    ctx.fillStyle = '#E8785A';
    // Claw 1
    ctx.beginPath();
    ctx.ellipse(tapCycle * 4 - 3, 0, 4, 2.5, 0.3 * tapCycle, 0, Math.PI * 2);
    ctx.fill();
    // Claw 2
    ctx.beginPath();
    ctx.ellipse(tapCycle * 4 + 3, 2, 4, 2.5, -0.3 * tapCycle, 0, Math.PI * 2);
    ctx.fill();
    // Tiny tap impact lines
    if (tapCycle > 0.5) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const angle = -Math.PI/3 + i * Math.PI/6;
        ctx.beginPath();
        ctx.moveTo(8, -2);
        ctx.lineTo(8 + Math.cos(angle) * 6, -2 + Math.sin(angle) * 6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  
  // Complete the upgrade!
  if (stage >= 1) {
    const oldTier = state.shell.tier;
    state.shell.name = state.shell.nextShell.name;
    state.shell.tier = state.shell.nextShell.tier;
    state.shell.type = state.shell.nextShell.type;
    state.shell.upgrading = false;
    state.shell.upgradeProgress = 0;
    state.stats.happiness = Math.min(100, state.stats.happiness + 15);
    state.mood = "excited";
    // CELEBRATION BURST!
    state.celebrationBurst = { x: crabX, y: crabY, timer: 0, duration: 120 };
    if (typeof SFX !== 'undefined') SFX.upgrade();
    // VACANCY CHAIN: old shell cascades to smaller crab!
    // (Even bottle cap gets passed down — some crab needs it!)
    spawnVacancyChain(oldTier);
    if (typeof SFX !== 'undefined') SFX.vacancy();
    state.pendingShell = null;
    // Reset crab position back to normal wandering
    crabX = W * 0.45;
    crabY = H * 0.62;
    crabTargetX = W * 0.45;
    crabTargetY = H * 0.62;
    updateUI();
  }
}