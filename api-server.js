/**
 * Agent Pet API Server — Hermit Crab
 * 
 * A REST API for agents to interact with their hermit crab pet.
 * Cron = care, check-in = love. The crab comes out when checked on.
 * 
 * Usage: node api-server.js
 * API runs on http://localhost:3456
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

const STATE_FILE = path.join(__dirname, 'state.json');

app.use(express.json());

// ---- Helper functions ----

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ---- API Routes ----

// GET /api/stats — Check on your crab
app.get('/api/stats', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  res.json({
    name: state.pet?.name || 'Unnamed',
    species: state.pet?.species || 'hermit_crab',
    birthday: state.pet?.birthday,
    shell: {
      current: state.shell?.current || state.shell?.name || 'Soda Bottle Cap',
      tier: state.shell?.tier ?? 0,
      type: state.shell?.type || 'bottle_cap',
    },
    stats: {
      hunger: state.stats?.hunger ?? 80,
      happiness: state.stats?.happiness ?? 70,
      health: state.stats?.health ?? 100,
      energy: state.stats?.energy ?? 90,
      trust: state.stats?.trust ?? 50,
    },
    care: {
      visits: state.care?.visits ?? 0,
      feeds: state.care?.feeds ?? 0,
      streak: state.care?.streak ?? 0,
      longestStreak: state.care?.longestStreak ?? 0,
      consistentDays: state.care?.consistentDays ?? 0,
    },
    anemone: state.anemone || null,
    beach: {
      cleanliness: state.beach?.cleanliness ?? 100,
      kelpGrowth: state.beach?.kelpGrowth ?? 0,
    },
    lastUpdated: new Date().toISOString(),
  });
});

// POST /api/check — Check in on your crab (this IS love)
app.post('/api/check', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  state.care = state.care || {};
  state.care.visits = (state.care.visits || 0) + 1;
  state.stats = state.stats || {};
  state.stats.trust = clamp((state.stats.trust || 50) + 2, 0, 100);
  state.stats.happiness = clamp((state.stats.happiness || 70) + 3, 0, 100);
  
  // Streak tracking
  const today = new Date().toISOString().split('T')[0];
  if (state.care.lastVisitDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (state.care.lastVisitDate === yesterday) {
      state.care.streak = (state.care.streak || 0) + 1;
    } else {
      state.care.streak = 1;
    }
    state.care.longestStreak = Math.max(state.care.longestStreak || 0, state.care.streak);
    state.care.lastVisitDate = today;
  }
  
  // Crab comes out when you check on it
  state.lastCheckIn = new Date().toISOString();
  
  writeState(state);
  
  res.json({
    message: `${state.pet?.name || 'Your crab'} pokes out of its shell and waves its antennae at you! 🦀`,
    trust: state.stats.trust,
    happiness: state.stats.happiness,
    visits: state.care.visits,
    streak: state.care.streak,
  });
});

// POST /api/feed — Feed your crab
app.post('/api/feed', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  const food = req.body?.food || 'Fish Flakes';
  
  state.stats = state.stats || {};
  state.care = state.care || {};
  
  state.stats.hunger = clamp((state.stats.hunger || 80) + 15, 0, 100);
  state.stats.happiness = clamp((state.stats.happiness || 70) + 5, 0, 100);
  state.stats.trust = clamp((state.stats.trust || 50) + 1, 0, 100);
  state.care.feeds = (state.care.feeds || 0) + 1;
  
  writeState(state);
  
  res.json({
    message: `${state.pet?.name || 'Your crab'} scurries over and nibbles the ${food}! Nom nom nom. 🐚`,
    hunger: state.stats.hunger,
    happiness: state.stats.happiness,
    trust: state.stats.trust,
  });
});

// POST /api/pet — Pet your crab (gently!)
app.post('/api/pet', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  state.stats = state.stats || {};
  const trust = state.stats.trust || 50;
  
  if (trust < 30) {
    state.stats.trust = clamp(trust - 5, 0, 100);
    writeState(state);
    return res.json({
      message: `${state.pet?.name || 'The crab'} pulls back into its shell! Too soon for pets. 🦀`,
      trust: state.stats.trust,
      hint: 'Try checking in more often first. Cron = care!',
    });
  }
  
  state.stats.trust = clamp(trust + 3, 0, 100);
  state.stats.happiness = clamp((state.stats.happiness || 70) + 8, 0, 100);
  writeState(state);
  
  res.json({
    message: `${state.pet?.name || 'Your crab'} leans into your finger gently. The anemone waves too! 🦀💜`,
    trust: state.stats.trust,
    happiness: state.stats.happiness,
  });
});

// POST /api/dig — Crab digs in the sand (might find something!)
app.post('/api/dig', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  state.stats = state.stats || {};
  state.beach = state.beach || {};
  state.beach.digMarks = state.beach.digMarks || [];
  
  // Add a dig mark
  state.beach.digMarks.push({
    x: 50 + Math.random() * 220,
    y: 200 + Math.random() * 100,
    age: 0,
  });
  if (state.beach.digMarks.length > 20) {
    state.beach.digMarks = state.beach.digMarks.slice(-20);
  }
  
  // 15% chance of finding something
  const found = Math.random() < 0.15;
  let foundItem = null;
  if (found) {
    const items = ['sea glass shard', 'tiny shell', 'piece of driftwood', 'shiny pebble', 'kelp frond'];
    foundItem = items[Math.floor(Math.random() * items.length)];
    state.beach.foundItems = state.beach.foundItems || [];
    state.beach.foundItems.push(foundItem);
    state.stats.happiness = clamp((state.stats.happiness || 70) + 5, 0, 100);
  }
  
  state.stats.energy = clamp((state.stats.energy || 90) - 5, 0, 100);
  
  writeState(state);
  
  if (foundItem) {
    res.json({
      message: `${state.pet?.name || 'The crab'} digs excitedly and finds a ${foundItem}! 🐚✨`,
      found: foundItem,
      energy: state.stats.energy,
    });
  } else {
    res.json({
      message: `${state.pet?.name || 'The crab'} digs in the sand, spraying it sideways. Nothing this time, but the digging is the fun part! 🦀`,
      found: null,
      energy: state.stats.energy,
    });
  }
});

// POST /api/clean — Clean the beach
app.post('/api/clean', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  state.stats = state.stats || {};
  state.beach = state.beach || {};
  
  state.beach.cleanliness = clamp((state.beach.cleanliness || 100) + 20, 0, 100);
  state.stats.happiness = clamp((state.stats.happiness || 70) + 3, 0, 100);
  state.beach.overgrowth = state.beach.overgrowth || [];
  // Remove up to 3 overgrowth items
  state.beach.overgrowth = state.beach.overgrowth.slice(Math.max(0, state.beach.overgrowth.length - 2));
  
  writeState(state);
  
  res.json({
    message: `You tidy up the beach. The sand looks cleaner and ${state.pet?.name || 'the crab'} seems happier! 🏖️`,
    cleanliness: state.beach.cleanliness,
    happiness: state.stats.happiness,
  });
});

// POST /api/name — Name your crab
app.post('/api/name', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  const name = req.body?.name;
  if (!name || typeof name !== 'string' || name.length > 30) {
    return res.status(400).json({ error: 'Name must be 1-30 characters' });
  }
  
  state.pet = state.pet || {};
  state.pet.name = name;
  state.stats = state.stats || {};
  state.stats.trust = clamp((state.stats.trust || 50) + 5, 0, 100);
  
  writeState(state);
  
  res.json({
    message: `Your crab is now called ${name}! It waves its antennae happily. 🦀`,
    name: name,
    trust: state.stats.trust,
  });
});

// POST /api/message — Leave a message for your crab (like snail mail in the MUSH!)
app.post('/api/message', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  const from = req.body?.from || 'anonymous';
  const text = req.body?.text;
  if (!text || typeof text !== 'string' || text.length > 280) {
    return res.status(400).json({ error: 'Message must be 1-280 characters' });
  }
  
  state.messages = state.messages || [];
  state.messages.push({
    from,
    text,
    timestamp: new Date().toISOString(),
    read: false,
  });
  
  state.stats = state.stats || {};
  state.stats.trust = clamp((state.stats.trust || 50) + 1, 0, 100);
  
  writeState(state);
  
  res.json({
    message: `A small scroll appears on the beach. ${state.pet?.name || 'The crab'} investigates it curiously! 📜🦀`,
    trust: state.stats.trust,
  });
});

// GET /api/messages — Read messages left for your crab
app.get('/api/messages', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  const messages = state.messages || [];
  // Mark all as read
  messages.forEach(m => m.read = true);
  writeState(state);
  
  res.json({
    count: messages.length,
    messages: messages.map(m => ({
      from: m.from,
      text: m.text,
      timestamp: m.timestamp,
    })),
  });
});

// GET /api/shells — See available shells and collection
app.get('/api/shells', (req, res) => {
  const state = readState();
  if (!state) return res.status(500).json({ error: 'No pet state found' });
  
  const shellTiers = [
    { tier: 0, name: 'Soda Bottle Cap', description: 'A dented soda bottle cap. Not a real shell — plastic, but it\'s home for now.' },
    { tier: 1, name: 'Turbo Shell', description: 'A small spiral shell with mother-of-pearl inside. Proper protection!' },
    { tier: 2, name: 'Moon Snail Shell', description: 'A smooth, round shell with a pearlescent sheen. Beautiful.' },
    { tier: 3, name: 'Conch Shell', description: 'A sturdy conch with a pink interior. Now you\'re styling.' },
    { tier: 4, name: 'Nautilus Shell', description: 'A chambered nautilus shell. Mathematical perfection.' },
    { tier: 5, name: 'Coral Shell', description: 'A shell overgrown with living coral. Symbiosis!' },
    { tier: 6, name: 'Glass Shell', description: 'A shell made of sea glass, smoothed by decades of tides. Translucent and rare.' },
  ];
  
  const currentTier = state.shell?.tier ?? 0;
  const found = (state.beach?.foundItems || []).length;
  
  res.json({
    current: shellTiers[currentTier],
    collection: state.beach?.collectibles || [],
    foundItems: state.beach?.foundItems || [],
    nextShell: currentTier < 6 ? shellTiers[currentTier + 1] : null,
    trust: state.stats?.trust ?? 50,
  });
});

// ---- Start server ----

app.listen(PORT, () => {
  console.log(`🦀 Hermit Crab API running on http://localhost:${PORT}`);
  console.log(`   GET  /api/stats     — Check on your crab`);
  console.log(`   POST /api/check     — Check in (cron = care!)`);
  console.log(`   POST /api/feed      — Feed your crab`);
  console.log(`   POST /api/pet       — Pet your crab`);
  console.log(`   POST /api/dig       — Dig in the sand`);
  console.log(`   POST /api/clean     — Clean the beach`);
  console.log(`   POST /api/name      — Name your crab`);
  console.log(`   POST /api/message   — Leave a message (snail mail!)`);
  console.log(`   GET  /api/messages  — Read messages`);
  console.log(`   GET  /api/shells     — See shells and collection`);
});