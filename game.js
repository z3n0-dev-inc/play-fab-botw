// ══════════════════════════════════════════════════════════════
//  ACCOUNT LEVEL SYSTEM  (BTD6-style XP progression)
// ══════════════════════════════════════════════════════════════

const AccountLevel = (() => {
  // XP thresholds per level (cumulative) — level 1 = 0 XP, level 100 = ~2.5M
  function _xpForLevel(lvl) {
    if (lvl <= 1) return 0;
    // Exponential curve: roughly 500 * (1.18^level)
    return Math.floor(500 * Math.pow(1.18, lvl - 1));
  }
  function _totalXpForLevel(lvl) {
    let total = 0;
    for (let i = 2; i <= lvl; i++) total += _xpForLevel(i);
    return total;
  }
  function getLevelFromXP(xp) {
    let lvl = 1;
    while (_totalXpForLevel(lvl + 1) <= xp) lvl++;
    return Math.min(lvl, 100);
  }
  function getXPProgress(xp) {
    const lvl = getLevelFromXP(xp);
    if (lvl >= 100) return { level:100, current:0, needed:0, pct:1 };
    const base = _totalXpForLevel(lvl);
    const next = _totalXpForLevel(lvl + 1);
    return { level:lvl, current:xp - base, needed:next - base, pct:(xp - base)/(next - base) };
  }

  // XP rewards per game action
  const XP_TABLE = {
    kill: 1,           // per enemy killed
    bossKill: 50,      // per boss
    waveClear: 30,     // per wave
    perfectWave: 60,   // wave with no lives lost
    mapComplete: 500,  // finishing a map
    surviveWaves: 2,   // per wave survived (difficulty multiplier applied)
  };

  // Level-up unlocks catalog
  const LEVEL_UNLOCKS = {
    1:   { type:'title',   value:'ROOKIE',        display:'Title: Rookie' },
    3:   { type:'tower',   value:'sniper',         display:'Tower Unlocked: Sniper' },
    5:   { type:'title',   value:'SURVIVOR',       display:'Title: Survivor' },
    7:   { type:'tower',   value:'freezer',        display:'Tower Unlocked: Freezer' },
    10:  { type:'tower',   value:'rocketeer',      display:'Tower Unlocked: Rocketeer' },
    12:  { type:'title',   value:'VETERAN',        display:'Title: Veteran' },
    15:  { type:'tower',   value:'drone_bay',      display:'AIR TOWER: Drone Bay' },
    18:  { type:'tower',   value:'flamer',         display:'Tower Unlocked: Flamethrower' },
    20:  { type:'title',   value:'WARLORD',        display:'Title: Warlord' },
    22:  { type:'tower',   value:'apache',         display:'AIR TOWER: Apache Gunship' },
    25:  { type:'tower',   value:'tesla',          display:'Tower Unlocked: Tesla Coil' },
    28:  { type:'tower',   value:'mortar',         display:'Tower Unlocked: Mortar' },
    30:  { type:'title',   value:'COMMANDER',      display:'Title: Commander' },
    32:  { type:'tower',   value:'stormwing',      display:'AIR TOWER: Stormwing Jet' },
    35:  { type:'tower',   value:'venom',          display:'Tower Unlocked: Venom Tower' },
    38:  { type:'tower',   value:'laser',          display:'Tower Unlocked: Laser Tower' },
    40:  { type:'title',   value:'ELITE',          display:'Title: Elite' },
    42:  { type:'tower',   value:'stratobomber',   display:'AIR TOWER: Strato Bomber' },
    45:  { type:'tower',   value:'phantom',        display:'Tower Unlocked: Phantom Sniper' },
    48:  { type:'tower',   value:'omega',          display:'Tower Unlocked: Omega Cannon' },
    50:  { type:'title',   value:'LEGEND',         display:'Title: Legend' },
    52:  { type:'tower',   value:'spectre',        display:'AIR TOWER: Spectre AC-130' },
    55:  { type:'tower',   value:'temporal',       display:'Tower Unlocked: Time Distorter' },
    58:  { type:'tower',   value:'reaper',         display:'Tower Unlocked: Soul Reaper' },
    60:  { type:'title',   value:'IMMORTAL',       display:'Title: Immortal' },
    65:  { type:'tower',   value:'sky_fortress',   display:'AIR TOWER: Sky Fortress' },
    70:  { type:'title',   value:'GOD OF WAR',     display:'Title: God of War' },
    80:  { type:'title',   value:'UNTOUCHABLE',    display:'Title: Untouchable' },
    90:  { type:'title',   value:'TRANSCENDENT',   display:'Title: Transcendent' },
    100: { type:'title',   value:'THE LAST BASTION',display:'Title: The Last Bastion' },
  };

  const TITLES = [
    {min:1,  title:'ROOKIE'},
    {min:5,  title:'SURVIVOR'},
    {min:12, title:'VETERAN'},
    {min:20, title:'WARLORD'},
    {min:30, title:'COMMANDER'},
    {min:40, title:'ELITE'},
    {min:50, title:'LEGEND'},
    {min:60, title:'IMMORTAL'},
    {min:70, title:'GOD OF WAR'},
    {min:80, title:'UNTOUCHABLE'},
    {min:90, title:'TRANSCENDENT'},
    {min:100,title:'THE LAST BASTION'},
  ];

  function getTitle(level) {
    for (let i = TITLES.length - 1; i >= 0; i--) {
      if (level >= TITLES[i].min) return TITLES[i].title;
    }
    return 'ROOKIE';
  }

  // Level badge color
  function getLevelColor(level) {
    if (level >= 90) return '#ff00ff';
    if (level >= 70) return '#ff1744';
    if (level >= 50) return '#ffd700';
    if (level >= 30) return '#ff6d00';
    if (level >= 15) return '#7c4dff';
    if (level >= 5)  return '#00bcd4';
    return '#78909c';
  }

  // In-memory state (synced with PlayFab)
  let _xp = 0, _level = 1;

  function load(xp) {
    _xp = xp || 0;
    _level = getLevelFromXP(_xp);
  }
  function getXP() { return _xp; }
  function getLevel() { return _level; }

  // Award XP and return level-ups that occurred
  function awardXP(amount) {
    const oldLevel = _level;
    _xp += amount;
    _level = getLevelFromXP(_xp);
    const levelUps = [];
    for (let l = oldLevel + 1; l <= _level; l++) {
      if (LEVEL_UNLOCKS[l]) levelUps.push({ level: l, ...LEVEL_UNLOCKS[l] });
    }
    return levelUps;
  }

  function getProgress() { return getXPProgress(_xp); }
  function getUnlockAt(level) { return LEVEL_UNLOCKS[level]; }

  return { load, getXP, getLevel, getTitle, getProgress, getLevelColor, awardXP, XP_TABLE, LEVEL_UNLOCKS };
})();


/* ═══════════════════════════════════════════════
   game.js — Core game loop, state, rendering (improved)
   ═══════════════════════════════════════════════ */

const Game = (() => {
  // ── State ──────────────────────────────────────
  let canvas, ctx, map, tileSize;
  let towers = [], enemies = [], bullets = [];
  let waves = [], currentWaveIndex = 0;
  let waveActive = false, waveSpawnQueue = [], waveSpawnIdx = 0, spawnTimer = 0;
  let money, lives, score, kills, wave;
  let _livesAtWaveStart = 0;
  let _killsAtWaveStart = 0;
  let gameOver = false, victory = false;
  let speed = 1;
  let selectedTower = null;
  let placingTower = null;
  let mouseX = 0, mouseY = 0;
  let hoverTile = null;
  let godMode = false;
  let lastTime = 0, raf = null;
  let totalCoinsEarned = 0;
  let targetMode = 'first';

  // Screen shake
  let shakeAmount = 0, shakeX = 0, shakeY = 0;

  // Kill feed (recent kills shown HUD right)
  let killFeed = [];

  // Combo system
  let _combo = 0, _comboTimer = 0;
  const _COMBO_DECAY = 3.5; // seconds to lose combo

  // Interest income accumulator
  let interestAccum = 0;

  // Reusable buffer — avoids array allocation every frame
  const _liveEnemiesBuf = [];
  let _lastAuraTowerCount = -1;

  // Map render cache
  let mapCanvas = null, mapCtx = null;

  // Last placed tower (for undo)
  let lastPlaced = null;

  // ── Public API ─────────────────────────────────
  function init(mapId) {
    map = getMap(mapId);
    if (!map) return;

    canvas = document.getElementById('gameCanvas');
    ctx    = canvas.getContext('2d');

    tileSize = Math.min(
      Math.floor((window.innerWidth - 220) / map.cols),
      Math.floor((window.innerHeight - 52) / map.rows)
    );

    canvas.width  = map.cols * tileSize;
    canvas.height = map.rows * tileSize;

    money  = map.startGold;
    lives  = map.livesStart;
    const _savedXP = PF.isLoggedIn()
      ? (PF.playerData?.AccountXP || 0)
      : parseInt(localStorage.getItem('ztd_xp') || '0');
    AccountLevel.load(_savedXP);
    _updateLevelHUD();
    score  = 0; kills = 0; wave = 0;
    towers = []; enemies = []; bullets = [];
    waveActive = false; waveSpawnQueue = []; waveSpawnIdx = 0; spawnTimer = 0;
    currentWaveIndex = 0; gameOver = false; victory = false;
    godMode = false; selectedTower = null; placingTower = null;
    totalCoinsEarned = 0; shakeAmount = 0; killFeed = [];
    interestAccum = 0; lastPlaced = null;
    _particles.length = 0;

    waves = generateWaves(map.id, map.waves, map.waveModifier, !!map.isInfinite);

    _buildMapCache();
    _buildMinimap();
    _bindEvents();
    // Pre-render all balloon sprites into cache (eliminates first-frame jank)
    _prewarmSpriteCache();
    _updateHUD();
    _updateWavePreview();
    UI.updateTowerPalette(map);

    if (raf) cancelAnimationFrame(raf);
    lastTime = performance.now();
    raf = requestAnimationFrame(_loop);
  }

  function _buildMapCache() {
    mapCanvas = document.createElement('canvas');
    mapCanvas.width  = map.cols * tileSize;
    mapCanvas.height = map.rows * tileSize;
    mapCtx = mapCanvas.getContext('2d');
    _renderMap(mapCtx);
  }

// This file contains the replacement for _makePathTile, _getPathTileType, and _renderMap
// Lines 228-952 of game.js (functions inside the GameEngine IIFE)

  // ═══════════════════════════════════════════════════════════════════════════
  // PATH TILE SYSTEM — Proper arc-based road tiles with stone borders
  // ═══════════════════════════════════════════════════════════════════════════



  function _renderMap(c) {
    const w = map.cols * tileSize, h = map.rows * tileSize;
    const theme = map.theme || 'graveyard';
    const T = tileSize;
    const rng  = mulberry32(42);
    const rng2 = mulberry32(99);
    const rng3 = mulberry32(17);

    // ── GROUND PALETTES ──────────────────────────────────────────────────────
    const GP = {
      graveyard: { g:['#2d5c1a','#347022','#265218','#3a5c20','#224816','#406828'],
                   dark:'#1c3a10', light:'#4a7830', fog:'rgba(160,210,130,0.07)',
                   grass:true },
      urban:     { g:['#2e2e2e','#363636','#282828','#303030','#222222','#3a3a3a'],
                   dark:'#1a1a1a', light:'#484848', fog:null },
      volcanic:  { g:['#220a00','#2c0e00','#1e0600','#300e00','#1a0400','#381200'],
                   dark:'#120300', light:'#3c1000', fog:'rgba(255,60,0,0.05)' },
      arctic:    { g:['#c8e4f4','#d4eeff','#bcd8ec','#daf0ff','#b4cce0','#e2f4ff'],
                   dark:'#9ab8d0', light:'#e8f8ff', fog:'rgba(200,230,255,0.08)' },
      hell:      { g:['#220000','#2c0000','#1c0000','#300000','#180000','#380000'],
                   dark:'#120000', light:'#3c0000', fog:'rgba(200,0,0,0.06)' },
      nuclear:   { g:['#1e3000','#263c00','#1a2c00','#2c4200','#162200','#304e00'],
                   dark:'#101c00', light:'#385200', fog:'rgba(120,200,0,0.05)' },
      shadow:    { g:['#070716','#09091e','#05050e','#0c0c22','#030310','#10102c'],
                   dark:'#030310', light:'#12122e', fog:'rgba(80,0,200,0.06)' },
      omega:     { g:['#0a000a','#0e000e','#080008','#120012','#060006','#160016'],
                   dark:'#040004', light:'#180018', fog:'rgba(180,0,200,0.06)' },
    };
    const gp = GP[theme] || GP.graveyard;

    // ── 1. BASE FILL ─────────────────────────────────────────────────────────
    c.fillStyle = gp.dark;
    c.fillRect(0, 0, w, h);

    // ── 2. GROUND TILES — Pre-rendered rich variants ─────────────────────────
    const VARIANTS = 6;
    const gTiles = [];
    for (let v = 0; v < VARIANTS; v++) {
      const gt = document.createElement('canvas');
      gt.width = gt.height = T;
      const gg = gt.getContext('2d');
      const gr = mulberry32(v * 2311 + 17);

      // Base ground color
      gg.fillStyle = gp.g[v % gp.g.length];
      gg.fillRect(0, 0, T, T);

      // Organic color patches
      for (let p = 0; p < 5; p++) {
        gg.fillStyle = gp.g[(v+p+1) % gp.g.length];
        gg.globalAlpha = 0.18 + gr()*0.28;
        gg.beginPath();
        gg.ellipse(gr()*T, gr()*T, T*(0.15+gr()*0.35), T*(0.1+gr()*0.25), gr()*Math.PI, 0, Math.PI*2);
        gg.fill();
      }
      gg.globalAlpha = 1;

      if (theme === 'graveyard') {
        // Rich multi-layer grass
        const bCols = ['#2a5018','#347020','#1e4010','#3e7828','#285a18','#4a8830','#206418','#56a038'];
        // Darker ground base variation
        gg.fillStyle = gp.g[v % gp.g.length];
        gg.globalAlpha = 0.3 + gr() * 0.3;
        gg.beginPath(); gg.ellipse(gr()*T, gr()*T, T*(0.2+gr()*0.4), T*(0.15+gr()*0.3), gr()*Math.PI, 0, Math.PI*2); gg.fill();
        gg.globalAlpha = 1;
        // Dense grass blades in clusters
        for (let b = 0; b < 28; b++) {
          const bx = gr()*T, by = T*(0.4+gr()*0.6);
          const bh = T*(0.12+gr()*0.28);
          const lean = (gr()-0.5)*T*0.14;
          gg.strokeStyle = bCols[Math.floor(gr()*bCols.length)];
          gg.lineWidth = 0.8 + gr()*1.8; gg.lineCap = 'round';
          gg.globalAlpha = 0.55 + gr()*0.45;
          gg.beginPath(); gg.moveTo(bx, by);
          gg.quadraticCurveTo(bx+lean*0.5, by-bh*0.55, bx+lean, by-bh);
          gg.stroke();
        }
        // Taller background blades
        for (let b = 0; b < 8; b++) {
          const bx = gr()*T, by = T*(0.3+gr()*0.5);
          const bh = T*(0.25+gr()*0.4);
          gg.strokeStyle = bCols[Math.floor(gr()*bCols.length)];
          gg.lineWidth = 0.5; gg.lineCap = 'round';
          gg.globalAlpha = 0.3 + gr()*0.35;
          gg.beginPath(); gg.moveTo(bx, by);
          gg.quadraticCurveTo(bx+(gr()-0.5)*T*0.1, by-bh*0.6, bx+(gr()-0.5)*T*0.15, by-bh);
          gg.stroke();
        }
        // Wildflowers (more frequent)
        if (gr() < 0.45) {
          const fx = T*0.1+gr()*T*0.8, fy = T*0.1+gr()*T*0.65;
          const fCols = ['#ffe566','#ff8899','#ffccee','#ffffc0','#99ffcc','#ffaacc','#ccffaa'];
          const fc = fCols[Math.floor(gr()*fCols.length)];
          const petals = 4 + Math.floor(gr()*3);
          for (let pet = 0; pet < petals; pet++) {
            const pa = (pet/petals)*Math.PI*2;
            const pr2 = T*0.038 + gr()*T*0.015;
            gg.fillStyle = fc; gg.globalAlpha = 0.85;
            gg.beginPath(); gg.ellipse(fx+Math.cos(pa)*pr2*1.5, fy+Math.sin(pa)*pr2*1.5, pr2, pr2*0.5, pa, 0, Math.PI*2); gg.fill();
          }
          gg.fillStyle = '#ffd700'; gg.globalAlpha = 1;
          gg.beginPath(); gg.arc(fx, fy, T*0.025, 0, Math.PI*2); gg.fill();
        }
        // Second flower cluster sometimes
        if (gr() < 0.2) {
          const fx2 = T*0.1+gr()*T*0.8, fy2 = T*0.1+gr()*T*0.65;
          gg.fillStyle = '#ffffff'; gg.globalAlpha = 0.6;
          for (let pet = 0; pet < 5; pet++) {
            const pa = (pet/5)*Math.PI*2;
            gg.beginPath(); gg.ellipse(fx2+Math.cos(pa)*T*0.04, fy2+Math.sin(pa)*T*0.04, T*0.03, T*0.018, pa, 0, Math.PI*2); gg.fill();
          }
          gg.fillStyle = '#ffe566'; gg.globalAlpha = 1;
          gg.beginPath(); gg.arc(fx2, fy2, T*0.02, 0, Math.PI*2); gg.fill();
        }
        // Small rocks (more detailed)
        if (gr() < 0.25) {
          const rx = T*0.1+gr()*T*0.8, ry = T*0.2+gr()*T*0.65;
          const rCols = ['#7a8275','#6c7465','#8a8c7e','#7c8270'];
          const rw = T*0.06+gr()*T*0.07, rh = T*0.04+gr()*T*0.05;
          gg.fillStyle = 'rgba(0,0,0,0.2)';
          gg.beginPath(); gg.ellipse(rx+rw*0.3, ry+rh*0.4, rw*0.7, rh*0.4, 0, 0, Math.PI*2); gg.fill();
          gg.fillStyle = rCols[Math.floor(gr()*rCols.length)];
          gg.globalAlpha = 0.75;
          gg.beginPath(); gg.ellipse(rx, ry, rw, rh, gr()*Math.PI, 0, Math.PI*2); gg.fill();
          gg.fillStyle = 'rgba(255,255,255,0.22)';
          gg.beginPath(); gg.ellipse(rx-rw*0.2, ry-rh*0.25, rw*0.3, rh*0.28, 0, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;
        // Mossy patches
        for (let m = 0; m < 2; m++) {
          gg.fillStyle = m === 0 ? '#3a6820' : '#2a5818'; gg.globalAlpha = 0.12 + gr()*0.1;
          gg.beginPath(); gg.ellipse(gr()*T, gr()*T, T*(0.18+gr()*0.22), T*(0.1+gr()*0.14), gr()*Math.PI, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;

      } else if (theme === 'arctic') {
        // Snow bumps
        for (let s = 0; s < 6; s++) {
          const sg2 = gg.createRadialGradient(gr()*T, gr()*T, 0, gr()*T, gr()*T, T*0.22);
          sg2.addColorStop(0, 'rgba(255,255,255,0.5)');
          sg2.addColorStop(1, 'rgba(220,240,255,0)');
          gg.fillStyle = sg2;
          gg.beginPath(); gg.ellipse(gr()*T, gr()*T, T*(0.1+gr()*0.15), T*(0.06+gr()*0.1), gr()*Math.PI, 0, Math.PI*2); gg.fill();
        }
        for (let sp = 0; sp < 8; sp++) {
          gg.fillStyle = '#fff'; gg.globalAlpha = 0.25+gr()*0.5;
          gg.beginPath(); gg.arc(gr()*T, gr()*T, 0.5+gr()*1.8, 0, Math.PI*2); gg.fill();
        }
        if (gr() < 0.35) {
          // Frozen pine sprig
          const bx2 = T*0.2+gr()*T*0.6;
          for (let b = 0; b < 5; b++) {
            gg.strokeStyle = '#aabbcc'; gg.lineWidth = 1; gg.globalAlpha = 0.55;
            gg.beginPath(); gg.moveTo(bx2+(b-2)*T*0.07, T*0.88);
            gg.lineTo(bx2+(b-2)*T*0.07+(gr()-0.5)*T*0.05, T*0.6); gg.stroke();
          }
        }
        gg.globalAlpha = 1;

      } else if (theme === 'urban') {
        // Cracked concrete
        for (let cr = 0; cr < 5; cr++) {
          gg.strokeStyle = gr()<0.5?'rgba(0,0,0,0.25)':'rgba(100,100,100,0.12)';
          gg.lineWidth = 0.5+gr()*1.5; gg.globalAlpha = 0.25+gr()*0.4;
          const sx = gr()*T, sy = gr()*T;
          gg.beginPath(); gg.moveTo(sx, sy);
          let cx=sx, cy=sy;
          for (let s=0; s<3; s++){cx+=(gr()-0.5)*T*0.5; cy+=(gr()-0.5)*T*0.5; gg.lineTo(cx,cy);}
          gg.stroke();
        }
        for (let d = 0; d < 10; d++) {
          gg.fillStyle = gr()<0.5?'#1e1e1e':'#484848'; gg.globalAlpha = 0.15+gr()*0.2;
          gg.fillRect(gr()*T, gr()*T, 1+gr()*3, 1+gr()*2);
        }
        gg.globalAlpha = 1;

      } else if (theme === 'volcanic') {
        // Ash and hot rock
        for (let a = 0; a < 7; a++) {
          gg.fillStyle = gr()<0.5?'#2a1000':'#3c1800'; gg.globalAlpha = 0.3+gr()*0.4;
          gg.beginPath(); gg.ellipse(gr()*T, gr()*T, T*0.04+gr()*T*0.1, T*0.03+gr()*T*0.07, gr()*Math.PI, 0, Math.PI*2); gg.fill();
        }
        if (gr() < 0.35) {
          const gl2 = gg.createRadialGradient(gr()*T, gr()*T, 0, gr()*T, gr()*T, T*0.2);
          gl2.addColorStop(0,'rgba(255,80,0,0.4)'); gl2.addColorStop(1,'rgba(200,30,0,0)');
          gg.fillStyle = gl2; gg.beginPath(); gg.arc(gr()*T, gr()*T, T*0.2, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;

      } else if (theme === 'hell') {
        for (let a = 0; a < 6; a++) {
          gg.fillStyle = gr()<0.5?'#180000':'#260000'; gg.globalAlpha = 0.4+gr()*0.4;
          gg.beginPath(); gg.ellipse(gr()*T, gr()*T, T*0.05+gr()*T*0.12, T*0.03+gr()*T*0.08, gr()*Math.PI, 0, Math.PI*2); gg.fill();
        }
        if (gr() < 0.4) {
          gg.fillStyle = gr()<0.5?'#ff2200':'#ff6600'; gg.globalAlpha = 0.15+gr()*0.2;
          gg.beginPath(); gg.arc(gr()*T, gr()*T, 1+gr()*2.5, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;

      } else if (theme === 'nuclear') {
        for (let b = 0; b < 14; b++) {
          gg.strokeStyle = gr()<0.5?'#3a6800':'#507800'; gg.lineWidth=1; gg.lineCap='round'; gg.globalAlpha=0.4+gr()*0.4;
          const bx=gr()*T, by=T*0.55+gr()*T*0.45;
          gg.beginPath(); gg.moveTo(bx,by); gg.quadraticCurveTo(bx+(gr()-0.5)*T*0.07,by-T*0.05,bx+(gr()-0.5)*T*0.05,by-T*0.14); gg.stroke();
        }
        if (gr() < 0.28) {
          const ggl = gg.createRadialGradient(gr()*T, gr()*T, 0, gr()*T, gr()*T, T*0.16);
          ggl.addColorStop(0,'rgba(140,220,0,0.45)'); ggl.addColorStop(1,'rgba(80,160,0,0)');
          gg.fillStyle=ggl; gg.beginPath(); gg.arc(gr()*T, gr()*T, T*0.16, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;

      } else if (theme === 'shadow') {
        for (let s = 0; s < 5; s++) {
          const gl3 = gg.createRadialGradient(gr()*T, gr()*T, 0, gr()*T, gr()*T, T*0.18);
          gl3.addColorStop(0,'rgba(100,0,200,0.22)'); gl3.addColorStop(1,'rgba(50,0,120,0)');
          gg.fillStyle=gl3; gg.beginPath(); gg.ellipse(gr()*T, gr()*T, T*0.14+gr()*T*0.1, T*0.09+gr()*T*0.07, gr()*Math.PI, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;

      } else if (theme === 'omega') {
        if (gr() < 0.25) {
          gg.strokeStyle='rgba(180,0,200,0.18)'; gg.lineWidth=0.6;
          gg.beginPath(); gg.moveTo(gr()*T, gr()*T); gg.lineTo(gr()*T, gr()*T); gg.stroke();
        }
        if (gr() < 0.2) {
          gg.fillStyle='#cc0030'; gg.globalAlpha=0.08+gr()*0.1;
          gg.beginPath(); gg.arc(gr()*T, gr()*T, T*0.1+gr()*T*0.1, 0, Math.PI*2); gg.fill();
        }
        gg.globalAlpha = 1;
      }

      gTiles.push(gt);
    }

    // Draw ground tiles with subtle 3D depth edge highlights
    for (let row = 0; row < map.rows; row++) {
      for (let col = 0; col < map.cols; col++) {
        if (map.pathSet.has(`${col},${row}`)) continue;
        const vi = Math.floor(rng() * VARIANTS);
        c.drawImage(gTiles[vi], col*T, row*T);
        // Subtle top/left edge highlight for isometric depth feel
        c.fillStyle = 'rgba(255,255,255,0.04)';
        c.fillRect(col*T, row*T, T, 1);        // top edge
        c.fillRect(col*T, row*T, 1, T);        // left edge
        c.fillStyle = 'rgba(0,0,0,0.06)';
        c.fillRect(col*T, row*T+T-1, T, 1);   // bottom edge
        c.fillRect(col*T+T-1, row*T, 1, T);   // right edge
      }
    }

    // ── 3. GROUND LARGE PATCHES ───────────────────────────────────────────────
    for (let i = 0; i < 60; i++) {
      const gx = rng2()*w, gy = rng2()*h;
      const col2 = Math.floor(gx/T), row2 = Math.floor(gy/T);
      if (map.pathSet.has(`${col2},${row2}`)) continue;
      c.globalAlpha = 0.06 + rng2()*0.1;
      c.fillStyle = gp.dark;
      c.beginPath(); c.ellipse(gx, gy, T*(0.4+rng2()*0.8), T*(0.25+rng2()*0.5), rng2()*Math.PI, 0, Math.PI*2); c.fill();
    }
    c.globalAlpha = 1;

    // ── 4. THEME ATMOSPHERE EFFECTS ───────────────────────────────────────────
    if (theme === 'graveyard') {
      for (let i = 0; i < 10; i++) {
        const gx = rng3()*w, gy = rng3()*h;
        const g2 = c.createRadialGradient(gx, gy, 0, gx, gy, T*1.4);
        g2.addColorStop(0,'rgba(140,200,120,0.1)'); g2.addColorStop(1,'rgba(100,160,80,0)');
        c.fillStyle = g2; c.fillRect(gx-T*1.4, gy-T*1.4, T*2.8, T*2.8);
      }
    }
    if (theme === 'arctic') {
      for (let i = 0; i < 20; i++) {
        const ix = rng3()*w, iy = rng3()*h;
        const sg = c.createRadialGradient(ix, iy, 0, ix, iy, T*0.9);
        sg.addColorStop(0,'rgba(255,255,255,0.35)'); sg.addColorStop(1,'rgba(220,240,255,0)');
        c.fillStyle = sg;
        c.beginPath(); c.ellipse(ix, iy, T*(0.5+rng3()*0.7), T*(0.3+rng3()*0.35), rng3()*Math.PI, 0, Math.PI*2); c.fill();
      }
      c.globalAlpha = 1;
    }

    // ── 5. PATH — Tile-by-tile with proper arc corners ────────────────────────
    const tileCache = {};
    ['h','v','tl','tr','bl','br'].forEach(type => {
      tileCache[type] = _makePathTile(T, type, theme);
    });

    // 3D DEPTH PASS: draw raised ground shadows BEFORE path tiles
    // This makes the path look like it's elevated/recessed into the terrain
    const depthH = Math.floor(T * 0.12);
    map.path.forEach(([pc, pr]) => {
      // Cast a shadow below and to the right (3D depth illusion)
      c.fillStyle = 'rgba(0,0,0,0.38)';
      c.fillRect(pc*T + depthH, pr*T + T, T, depthH); // bottom shadow
      c.fillRect(pc*T + T, pr*T + depthH, depthH, T);  // right shadow

      // Left and top lighter face for raised-road look  
      c.fillStyle = 'rgba(255,255,255,0.06)';
      c.fillRect(pc*T, pr*T, depthH, T); // left highlight
      c.fillRect(pc*T, pr*T, T, depthH); // top highlight
    });

    // First pass: draw path tiles (corners are transparent outside arc)
    map.path.forEach(([pc, pr], idx) => {
      const type = _getPathTileType(map.path, idx);
      c.drawImage(tileCache[type], pc*T, pr*T);
    });

    // ── 6. PATH EDGE SHADOWS ──────────────────────────────────────────────────
    map.path.forEach(([pc, pr]) => {
      [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dc, dr]) => {
        const nc = pc+dc, nr = pr+dr;
        if (nc<0||nc>=map.cols||nr<0||nr>=map.rows) return;
        if (map.pathSet.has(`${nc},${nr}`)) return;
        const fx = pc*T+T/2 + dc*T*0.3, fy = pr*T+T/2 + dr*T*0.3;
        const sg = c.createRadialGradient(fx, fy, 0, fx, fy, T*0.65);
        sg.addColorStop(0,'rgba(0,0,0,0.32)'); sg.addColorStop(1,'rgba(0,0,0,0)');
        c.fillStyle = sg; c.fillRect(nc*T, nr*T, T, T);
      });
    });

    // ── 7. DECORATIONS ────────────────────────────────────────────────────────
    {
      const decRng = mulberry32(55);
      let placed = 0;
      const maxDeco = Math.min(75, Math.floor(map.cols * map.rows * 0.15));
      for (let row = 0; row < map.rows && placed < maxDeco; row++) {
        for (let col = 0; col < map.cols && placed < maxDeco; col++) {
          if (map.pathSet.has(`${col},${row}`)) continue;
          // Also skip tiles directly adjacent to path (don't clutter road edges too much)
          const hasPathNeighbor = [[-1,0],[1,0],[0,-1],[0,1]].some(([dc,dr]) => map.pathSet.has(`${col+dc},${row+dr}`));
          const chance = hasPathNeighbor ? 0.06 : 0.14;
          if (decRng() < chance) {
            const dx = col*T + T*0.15 + decRng()*T*0.7;
            const dy = row*T + T*0.15 + decRng()*T*0.7;
            c.globalAlpha = 0.75 + decRng()*0.25;
            _drawMapDeco(c, theme, dx, dy, T * 0.44, decRng);
            c.globalAlpha = 1;
            placed++;
          }
        }
      }
    }

    // ── 8. ATMOSPHERE OVERLAY ─────────────────────────────────────────────────
    if (gp.fog) { c.fillStyle = gp.fog; c.fillRect(0,0,w,h); }

    // Vignette
    const vig = c.createRadialGradient(w/2, h/2, h*0.1, w/2, h/2, h*0.9);
    vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,0.45)');
    c.fillStyle = vig; c.fillRect(0,0,w,h);

    // ── 9. PORTALS ────────────────────────────────────────────────────────────
    const [sc, sr] = map.path[0];
    const [ec, er] = map.path[map.path.length-1];
    _drawPortal(c, sc*T, sr*T, T, '#27ae60', '#2ecc71', 'START');
    _drawPortal(c, ec*T, er*T, T, '#c0392b', '#e74c3c', 'END');
  }


  function _drawPortal(c, x, y, s, col1, col2, label) {
    const cx = x + s/2, cy = y + s/2, r = s * 0.44;
    // Glow
    c.save();
    const glow = c.createRadialGradient(cx, cy, r*0.3, cx, cy, r*1.4);
    glow.addColorStop(0, col2 + '55');
    glow.addColorStop(1, col1 + '00');
    c.fillStyle = glow;
    c.fillRect(x - s*0.4, y - s*0.4, s*1.8, s*1.8);
    // Ring
    c.strokeStyle = col2;
    c.lineWidth = s * 0.07;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI*2); c.stroke();
    c.strokeStyle = col1;
    c.lineWidth = s * 0.04;
    c.beginPath(); c.arc(cx, cy, r * 0.75, 0, Math.PI*2); c.stroke();
    // Fill
    c.fillStyle = col1 + 'aa';
    c.beginPath(); c.arc(cx, cy, r * 0.68, 0, Math.PI*2); c.fill();
    c.fillStyle = col2 + '55';
    c.beginPath(); c.arc(cx, cy, r * 0.5, 0, Math.PI*2); c.fill();
    // Label
    c.font = `bold ${Math.floor(s*0.28)}px monospace`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#fff';
    c.fillText(label, cx, cy);
    c.restore();
  }

  // ── Minimap ───────────────────────────────────
  let minimapCanvas = null, minimapCtx = null;
  const MM_W = 120, MM_H = 72;

  function _buildMinimap() {
    let mm = document.getElementById('minimap');
    if (!mm) {
      mm = document.createElement('div');
      mm.id = 'minimap';
      mm.innerHTML = '<canvas id="mmCanvas"></canvas><div id="minimap-label">MINIMAP</div>';
      document.querySelector('.canvas-wrap').appendChild(mm);
    }
    minimapCanvas = document.getElementById('mmCanvas');
    minimapCanvas.width  = MM_W;
    minimapCanvas.height = MM_H;
    minimapCtx = minimapCanvas.getContext('2d');
  }

  function _drawMinimap() {
    if (!minimapCtx || !map) return;
    const c = minimapCtx;
    const scX = MM_W / map.cols, scY = MM_H / map.rows;
    c.clearRect(0, 0, MM_W, MM_H);

    // BG
    c.fillStyle = map.bgColor || '#1a2a15';
    c.fillRect(0, 0, MM_W, MM_H);

    // Path
    c.strokeStyle = map.pathColor || '#4a3820';
    c.lineWidth = Math.max(scX, scY) * 0.88;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    map.path.forEach(([pc,pr],i)=>{
      const px=(pc+0.5)*scX, py=(pr+0.5)*scY;
      i===0?c.moveTo(px,py):c.lineTo(px,py);
    });
    c.stroke();

    // Towers (cyan dots)
    towers.forEach(t => {
      const mx=t.tileX*scX+scX/2, my=t.tileY*scY+scY/2;
      c.beginPath(); c.arc(mx, my, 2, 0, Math.PI*2);
      c.fillStyle = t.def.ownerOnly ? t.def.color : '#22d3ee';
      c.fill();
    });

    // Enemies (red/gold dots)
    enemies.forEach(e => {
      if (e.dead) return;
      const ex=(e.x/tileSize)*scX, ey=(e.y/tileSize)*scY;
      c.beginPath(); c.arc(ex, ey, e.isBoss?3:1.5, 0, Math.PI*2);
      c.fillStyle = e.isBoss?'#f1c40f':'#ef4444';
      c.fill();
    });

    // Border
    c.strokeStyle = 'rgba(6,182,212,0.25)';
    c.lineWidth = 1;
    c.strokeRect(0.5, 0.5, MM_W-1, MM_H-1);
  }

  // ── Game Loop ──────────────────────────────────
  function _loop(ts) {
    raf = requestAnimationFrame(_loop);
    const rawDt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    if (rawDt > 0.049) return;
    updateAnimTime(rawDt);  // Update shared animation clock once per frame
    const dt = rawDt * speed;
    _update(dt, rawDt);
    _draw();
  }

  function _update(dt, rawDt) {
    if (gameOver || victory) return;

    // Screen shake decay
    shakeAmount = Math.max(0, shakeAmount - rawDt * 12);
    shakeX = (Math.random() - 0.5) * shakeAmount;
    shakeY = (Math.random() - 0.5) * shakeAmount;

    // Combo decay
    if (_combo > 0 && waveActive) {
      _comboTimer -= rawDt;
      if (_comboTimer <= 0) { _combo = 0; _comboTimer = 0; _updateComboDisplay(); }
    }

    // Kill feed age-out (age first, then filter — avoids double pass)
    for (let i = killFeed.length-1; i >= 0; i--) {
      killFeed[i].age += rawDt;
      if (killFeed[i].age >= 4.0) killFeed.splice(i, 1);
    }

    // Spawn queue
    if (waveActive && waveSpawnIdx < waveSpawnQueue.length) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const e = waveSpawnQueue[waveSpawnIdx++];
        if (e) {
          enemies.push(new Enemy(e.type, map.path, tileSize, wave, map.waveModifier));
          spawnTimer = Math.max(0.08, (e.interval || 0.4) * 0.65);
        }
      }
    }

    // Wave complete check (not infinite)
    if (!map.isInfinite && waveActive && waveSpawnIdx >= waveSpawnQueue.length && enemies.length === 0) {
      waveActive = false;

      // Round summary popup
      _showRoundSummary(wave, kills - _killsAtWaveStart, money);

      // Reset combo on wave end
      _combo = 0; _comboTimer = 0; _updateComboDisplay();

      // Wave achievements
      if (wave >= 5)  UI.showAchievement('wave_5');
      if (wave >= 10) UI.showAchievement('wave_10');
      if (wave >= 20) UI.showAchievement('wave_20');
      if (wave >= 30) UI.showAchievement('wave_30');
      // Perfect wave (no lives lost)
      if (lives >= _livesAtWaveStart) UI.showAchievement('no_damage_wave');

      // ── Farm income + simple interest ──────────────────────────────────
      let farmTotal = 0;
      towers.forEach(t => {
        if (t.isFarm && !t.bankMode && t.incomePerRound > 0) {
          money += t.incomePerRound;
          farmTotal += t.incomePerRound;
          t.totalEarned += t.incomePerRound;
        }
      });
      if (farmTotal > 0) {
        _floatText(`🍌 +$${farmTotal} FARM INCOME`, 'gold');
        _flashPill('hudMoney', 'money-gain');
      }
      // Global interest on hand cash — generous rate
      const interest = Math.max(10, Math.floor(money * 0.025));
      money += interest;
      _updateHUD();
      _floatText(`+$${interest} INTEREST`, 'gold');

      if (currentWaveIndex >= waves.length) {
        _triggerVictory();
        return;
      }
      // XP for wave clear
      const _perfectWave = lives >= _livesAtWaveStart;
      const _waveXP = AccountLevel.XP_TABLE.waveClear
        + wave * AccountLevel.XP_TABLE.surviveWaves
        + (_perfectWave ? AccountLevel.XP_TABLE.perfectWave : 0);
      const _luWave = AccountLevel.awardXP(_waveXP);
      _luWave.forEach(lu => _handleLevelUp(lu));
      if (_perfectWave) _floatText('PERFECT WAVE! +60 XP', '#00e5ff');
      _updateLevelHUD();
      const waveBtn = document.getElementById('btnStartWave');
      waveBtn.textContent = '▶ SEND WAVE';
      waveBtn.classList.add('pulse-green');
      // Auto-send next wave if enabled
      if (Game._triggerAutoWave) Game._triggerAutoWave();
    }

    // Update enemies + collect pending boss spawns
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.update(dt, enemies);

      // Boss summon: inject new enemies at current position
      if (e.pendingSpawns && e.pendingSpawns.length > 0) {
        const spawn = e.pendingSpawns.shift();
        const minion = new Enemy(spawn.type, map.path, tileSize, wave, map.waveModifier);
        minion.pathIndex = Math.max(0, spawn.pathIndex - 1);
        minion.isSummoned = true;
        minion.x = e.x + (Math.random() - 0.5) * tileSize;
        minion.y = e.y + (Math.random() - 0.5) * tileSize;
        minion._updateTarget && minion._updateTarget();
        enemies.push(minion);
      }

      // Boss stomp shockwave: slow all nearby enemies and shake screen
      if (e.stompTrigger) {
        e.stompTrigger = false;
        shakeAmount = 12;
        _floatText('STOMP!', 'red');
        // All player's bullets get cleared (shockwave knocks them away)
        bullets = bullets.filter(b => Math.hypot(b.x - e.x, b.y - e.y) > 80);
      }
    }

    // Enemies reaching end: deduct lives
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.reachedEnd && !e._lifeLost) {
        e._lifeLost = true;
        if (!godMode) {
          // Lives lost per balloon reaching end — brutal scaling
          let livesLost;
          if (e.def.isBlimp) {
            // Blimps cost lives scaled by tier — MOAB=10, BFB=20, ZOMG=30, BAD=50, PHANTOM=75
            const blimpLives = { moab:10, bfb:20, zomg:30, bad:50, phantom:75 };
            livesLost = blimpLives[e.type] || Math.max(10, (e.def.tier - 11) * 8);
          } else {
            // Regular balloons: 1 life per tier (tier 1-5 = 1-5 lives)
            livesLost = Math.max(1, e.def.tier || 1);
          }
          lives -= livesLost;
          shakeAmount = e.isBoss ? 18 : 8;
          _screenFlash('red');
          _flashPill('hudLives', 'lives-hit');
          _combo = 0; _comboTimer = 0; _updateComboDisplay(); // reset combo on life lost
          if (lives <= 0) { lives = 0; _triggerGameOver(); return; }
        }
      }
    }

    // Collect dead enemies for rewards + spawn balloon children
    const _newChildren = [];
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.dead && !e._rewarded) {
        e._rewarded = true;
        // Only reward money/score/XP for enemies killed (not leaked)
        if (!e.reachedEnd) {
          money += e.reward;
          score += e.reward * (e.isBoss ? 10 : 1);
          totalCoinsEarned += e.reward;
          kills++;

          const _killXP = e.isBoss
            ? AccountLevel.XP_TABLE.bossKill
            : AccountLevel.XP_TABLE.kill;
          const _luKill = AccountLevel.awardXP(_killXP);
          _luKill.forEach(lu => _handleLevelUp(lu));

          // Achievement triggers
          if (kills === 1)    UI.showAchievement('first_kill');
          if (kills === 100)  UI.showAchievement('kills_100');
          if (kills === 500)  UI.showAchievement('kills_500');
          if (kills === 1000) UI.showAchievement('kills_1000');

          // Combo
          _combo++;
          _comboTimer = _COMBO_DECAY;
          _updateComboDisplay();

          const isCrit = e.isBoss || e.def.tier >= 12;
          if (isCrit) _spawnDmgNum(e.x, e.y, `+${e.reward}`, true);

          if (e.isBoss) {
            shakeAmount = 22;
            _screenFlash('gold');
            _addKillFeedEntry(`💥 ${e.name} DESTROYED!`, true);
            _floatText(`${e.name} DESTROYED! +${e.reward}`, 'gold');
            UI.showAchievement('boss_kill');
            _spawnExplosion(e.x, e.y, '#ffd700', 18, 80);
            _spawnExplosion(e.x, e.y, '#ff4400', 12, 60);
          } else {
            if (_combo === 10) UI.showAchievement('combo_10');
            if (_combo === 25) UI.showAchievement('combo_25');
            if (_combo > 0 && _combo % 25 === 0) {
              _spawnStreakPop(`🔥 ${_combo}× COMBO!`);
              _screenFlash('gold');
            } else if (_combo > 0 && _combo % 10 === 0) {
              _screenFlash('green');
            }
            // Small pop particles on kill
            if (e.def.isBlimp) {
              _spawnExplosion(e.x, e.y, e.color || '#3498db', 10, 40);
            }
            if (kills % 50 === 0) {
              _addKillFeedEntry(`🎈 ${kills} total pops!`, false);
              _spawnStreakPop(`🎈 ${kills} POPS!`);
            } else if (kills % 25 === 0) {
              _addKillFeedEntry(`💀 ${kills} kills!`, false);
            }
          }
        } // end if (!e.reachedEnd)

        // Spawn children regardless of how they died (blimps leak → release inner bloons)
        if (e.getSpawnChildren) {
          const children = e.getSpawnChildren(wave, map.waveModifier);
          children.forEach(c => _newChildren.push(c));
        }
      }
    }
    if (_newChildren.length > 0) enemies.push(..._newChildren);

    // In-place remove dead/reached enemies — no new array allocation
    let w2 = 0;
    for (let i = 0; i < enemies.length; i++) {
      if (!enemies[i].dead && !enemies[i].reachedEnd) enemies[w2++] = enemies[i];
    }
    enemies.length = w2;

    // Infinite mode: never end
    if (map && map.isInfinite && waveActive && waveSpawnIdx >= waveSpawnQueue.length && enemies.length===0) {
      // auto-load next infinite wave
      if (currentWaveIndex < waves.length) {
        const waveData = waves[currentWaveIndex];
        wave = waveData.number;
        currentWaveIndex++;
        waveSpawnQueue = []; waveSpawnIdx = 0;
        waveData.enemies.forEach(group => {
          for (let ii=0;ii<group.count;ii++) {
            const isGFirst = ii === 0 && gi > 0;
            waveSpawnQueue.push({type:group.type, interval: isGFirst ? Math.max(group.interval, 1.2) : group.interval});
          }
        });
        spawnTimer = 2.5; // brief pause between waves
        _livesAtWaveStart = lives;
        _killsAtWaveStart = kills;
        _updateHUD(); _updateWavePreview();
        UI.announceWave(wave, waveData.isBossWave);
        // Save infinite leaderboard entry
        _saveInfiniteScore(wave);
      }
    }

    // Aura towers: recompute every tick (towers < 30, O(n²) is fine)
    // Must recompute every tick since upgrades change auraBonus mid-game
    let hasAura = false;
    for (let i = 0; i < towers.length; i++) { if (towers[i].def && towers[i].def.aura) { hasAura = true; break; } }
    if (hasAura) {
      for (let i = 0; i < towers.length; i++) towers[i].auraBuff = 1.0;
      for (let i = 0; i < towers.length; i++) {
        const t = towers[i];
        if (!t.def.aura) continue;
        // Use tower's CURRENT range (upgraded) and aura bonus
        const auraRange = t.range * 0.9;
        const rSq = auraRange * auraRange;
        // auraBonus accumulates via upgrade(), so read from tower instance not def
        const towerAuraBonus = t.def.auraBonus || 0.4;
        const upgradedBonus  = (t.level > 0 && t.def.upgrades)
          ? t.def.upgrades.slice(0, t.level).reduce((acc, u) => acc + (u.auraBonus || 0), towerAuraBonus)
          : towerAuraBonus;
        const bonus = 1.0 + upgradedBonus;
        for (let j = 0; j < towers.length; j++) {
          if (i === j) continue;
          const o = towers[j];
          const dx = o.x - t.x, dy = o.y - t.y;
          if (dx*dx + dy*dy <= rSq) o.auraBuff = Math.max(o.auraBuff, bonus);
        }
      }
    }

    // Reuse pre-allocated array for live enemies (no GC pressure)
    _liveEnemiesBuf.length = 0;
    for (let i = 0; i < enemies.length; i++) { if (!enemies[i].dead) _liveEnemiesBuf.push(enemies[i]); }
    const liveEnemies = _liveEnemiesBuf;

    // PERF: soft cap — reduce spawn rate if too many enemies on field
    // Never delete live enemies; just pause spawning temporarily
    const MAX_ENEMIES = 180;
    if (enemies.length >= MAX_ENEMIES) {
      spawnTimer = Math.max(spawnTimer, 0.3); // slow down spawning, don't kill enemies
    }

    // Update towers (skip combat logic for economy-only towers)
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      if (t.isEconomy) continue;
      t.targetMode = targetMode;
      t.update(dt, liveEnemies);
      // Transfer new bullets — push is O(1), no shift needed
      const tb = t.bullets;
      if (tb.length > 0) { for (let j = 0; j < tb.length; j++) bullets.push(tb[j]); tb.length = 0; }
    }

    // Update bullets - reverse loop for in-place removal
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].update(dt);
      if (bullets[i].dead) { bullets[i] = bullets[bullets.length-1]; bullets.length--; }
    }
    if (bullets.length > 350) bullets.length = 350;
    _updateHUD(); // single HUD update per frame
    _tickFloats(rawDt);
    _tickDmgNums(rawDt);
    _tickParticles(rawDt);
  }

  function _draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (shakeAmount > 0) ctx.translate(shakeX, shakeY);

    // Map (cached offscreen canvas)
    ctx.drawImage(mapCanvas, 0, 0);

    // Placement preview — BTD6-style
    if (placingTower && hoverTile) {
      const [col, row] = hoverTile;
      const canPlace = _canPlace(col, row);
      const canAffordPlace = money >= placingTower.cost;
      const cx2 = col*tileSize + tileSize/2;
      const cy2 = row*tileSize + tileSize/2;
      const valid = canPlace && canAffordPlace;
      const rCol = valid ? '#39ff14' : '#ff2244';
      const rColAlpha = valid ? 'rgba(57,255,20,' : 'rgba(255,34,68,';

      // ── Range fill — soft tinted disc ──
      ctx.beginPath();
      ctx.arc(cx2, cy2, placingTower.range, 0, Math.PI*2);
      ctx.fillStyle = valid ? 'rgba(57,255,20,0.07)' : 'rgba(255,34,68,0.07)';
      ctx.fill();

      // ── Range ring — solid bright ring like BTD6 ──
      ctx.beginPath();
      ctx.arc(cx2, cy2, placingTower.range, 0, Math.PI*2);
      ctx.strokeStyle = valid ? 'rgba(57,255,20,0.75)' : 'rgba(255,34,68,0.7)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // ── Second ring pulse (animated) ──
      const pulseFrac = ((_animTime*1.2) % 1);
      const pulseR = placingTower.range * (0.5 + pulseFrac * 0.5);
      const pulseAlpha = (1 - pulseFrac) * 0.35;
      ctx.beginPath();
      ctx.arc(cx2, cy2, pulseR, 0, Math.PI*2);
      ctx.strokeStyle = valid ? `rgba(57,255,20,${pulseAlpha})` : `rgba(255,34,68,${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Tile highlight — colored square with rounded feel ──
      const tileAlpha = valid ? 0.28 : 0.38;
      ctx.fillStyle = valid ? `rgba(57,255,20,${tileAlpha})` : `rgba(255,34,68,${tileAlpha})`;
      ctx.beginPath();
      ctx.roundRect(col*tileSize+2, row*tileSize+2, tileSize-4, tileSize-4, 4);
      ctx.fill();

      // ── Tile border ──
      ctx.strokeStyle = valid ? 'rgba(57,255,20,0.9)' : 'rgba(255,34,68,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(col*tileSize+2, row*tileSize+2, tileSize-4, tileSize-4, 4);
      ctx.stroke();

      // ── Can't afford: diagonal warning stripes ──
      if (!canAffordPlace) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(col*tileSize+2, row*tileSize+2, tileSize-4, tileSize-4, 4);
        ctx.clip();
        ctx.globalAlpha = 0.22;
        ctx.strokeStyle = '#ff2244';
        ctx.lineWidth = 4;
        for (let si = -tileSize; si < tileSize*2; si += 12) {
          ctx.beginPath();
          ctx.moveTo(col*tileSize + si, row*tileSize);
          ctx.lineTo(col*tileSize + si + tileSize, row*tileSize + tileSize);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Tower sprite preview ──
      ctx.globalAlpha = valid ? 0.85 : 0.45;
      const previewFn = (typeof TowerArt !== 'undefined' && TowerArt[placingTower.id]) || null;
      if (previewFn) previewFn(ctx, cx2, cy2 - Math.floor(tileSize*0.04), tileSize, placingTower.color, 0, _animTime);
      ctx.globalAlpha = 1;

      // ── Floating info badge — BTD6-style pill above cursor ──
      const badgePad = 7;
      const badgeFont = Math.floor(tileSize * 0.28);
      ctx.font = `700 ${badgeFont}px 'Orbitron', 'Barlow Condensed', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (!canAffordPlace) {
        const needed = placingTower.cost - money;
        const label = `-$${needed.toLocaleString()} SHORT`;
        const tw = ctx.measureText(label).width;
        const bw2 = tw + badgePad*2, bh2 = badgeFont + badgePad*1.6;
        const bx2 = cx2 - bw2/2, by2 = row*tileSize - bh2 - 6;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.beginPath(); ctx.roundRect(bx2+2, by2+2, bw2, bh2, bh2/2); ctx.fill();
        // Red pill
        const bgRed = ctx.createLinearGradient(bx2,by2,bx2,by2+bh2);
        bgRed.addColorStop(0,'rgba(200,20,30,0.95)'); bgRed.addColorStop(1,'rgba(130,10,15,0.95)');
        ctx.fillStyle = bgRed;
        ctx.beginPath(); ctx.roundRect(bx2, by2, bw2, bh2, bh2/2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,80,0.7)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.roundRect(bx2, by2, bw2, bh2, bh2/2); ctx.stroke();
        ctx.fillStyle = '#ffbbbb';
        ctx.fillText(label, cx2, by2+bh2/2);
      } else {
        const label = `$${placingTower.cost.toLocaleString()}`;
        const tw = ctx.measureText(label).width;
        const bw2 = tw + badgePad*2.5, bh2 = badgeFont + badgePad*1.6;
        const bx2 = cx2 - bw2/2, by2 = row*tileSize - bh2 - 6;
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath(); ctx.roundRect(bx2+2, by2+2, bw2, bh2, bh2/2); ctx.fill();
        // Green pill
        const bgGrn = ctx.createLinearGradient(bx2,by2,bx2,by2+bh2);
        bgGrn.addColorStop(0,'rgba(20,140,55,0.95)'); bgGrn.addColorStop(1,'rgba(10,90,30,0.95)');
        ctx.fillStyle = bgGrn;
        ctx.beginPath(); ctx.roundRect(bx2, by2, bw2, bh2, bh2/2); ctx.fill();
        ctx.strokeStyle = 'rgba(57,255,20,0.65)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.roundRect(bx2, by2, bw2, bh2, bh2/2); ctx.stroke();
        // Coin icon
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(bx2+bh2/2, by2+bh2/2, bh2*0.28, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff8a0';
        ctx.font = `700 ${Math.floor(badgeFont*0.7)}px 'Orbitron', sans-serif`;
        ctx.fillText('$', bx2+bh2/2, by2+bh2/2+1);
        ctx.font = `700 ${badgeFont}px 'Orbitron', 'Barlow Condensed', sans-serif`;
        ctx.fillStyle = '#aaffaa';
        ctx.fillText(label, cx2 + bh2*0.1, by2+bh2/2);
      }

      // ── Tower name badge (below cursor) ──
      const nameFontSz = Math.floor(tileSize * 0.22);
      ctx.font = `600 ${nameFontSz}px 'Orbitron', 'Barlow Condensed', sans-serif`;
      const nameW = ctx.measureText(placingTower.name).width + 14;
      const nameH = nameFontSz + 8;
      const nameX = cx2 - nameW/2;
      const nameY = (row+1)*tileSize + 4;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.beginPath(); ctx.roundRect(nameX+1, nameY+1, nameW, nameH, nameH/2); ctx.fill();
      ctx.fillStyle = 'rgba(10,16,28,0.92)';
      ctx.beginPath(); ctx.roundRect(nameX, nameY, nameW, nameH, nameH/2); ctx.fill();
      ctx.strokeStyle = valid ? 'rgba(57,255,20,0.5)' : 'rgba(255,34,68,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(nameX, nameY, nameW, nameH, nameH/2); ctx.stroke();
      ctx.fillStyle = valid ? '#aaffaa' : '#ffaaaa';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(placingTower.name, cx2, nameY + nameH/2);

      // ── Rarity dot indicator ──
      const rarityDotColors = { basic:'#aaaaaa', advanced:'#4488ff', special:'#cc44ff', legendary:'#ffd700' };
      const rdCol = rarityDotColors[placingTower.rarity] || '#aaa';
      ctx.fillStyle = rdCol;
      ctx.beginPath(); ctx.arc(nameX+8, nameY+nameH/2, 3, 0, Math.PI*2); ctx.fill();

      // ── AIR badge ──
      if (placingTower.isAir) {
        ctx.font = `700 ${Math.floor(tileSize*0.2)}px 'Orbitron', sans-serif`;
        const airW = ctx.measureText('✈ AIR').width + 12;
        const airH = tileSize*0.2 + 8;
        const airX = cx2 - airW/2, airY = row*tileSize + tileSize*0.06;
        ctx.fillStyle = 'rgba(0,180,255,0.85)';
        ctx.beginPath(); ctx.roundRect(airX, airY, airW, airH, airH/2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText('✈ AIR', cx2, airY + airH/2);
      }

      // ── Owner glow aura for owner towers ──
      if (placingTower.ownerOnly) {
        const oGrad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, tileSize*0.8);
        oGrad.addColorStop(0, `rgba(255,215,0,${0.15+0.1*Math.sin(_animTime*4)})`);
        oGrad.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = oGrad;
        ctx.beginPath(); ctx.arc(cx2, cy2, tileSize*0.8, 0, Math.PI*2); ctx.fill();
      }
    }

    // Hover range — show range ring when hovering placed tower
    if (!placingTower && hoverTile) {
      const [col, row] = hoverTile;
      const hovered = towers.find(t => t.tileX === col && t.tileY === row);
      if (hovered && !hovered.selected) {
        const rarityAlphas = { basic:0.25, advanced:0.35, special:0.45, legendary:0.55 };
        const alpha = rarityAlphas[hovered.def.rarity] || 0.25;
        const hcol = hovered.def.color || '#aaaaaa';
        // Range fill
        ctx.beginPath(); ctx.arc(hovered.x, hovered.y, hovered.range, 0, Math.PI*2);
        ctx.fillStyle = hcol + '12'; ctx.fill();
        // Range ring
        ctx.beginPath(); ctx.arc(hovered.x, hovered.y, hovered.range, 0, Math.PI*2);
        ctx.strokeStyle = hcol + Math.floor(alpha*255).toString(16).padStart(2,'0');
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    // PERFORMANCE: draw towers (always on screen)
    const tLen = towers.length;
    for (let i = 0; i < tLen; i++) towers[i].draw(ctx);

    // PERFORMANCE: skip offscreen enemies - cull with margin
    const cw = canvas.width, ch = canvas.height;
    const margin = 80;
    const eLen = enemies.length;
    for (let i = 0; i < eLen; i++) {
      const e = enemies[i];
      if (e.x > -margin && e.x < cw+margin && e.y > -margin && e.y < ch+margin) {
        e.draw(ctx);
      }
    }

    // PERFORMANCE: batch bullets - simple circles where possible
    const bLen = bullets.length;
    for (let i = 0; i < bLen; i++) {
      const b = bullets[i];
      if (b.x > -margin && b.x < cw+margin && b.y > -margin && b.y < ch+margin) {
        b.draw(ctx);
      }
    }

    // Hover tile highlight
    if (!placingTower && hoverTile) {
      const [col, row] = hoverTile;
      ctx.strokeStyle = 'rgba(255,255,255,0.09)';
      ctx.lineWidth = 1;
      ctx.strokeRect(col*tileSize+0.5, row*tileSize+0.5, tileSize-1, tileSize-1);
    }

    _drawFloats(ctx);
    _drawDmgNums(ctx);
    _drawParticles(ctx);
    ctx.restore();
    // Throttle DOM-heavy updates: boss bar every 100ms, minimap every 150ms
    const now = performance.now();
    if (!_lastBossBarUpdate || now - _lastBossBarUpdate > 100) { _updateBossBar(); _lastBossBarUpdate = now; }
    if (!_lastMinimapUpdate || now - _lastMinimapUpdate > 150) { _drawMinimap(); _lastMinimapUpdate = now; }
  }
  let _lastBossBarUpdate = 0, _lastMinimapUpdate = 0;

  function _spawnStreakPop(text) {
    const el = document.createElement('div');
    el.className = 'streak-pop';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1900);
  }

  // ── NEW FEEDBACK HELPERS ─────────────────────────────────────────
  function _screenFlash(type) {
    const el = document.getElementById('screenFlash');
    if (!el) return;
    el.className = 'flash-' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = ''; }, 180);
  }

  function _flashPill(id, cls) {
    const el = document.getElementById(id)?.parentElement;
    if (!el) return;
    el.classList.add(cls);
    clearTimeout(el['_t_' + cls]);
    el['_t_' + cls] = setTimeout(() => el.classList.remove(cls), 700);
  }

  function _updateComboDisplay() {
    const disp = document.getElementById('comboDisplay');
    const cnt  = document.getElementById('comboCount');
    if (!disp || !cnt) return;
    if (_combo < 5) {
      disp.classList.add('hidden');
    } else {
      disp.classList.remove('hidden');
      cnt.textContent = _combo + '×';
      // Re-trigger pop animation
      cnt.style.animation = 'none';
      void cnt.offsetWidth;
      cnt.style.animation = '';
    }
  }

  const _killFeedMax = 6;
  function _addKillFeedEntry(text, isBoss) {
    const panel = document.getElementById('killFeedPanel');
    if (!panel) return;
    const el = document.createElement('div');
    el.className = 'kf-entry' + (isBoss ? ' boss' : '');
    el.textContent = text;
    panel.insertBefore(el, panel.firstChild);
    // Fade out after delay
    setTimeout(() => { el.style.opacity = '0'; }, 2800);
    setTimeout(() => el.remove(), 3200);
    // Cap entries
    while (panel.children.length > _killFeedMax) panel.removeChild(panel.lastChild);
  }

  function _showRoundSummary(waveNum, waveKills, currentMoney) {
    const prev = document.querySelector('.round-summary');
    if (prev) prev.remove();
    const perfect = lives >= _livesAtWaveStart;
    const el = document.createElement('div');
    el.className = 'round-summary';
    el.innerHTML = `
      <div class="rs-title">WAVE ${waveNum} CLEAR${perfect ? ' — PERFECT! ⭐' : ''}</div>
      <div class="rs-stat">💀 <span>${waveKills}</span> kills this wave</div>
      <div class="rs-stat">💰 <span>$${currentMoney.toLocaleString()}</span> cash</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }

  function _updateBossBar() {
    const bar   = document.getElementById('bossBar');
    const boss  = enemies.find(e => e.isBoss && !e.dead);
    if (boss) {
      bar.classList.add('visible');
      document.getElementById('bossBarLabel').textContent = boss.name;
      document.getElementById('bossBarHp').textContent    = `${Math.ceil(boss.hp)} / ${boss.maxHp}`;
      document.getElementById('bossBarFill').style.width  = `${(boss.hp / boss.maxHp) * 100}%`;
    } else {
      bar.classList.remove('visible');
    }
  }

  function _drawKillFeed(c) {
    if (killFeed.length === 0) return;
    const W = canvas.width;
    killFeed.slice(0, 6).forEach((k, i) => {
      const alpha = Math.max(0, 1 - k.age / 4.0);
      c.save();
      c.globalAlpha = alpha;
      const fs = k.boss ? 13 : 11;
      c.font = `700 ${fs}px 'Barlow Condensed', sans-serif`;
      const tw = c.measureText(k.text).width;
      const px = W - 14, py = 16 + i * 20;
      // Pill bg
      c.fillStyle = k.boss ? 'rgba(80,60,0,0.7)' : 'rgba(60,0,0,0.6)';
      c.beginPath();
      c.roundRect(px - tw - 14, py - fs*0.7, tw + 18, fs*1.5, 4);
      c.fill();
      // Dot
      c.fillStyle = k.boss ? '#f1c40f' : '#e74c3c';
      c.beginPath(); c.arc(px - tw - 6, py + fs*0.05, 3.5, 0, Math.PI*2); c.fill();
      // Text
      c.fillStyle = k.boss ? '#f1c40f' : '#ff8080';
      c.textAlign = 'right';
      c.fillText(k.text, px, py + fs*0.35);
      c.restore();
    });
  }

  // ── Events ─────────────────────────────────────
  function _bindEvents() {
    canvas.onclick      = _onCanvasClick;
    canvas.onmousemove  = _onMouseMove;
    canvas.oncontextmenu = e => { e.preventDefault(); _cancelPlacement(); };
    canvas.onmouseleave  = () => { hoverTile = null; };

    document.getElementById('btnStartWave').onclick = startNextWave;
    document.getElementById('btnSpeed').onclick     = toggleSpeed;
    // Auto-send wave toggle
    let _autoWave = false;
    const _autoBtn = document.getElementById('btnAutoWave');
    if (_autoBtn) {
      _autoBtn.onclick = () => {
        _autoWave = !_autoWave;
        _autoBtn.textContent = _autoWave ? '⚡AUTO ON' : 'AUTO';
        _autoBtn.style.background = _autoWave ? 'rgba(39,174,96,0.5)' : 'rgba(0,0,0,0.3)';
        _autoBtn.style.borderColor = _autoWave ? '#27ae60' : '';
        if (_autoWave) startNextWave();
      };
      // Store ref so wave-complete can check it
      Game._autoWave = () => _autoWave;
      Game._triggerAutoWave = () => { if (_autoWave && !waveActive) setTimeout(startNextWave, 1200); };
    }
    document.getElementById('btnBackMenu').onclick  = () => {
      if (confirm('Return to menu? Progress will be saved.')) {
        stopGame(); UI.showScreen('menu');
      }
    };
    document.getElementById('btnUpgrade').onclick  = upgradeTower;
    document.getElementById('btnSell').onclick     = sellTower;
    document.getElementById('btnDeselect').onclick = deselectTower;
    document.getElementById('btnRetry').onclick    = () => {
      document.getElementById('gameOverScreen').classList.add('hidden');
      init(map.id);
    };
    document.getElementById('btnGoMenu').onclick = () => {
      document.getElementById('gameOverScreen').classList.add('hidden');
      stopGame(); UI.showScreen('menu');
    };
    document.getElementById('btnNextMap').onclick = () => {
      document.getElementById('victoryScreen').classList.add('hidden');
      const nextIndex = MAPS.findIndex(m => m.id === map.id) + 1;
      if (nextIndex < MAPS.length) UI.startGame(MAPS[nextIndex].id);
      else { stopGame(); UI.showScreen('menu'); }
    };
    document.getElementById('btnVicMenu').onclick = () => {
      document.getElementById('victoryScreen').classList.add('hidden');
      stopGame(); UI.showScreen('menu');
    };

    document.querySelectorAll('.tgt-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.tgt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        targetMode = btn.dataset.tgt;
        if (selectedTower) selectedTower.targetMode = targetMode;
      };
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', _onKey);
  }

  function _onKey(e) {
    if (!raf) return; // game not running
    switch (e.key) {
      case ' ':     e.preventDefault(); startNextWave(); break;
      case 'Escape': _cancelPlacement(); deselectTower(); break;
      case 'u': case 'U': _undoLastTower(); break;
      case 's': case 'S': if (selectedTower) sellTower(); break;
      case 'g': case 'G': if (selectedTower) upgradeTower(); break;
      case '1': document.querySelectorAll('.tgt-btn')[0]?.click(); break;
      case '2': document.querySelectorAll('.tgt-btn')[1]?.click(); break;
      case '3': document.querySelectorAll('.tgt-btn')[2]?.click(); break;
      case '4': document.querySelectorAll('.tgt-btn')[3]?.click(); break;
    }
  }

  function _onMouseMove(e) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top)  * scaleY;

    const col = Math.floor(mouseX / tileSize);
    const row = Math.floor(mouseY / tileSize);
    hoverTile = (col >= 0 && col < map.cols && row >= 0 && row < map.rows) ? [col, row] : null;
  }

  function _onCanvasClick(e) {
    if (!hoverTile) return;
    const [col, row] = hoverTile;

    if (placingTower) {
      if (_canPlace(col, row)) {
        if (money < placingTower.cost) { UI.toast('Not enough money!', 'red'); return; }
        const t = new Tower(placingTower, col, row, tileSize);
        towers.push(t);
        lastPlaced = t;
        money -= placingTower.cost;
        _updateHUD();
        UI.toast(`${placingTower.name} PLACED!`, 'green');
      } else {
        UI.toast("Can't place there!", 'red');
      }
      _cancelPlacement();
      return;
    }

    const clicked = towers.find(t => t.tileX === col && t.tileY === row);
    if (clicked) {
      towers.forEach(t => t.selected = false);
      clicked.selected = true;
      selectedTower = clicked;
      UI.showTowerInfo(clicked);
    } else {
      deselectTower();
    }
  }

  function _canPlace(col, row) {
    if (col < 0 || col >= map.cols || row < 0 || row >= map.rows) return false;
    if (towers.some(t => t.tileX === col && t.tileY === row)) return false;
    // Air towers can be placed on grass tiles only (they fly over everything)
    const isPath = map.pathSet.has(`${col},${row}`);
    if (placingTower?.isAir) {
      return !isPath; // air towers land on grass pads, not on the path
    }
    if (isPath) return false;
    return true;
  }

  function _cancelPlacement() {
    placingTower = null;
    document.querySelectorAll('.tp-item').forEach(el => el.classList.remove('selected'));
    canvas.style.cursor = 'crosshair';
  }

  // ── Actions ────────────────────────────────────
  function selectTowerToPlace(towerId) {
    const def = getTowerDef(towerId);
    if (!def) return;
    // Block selection if can't afford — shake the cost label and toast
    if (money < def.cost) {
      const item = document.querySelector(`.tp-item[data-id="${towerId}"]`);
      if (item) {
        item.classList.remove('just-affordable');
        void item.offsetWidth;
        item.style.animation = 'none';
        void item.offsetWidth;
        item.style.animation = '';
        // Pulse red border briefly
        item.style.outline = '2px solid #ef4444';
        item.style.outlineOffset = '2px';
        setTimeout(() => { item.style.outline = ''; item.style.outlineOffset = ''; }, 500);
      }
      const shortage = def.cost - money;
      UI.toast(`Need $${shortage} more for ${def.name}!`, 'red');
      return;
    }
    deselectTower();
    if (placingTower?.id === towerId) { _cancelPlacement(); return; }
    placingTower = def;
    canvas.style.cursor = 'none';
    document.querySelectorAll('.tp-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === towerId);
    });
  }

  function upgradeTower() {
    if (!selectedTower) return;
    const cost = selectedTower.getUpgradeCost();
    if (cost === null) { UI.toast('Already max level!', 'gold'); return; }
    if (money < cost) { UI.toast('Not enough money!', 'red'); return; }
    money -= cost;
    selectedTower.upgrade();
    UI.showTowerInfo(selectedTower);
    _updateHUD();
    UI.toast(`UP: ${selectedTower.def.upgrades[selectedTower.level - 1].name}!`, 'green');
  }

  function sellTower() {
    if (!selectedTower) return;
    const val = selectedTower.getSellValue();
    money += val;
    towers = towers.filter(t => t !== selectedTower);
    if (lastPlaced === selectedTower) lastPlaced = null;
    deselectTower();
    _updateHUD();
    UI.toast(`SOLD FOR $${val}`, 'gold');
  }

  // ── Bank withdraw: pulls stored cash out of a bank tower ──
  function withdrawBank(tower) {
    if (!tower || tower.bankBalance <= 0) return;
    const amount = tower.bankBalance;
    tower.bankBalance = 0;
    money += amount;
    _updateHUD();
    _spawnDmgNum(tower.x, tower.y, `WITHDRAWN $${amount}`, true);
    UI.toast(`💸 Withdrew $${amount.toLocaleString()} from bank!`, 'green');
    _floatText(`💸 +$${amount.toLocaleString()} WITHDRAWN`, 'gold');
  }

  // ── Deposit to bank: click bank during prep to deposit cash ──
  function depositToBank(tower, amount) {
    if (!tower || (!tower.isBank && !tower.bankMode)) return;
    const cap = tower.bankCap || 0;
    const room = cap - tower.bankBalance;
    const deposit = Math.min(amount, room, money);
    if (deposit <= 0) { UI.toast('Bank is full!', 'red'); return; }
    tower.bankBalance += deposit;
    money -= deposit;
    _updateHUD();
    UI.toast(`🏦 Deposited $${deposit} (Balance: $${tower.bankBalance})`, 'green');
  }

  function deselectTower() {
    towers.forEach(t => t.selected = false);
    selectedTower = null;
    document.getElementById('selPanel').style.display = 'none';
  }

  function _undoLastTower() {
    if (!lastPlaced || !towers.includes(lastPlaced)) return;
    const refund = lastPlaced.def.cost;
    towers = towers.filter(t => t !== lastPlaced);
    money += refund;
    if (selectedTower === lastPlaced) deselectTower();
    lastPlaced = null;
    _updateHUD();
    UI.toast('↩ Tower refunded', 'gold');
  }

  function startNextWave() {
    if (waveActive) return;
    if (currentWaveIndex >= waves.length) return;

    const waveData = waves[currentWaveIndex];
    wave = waveData.number;
    currentWaveIndex++;

    waveSpawnQueue = []; waveSpawnIdx = 0;
    waveData.enemies.forEach((group, gi) => {
      for (let i = 0; i < group.count; i++) {
        // First enemy of each group (except first group) gets a longer gap
        const isGroupFirst = i === 0 && gi > 0;
        const interval = isGroupFirst
          ? Math.max(group.interval, 1.2)   // gap between groups
          : group.interval;
        waveSpawnQueue.push({ type: group.type, interval });
      }
    });

    waveActive  = true;
    spawnTimer  = 0.5;
    _livesAtWaveStart = lives;
    lastPlaced  = null; // can't undo across waves
    _updateHUD();
    _updateWavePreview();
    document.getElementById('btnStartWave').classList.remove('pulse-green');
    UI.announceWave(wave, waveData.isBossWave);
  }

  function toggleSpeed() {
    const speeds = [1, 2, 3, 4];
    const idx = speeds.indexOf(speed);
    speed = speeds[(idx + 1) % speeds.length];
    const btn = document.getElementById('btnSpeed');
    btn.textContent = speed + '×';
    btn.dataset.spd = speed;
  }

  function stopGame() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    document.removeEventListener('keydown', _onKey);
    const bar = document.getElementById('bossBar');
    if (bar) bar.classList.remove('visible');
  }

  function _saveInfiniteScore(waveReached) {
    const existing = parseInt(localStorage.getItem('ztd_infinite_best') || '0');
    if (waveReached > existing) {
      localStorage.setItem('ztd_infinite_best', waveReached);
    }
    // Also save to leaderboard array
    try {
      const lb = JSON.parse(localStorage.getItem('ztd_infinite_lb') || '[]');
      lb.push({ wave: waveReached, date: Date.now(), name: PF.getDisplayName() || 'ANON' });
      lb.sort((a,b)=>b.wave-a.wave);
      localStorage.setItem('ztd_infinite_lb', JSON.stringify(lb.slice(0,20)));
    } catch(e) {}
  }

  function getInfiniteLeaderboard() {
    try { return JSON.parse(localStorage.getItem('ztd_infinite_lb') || '[]'); } catch(e) { return []; }
  }

  function _triggerGameOver() {
    gameOver = true;
    stopGame();
    shakeAmount = 18;
    PF.saveGameResult(wave, score, kills, totalCoinsEarned, AccountLevel.getXP(), false);
    UI.unlockMap(map.id, false);

    setTimeout(() => {
      document.getElementById('goWave').textContent  = wave;
      document.getElementById('goScore').textContent = score.toLocaleString();
      document.getElementById('goKills').textContent = kills;
      document.getElementById('goCoins').textContent = totalCoinsEarned;
      document.getElementById('gameOverScreen').classList.remove('hidden');
    }, 700);
  }

  function _triggerVictory() {
    victory = true;
    stopGame();
    // Big XP bonus for completing the map
    const _victoryLUs = AccountLevel.awardXP(AccountLevel.XP_TABLE.mapComplete);
    _victoryLUs.forEach(lu => _handleLevelUp(lu));
    PF.saveGameResult(wave, score, kills, totalCoinsEarned, AccountLevel.getXP(), true);
    UI.unlockNextMap(map.id);

    const stars = score > map.waves * 200 ? '⭐⭐⭐' : score > map.waves * 100 ? '⭐⭐' : '⭐';
    setTimeout(() => {
      document.getElementById('vicStars').textContent = stars;
      document.getElementById('vicMsg').textContent = `${map.name} complete! +${totalCoinsEarned} coins`;
      document.getElementById('victoryScreen').classList.remove('hidden');
    }, 800);
  }

  // ── PARTICLE SYSTEM ───────────────────────────────────────────────
  const _particles = [];
  const _MAX_PARTICLES = 80;

  function _spawnExplosion(x, y, color, count, radius) {
    if (_particles.length >= _MAX_PARTICLES) return;
    const n = Math.min(count, _MAX_PARTICLES - _particles.length);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * (radius * 1.8);
      _particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.4,
        age: 0,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  function _tickParticles(dt) {
    for (let i = _particles.length - 1; i >= 0; i--) {
      const p = _particles[i];
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.88;
      p.vy *= 0.88;
      if (p.age >= p.life) { _particles[i] = _particles[_particles.length - 1]; _particles.length--; }
    }
  }

  function _drawParticles(ctx) {
    if (_particles.length === 0) return;
    for (const p of _particles) {
      const a = Math.max(0, 1 - p.age / p.life);
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  // ── END PARTICLE SYSTEM ───────────────────────────────────────────
  const _dmgNums = [];
  function _spawnDmgNum(x, y, text, isCrit) {
    if (_dmgNums.length >= 12) return; // hard cap
    _dmgNums.push({ x, y: y - 8, text, isCrit, age: 0, life: 0.9 });
  }
  function _tickDmgNums(dt) {
    for (let i = _dmgNums.length - 1; i >= 0; i--) {
      _dmgNums[i].age += dt;
      _dmgNums[i].y -= dt * 38;
      if (_dmgNums[i].age >= _dmgNums[i].life) _dmgNums.splice(i, 1);
    }
  }
  function _drawDmgNums(ctx) {
    if (_dmgNums.length === 0) return;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const d of _dmgNums) {
      const a = Math.max(0, 1 - d.age / d.life);
      ctx.globalAlpha = a;
      ctx.font = d.isCrit ? "bold 15px 'Space Mono',monospace" : "bold 11px 'Space Mono',monospace";
      ctx.fillStyle = '#000';
      ctx.fillText(d.text, d.x+1, d.y+1);
      ctx.fillStyle = d.isCrit ? '#fbbf24' : '#f87171';
      ctx.fillText(d.text, d.x, d.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Float text pool — draw on canvas, zero DOM cost
  const _floats = [];
  function _floatText(msg, type = '') {
    const colorMap = { gold:'#fbbf24', red:'#ef4444', green:'#22c55e', '#00e5ff':'#00e5ff', '#4ade80':'#4ade80', '':'#cbd5e1' };
    _floats.push({ msg, color: colorMap[type] || colorMap[''], life: 1.6, age: 0, y: canvas.height * 0.18 });
    if (_floats.length > 6) _floats.shift(); // cap
  }
  function _drawFloats(ctx) {
    if (_floats.length === 0) return;
    ctx.save();
    ctx.font = "700 18px 'Barlow Condensed',sans-serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const cx = canvas.width / 2;
    for (let i = _floats.length - 1; i >= 0; i--) {
      const f = _floats[i];
      const a = Math.max(0, 1 - f.age / f.life);
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = '#000';
      ctx.fillText(f.msg, cx+1, f.y+1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.msg, cx, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  function _tickFloats(dt) {
    for (let i = _floats.length - 1; i >= 0; i--) {
      _floats[i].age += dt;
      _floats[i].y -= dt * 28;
      if (_floats[i].age >= _floats[i].life) _floats.splice(i, 1);
    }
  }

  // Cached HUD values — only write DOM when value actually changes
  let _hud = { money:-1, lives:-1, wave:-1, kills:-1 };
  function _updateHUD() {
    if (money !== _hud.money) { document.getElementById('hudMoney').textContent = money; _hud.money = money; UI.refreshCanAfford(money); }
    if (lives !== _hud.lives) {
      document.getElementById('hudLives').textContent = lives; _hud.lives = lives;
      const livesPill = document.getElementById('hudLives').parentElement;
      if (lives <= 3)      { livesPill.classList.add('lives-danger'); livesPill.style.borderColor=''; }
      else if (lives <= 8) { livesPill.classList.remove('lives-danger'); livesPill.style.borderColor='rgba(251,191,36,0.5)'; }
      else                 { livesPill.classList.remove('lives-danger'); livesPill.style.borderColor=''; }
    }
    if (wave !== _hud.wave)   { document.getElementById('hudWave').textContent = wave || '—'; _hud.wave = wave; }
    if (kills !== _hud.kills) { document.getElementById('hudKills').textContent = kills; _hud.kills = kills; }
    _updateLevelHUD();
  }

  function _updateThreatLevel() {
    // Threat level 1-5 based on wave number
    const w = wave || 0;
    let threatLevel = 1;
    if (w >= 5)  threatLevel = 2;
    if (w >= 10) threatLevel = 3;
    if (w >= 20) threatLevel = 4;
    if (w >= 40) threatLevel = 5;
    const classes = ['','t1','t2','t3','t4','t5'];
    for (let i = 1; i <= 5; i++) {
      const bar = document.getElementById('tb'+i);
      if (bar) {
        bar.className = 'threat-bar' + (i <= threatLevel ? ' '+classes[i] : '');
      }
    }
  }


  function _handleLevelUp(lu) {
    const col = AccountLevel.getLevelColor(lu.level);
    // Dramatic level-up overlay
    const el = document.createElement('div');
    el.className = 'levelup-toast';
    el.style.borderColor = col;
    el.style.boxShadow = `0 0 50px ${col}44`;
    el.innerHTML = `
      <div class="lu-big" style="color:${col}">LEVEL ${lu.level}</div>
      <div class="lu-sub">${AccountLevel.getTitle(lu.level)}</div>
      ${lu.display ? `<div class="lu-unlock">🔓 ${lu.display}</div>` : ''}
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
    // Update HUD
    _updateLevelHUD();
    // If it unlocks a tower, refresh tower palette
    if (lu.type === 'tower') UI.updateTowerPalette(map);
  }

  let _lastLevelHudXP = -1;
  function _updateLevelHUD() {
    const xp = AccountLevel.getXP();
    if (xp === _lastLevelHudXP) return; // no change, skip DOM writes
    _lastLevelHudXP = xp;
    const prog = AccountLevel.getProgress();
    const lvlEl = document.getElementById('hudAcctLevel');
    const barEl = document.getElementById('hudXPBar');
    const titleEl = document.getElementById('hudAcctTitle');
    if (lvlEl) {
      lvlEl.textContent = prog.level;
      lvlEl.style.color = AccountLevel.getLevelColor(prog.level);
    }
    if (barEl) {
      barEl.style.width = (prog.pct * 100).toFixed(1) + '%';
      barEl.style.background = AccountLevel.getLevelColor(prog.level);
    }
    if (titleEl) titleEl.textContent = AccountLevel.getTitle(prog.level);
  }

    function _updateWavePreview() {
    const panel = document.getElementById('wavePreview');
    if (currentWaveIndex >= waves.length) {
      panel.innerHTML = '<span style="color:var(--grn2);font-family:var(--f-mono);font-size:10px;letter-spacing:1px">✓ ALL WAVES CLEARED</span>';
      return;
    }
    const next = waves[currentWaveIndex];
    const counts = {};
    next.enemies.forEach(g => { counts[g.type] = (counts[g.type] || 0) + g.count; });

    let html = `<div style="font-family:var(--f-mono);font-size:9px;color:var(--txt2);letter-spacing:1px;margin-bottom:5px;display:flex;align-items:center;justify-content:space-between">
      <span>WAVE ${next.number}/${waves.length}</span>
      <span style="color:var(--txt3)">${Object.values(counts).reduce((a,b)=>a+b,0)} units</span>
    </div>`;

    if (next.isBossWave) {
      html += '<div class="wp-boss-tag">⚠ BOSS WAVE</div>';
    }

    Object.entries(counts).forEach(([type, count]) => {
      const def = ENEMY_TYPES[type];
      const imm = def.immunities?.length ? `<span style="color:var(--txt3);font-size:8px">[${def.immunities.slice(0,2).join(',')}${def.immunities.length>2?'…':''}]</span>` : '';
      html += `<div class="wp-enemy-row">
        <div class="wp-e-dot" style="background:${def.color||'#888'}"></div>
        <div class="wp-e-name">${def.name} ${imm}</div>
        <div class="wp-e-count">×${count}</div>
      </div>`;
    });
    panel.innerHTML = html;
  }

  // ── Owner commands ─────────────────────────────
  function ownerAddMoney(amount) {
    money += amount;
    _updateHUD();
    _floatText(`+$${amount} OWNER CASH`, 'gold');
  }

  function ownerSkipWave() {
    enemies = []; bullets = [];
    waveActive = false; waveSpawnQueue = []; waveSpawnIdx = 0;
    _floatText('WAVE SKIPPED', 'green');
  }

  function ownerNukeEnemies() {
    // Dramatic nuke effect
    shakeAmount = 30;
    enemies.forEach(e => { e.hp = 0; e.dead = true; });
    bullets = [];
    _floatText('NUKE ACTIVATED', 'red');
    setTimeout(() => {
      enemies = []; waveActive = false; waveSpawnQueue = []; waveSpawnIdx = 0;
    }, 100);
  }

  function ownerGodMode() {
    godMode = !godMode;
    _floatText(godMode ? 'GOD MODE ON' : 'GOD MODE OFF', godMode?'green':'red');
    return godMode;
  }

  function ownerFreezeAll() {
    enemies.forEach(e => {
      e.slowTimer = 10;
      e.speed = e.baseSpeed * 0.05;
      e.flashTimer = 10;
    });
    _floatText('❄️ ALL ENEMIES FROZEN!', 'green');
    shakeAmount = 8;
  }

  let ownerSpeedLevel = 0;
  function ownerSpeedHack() {
    const levels = [1, 2, 4, 8, 12, 16, 1];
    ownerSpeedLevel = (ownerSpeedLevel + 1) % levels.length;
    speed = levels[ownerSpeedLevel];
    const btn = document.getElementById('btnSpeed');
    btn.textContent = speed + '×';
    btn.dataset.spd = speed;
    _floatText(`⚡ SPEED: ${speed}×`, speed >= 12 ? 'red' : 'gold');
    return speed;
  }

  function ownerSpawnBoss(bossType) {
    if (!map) return;
    const boss = new Enemy(bossType, map.path, tileSize, wave || 1, map.waveModifier || 1);
    enemies.push(boss);
    shakeAmount = 14;
    UI.announceWave(wave || 1, true);
  }

  function ownerMaxAllTowers() {
    towers.forEach(t => {
      while (t.level < t.def.maxUpgrade) {
        t.upgrade();
      }
    });
    _floatText('⬆ ALL TOWERS MAXED!', 'gold');
    shakeAmount = 10;
  }

  function ownerSetLives(amount) {
    lives = amount;
    _updateHUD();
    _floatText(`❤️ LIVES SET TO ${amount}`, 'green');
  }

  return {
    init, stopGame, selectTowerToPlace,
    upgradeTower, sellTower, deselectTower, withdrawBank, depositToBank,
    startNextWave, toggleSpeed,
    ownerAddMoney, ownerSkipWave, ownerNukeEnemies, ownerGodMode,
    ownerFreezeAll, ownerSpeedHack, ownerSpawnBoss, ownerMaxAllTowers, ownerSetLives,
    getInfiniteLeaderboard,
    get money()  { return money;  },
    get lives()  { return lives;  },
    get wave()   { return wave;   },
    get score()  { return score;  },
    get mapId()  { return map?.id; },
    get isInfinite() { return !!(map && map.isInfinite); },
    isRunning:   () => !!raf,
  };
})();


// ── Shared path tile functions (available globally) ─────────────────────
function _makePathTile(T, type, theme) {
  // T = tile size in pixels
  // type: 'h' | 'v' | 'tl' | 'tr' | 'bl' | 'br'
  //   straight: h=horizontal road, v=vertical road
  //   corner: tl/tr/bl/br = the INNER corner of the curve
  //     tl = inner corner at top-left  → road enters from right, exits downward
  //     tr = inner corner at top-right → road enters from left,  exits downward
  //     bl = inner corner at bottom-left → road enters from right, exits upward
  //     br = inner corner at bottom-right → road enters from left, exits upward

  const oc = document.createElement('canvas');
  oc.width = oc.height = T;
  const g = oc.getContext('2d');

  const TC = {
    graveyard: { road:'#a08050', roadB:'#b89060', roadC:'#8a6c40', border:'#4a3218',
                 curb:'#c8a870', curbD:'#6a4c28', stones:['#9a9080','#8a8070','#787060','#aa9878'],
                 edgeShadow:'rgba(0,0,0,0.45)', innerGlow:'rgba(200,175,120,0.15)',
                 midLine:'rgba(180,155,100,0.2)' },
    urban:     { road:'#6e6e6e', roadB:'#808080', roadC:'#5a5a5a', border:'#282828',
                 curb:'#9a9a9a', curbD:'#404040', stones:['#666','#777','#555'],
                 edgeShadow:'rgba(0,0,0,0.55)', innerGlow:'rgba(200,200,200,0.07)' },
    volcanic:  { road:'#6a3400', roadB:'#803e00', roadC:'#542800', border:'#220a00',
                 curb:'#c05000', curbD:'#301200', stones:['#4a3020','#3a2010','#5a2808','#6a3c14'],
                 edgeShadow:'rgba(0,0,0,0.6)', innerGlow:'rgba(255,80,0,0.12)' },
    arctic:    { road:'#b8d4e8', roadB:'#cce4f4', roadC:'#a0c0d8', border:'#6080a0',
                 curb:'#dceeff', curbD:'#7090b0', stones:['#c0d8ec','#d0e8f8','#a8c0d8'],
                 edgeShadow:'rgba(0,10,30,0.4)', innerGlow:'rgba(220,240,255,0.18)' },
    hell:      { road:'#880000', roadB:'#aa0000', roadC:'#6e0000', border:'#2e0000',
                 curb:'#dd2200', curbD:'#3e0000', stones:['#4a1010','#3a0808','#5a1818'],
                 edgeShadow:'rgba(0,0,0,0.65)', innerGlow:'rgba(255,20,0,0.12)' },
    nuclear:   { road:'#5e8800', roadB:'#72a400', roadC:'#4c6e00', border:'#222e00',
                 curb:'#90c000', curbD:'#2e4400', stones:['#485a20','#384810','#586030'],
                 edgeShadow:'rgba(0,0,0,0.5)', innerGlow:'rgba(140,220,0,0.12)' },
    shadow:    { road:'#320068', roadB:'#420080', roadC:'#26004e', border:'#0c0025',
                 curb:'#9800ee', curbD:'#180038', stones:['#2a1050','#1a0840','#38186a'],
                 edgeShadow:'rgba(0,0,0,0.7)', innerGlow:'rgba(170,0,255,0.12)' },
    omega:     { road:'#4e000c', roadB:'#660012', roadC:'#3a0008', border:'#160004',
                 curb:'#ee0025', curbD:'#200006', stones:['#3a1018','#281008','#4a1820'],
                 edgeShadow:'rgba(0,0,0,0.7)', innerGlow:'rgba(255,0,30,0.14)' },
  };
  const t = TC[theme] || TC.graveyard;

  // Road occupies 85% of tile width (7.5% margin each side)
  const MARGIN = T * 0.075;
  const ROAD_W = T - MARGIN * 2;  // 85% of T
  const BORDER = T * 0.04;   // border strip width
  const CURB   = T * 0.035;  // curb highlight width
  const pRng   = mulberry32(type.charCodeAt(0)*77 + Math.floor(T));

  const isCorner = ['tl','tr','bl','br'].includes(type);

  if (!isCorner) {
    // ── STRAIGHT TILE ───────────────────────────────────────────────────────
    const isH = type === 'h';
    const R0 = MARGIN, R1 = MARGIN + BORDER, R2 = MARGIN + BORDER + CURB;
    const R3 = T - MARGIN - BORDER - CURB, R4 = T - MARGIN - BORDER, R5 = T - MARGIN;

    // Full shadow underlay
    g.fillStyle = t.edgeShadow.replace(')', ',0.2)').replace('rgba(','rgba(');
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0,0,T,T);

    // Draw road layers
    const drawStrip = (a, b, col, alpha) => {
      g.globalAlpha = alpha || 1; g.fillStyle = col;
      if (isH) g.fillRect(0, a, T, b-a);
      else     g.fillRect(a, 0, b-a, T);
    };

    drawStrip(R0, R5, t.border);         // outer border (dark)
    drawStrip(R1, R4, t.road);           // main road surface
    // Gradient overlay for depth
    const roadGrad = isH
      ? g.createLinearGradient(0, R1, 0, R4)
      : g.createLinearGradient(R1, 0, R4, 0);
    roadGrad.addColorStop(0, t.curbD + '80');
    roadGrad.addColorStop(0.2, 'rgba(0,0,0,0)');
    roadGrad.addColorStop(0.8, 'rgba(0,0,0,0)');
    roadGrad.addColorStop(1, t.curbD + '80');
    g.fillStyle = roadGrad;
    if (isH) g.fillRect(0, R1, T, R4-R1); else g.fillRect(R1, 0, R4-R1, T);

    // Curb highlights at edges
    drawStrip(R1, R2, t.curb, 0.7);
    drawStrip(R3, R4, t.curb, 0.7);
    // Inner curb shadow lines
    g.globalAlpha = 0.65;
    drawStrip(R2, R2+T*0.018, t.curbD);
    drawStrip(R3-T*0.018, R3, t.curbD);
    g.globalAlpha = 1;

    // Center lighter band
    const mid0 = T*0.38, mid1 = T*0.62;
    drawStrip(mid0, mid1, t.roadB, 0.7);
    // Subtle center sheen
    const sh0 = T*0.47, sh1 = T*0.53;
    drawStrip(sh0, sh1, 'rgba(255,255,255,0.07)');

    // Road surface texture — many pebbles/dirt grains for realistic look
    for (let s = 0; s < 22; s++) {
      const sx = pRng()*T, sy = pRng()*T;
      const inRoad = isH ? (sy > R2 && sy < R3) : (sx > R2 && sx < R3);
      if (!inRoad) continue;
      g.globalAlpha = 0.12 + pRng()*0.22;
      g.fillStyle = t.stones[Math.floor(pRng()*t.stones.length)];
      g.beginPath();
      g.ellipse(sx, sy, 1+pRng()*3.5, 0.8+pRng()*2.2, pRng()*Math.PI, 0, Math.PI*2);
      g.fill();
    }
    // Wheel track grooves (two subtle parallel lines)
    if (theme === 'graveyard' || theme === 'urban' || theme === 'volcanic') {
      g.globalAlpha = 0.18;
      g.fillStyle = t.curbD;
      const track1a = T*0.28, track1b = T*0.33, track2a = T*0.67, track2b = T*0.72;
      if (isH) { g.fillRect(0,track1a,T,track1b-track1a); g.fillRect(0,track2a,T,track2b-track2a); }
      else     { g.fillRect(track1a,0,track1b-track1a,T); g.fillRect(track2a,0,track2b-track2a,T); }
      g.globalAlpha = 1;
    }
    g.globalAlpha = 1;

    // Theme-specific surface overlays
    if (theme === 'arctic') {
      for (let i = 0; i < 4; i++) {
        const fx = pRng()*T, fy = pRng()*T;
        const inRoad = isH ? (fy > R2 && fy < R3) : (fx > R2 && fx < R3);
        if (!inRoad) continue;
        g.strokeStyle = 'rgba(220,245,255,0.5)'; g.lineWidth = 0.7; g.globalAlpha = 0.55;
        g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx+(pRng()-0.5)*T*0.35, fy+(pRng()-0.5)*T*0.3); g.stroke();
      }
      g.globalAlpha = 1;
    }
    if (theme === 'volcanic' || theme === 'hell') {
      for (let i = 0; i < 4; i++) {
        if (pRng() < 0.45) {
          const gx=pRng()*T, gy=pRng()*T;
          const gl=g.createRadialGradient(gx,gy,0,gx,gy,T*0.13);
          gl.addColorStop(0,theme==='hell'?'rgba(255,60,0,0.5)':'rgba(255,140,0,0.4)');
          gl.addColorStop(1,'rgba(0,0,0,0)');
          g.fillStyle=gl; g.beginPath(); g.arc(gx,gy,T*0.13,0,Math.PI*2); g.fill();
        }
      }
    }
    if (theme === 'urban') {
      g.fillStyle='rgba(255,255,255,0.07)';
      if (isH) g.fillRect(T*0.15,T*0.46,T*0.7,T*0.08);
      else     g.fillRect(T*0.46,T*0.15,T*0.08,T*0.7);
    }
    if (theme === 'nuclear') {
      for (let i=0;i<2;i++) {
        const gx=pRng()*T, gy=pRng()*T;
        const inR = isH?(gy>R2&&gy<R3):(gx>R2&&gx<R3);
        if (!inR) continue;
        const gl=g.createRadialGradient(gx,gy,0,gx,gy,T*0.1);
        gl.addColorStop(0,'rgba(150,240,0,0.35)'); gl.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gl; g.beginPath(); g.arc(gx,gy,T*0.1,0,Math.PI*2); g.fill();
      }
    }

  } else {
    // ── CORNER TILE ─────────────────────────────────────────────────────────
    // Road from one straight direction curving to an adjacent straight direction.
    // We draw it as a filled annular sector (donut wedge).
    //
    // Pivot at one corner of the tile. Road outer edge at radius T (tile edge).
    // Road inner edge at radius MARGIN (so the inner corner is open/transparent).
    //
    //  tl: pivot=(0,0)   road comes from RIGHT (bottom edge) goes DOWN (right edge) → quarter arc
    //      Wait — let's define clearly:
    //  'tl': inner corner is top-left → pivot=(0,0)
    //        road spans from angle 0 (pointing right) to angle π/2 (pointing down)
    //        but drawn OUTSIDE the pivot — so from right side to bottom side of tile
    //  'tr': inner corner is top-right → pivot=(T,0)
    //        road spans from angle π/2 to π
    //  'bl': inner corner is bottom-left → pivot=(0,T)
    //        road spans from angle -π/2 (=3π/2) to 0 OR equivalently 270° to 360°
    //  'br': inner corner is bottom-right → pivot=(T,T)
    //        road spans from angle π to 3π/2

    // Corner pivot is at the tile corner, arcs from angle a0 to a1
    // R_outer = T so the arc reaches the opposite two tile edges exactly
    // R_inner = MARGIN so inner edge of road aligns with straight tile margins
    // Pivot is the OUTER corner of the turn (where the road bends away from)
    // tl pivot=(0,0): road enters from bottom, exits right → arc sweeps from π/2 (down) to 0 (right)  
    // tr pivot=(T,0): road enters from bottom, exits left  → arc sweeps from π/2 to π
    // bl pivot=(0,T): road enters from top, exits right    → arc sweeps from 3π/2 to 2π (=0)
    // br pivot=(T,T): road enters from top, exits left     → arc sweeps from π to 3π/2
    const pivots = { tl:[0,0], tr:[T,0], bl:[0,T], br:[T,T] };
    const angles = { tl:[0, Math.PI/2], tr:[Math.PI/2, Math.PI], bl:[3*Math.PI/2, 2*Math.PI], br:[Math.PI, 3*Math.PI/2] };

    const [pvx, pvy] = pivots[type];
    const [a0, a1] = angles[type];

    // Road outer radius = T * √2 clipped by tile, inner = MARGIN
    const R_outer = T;
    const R_inner = MARGIN * 0.5; // tighter inner to reduce squareness

    const drawArcBand = (r_in, r_out, col, alpha) => {
      g.globalAlpha = alpha || 1; g.fillStyle = col;
      g.beginPath();
      g.arc(pvx, pvy, r_out, a0, a1);
      g.arc(pvx, pvy, r_in, a1, a0, true);
      g.closePath(); g.fill();
    };

    // Clip to tile
    g.save(); g.beginPath(); g.rect(0,0,T,T); g.clip();

    // Layers from outside in (mimics the straight tile layers)
    drawArcBand(R_inner, R_outer,        'rgba(0,0,0,0.2)');            // shadow
    drawArcBand(R_inner, R_outer,        t.border);                      // dark border ring
    drawArcBand(R_inner + BORDER, R_outer - BORDER, t.curb);            // curb
    drawArcBand(R_inner + BORDER + CURB, R_outer - BORDER - CURB, t.road); // main surface
    // Center band
    const band_in = R_inner + BORDER + CURB + (R_outer - R_inner - 2*(BORDER+CURB))*0.2;
    const band_out = R_outer - BORDER - CURB - (R_outer - R_inner - 2*(BORDER+CURB))*0.2;
    drawArcBand(band_in, band_out, t.roadB);
    // Inner curb dark lines
    g.globalAlpha = 0.7;
    drawArcBand(R_inner + BORDER + CURB, R_inner + BORDER + CURB + T*0.022, t.curbD);
    drawArcBand(R_outer - BORDER - CURB - T*0.022, R_outer - BORDER - CURB, t.curbD);
    g.globalAlpha = 1;
    // Center sheen
    drawArcBand((band_in+band_out)/2 - T*0.04, (band_in+band_out)/2 + T*0.04, 'rgba(255,255,255,0.06)');

    // Surface pebbles on the arc road — more of them
    for (let s = 0; s < 16; s++) {
      const angle = a0 + pRng()*(a1-a0);
      const radius = R_inner + BORDER + CURB + pRng()*(R_outer - R_inner - 2*(BORDER+CURB));
      const sx = pvx + Math.cos(angle)*radius;
      const sy = pvy + Math.sin(angle)*radius;
      g.globalAlpha = 0.14 + pRng()*0.22;
      g.fillStyle = t.stones[Math.floor(pRng()*t.stones.length)];
      g.beginPath(); g.ellipse(sx, sy, 1+pRng()*3, 0.8+pRng()*2, pRng()*Math.PI, 0, Math.PI*2); g.fill();
    }
    g.globalAlpha = 1;

    // Theme overlays on arc
    if (theme === 'arctic') {
      for (let i = 0; i < 3; i++) {
        const angle = a0 + pRng()*(a1-a0);
        const radius = R_inner + BORDER + CURB + pRng()*(R_outer-R_inner-2*(BORDER+CURB));
        const fx = pvx + Math.cos(angle)*radius, fy = pvy + Math.sin(angle)*radius;
        g.strokeStyle='rgba(220,245,255,0.5)'; g.lineWidth=0.8; g.globalAlpha=0.55;
        g.beginPath(); g.moveTo(fx,fy); g.lineTo(fx+(pRng()-0.5)*T*0.25,fy+(pRng()-0.5)*T*0.25); g.stroke();
      }
      g.globalAlpha=1;
    }
    if (theme==='volcanic'||theme==='hell') {
      for (let i=0;i<3;i++) if(pRng()<0.4) {
        const angle=a0+pRng()*(a1-a0);
        const radius=R_inner+BORDER+CURB+pRng()*(R_outer-R_inner-2*(BORDER+CURB));
        const gx=pvx+Math.cos(angle)*radius, gy=pvy+Math.sin(angle)*radius;
        const gl=g.createRadialGradient(gx,gy,0,gx,gy,T*0.1);
        gl.addColorStop(0,theme==='hell'?'rgba(255,60,0,0.5)':'rgba(255,140,0,0.4)');
        gl.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=gl; g.beginPath(); g.arc(gx,gy,T*0.1,0,Math.PI*2); g.fill();
      }
    }

    g.restore();
  }

  return oc;
}

// ── Determine tile type from path neighbors ───────────────────────────────
function _getPathTileType(path, idx) {
  const [c, r] = path[idx];
  const prev = idx > 0 ? path[idx-1] : null;
  const next = idx < path.length-1 ? path[idx+1] : null;
  const fromDir = prev ? { dc: c-prev[0], dr: r-prev[1] } : null;
  const toDir   = next ? { dc: next[0]-c, dr: next[1]-r } : null;
  const dir = toDir || fromDir;
  if (!toDir || !fromDir) return dir.dc !== 0 ? 'h' : 'v';
  if (fromDir.dc === toDir.dc || fromDir.dr === toDir.dr) return toDir.dc !== 0 ? 'h' : 'v';
  // Corner: determine the OUTER pivot (opposite of inner) to match the arc pivot coords
  // The arc is drawn from the corner pivot outward, so pivot = outer corner of the turn
  const fd = fromDir, td = toDir;
  // → then ↓ (right then down): enter left, exit bottom → 'bl'
  if (fd.dc===1  && td.dr===1)  return 'bl';
  // ← then ↓ (left then down): enter right, exit bottom → 'br'
  if (fd.dc===-1 && td.dr===1)  return 'br';
  // → then ↑ (right then up): enter left, exit top → 'tl'
  if (fd.dc===1  && td.dr===-1) return 'tl';
  // ← then ↑ (left then up): enter right, exit top → 'tr'
  if (fd.dc===-1 && td.dr===-1) return 'tr';
  // ↓ then → (down then right): enter top, exit right → 'tr'
  if (fd.dr===1  && td.dc===1)  return 'tr';
  // ↓ then ← (down then left): enter top, exit left → 'tl'
  if (fd.dr===1  && td.dc===-1) return 'tl';
  // ↑ then → (up then right): enter bottom, exit right → 'br'
  if (fd.dr===-1 && td.dc===1)  return 'br';
  // ↑ then ← (up then left): enter bottom, exit left → 'bl'
  if (fd.dr===-1 && td.dc===-1) return 'bl';
  return 'h';
}

// ── Map Decoration Renderer ───────────────────────────────
// NEW _drawMapDeco — proper pixel-art style canvas assets
// Rocks, trees, bushes, stumps, flowers, bones, crystals etc.

// ══════════════════════════════════════════════════════════════════════════
//  MAP DECORATION RENDERER — Pixel-art style assets per theme
//  Draws real canvas objects: trees, rocks, bushes, logs, tombstones etc.
//  Inspired by top-down TD tileset aesthetics.
// ══════════════════════════════════════════════════════════════════════════
function _drawMapDeco(ctx, theme, x, y, s, rng) {
  ctx.save();
  ctx.translate(x, y);

  // s is the "asset size" (roughly half a tileSize)
  // We'll use it as a scale unit. All coords relative to center (0,0).
  const p = rng();

  // ── Shared drawing helpers ───────────────────────────────────────────────
  const px = (n) => Math.round(n * s);  // pixel-snap helper

  // Rock cluster (used by many themes)
  function drawRock(ox, oy, w, h, col1, col2, shadowCol) {
    // Shadow
    ctx.fillStyle = shadowCol || 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(ox+px(0.15), oy+px(0.35), px(w*0.55), px(h*0.22), 0, 0, Math.PI*2);
    ctx.fill();
    // Main rock body
    const rg = ctx.createLinearGradient(ox-px(w*0.5), oy-px(h*0.5), ox+px(w*0.5), oy+px(h*0.5));
    rg.addColorStop(0, col1); rg.addColorStop(1, col2);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(ox-px(w*0.45), oy+px(h*0.2));
    ctx.quadraticCurveTo(ox-px(w*0.5), oy-px(h*0.15), ox-px(w*0.1), oy-px(h*0.5));
    ctx.quadraticCurveTo(ox+px(w*0.25), oy-px(h*0.55), ox+px(w*0.5), oy-px(h*0.1));
    ctx.quadraticCurveTo(ox+px(w*0.48), oy+px(h*0.3), ox+px(w*0.1), oy+px(h*0.5));
    ctx.quadraticCurveTo(ox-px(w*0.2), oy+px(h*0.5), ox-px(w*0.45), oy+px(h*0.2));
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(ox-px(w*0.12), oy-px(h*0.15), px(w*0.18), px(h*0.14), -0.5, 0, Math.PI*2);
    ctx.fill();
    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = px(0.06);
    ctx.beginPath();
    ctx.moveTo(ox-px(w*0.45), oy+px(h*0.2));
    ctx.quadraticCurveTo(ox-px(w*0.5), oy-px(h*0.15), ox-px(w*0.1), oy-px(h*0.5));
    ctx.quadraticCurveTo(ox+px(w*0.25), oy-px(h*0.55), ox+px(w*0.5), oy-px(h*0.1));
    ctx.quadraticCurveTo(ox+px(w*0.48), oy+px(h*0.3), ox+px(w*0.1), oy+px(h*0.5));
    ctx.quadraticCurveTo(ox-px(w*0.2), oy+px(h*0.5), ox-px(w*0.45), oy+px(h*0.2));
    ctx.stroke();
  }

  // Round bush/tree crown
  function drawBush(ox, oy, r, col1, col2, col3) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(ox+px(0.1), oy+r*0.6, r*0.85, r*0.28, 0, 0, Math.PI*2); ctx.fill();
    // Main crown (multiple overlapping circles for pixel art feel)
    const offsets = [[-0.3,-0.15,0.72],[0.25,-0.2,0.68],[-0.05,0.15,0.65],[0,0,0.8]];
    offsets.forEach(([dx,dy,sc], i) => {
      const cols = [col2,col3,col2,col1];
      ctx.fillStyle = cols[i];
      ctx.beginPath(); ctx.arc(ox+r*dx, oy+r*dy, r*sc, 0, Math.PI*2); ctx.fill();
    });
    // Specular highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(ox-r*0.2, oy-r*0.25, r*0.28, r*0.2, -0.4, 0, Math.PI*2); ctx.fill();
    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = px(0.07);
    ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI*2); ctx.stroke();
  }

  // Pine/conifer tree
  function drawPine(ox, oy, h, col1, col2, trunkCol) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(ox+px(0.1), oy+h*0.55, h*0.38, h*0.12, 0, 0, Math.PI*2); ctx.fill();
    // Trunk
    ctx.fillStyle = trunkCol || '#6b4a28';
    ctx.fillRect(ox-px(0.08), oy+h*0.35, px(0.16), h*0.2);
    // Three layered triangles (top-down pine look)
    const layers = [
      [ox, oy-h*0.5, h*0.45, col1],  // top (darkest)
      [ox, oy-h*0.2, h*0.6,  col2],  // mid
      [ox, oy+h*0.05,h*0.7,  col1],  // bottom
    ];
    layers.forEach(([lx, ly, lw, lc]) => {
      ctx.fillStyle = lc;
      ctx.beginPath();
      ctx.moveTo(lx, ly - lw*0.45);
      ctx.lineTo(lx - lw*0.5, ly + lw*0.3);
      ctx.lineTo(lx + lw*0.5, ly + lw*0.3);
      ctx.closePath(); ctx.fill();
      // Shadow side
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.moveTo(lx, ly - lw*0.45);
      ctx.lineTo(lx + lw*0.5, ly + lw*0.3);
      ctx.lineTo(lx, ly + lw*0.0);
      ctx.closePath(); ctx.fill();
    });
    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = px(0.05);
    ctx.beginPath();
    ctx.moveTo(ox, oy-h*0.95);
    ctx.lineTo(ox-h*0.35, oy+h*0.35);
    ctx.lineTo(ox+h*0.35, oy+h*0.35);
    ctx.closePath(); ctx.stroke();
  }

  switch (theme) {

    // ── GRAVEYARD ────────────────────────────────────────────────────────────
    case 'graveyard': {
      if (p < 0.2) {
        // Arched tombstone
        const tw = px(0.7), th = px(0.95);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(px(0.08), px(0.42), tw*0.55, px(0.12), 0, 0, Math.PI*2); ctx.fill();
        // Stone gradient
        const sg = ctx.createLinearGradient(-tw/2-px(0.05), -th/2, tw/2+px(0.05), th*0.4);
        sg.addColorStop(0, '#9aaa98'); sg.addColorStop(0.5,'#7a8a78'); sg.addColorStop(1,'#5a6a58');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(0, -th*0.18, tw/2, Math.PI, 0);
        ctx.lineTo(tw/2, th*0.42);
        ctx.lineTo(-tw/2, th*0.42);
        ctx.closePath(); ctx.fill();
        // Cross
        ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = px(0.07); ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(0,-th*0.08); ctx.lineTo(0,th*0.25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-px(0.22),th*0.05); ctx.lineTo(px(0.22),th*0.05); ctx.stroke();
        // Moss
        ctx.fillStyle='#3a6a28'; ctx.globalAlpha=0.4;
        ctx.beginPath(); ctx.ellipse(-px(0.18),-th*0.28,px(0.2),px(0.09),0.3,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1;
        // Highlight
        ctx.fillStyle='rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.ellipse(-tw/2+px(0.1),-th*0.1,px(0.1),px(0.18),-0.3,0,Math.PI*2); ctx.fill();
        // Outline
        ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=px(0.04);
        ctx.beginPath(); ctx.arc(0,-th*0.18,tw/2,Math.PI,0);
        ctx.lineTo(tw/2,th*0.42); ctx.lineTo(-tw/2,th*0.42); ctx.closePath(); ctx.stroke();
      } else if (p < 0.42) {
        // Dead tree (top-down silhouette)
        ctx.strokeStyle='#3a2c18'; ctx.lineWidth=px(0.15); ctx.lineCap='round'; ctx.lineJoin='round';
        ctx.beginPath(); ctx.moveTo(0,px(0.55)); ctx.lineTo(0,-px(0.3)); ctx.stroke();
        // Main branches
        [[-px(0.55),-px(0.6),-px(0.08),-px(0.1)],
         [px(0.5),-px(0.5),px(0.05),-px(0.08)],
         [-px(0.4),-px(0.15),-px(0.03),px(0.05)],
         [px(0.38),-px(0.2),px(0.04),px(0.08)]].forEach(([bx,by,ox2,oy2]) => {
          ctx.lineWidth=px(0.08);
          ctx.beginPath(); ctx.moveTo(ox2,oy2);
          ctx.quadraticCurveTo((ox2+bx)*0.5, (oy2+by)*0.3-px(0.05), bx, by); ctx.stroke();
          // Twigs
          ctx.lineWidth=px(0.04);
          ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx-px(0.12),by-px(0.18)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+px(0.14),by-px(0.15)); ctx.stroke();
        });
        // Roots at base
        ctx.lineWidth=px(0.06);
        [[-px(0.25),px(0.65)],[px(0.2),px(0.62)]].forEach(([rx,ry]) => {
          ctx.beginPath(); ctx.moveTo(0,px(0.45)); ctx.quadraticCurveTo(rx*0.5,px(0.58),rx,ry); ctx.stroke();
        });
      } else if (p < 0.62) {
        // Rock cluster
        drawRock(-px(0.18), px(0.05), 0.65, 0.5, '#7a8a78', '#5a6a58', 'rgba(0,0,0,0.28)');
        drawRock(px(0.2), -px(0.08), 0.45, 0.4, '#888e85', '#606860', 'rgba(0,0,0,0.2)');
      } else if (p < 0.8) {
        // Round bush with grass
        drawBush(0, px(0.05), px(0.48), '#2d5a1e', '#3d7228', '#234a18');
        // Small wildflowers around base
        ['#ffd060','#ff8899','#ffffff'].forEach((fc, i) => {
          const fa = (i/3)*Math.PI*2 + 0.8;
          ctx.fillStyle = fc; ctx.globalAlpha=0.8;
          ctx.beginPath(); ctx.arc(Math.cos(fa)*px(0.42), px(0.18)+Math.sin(fa)*px(0.15), px(0.06), 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha=1;
      } else {
        // Wooden fence post + rail
        ctx.fillStyle='#7a5530';
        // Posts
        [-px(0.3),px(0.3)].forEach(fx => {
          ctx.fillRect(fx-px(0.08),-px(0.45),px(0.16),px(0.85));
          // Post top
          ctx.fillStyle='#8a6540';
          ctx.beginPath(); ctx.moveTo(fx-px(0.08),-px(0.45)); ctx.lineTo(fx,-px(0.58)); ctx.lineTo(fx+px(0.08),-px(0.45)); ctx.fill();
          ctx.fillStyle='#7a5530';
        });
        // Rails
        ctx.fillStyle='#8a6540';
        ctx.fillRect(-px(0.38),-px(0.2),px(0.76),px(0.08));
        ctx.fillRect(-px(0.38),px(0.08),px(0.76),px(0.08));
        // Shadow/highlight
        ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(-px(0.38),-px(0.2),px(0.76),px(0.02));
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(-px(0.38),-px(0.18),px(0.76),px(0.02));
      }
      break;
    }

    // ── URBAN ─────────────────────────────────────────────────────────────────
    case 'urban': {
      if (p < 0.25) {
        // Wrecked car (top-down view)
        ctx.save(); ctx.rotate(rng()*Math.PI*2);
        // Car body
        const cg = ctx.createLinearGradient(-px(0.55),-px(0.3),px(0.55),px(0.3));
        cg.addColorStop(0,'#4a5055'); cg.addColorStop(1,'#353a3f');
        ctx.fillStyle=cg;
        ctx.beginPath(); ctx.roundRect(-px(0.6),-px(0.32),px(1.2),px(0.64),px(0.1)); ctx.fill();
        // Windows
        ctx.fillStyle='rgba(100,150,200,0.2)';
        ctx.fillRect(-px(0.38),-px(0.22),px(0.38),px(0.44));
        ctx.fillRect(px(0.04),-px(0.22),px(0.35),px(0.44));
        // Wheels (4)
        [[-px(0.48),-px(0.3)],[px(0.48),-px(0.3)],[-px(0.48),px(0.3)],[px(0.48),px(0.3)]].forEach(([wx,wy]) => {
          ctx.fillStyle='#1a1a1a'; ctx.beginPath(); ctx.ellipse(wx,wy,px(0.12),px(0.1),0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#333'; ctx.beginPath(); ctx.ellipse(wx,wy,px(0.06),px(0.05),0,0,Math.PI*2); ctx.fill();
        });
        // Outline
        ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=px(0.04);
        ctx.beginPath(); ctx.roundRect(-px(0.6),-px(0.32),px(1.2),px(0.64),px(0.1)); ctx.stroke();
        ctx.restore();
      } else if (p < 0.5) {
        // Rubble / broken concrete
        const rubbleColors = ['#555','#666','#777','#4a4a4a'];
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = rubbleColors[Math.floor(rng()*rubbleColors.length)];
          ctx.globalAlpha = 0.7+rng()*0.3;
          ctx.save(); ctx.translate((rng()-0.5)*px(0.7),(rng()-0.5)*px(0.5));
          ctx.rotate(rng()*Math.PI);
          const rw2=px(0.1+rng()*0.25), rh2=px(0.06+rng()*0.15);
          ctx.fillRect(-rw2/2,-rh2/2,rw2,rh2);
          ctx.restore();
        }
        ctx.globalAlpha=1;
      } else if (p < 0.72) {
        // Street lamp (broken/leaning)
        const lean = (rng()-0.5)*0.3;
        ctx.save(); ctx.rotate(lean);
        ctx.fillStyle='#555';
        ctx.fillRect(-px(0.06),-px(0.7),px(0.12),px(1.0));
        // Arm
        ctx.fillStyle='#4a4a4a';
        ctx.fillRect(px(0.06),-px(0.65),px(0.28),px(0.06));
        // Lamp head
        ctx.fillStyle= rng()<0.6 ? '#ffe08844' : '#333';
        ctx.beginPath(); ctx.ellipse(px(0.34),-px(0.65),px(0.1),px(0.07),0,0,Math.PI*2); ctx.fill();
        if (rng()<0.6) {
          const lg = ctx.createRadialGradient(px(0.34),-px(0.65),0,px(0.34),-px(0.65),px(0.35));
          lg.addColorStop(0,'rgba(255,220,100,0.35)'); lg.addColorStop(1,'rgba(255,200,50,0)');
          ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(px(0.34),-px(0.65),px(0.35),0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
      } else {
        // Dumpster
        const dg = ctx.createLinearGradient(-px(0.4),-px(0.25),px(0.4),px(0.25));
        dg.addColorStop(0,'#2a5a2a'); dg.addColorStop(1,'#1a3a1a');
        ctx.fillStyle=dg;
        ctx.beginPath(); ctx.roundRect(-px(0.42),-px(0.3),px(0.84),px(0.62),px(0.05)); ctx.fill();
        // Lid
        ctx.fillStyle='#3a7a3a';
        ctx.fillRect(-px(0.42),-px(0.35),px(0.84),px(0.12));
        // Handle
        ctx.fillStyle='#555';
        ctx.fillRect(-px(0.12),-px(0.4),px(0.24),px(0.06));
        // Shadow line
        ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(-px(0.42),px(0.1),px(0.84),px(0.04));
        ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=px(0.04);
        ctx.beginPath(); ctx.roundRect(-px(0.42),-px(0.3),px(0.84),px(0.62),px(0.05)); ctx.stroke();
      }
      break;
    }

    // ── VOLCANIC ──────────────────────────────────────────────────────────────
    case 'volcanic': {
      if (p < 0.3) {
        // Lava rock cluster
        drawRock(-px(0.15), px(0.05), 0.72, 0.52, '#2a1000', '#4a1800', 'rgba(0,0,0,0.4)');
        drawRock(px(0.22), -px(0.1), 0.5, 0.42, '#3a1400', '#5a2000', 'rgba(0,0,0,0.3)');
        // Lava glow between rocks
        const lg2 = ctx.createRadialGradient(0,px(0.05),0,0,px(0.05),px(0.35));
        lg2.addColorStop(0,'rgba(255,100,0,0.5)'); lg2.addColorStop(1,'rgba(200,30,0,0)');
        ctx.fillStyle=lg2; ctx.beginPath(); ctx.arc(0,px(0.05),px(0.35),0,Math.PI*2); ctx.fill();
      } else if (p < 0.58) {
        // Obsidian spike cluster (top-down)
        for (let sp=0; sp<5; sp++) {
          const sx=(sp-2)*px(0.22), sh=px(0.35+rng()*0.35);
          const sg2 = ctx.createLinearGradient(sx,px(0.45),sx,px(0.45)-sh);
          sg2.addColorStop(0,'#0e0800'); sg2.addColorStop(0.6,'#2a1800'); sg2.addColorStop(1,'#4a2c00');
          ctx.fillStyle=sg2;
          ctx.beginPath();
          ctx.moveTo(sx-px(0.12),px(0.45));
          ctx.lineTo(sx,px(0.45)-sh);
          ctx.lineTo(sx+px(0.12),px(0.45));
          ctx.closePath(); ctx.fill();
          // Highlight edge
          ctx.fillStyle='rgba(255,150,0,0.2)';
          ctx.beginPath(); ctx.moveTo(sx,px(0.45)-sh); ctx.lineTo(sx-px(0.12),px(0.45)); ctx.lineTo(sx-px(0.04),px(0.45)-sh*0.6); ctx.closePath(); ctx.fill();
        }
      } else {
        // Lava pool
        const lp = ctx.createRadialGradient(0,px(0.1),0,0,px(0.1),px(0.55));
        lp.addColorStop(0,'#ff9900'); lp.addColorStop(0.35,'#dd4400'); lp.addColorStop(0.7,'#880000'); lp.addColorStop(1,'#440000');
        ctx.fillStyle=lp;
        ctx.beginPath(); ctx.ellipse(0,px(0.1),px(0.52),px(0.35),0,0,Math.PI*2); ctx.fill();
        // Crust edge
        ctx.strokeStyle='#2a0800'; ctx.lineWidth=px(0.1);
        ctx.beginPath(); ctx.ellipse(0,px(0.1),px(0.52),px(0.35),0,0,Math.PI*2); ctx.stroke();
        // Glow aura
        const ga = ctx.createRadialGradient(0,px(0.1),px(0.3),0,px(0.1),px(0.7));
        ga.addColorStop(0,'rgba(255,80,0,0.25)'); ga.addColorStop(1,'rgba(255,30,0,0)');
        ctx.fillStyle=ga; ctx.beginPath(); ctx.arc(0,px(0.1),px(0.7),0,Math.PI*2); ctx.fill();
      }
      break;
    }

    // ── ARCTIC ────────────────────────────────────────────────────────────────
    case 'arctic': {
      if (p < 0.35) {
        // Snow-covered pine tree
        drawPine(0, 0, px(1.0), '#2d5a3a', '#3a7248', '#5a3a20');
        // Snow caps on branches
        ctx.fillStyle='rgba(240,248,255,0.75)';
        [[0,-px(0.48),px(0.16)],[0,-px(0.2),px(0.22)],[0,px(0.06),px(0.28)]].forEach(([tx,ty,tw2]) => {
          ctx.beginPath(); ctx.ellipse(tx,ty,tw2,tw2*0.3,0,0,Math.PI*2); ctx.fill();
        });
      } else if (p < 0.62) {
        // Ice crystal / snow mound
        const smg = ctx.createRadialGradient(-px(0.1),-px(0.15),0,0,0,px(0.6));
        smg.addColorStop(0,'#f5faff'); smg.addColorStop(0.5,'#d8eeff'); smg.addColorStop(1,'rgba(180,220,255,0)');
        ctx.fillStyle=smg;
        ctx.beginPath(); ctx.ellipse(0,px(0.1),px(0.58),px(0.38),0,0,Math.PI*2); ctx.fill();
        // Ice crystals sticking up
        ctx.fillStyle='rgba(200,235,255,0.7)';
        [[-px(0.15),-px(0.35),px(0.22)],[px(0.1),-px(0.4),px(0.18)],[px(0.28),-px(0.28),px(0.14)]].forEach(([cx2,cy2,ch2]) => {
          ctx.beginPath(); ctx.moveTo(cx2,cy2-ch2*0.5); ctx.lineTo(cx2-ch2*0.3,cy2+ch2*0.5); ctx.lineTo(cx2+ch2*0.3,cy2+ch2*0.5); ctx.closePath(); ctx.fill();
        });
        // Sparkle dots
        ctx.fillStyle='#ffffff';
        for (let i=0;i<5;i++) { ctx.globalAlpha=0.4+rng()*0.5; ctx.beginPath(); ctx.arc((rng()-0.5)*px(0.8),(rng()-0.5)*px(0.5),px(0.03+rng()*0.04),0,Math.PI*2); ctx.fill(); }
        ctx.globalAlpha=1;
      } else {
        // Rock cluster (snow-dusted)
        drawRock(-px(0.15),px(0.05),0.68,0.5,'#8090a0','#606878','rgba(0,0,0,0.2)');
        drawRock(px(0.22),-px(0.08),0.48,0.4,'#909aaa','#6a7080','rgba(0,0,0,0.15)');
        // Snow dusting on top
        ctx.fillStyle='rgba(240,248,255,0.6)';
        ctx.beginPath(); ctx.ellipse(-px(0.18),-px(0.05),px(0.25),px(0.1),-0.3,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px(0.22),-px(0.15),px(0.18),px(0.07),-0.2,0,Math.PI*2); ctx.fill();
      }
      break;
    }

    // ── HELL ─────────────────────────────────────────────────────────────────
    case 'hell': {
      if (p < 0.28) {
        // Skull (top-down, detailed)
        // Shadow
        ctx.fillStyle='rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(px(0.08),px(0.38),px(0.45),px(0.14),0,0,Math.PI*2); ctx.fill();
        // Skull cranium
        const skull_g = ctx.createRadialGradient(-px(0.12),-px(0.15),0,0,0,px(0.48));
        skull_g.addColorStop(0,'#c8b898'); skull_g.addColorStop(1,'#8a7a60');
        ctx.fillStyle=skull_g;
        ctx.beginPath(); ctx.arc(0,-px(0.05),px(0.45),0,Math.PI*2); ctx.fill();
        // Jaw
        ctx.fillStyle='#9a8a68';
        ctx.beginPath(); ctx.moveTo(-px(0.3),px(0.2)); ctx.lineTo(-px(0.25),px(0.42)); ctx.lineTo(px(0.25),px(0.42)); ctx.lineTo(px(0.3),px(0.2)); ctx.closePath(); ctx.fill();
        // Eye sockets
        [[-px(0.16),-px(0.08)],[px(0.16),-px(0.08)]].forEach(([ex,ey]) => {
          ctx.fillStyle='#1a0000';
          ctx.beginPath(); ctx.ellipse(ex,ey,px(0.12),px(0.15),0,0,Math.PI*2); ctx.fill();
          // Eye glow
          ctx.fillStyle='rgba(200,0,0,0.6)';
          ctx.beginPath(); ctx.arc(ex,ey,px(0.06),0,Math.PI*2); ctx.fill();
        });
        // Nose
        ctx.fillStyle='#1a0000';
        ctx.beginPath(); ctx.moveTo(0,px(0.05)); ctx.lineTo(-px(0.07),px(0.18)); ctx.lineTo(px(0.07),px(0.18)); ctx.closePath(); ctx.fill();
        // Teeth
        ctx.fillStyle='#d0c0a0';
        for (let t=-2;t<=2;t++) {
          ctx.beginPath(); ctx.roundRect(t*px(0.1)-px(0.04),px(0.28),px(0.07),px(0.1),px(0.02)); ctx.fill();
        }
        // Outline
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=px(0.04);
        ctx.beginPath(); ctx.arc(0,-px(0.05),px(0.45),0,Math.PI*2); ctx.stroke();
      } else if (p < 0.55) {
        // Fire/torch cluster
        for (let fl=0;fl<3;fl++) {
          const fx=(fl-1)*px(0.35), fbase=px(0.35);
          // Torch base
          ctx.fillStyle='#5a3a18';
          ctx.fillRect(fx-px(0.06),fbase-px(0.3),px(0.12),px(0.3));
          // Flame layers
          const fh=px(0.35+rng()*0.15);
          [[0,'#ff2200',1.0],[0,'#ff6600',0.8],[0,'#ffaa00',0.5],[0,'#ffee00',0.25]].forEach(([_,fc,fscale]) => {
            const ffg = ctx.createRadialGradient(fx,fbase-px(0.3),0,fx,fbase-px(0.3),fh*fscale);
            ffg.addColorStop(0,fc+'cc'); ffg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=ffg;
            ctx.beginPath(); ctx.arc(fx,fbase-px(0.3),fh*fscale,0,Math.PI*2); ctx.fill();
          });
        }
      } else {
        // Bone pile
        ctx.fillStyle='#c0a880';
        for (let b=0;b<5;b++) {
          const bx=(rng()-0.5)*px(0.85), by=(rng()-0.5)*px(0.55), bl=px(0.22+rng()*0.3);
          ctx.save(); ctx.translate(bx,by); ctx.rotate(rng()*Math.PI);
          ctx.globalAlpha=0.8+rng()*0.2;
          ctx.beginPath(); ctx.roundRect(-bl/2,-px(0.055),bl,px(0.11),px(0.055)); ctx.fill();
          ctx.beginPath(); ctx.arc(-bl/2,0,px(0.08),0,Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(bl/2,0,px(0.08),0,Math.PI*2); ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha=1;
      }
      break;
    }

    // ── NUCLEAR ───────────────────────────────────────────────────────────────
    case 'nuclear': {
      if (p < 0.3) {
        // Glowing radioactive barrel
        const bg3 = ctx.createLinearGradient(-px(0.28),-px(0.48),px(0.28),px(0.48));
        bg3.addColorStop(0,'#4a6a18'); bg3.addColorStop(1,'#283808');
        ctx.fillStyle=bg3;
        ctx.beginPath(); ctx.roundRect(-px(0.28),-px(0.48),px(0.56),px(0.88),px(0.06)); ctx.fill();
        // Stripe rings
        ctx.fillStyle='#ffc107';
        ctx.fillRect(-px(0.28),-px(0.15),px(0.56),px(0.1));
        ctx.fillStyle='#333';
        ctx.fillRect(-px(0.28),-px(0.08),px(0.56),px(0.04));
        // Lid rim
        ctx.fillStyle='#6a8a28';
        ctx.beginPath(); ctx.ellipse(0,-px(0.45),px(0.3),px(0.09),0,0,Math.PI*2); ctx.fill();
        // ☢ symbol (drawn with arcs)
        ctx.fillStyle='rgba(120,220,0,0.7)';
        ctx.beginPath(); ctx.arc(0,px(0.12),px(0.18),0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#283808';
        ctx.beginPath(); ctx.arc(0,px(0.12),px(0.07),0,Math.PI*2); ctx.fill();
        for (let i=0;i<3;i++) {
          const a=(i/3)*Math.PI*2-Math.PI/2;
          ctx.fillStyle='rgba(120,220,0,0.7)';
          ctx.beginPath(); ctx.moveTo(Math.cos(a)*px(0.09)+0,Math.sin(a)*px(0.09)+px(0.12));
          ctx.arc(0,px(0.12),px(0.15),a+0.3,a+Math.PI/1.6-0.3); ctx.closePath(); ctx.fill();
        }
        // Glow
        const ng = ctx.createRadialGradient(0,0,0,0,0,px(0.6));
        ng.addColorStop(0,'rgba(140,255,0,0.2)'); ng.addColorStop(1,'rgba(80,180,0,0)');
        ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(0,0,px(0.6),0,Math.PI*2); ctx.fill();
      } else if (p < 0.62) {
        // Mutant / glowing plant
        // Stem
        ctx.strokeStyle='#2a5800'; ctx.lineWidth=px(0.1); ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(0,px(0.55)); ctx.quadraticCurveTo(px(0.12),px(0.1),px(0.18),-px(0.2)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px(0.18),-px(0.2)); ctx.quadraticCurveTo(-px(0.28),-px(0.45),-px(0.4),-px(0.22)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px(0.18),-px(0.2)); ctx.quadraticCurveTo(px(0.45),-px(0.42),px(0.5),-px(0.15)); ctx.stroke();
        // Glowing pods
        [[-px(0.4),-px(0.25),px(0.22)],[px(0.5),-px(0.18),px(0.2)],[px(0.18),-px(0.22),px(0.18)]].forEach(([gx,gy,gr]) => {
          const pg = ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
          pg.addColorStop(0,'#aaff00'); pg.addColorStop(0.6,'#66cc00'); pg.addColorStop(1,'rgba(50,120,0,0)');
          ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle='#448800'; ctx.lineWidth=px(0.04);
          ctx.beginPath(); ctx.arc(gx,gy,gr*0.75,0,Math.PI*2); ctx.stroke();
        });
      } else {
        // Rock with radioactive glow
        drawRock(0,px(0.05),0.78,0.58,'#4a5830','#2a3818','rgba(0,0,0,0.35)');
        const ng2 = ctx.createRadialGradient(0,px(0.05),0,0,px(0.05),px(0.5));
        ng2.addColorStop(0,'rgba(120,220,0,0.25)'); ng2.addColorStop(1,'rgba(80,180,0,0)');
        ctx.fillStyle=ng2; ctx.beginPath(); ctx.arc(0,px(0.05),px(0.5),0,Math.PI*2); ctx.fill();
      }
      break;
    }

    // ── SHADOW ────────────────────────────────────────────────────────────────
    case 'shadow': {
      if (p < 0.33) {
        // Void/shadow eye on the ground
        const eg = ctx.createRadialGradient(0,0,0,0,0,px(0.55));
        eg.addColorStop(0,'#000010'); eg.addColorStop(0.4,'#150035'); eg.addColorStop(0.8,'#2a0055'); eg.addColorStop(1,'rgba(30,0,60,0)');
        ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(0,0,px(0.55),0,Math.PI*2); ctx.fill();
        // Iris
        ctx.fillStyle='#6600bb';
        ctx.beginPath(); ctx.ellipse(0,0,px(0.3),px(0.38),0,0,Math.PI*2); ctx.fill();
        // Pupil
        ctx.fillStyle='#000';
        ctx.beginPath(); ctx.ellipse(0,0,px(0.14),px(0.2),0,0,Math.PI*2); ctx.fill();
        // Highlights
        ctx.fillStyle='rgba(180,100,255,0.5)';
        ctx.beginPath(); ctx.ellipse(-px(0.08),-px(0.1),px(0.06),px(0.09),-0.3,0,Math.PI*2); ctx.fill();
        // Glow ring
        ctx.strokeStyle='rgba(140,0,255,0.4)'; ctx.lineWidth=px(0.08);
        ctx.beginPath(); ctx.arc(0,0,px(0.45),0,Math.PI*2); ctx.stroke();
      } else if (p < 0.62) {
        // Candles with shadow wisps
        [[-px(0.25),0],[px(0.25),-px(0.08)],[px(0.05),px(0.15)]].forEach(([cx,cy]) => {
          // Candle body
          ctx.fillStyle='#7a5a48';
          ctx.fillRect(cx-px(0.07),cy-px(0.08),px(0.14),px(0.4));
          // Wax drip
          ctx.fillStyle='#d0b8a0'; ctx.globalAlpha=0.6;
          ctx.beginPath(); ctx.arc(cx,cy-px(0.06),px(0.08),0,Math.PI*2); ctx.fill();
          ctx.globalAlpha=1;
          // Flame
          const fl = ctx.createRadialGradient(cx,cy-px(0.15),0,cx,cy-px(0.12),px(0.18));
          fl.addColorStop(0,'#cc00ff'); fl.addColorStop(0.4,'#6600cc'); fl.addColorStop(1,'rgba(60,0,120,0)');
          ctx.fillStyle=fl; ctx.beginPath(); ctx.arc(cx,cy-px(0.12),px(0.18),0,Math.PI*2); ctx.fill();
        });
      } else {
        // Shadow tentacle roots emerging from ground
        ctx.strokeStyle='#180035'; ctx.lineWidth=px(0.18); ctx.lineCap='round';
        for (let t=0;t<3;t++) {
          const ta=t/3*Math.PI*2;
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.bezierCurveTo(Math.cos(ta)*px(0.2),Math.sin(ta)*px(0.2),Math.cos(ta+0.8)*px(0.45),Math.sin(ta+0.8)*px(0.45),Math.cos(ta+0.5)*px(0.58),Math.sin(ta+0.5)*px(0.58)); ctx.stroke();
        }
        // Center vortex
        const vg2 = ctx.createRadialGradient(0,0,0,0,0,px(0.25));
        vg2.addColorStop(0,'#aa00ff'); vg2.addColorStop(0.5,'#440088'); vg2.addColorStop(1,'rgba(20,0,60,0)');
        ctx.fillStyle=vg2; ctx.beginPath(); ctx.arc(0,0,px(0.25),0,Math.PI*2); ctx.fill();
      }
      break;
    }

    // ── OMEGA ─────────────────────────────────────────────────────────────────
    case 'omega': {
      if (p < 0.33) {
        // Red rune obelisk (top-down)
        const og = ctx.createLinearGradient(-px(0.18),-px(0.65),px(0.18),px(0.65));
        og.addColorStop(0,'#3a000a'); og.addColorStop(0.5,'#5e0012'); og.addColorStop(1,'#2a0008');
        ctx.fillStyle=og;
        ctx.beginPath(); ctx.moveTo(-px(0.18),px(0.6)); ctx.lineTo(-px(0.15),-px(0.1)); ctx.lineTo(0,-px(0.65)); ctx.lineTo(px(0.15),-px(0.1)); ctx.lineTo(px(0.18),px(0.6)); ctx.closePath(); ctx.fill();
        // Rune lines
        ctx.strokeStyle='#ff0030'; ctx.lineWidth=px(0.04); ctx.globalAlpha=0.7; ctx.lineCap='round';
        [[[-px(0.1),px(0.1)],[px(0.1),px(0.1)]],[[-px(0.08),-px(0.1)],[px(0.08),-px(0.1)]],[[-px(0.05),-px(0.35)],[px(0.05),-px(0.35)]]].forEach(([[ax,ay],[bx,by]]) => {
          ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
        });
        ctx.globalAlpha=1;
        // Glow
        const rgl = ctx.createRadialGradient(0,0,0,0,0,px(0.5));
        rgl.addColorStop(0,'rgba(255,0,40,0.3)'); rgl.addColorStop(1,'rgba(200,0,20,0)');
        ctx.fillStyle=rgl; ctx.beginPath(); ctx.arc(0,0,px(0.5),0,Math.PI*2); ctx.fill();
      } else if (p < 0.66) {
        // Corrupted machinery / portal
        ctx.fillStyle='#150002'; ctx.strokeStyle='#cc0025'; ctx.lineWidth=px(0.06);
        ctx.beginPath(); ctx.roundRect(-px(0.45),-px(0.45),px(0.9),px(0.9),px(0.1)); ctx.fill(); ctx.stroke();
        // Inner ring
        ctx.strokeStyle='rgba(200,0,35,0.5)'; ctx.lineWidth=px(0.08);
        ctx.beginPath(); ctx.arc(0,0,px(0.28),0,Math.PI*2); ctx.stroke();
        // Center void glow
        const cvg = ctx.createRadialGradient(0,0,0,0,0,px(0.22));
        cvg.addColorStop(0,'rgba(255,0,40,0.8)'); cvg.addColorStop(0.5,'rgba(150,0,25,0.4)'); cvg.addColorStop(1,'rgba(80,0,15,0)');
        ctx.fillStyle=cvg; ctx.beginPath(); ctx.arc(0,0,px(0.22),0,Math.PI*2); ctx.fill();
        // Cog teeth
        for (let t=0;t<8;t++) {
          const ta=(t/8)*Math.PI*2;
          ctx.strokeStyle='rgba(200,0,35,0.6)'; ctx.lineWidth=px(0.05);
          ctx.beginPath(); ctx.moveTo(Math.cos(ta)*px(0.3),Math.sin(ta)*px(0.3)); ctx.lineTo(Math.cos(ta)*px(0.42),Math.sin(ta)*px(0.42)); ctx.stroke();
        }
      } else {
        // Apocalyptic cross monument
        const mg2 = ctx.createLinearGradient(-px(0.15),-px(0.7),px(0.15),px(0.7));
        mg2.addColorStop(0,'#300008'); mg2.addColorStop(0.5,'#4a000e'); mg2.addColorStop(1,'#200006');
        ctx.fillStyle=mg2;
        ctx.fillRect(-px(0.14),-px(0.68),px(0.28),px(1.1));
        ctx.fillRect(-px(0.44),-px(0.35),px(0.88),px(0.28));
        ctx.strokeStyle='rgba(200,0,40,0.3)'; ctx.lineWidth=px(0.04);
        ctx.strokeRect(-px(0.14),-px(0.68),px(0.28),px(1.1));
        ctx.strokeRect(-px(0.44),-px(0.35),px(0.88),px(0.28));
        const cg2 = ctx.createRadialGradient(0,-px(0.2),0,0,-px(0.2),px(0.5));
        cg2.addColorStop(0,'rgba(220,0,40,0.28)'); cg2.addColorStop(1,'rgba(180,0,20,0)');
        ctx.fillStyle=cg2; ctx.beginPath(); ctx.arc(0,-px(0.2),px(0.5),0,Math.PI*2); ctx.fill();
      }
      break;
    }

    default:
      drawRock(0, 0, 0.65, 0.5, '#666', '#444', 'rgba(0,0,0,0.3)');
  }

  ctx.restore();
}

// ── Simple seedable RNG ───────────────────────────────────
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 0xFFFFFFFF;
  };
}
