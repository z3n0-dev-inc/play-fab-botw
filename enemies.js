/* ═══════════════════════════════════════════════════════════════════
   enemies.js v16 — Clean, beautiful balloon rendering
   Performance: sprite cache per type+size, single drawImage per enemy
   ═══════════════════════════════════════════════════════════════════ */

function _lighten(hex, amt) {
  const n=parseInt(hex.replace('#',''),16);
  return '#'+[n>>16,(n>>8)&0xff,n&0xff].map(c=>Math.min(255,c+amt).toString(16).padStart(2,'0')).join('');
}
function _darken(hex, amt) {
  const n=parseInt(hex.replace('#',''),16);
  return '#'+[n>>16,(n>>8)&0xff,n&0xff].map(c=>Math.max(0,c-amt).toString(16).padStart(2,'0')).join('');
}

const ENEMY_TYPES = {
  red:     { name:'RED',     color:'#e74c3c', hp:1,      speed:75,   reward:1,    armor:0,    size:13, tier:1,  immunities:[], spawnsOnDeath:null },
  blue:    { name:'BLUE',    color:'#3498db', hp:1,      speed:100,  reward:1,    armor:0,    size:13, tier:2,  immunities:[], spawnsOnDeath:{type:'red',count:1} },
  green:   { name:'GREEN',   color:'#27ae60', hp:1,      speed:130,  reward:1,    armor:0,    size:13, tier:3,  immunities:[], spawnsOnDeath:{type:'blue',count:1} },
  yellow:  { name:'YELLOW',  color:'#f1c40f', hp:1,      speed:180,  reward:2,    armor:0,    size:13, tier:4,  immunities:[], spawnsOnDeath:{type:'green',count:1} },
  pink:    { name:'PINK',    color:'#e91e8c', hp:1,      speed:230,  reward:3,    armor:0,    size:13, tier:5,  immunities:[], spawnsOnDeath:{type:'yellow',count:1} },
  black:   { name:'BLACK',   color:'#2c2c2c', hp:1,      speed:70,   reward:7,    armor:0,    size:15, tier:6,  immunities:['explosive'], spawnsOnDeath:{type:'pink',count:2} },
  white:   { name:'WHITE',   color:'#dde8f0', hp:1,      speed:70,   reward:7,    armor:0,    size:15, tier:7,  immunities:['ice'],       spawnsOnDeath:{type:'pink',count:2} },
  purple:  { name:'PURPLE',  color:'#8e44ad', hp:1,      speed:72,   reward:7,    armor:0,    size:15, tier:8,  immunities:['bullet'],    spawnsOnDeath:{type:'black',count:1,extraType:'white',extraCount:1} },
  lead:    { name:'LEAD',    color:'#7f8c8d', hp:1,      speed:38,   reward:14,   armor:0.55, size:17, tier:9,  immunities:['bullet','ice','electric'], spawnsOnDeath:{type:'black',count:2} },
  zebra:   { name:'ZEBRA',   color:'#bdc3c7', hp:1,      speed:68,   reward:14,   armor:0,    size:17, tier:10, immunities:['explosive','ice'], spawnsOnDeath:{type:'black',count:1,extraType:'white',extraCount:1} },
  rainbow: { name:'RAINBOW', color:'#e74c3c', hp:1,      speed:85,   reward:26,   armor:0,    size:18, tier:11, immunities:['bullet','ice','explosive'], spawnsOnDeath:{type:'zebra',count:2} },
  ceramic: { name:'CERAMIC', color:'#c9a227', hp:80,     speed:52,   reward:35,   armor:0.35, size:20, tier:12, immunities:[], spawnsOnDeath:{type:'rainbow',count:2} },
  moab:    { name:'M.O.A.B', color:'#2980b9', hp:300,    speed:22,   reward:247,  armor:0.35, size:34, tier:13, immunities:[], isBlimp:true, spawnsOnDeath:{type:'ceramic',count:4} },
  bfb:     { name:'B.F.B',   color:'#e74c3c', hp:1100,   speed:13,   reward:982,  armor:0.45, size:46, tier:14, immunities:[], isBlimp:true, isBoss:true, spawnsOnDeath:{type:'moab',count:4} },
  zomg:    { name:'Z.O.M.G', color:'#7d3c98', hp:6000,   speed:6,    reward:3900, armor:0.55, size:60, tier:15, immunities:[], isBlimp:true, isBoss:true, spawnsOnDeath:{type:'bfb',count:4} },
  bad:     { name:'B.A.D',   color:'#922b21', hp:40000,  speed:4,    reward:16250,armor:0.65, size:74, tier:16, immunities:[], isBlimp:true, isBoss:true, spawnsOnDeath:{type:'zomg',count:2,extraType:'bfb',extraCount:3} },
  phantom: { name:'PHANTOM', color:'#1a0030', hp:80000,  speed:5.5,  reward:39000,armor:0.7,  size:80, tier:17, immunities:['bullet'], isBlimp:true, isBoss:true, spawnsOnDeath:{type:'bad',count:2,extraType:'zomg',extraCount:2} },
};

let _animTime = 0;
function updateAnimTime(dt) { _animTime += dt; }

// ── SPRITE CACHE ──────────────────────────────────────────────────────────────
const _spriteCache = new Map();
function _getSprite(type, S) {
  const key = type + ':' + S;
  if (_spriteCache.has(key)) return _spriteCache.get(key);
  const sprite = _renderSprite(type, S);
  _spriteCache.set(key, sprite);
  return sprite;
}

function _renderSprite(type, S) {
  const W = Math.ceil(S * 3.2);
  const H = Math.ceil(S * 4.0);
  const oc = document.createElement('canvas');
  oc.width = W; oc.height = H;
  const g = oc.getContext('2d');
  const cx = W / 2, cy = H * 0.42;
  const def = ENEMY_TYPES[type];
  if (!def) return oc;
  if (def.isBlimp) _drawBlimpSprite(g, cx, cy, S, type);
  else             _drawBalloonSprite(g, cx, cy, S, type);
  return oc;
}

// ── Per-type balloon configs ────────────────────────────────────────────────
const _BCFG = {
  red:     { body:'#e84040', hi:'#ff8870', sh:'#8b1010', knot:'#c42020' },
  blue:    { body:'#2d8fd6', hi:'#7ecef8', sh:'#1a4f80', knot:'#1a6aaa' },
  green:   { body:'#2db860', hi:'#60e890', sh:'#145a30', knot:'#1a8a40' },
  yellow:  { body:'#f5c80f', hi:'#fff070', sh:'#a07808', knot:'#c8a000' },
  pink:    { body:'#ef2090', hi:'#ff80cc', sh:'#880050', knot:'#cc0078',
             bands:[{a:.12,c:'rgba(255,180,220,0.45)'},{a:.46,c:'rgba(255,180,220,0.45)'},{a:.78,c:'rgba(255,180,220,0.45)'}] },
  black:   { body:'#1e1e1e', hi:'#555555', sh:'#000000', knot:'#333',
             bands:[{a:.18,c:'rgba(120,0,0,0.5)'},{a:.55,c:'rgba(120,0,0,0.5)'}] },
  white:   { body:'#e0ecf8', hi:'#ffffff', sh:'#9ab8d8', knot:'#aaccee',
             bands:[{a:.2,c:'rgba(140,180,255,0.35)'},{a:.6,c:'rgba(140,180,255,0.35)'}] },
  purple:  { body:'#7d30a0', hi:'#c070e8', sh:'#3d1060', knot:'#6020aa',
             bands:[{a:.15,c:'rgba(200,100,255,0.4)'},{a:.55,c:'rgba(200,100,255,0.4)'}] },
  lead:    { body:'#646e74', hi:'#a8b4bc', sh:'#282e32', knot:'#4a5458', cracks:true },
  zebra:   { body:'#b8b8b8', hi:'#eeeeee', sh:'#444444', knot:'#888', zebra:true },
  rainbow: { body:'#e74c3c', hi:'#ff9980', sh:'#880000', knot:'#aa2200', rainbow:true },
  ceramic: { body:'#d4a830', hi:'#ffe060', sh:'#7a5800', knot:'#9a7010', ceramic:true },
};

const _BLIMP_CFG = {
  moab:    { body:'#2060a8', hi:'#4090d8', sh:'#0a2840', label:'M.O.A.B', glow:'#3498db' },
  bfb:     { body:'#b82020', hi:'#e06060', sh:'#4a0808', label:'B.F.B',   glow:'#e74c3c' },
  zomg:    { body:'#5a2070', hi:'#9040b8', sh:'#200830', label:'Z.O.M.G', glow:'#9b59b6' },
  bad:     { body:'#6a1810', hi:'#c03020', sh:'#1c0808', label:'B.A.D',   glow:'#e74c3c' },
  phantom: { body:'#0e0018', hi:'#6000c8', sh:'#060008', label:'PHANTOM', glow:'#8800ff' },
};

// Balloon outline path — classic teardrop
function _bPath(g, x, y, S) {
  g.beginPath();
  g.moveTo(x, y - S*0.82);
  g.bezierCurveTo(x+S*0.74, y-S*0.82, x+S*0.80, y+S*0.05, x+S*0.62, y+S*0.44);
  g.bezierCurveTo(x+S*0.44, y+S*0.74, x-S*0.44, y+S*0.74, x-S*0.62, y+S*0.44);
  g.bezierCurveTo(x-S*0.80, y+S*0.05, x-S*0.74, y-S*0.82, x, y-S*0.82);
  g.closePath();
}

function _drawBalloonSprite(g, x, y, S, type) {
  const c = _BCFG[type] || { body:'#888', hi:'#bbb', sh:'#333', knot:'#555' };

  // Drop shadow
  g.globalAlpha = 0.22;
  g.fillStyle = '#000';
  g.beginPath(); g.ellipse(x+S*0.1, y+S*0.88, S*0.44, S*0.1, 0, 0, Math.PI*2); g.fill();
  g.globalAlpha = 1;

  // Strings (2 thin lines)
  g.strokeStyle = 'rgba(80,50,15,0.65)';
  g.lineWidth = Math.max(0.5, S*0.022);
  g.lineCap = 'round';
  for (const [ox,oy] of [[-0.16,0.62],[0.16,0.62]]) {
    g.beginPath(); g.moveTo(x+ox*S, y+oy*S); g.lineTo(x+ox*S*0.25, y+S*0.90); g.stroke();
  }

  // Body fill with radial gradient
  g.save();
  _bPath(g, x, y, S);
  const grad = g.createRadialGradient(x-S*0.22, y-S*0.28, S*0.02, x+S*0.08, y+S*0.10, S*0.95);
  grad.addColorStop(0, c.hi);
  grad.addColorStop(0.38, c.body);
  grad.addColorStop(1, c.sh);
  g.fillStyle = grad; g.fill();
  g.clip();

  // Pattern bands (stripes / zebra / rainbow / cracks)
  if (c.bands) {
    g.globalAlpha = 1;
    c.bands.forEach(({a, c: col}) => {
      g.fillStyle = col;
      g.fillRect(x + (a - 0.5) * S * 2, y - S*0.95, S*0.28, S*1.8);
    });
  }
  if (c.zebra) {
    for (let i = -4; i <= 4; i++) {
      g.fillStyle = i%2===0 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.35)';
      g.fillRect(x + i*S*0.25 - S*0.125, y-S*0.95, S*0.25, S*1.8);
    }
  }
  if (c.rainbow) {
    ['#e74c3c','#e67e22','#f1c40f','#27ae60','#3498db','#8e44ad'].forEach((rc,i) => {
      g.fillStyle = rc; g.globalAlpha = 0.45;
      g.fillRect(x - S*0.93 + i*S*0.31, y-S*0.95, S*0.31, S*1.8);
    }); g.globalAlpha = 1;
  }
  if (c.ceramic) {
    g.strokeStyle = 'rgba(40,20,0,0.6)'; g.lineWidth = S*0.03;
    g.beginPath(); g.moveTo(x-S*0.12,y-S*0.55); g.lineTo(x+S*0.08,y-S*0.15); g.lineTo(x-S*0.02,y+S*0.18); g.stroke();
    g.beginPath(); g.moveTo(x+S*0.24,y-S*0.28); g.lineTo(x+S*0.12,y+S*0.12); g.stroke();
  }
  if (c.cracks) {
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = S*0.025;
    g.beginPath(); g.moveTo(x-S*0.08,y-S*0.40); g.lineTo(x+S*0.06,y-S*0.05); g.lineTo(x-S*0.04,y+S*0.20); g.stroke();
  }
  g.restore();

  // Crisp outline
  g.strokeStyle = _darken(c.body, 60);
  g.lineWidth = Math.max(0.8, S * 0.044);
  _bPath(g, x, y, S); g.stroke();

  // Specular highlight (top-left gloss oval)
  const spec = g.createRadialGradient(x-S*0.24, y-S*0.36, 0, x-S*0.1, y-S*0.14, S*0.46);
  spec.addColorStop(0, 'rgba(255,255,255,0.55)');
  spec.addColorStop(0.5,'rgba(255,255,255,0.18)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  g.save(); _bPath(g, x, y, S); g.clip();
  g.fillStyle = spec;
  g.beginPath(); g.ellipse(x-S*0.18, y-S*0.28, S*0.38, S*0.30, -0.3, 0, Math.PI*2); g.fill();
  g.restore();

  // Knot at bottom
  g.fillStyle = c.knot;
  g.beginPath(); g.ellipse(x, y+S*0.78, S*0.09, S*0.08, 0, 0, Math.PI*2); g.fill();
  g.strokeStyle = _darken(c.knot, 40); g.lineWidth = S*0.02;
  g.beginPath(); g.ellipse(x, y+S*0.78, S*0.09, S*0.08, 0, 0, Math.PI*2); g.stroke();

  // Gondola basket
  const gW=S*0.32, gH=S*0.19, gX=x-gW/2, gY=y+S*0.90;
  const bg = g.createLinearGradient(gX,gY,gX,gY+gH);
  bg.addColorStop(0,'#c8a060'); bg.addColorStop(1,'#7a5028');
  g.fillStyle=bg; g.beginPath(); g.roundRect(gX,gY,gW,gH,S*0.04); g.fill();
  g.strokeStyle='#5a3a18'; g.lineWidth=S*0.032;
  g.beginPath(); g.roundRect(gX,gY,gW,gH,S*0.04); g.stroke();
  // Basket weave lines
  g.strokeStyle='rgba(0,0,0,0.25)'; g.lineWidth=S*0.018;
  g.beginPath(); g.moveTo(gX,gY+gH*0.5); g.lineTo(gX+gW,gY+gH*0.5); g.stroke();
  g.beginPath(); g.moveTo(gX+gW*0.5,gY); g.lineTo(gX+gW*0.5,gY+gH); g.stroke();
}

function _drawBlimpSprite(g, x, y, S, type) {
  const c = _BLIMP_CFG[type] || _BLIMP_CFG.moab;

  // Outer glow
  const glowG = g.createRadialGradient(x,y,S*0.3,x,y,S*1.15);
  glowG.addColorStop(0, c.glow+'44'); glowG.addColorStop(1, c.glow+'00');
  g.fillStyle=glowG; g.beginPath(); g.arc(x,y,S*1.15,0,Math.PI*2); g.fill();

  // Drop shadow
  g.globalAlpha=0.28; g.fillStyle='#000';
  g.beginPath(); g.ellipse(x+S*0.1,y+S*0.72,S*0.88,S*0.14,0,0,Math.PI*2); g.fill();
  g.globalAlpha=1;

  // Tail fins (behind body)
  const finC = _darken(c.body,25);
  g.fillStyle=finC;
  // Top fin
  g.beginPath(); g.moveTo(x-S*0.7,y); g.lineTo(x-S*0.92,y-S*0.44); g.lineTo(x-S*0.58,y-S*0.02); g.closePath(); g.fill();
  // Bottom fin
  g.beginPath(); g.moveTo(x-S*0.7,y); g.lineTo(x-S*0.92,y+S*0.44); g.lineTo(x-S*0.58,y+S*0.02); g.closePath(); g.fill();
  // Right top fin
  g.beginPath(); g.moveTo(x+S*0.7,y); g.lineTo(x+S*0.88,y-S*0.32); g.lineTo(x+S*0.68,y-S*0.02); g.closePath(); g.fill();
  // Right bottom fin
  g.beginPath(); g.moveTo(x+S*0.7,y); g.lineTo(x+S*0.88,y+S*0.32); g.lineTo(x+S*0.68,y+S*0.02); g.closePath(); g.fill();

  // Hull
  g.save();
  g.beginPath(); g.ellipse(x,y,S*0.98,S*0.48,0,0,Math.PI*2); g.closePath();
  const hullG = g.createLinearGradient(x,y-S*0.48,x,y+S*0.48);
  hullG.addColorStop(0, _lighten(c.body,40));
  hullG.addColorStop(0.3, c.body);
  hullG.addColorStop(0.8, c.sh);
  hullG.addColorStop(1, _darken(c.sh,20));
  g.fillStyle=hullG; g.fill(); g.clip();

  // Panel rivets / seam lines
  g.strokeStyle='rgba(0,0,0,0.18)'; g.lineWidth=S*0.025;
  for (let i=-2;i<=2;i++) {
    g.beginPath(); g.moveTo(x+i*S*0.38,y-S*0.5); g.lineTo(x+i*S*0.38,y+S*0.5); g.stroke();
  }
  // Center accent band
  g.fillStyle=_darken(c.body,20); g.globalAlpha=0.5;
  g.fillRect(x-S,y-S*0.12,S*2,S*0.24); g.globalAlpha=1;
  g.restore();

  // Hull outline
  g.strokeStyle=_darken(c.body,70); g.lineWidth=S*0.055;
  g.beginPath(); g.ellipse(x,y,S*0.98,S*0.48,0,0,Math.PI*2); g.stroke();

  // Specular sheen
  const sp = g.createLinearGradient(x-S*0.5,y-S*0.48,x+S*0.5,y-S*0.1);
  sp.addColorStop(0,'rgba(255,255,255,0.40)'); sp.addColorStop(1,'rgba(255,255,255,0)');
  g.save(); g.beginPath(); g.ellipse(x,y,S*0.98,S*0.48,0,0,Math.PI*2); g.clip();
  g.fillStyle=sp; g.beginPath(); g.ellipse(x,y-S*0.15,S*0.65,S*0.22,0,0,Math.PI*2); g.fill();
  g.restore();

  // Engine nacelles
  [-S*0.44, S*0.44].forEach(ex => {
    const ey = y+S*0.54;
    g.fillStyle=_darken(c.body,30);
    g.beginPath(); g.roundRect(x+ex-S*0.16,ey,S*0.32,S*0.24,S*0.06); g.fill();
    g.strokeStyle='rgba(0,0,0,0.5)'; g.lineWidth=S*0.03;
    g.beginPath(); g.roundRect(x+ex-S*0.16,ey,S*0.32,S*0.24,S*0.06); g.stroke();
    // Engine glow
    g.fillStyle=c.glow+'88';
    g.beginPath(); g.ellipse(x+ex+S*0.16,ey+S*0.12,S*0.06,S*0.1,0,0,Math.PI*2); g.fill();
  });

  // Name label
  g.font=`bold ${Math.max(8,Math.floor(S*0.26))}px 'Barlow Condensed',Arial,sans-serif`;
  g.textAlign='center'; g.textBaseline='middle';
  g.strokeStyle='rgba(0,0,0,0.95)'; g.lineWidth=S*0.10;
  g.strokeText(c.label,x,y); g.fillStyle='#fff'; g.fillText(c.label,x,y);
}

function _prewarmSpriteCache() {
  for (const [type, def] of Object.entries(ENEMY_TYPES)) {
    _getSprite(type, Math.round(def.size * 0.9));
  }
}

// ── WAVE GENERATOR ─────────────────────────────────────────────────────────
function generateWaves(mapId, totalWaves, waveModifier, isInfinite) {
  const waves = [];
  const maxW = isInfinite ? 9999 : totalWaves;
  for (let w=1; w<=maxW; w++) {
    const wave = { number:w, enemies:[], delay:0.5 };
    const isMoab=w%5===0, isBfb=w%10===0, isZomg=w%20===0, isBad=w%40===0, isPhantom=w%80===0;
    if (isPhantom) {
      wave.isBossWave=true;
      wave.enemies.push(
        {type:'phantom',count:1,interval:0},
        {type:'bad',count:1+Math.floor(w/80),interval:2.0},
        {type:'zomg',count:2+Math.floor(w/40),interval:1.5},
        {type:'bfb',count:2+Math.floor(w/30),interval:1.0},
        {type:'ceramic',count:8+Math.floor(w/8),interval:0.3}
      );
    } else if (isBad) {
      wave.isBossWave=true;
      wave.enemies.push(
        {type:'bad',count:1+Math.floor(w/60),interval:0},
        {type:'zomg',count:2+Math.floor(w/40),interval:1.5},
        {type:'bfb',count:Math.max(2,Math.floor(w/25)),interval:1.0},
        {type:'ceramic',count:6+Math.floor(w/8),interval:0.3}
      );
    } else if (isZomg) {
      wave.isBossWave=true;
      wave.enemies.push(
        {type:'zomg',count:1+Math.floor(w/30),interval:0},
        {type:'bfb',count:2+Math.floor(w/20),interval:1.2},
        {type:'moab',count:Math.max(2,Math.floor(w/12)),interval:0.7},
        {type:'ceramic',count:5+Math.floor(w/8),interval:0.28}
      );
    } else if (isBfb) {
      wave.isBossWave=true;
      wave.enemies.push(
        {type:'bfb',count:1+Math.floor(w/20),interval:0.8},
        {type:'moab',count:2+Math.floor(w/10),interval:0.6},
        {type:'rainbow',count:5+Math.floor(w/6),interval:0.25},
        {type:'ceramic',count:4+Math.floor(w/8),interval:0.3}
      );
    } else if (isMoab) {
      wave.isBossWave=true;
      wave.enemies.push(
        {type:'moab',count:1+Math.floor(w/12),interval:0.7},
        {type:'ceramic',count:3+Math.floor(w/6),interval:0.28},
        {type:'rainbow',count:3+Math.floor(w/4),interval:0.22}
      );
    } else {
      const avail = _availableTypes(w);
      // Scale count more aggressively for satisfying waves
      const totalCount = Math.floor((8 + w*2.2) * (waveModifier||1));
      const groups = Math.min(5, 1+Math.floor(w/3));
      for (let g2=0;g2<groups;g2++) {
        const eligibles = avail.slice(Math.max(0, avail.length - 5));
        const type = eligibles[Math.floor(Math.random()*eligibles.length)];
        const interval = Math.max(0.18, 0.55 - w*0.012 - Math.random()*0.08);
        wave.enemies.push({type, count:Math.ceil(totalCount/groups), interval});
      }
      // Every 3rd regular wave: add a tougher surprise group
      if (w % 3 === 0 && w >= 4) {
        const surpriseTypes = avail.filter(t => ['lead','ceramic','zebra','purple'].includes(t));
        if (surpriseTypes.length > 0) {
          const sType = surpriseTypes[Math.floor(Math.random()*surpriseTypes.length)];
          wave.enemies.push({type:sType, count:Math.ceil(totalCount*0.3), interval:0.4});
        }
      }
    }
    waves.push(wave);
    if (!isInfinite && w >= totalWaves) break;
  }
  return waves;
}

function _availableTypes(wave) {
  return [
    {type:'red',min:1},{type:'blue',min:1},{type:'green',min:2},{type:'yellow',min:3},
    {type:'pink',min:4},{type:'black',min:5},{type:'white',min:5},{type:'purple',min:6},
    {type:'lead',min:7},{type:'zebra',min:9},{type:'rainbow',min:10},{type:'ceramic',min:12},
  ].filter(e=>e.min<=wave).map(e=>e.type);
}

// ── ENEMY CLASS ───────────────────────────────────────────────────────────────
class Enemy {
  constructor(type, path, tileSize, waveNum, waveModifier) {
    const def = ENEMY_TYPES[type] || ENEMY_TYPES.red;
    this.type=type; this.def=def; this.name=def.name; this.color=def.color;
    this.size = def.size * 0.9;
    this.isBoss = !!(def.isBoss || def.isBlimp);
    this.immunities = def.immunities || [];

    const wm = waveModifier || 1;
    // HP scales exponentially but caps sanely for blimps
    const hpScale = def.isBlimp
      ? Math.pow(1.28, Math.max(0, waveNum - 1)) * wm
      : Math.pow(1.42, Math.max(0, waveNum - 1)) * wm;
    this.maxHp = def.hp === 1 ? 1 : Math.floor(def.hp * hpScale * 2.5);
    this.hp = this.maxHp;

    // Speed scaling: gentle logarithmic curve — blimps cap out so they're still beatable
    const speedWave = def.isBlimp
      ? 1 + Math.log1p(waveNum) * 0.12           // blimps: slow ramp
      : 1 + waveNum * 0.025 + Math.pow(waveNum * 0.008, 1.4); // balloons: faster ramp
    this.speed = (def.speed || 65) * (0.92 + Math.random() * 0.16) * speedWave;
    // Hard cap: blimps can't go faster than 3× base, balloons 4× base
    const speedCap = def.isBlimp ? def.speed * 3 : def.speed * 4;
    this.speed = Math.min(this.speed, speedCap);
    this.baseSpeed = this.speed;

    this.reward = Math.floor((def.reward || 1) * Math.sqrt(hpScale));
    this.armor  = def.armor || 0;

    this.path=path; this.tileSize=tileSize;
    this.pathIndex=0;
    this.x=path[0][0]*tileSize+tileSize/2;
    this.y=path[0][1]*tileSize+tileSize/2;
    this.targetX=this.x; this.targetY=this.y;

    this.dead=false; this.reachedEnd=false;
    this.slowTimer=0; this.burnTimer=0; this.burnDmg=0; this.burnAccum=0;
    this.flashTimer=0; this.angle=0;
    this.spawnAlpha=0; this.spawnTime=0.15;
    this.pathProgress=0;
    this.waveNum=waveNum; this.waveModifier=waveModifier;

    _getSprite(type, Math.round(this.size));
    this._updateTarget();
  }

  _updateTarget() {
    if (this.pathIndex+1 < this.path.length) {
      this.targetX=this.path[this.pathIndex+1][0]*this.tileSize+this.tileSize/2;
      this.targetY=this.path[this.pathIndex+1][1]*this.tileSize+this.tileSize/2;
    }
  }

  takeDamage(amount, bullet) {
    if (this.dead) return 0;

    // Immunity check — respect bullet damageType
    const dtype = bullet?.damageType;
    if (dtype && this.immunities.includes(dtype)) return 0;

    let dmg = amount;
    // Armor reduction only if bullet doesn't pierce armor
    if (this.armor > 0 && !bullet?.armorPierce) dmg *= (1 - this.armor);
    dmg = Math.max(0, dmg);

    this.hp -= dmg;
    this.flashTimer = 0.08;

    // Slow — respect ice immunity
    if (bullet?.slow > 0 && !this.immunities.includes('ice')) {
      this.speed = this.baseSpeed * (1 - bullet.slow);
      this.slowTimer = bullet.slowDuration || 2;
    }

    // Burn — respect fire/explosive immunity, apply armor to ticks too
    if (bullet?.burn > 0 && !this.immunities.includes('fire')) {
      this.burnDmg   = Math.max(this.burnDmg, bullet.burn); // take stronger burn
      this.burnTimer = 4.0; // refresh duration
      this.burnAccum = 0;   // reset tick so new burn starts clean
      this.burnArmor = this.armor;
    }

    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    return dmg;
  }

  getSpawnChildren(waveNum, waveModifier) {
    const def = this.def;
    if (!def.spawnsOnDeath) return [];
    // Blimps that leak STILL release their inner balloons (BTD6 behaviour)
    // Regular balloons that leak do NOT (they already counted as lives lost)
    if (this.reachedEnd && !def.isBlimp) return [];
    const children = [];
    const s = def.spawnsOnDeath;

    const _make = (type, offsetX=0, offsetY=0) => {
      const c = new Enemy(type, this.path, this.tileSize, waveNum || this.waveNum, waveModifier || this.waveModifier);
      c.pathIndex    = this.pathIndex;
      c.pathProgress = this.pathProgress;
      c.x = this.x + offsetX;
      c.y = this.y + offsetY;
      c.targetX = this.targetX;
      c.targetY = this.targetY;
      c.spawnAlpha = 0.5;
      c._updateTarget();
      return c;
    };

    for (let i = 0; i < (s.count || 1); i++) {
      const jitter = i > 0 ? (Math.random()-0.5)*this.tileSize*0.4 : 0;
      children.push(_make(s.type, jitter, jitter));
    }
    if (s.extraType) {
      for (let i = 0; i < (s.extraCount || 1); i++) {
        const jx = (Math.random()-0.5)*this.tileSize*0.5;
        const jy = (Math.random()-0.5)*this.tileSize*0.5;
        children.push(_make(s.extraType, jx, jy));
      }
    }
    return children;
  }

  update(dt) {
    this.spawnAlpha = Math.min(1, this.spawnAlpha + dt / this.spawnTime);
    this.flashTimer = Math.max(0, this.flashTimer - dt);

    // Slow decay
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.speed = this.baseSpeed;
    }

    // Burn damage ticks — respects armor, properly marks dead
    if (this.burnTimer > 0) {
      this.burnAccum += dt;
      this.burnTimer  -= dt;
      if (this.burnAccum >= 0.33) {
        let burnDmg = this.burnDmg * 0.33;
        if ((this.burnArmor || 0) > 0) burnDmg *= (1 - this.burnArmor);
        this.hp -= burnDmg;
        this.burnAccum = 0;
        this.flashTimer = 0.06;
        if (this.hp <= 0) {
          this.hp = 0;
          this.dead = true;
          return; // game loop will handle children + reward
        }
      }
      if (this.burnTimer <= 0) this.burnAccum = 0;
    }

    // Movement
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.angle = Math.atan2(dy, dx);

    // pathProgress: how far along the full path (used for targeting priority)
    // Each tile segment contributes 1.0; interpolate within the current segment
    const segLen = this.tileSize; // tiles are square so segment length ≈ tileSize
    const segProgress = segLen > 0 ? Math.max(0, 1 - dist / segLen) : 0;
    this.pathProgress = this.pathIndex + segProgress;

    const move = this.speed * dt;
    if (dist <= move + 0.5) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.pathIndex++;
      if (this.pathIndex >= this.path.length - 1) {
        this.reachedEnd = true;
        this.dead = true;
        return;
      }
      this._updateTarget();
    } else {
      this.x += (dx / dist) * move;
      this.y += (dy / dist) * move;
    }
  }

  draw(ctx) {
    if (this.dead) return;
    const S = Math.round(this.size);
    const bob = this.def.isBlimp
      ? Math.sin(_animTime*1.0 + this.x*0.01) * S*0.04
      : Math.sin(_animTime*1.4 + this.x*0.012) * S*0.055;
    const drawY = this.y + bob;

    const sprite = _getSprite(this.type, S);
    const sw=sprite.width, sh=sprite.height;

    ctx.globalAlpha = this.spawnAlpha;
    ctx.drawImage(sprite, this.x-sw/2, drawY-sh*0.42);

    // Hit flash — clean white overlay
    if (this.flashTimer > 0) {
      ctx.globalAlpha = this.spawnAlpha * Math.min(1, this.flashTimer * 16);
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(this.x, drawY, S*0.7, 0, Math.PI*2); ctx.fill();
    }

    ctx.globalAlpha = this.spawnAlpha;

    // Boss glow ring (pulsing)
    if (this.isBoss) {
      const ga = 0.2 + Math.sin(_animTime*2.2)*0.1;
      ctx.globalAlpha = this.spawnAlpha * ga;
      ctx.strokeStyle = _BLIMP_CFG[this.type]?.glow || '#ffd700';
      ctx.lineWidth = S*0.06;
      ctx.beginPath(); ctx.arc(this.x, drawY, S*1.08, 0, Math.PI*2); ctx.stroke();
    }

    ctx.globalAlpha = this.spawnAlpha;

    // HP bar — always show for blimps, show when damaged for others
    if (this.maxHp > 1 && (this.isBoss || this.hp < this.maxHp)) {
      const bw=S*(this.isBoss?2.8:2.4), bh=this.isBoss?7:4;
      const bx=this.x-bw/2, by=drawY-S*(this.isBoss?1.35:1.25);
      const ratio=Math.max(0,this.hp/this.maxHp);
      ctx.fillStyle='rgba(0,0,0,0.75)';
      ctx.beginPath(); ctx.roundRect(bx-1,by-1,bw+2,bh+2,3); ctx.fill();
      // HP fill with gradient
      const hpGrad = ctx.createLinearGradient(bx, by, bx+bw*ratio, by);
      if (ratio > 0.55) { hpGrad.addColorStop(0,'#16a34a'); hpGrad.addColorStop(1,'#22c55e'); }
      else if (ratio > 0.28) { hpGrad.addColorStop(0,'#d97706'); hpGrad.addColorStop(1,'#fbbf24'); }
      else { hpGrad.addColorStop(0,'#b91c1c'); hpGrad.addColorStop(1,'#ef4444'); }
      ctx.fillStyle = hpGrad;
      ctx.beginPath(); ctx.roundRect(bx, by, Math.max(2, bw*ratio), bh, 2); ctx.fill();
      // Armor indicator (faint ticks if armored)
      if (this.armor > 0) {
        ctx.fillStyle='rgba(255,255,255,0.08)';
        ctx.fillRect(bx, by, bw*this.armor, bh);
      }
    }

    // Slow frost ring
    if (this.slowTimer > 0) {
      const frostAlpha = Math.min(0.6, this.slowTimer * 0.3);
      ctx.globalAlpha = this.spawnAlpha * frostAlpha;
      // Ice crystal ring
      ctx.strokeStyle='#7dd3fc'; ctx.lineWidth=S*0.10;
      ctx.setLineDash([S*0.2, S*0.15]);
      ctx.beginPath(); ctx.arc(this.x, drawY, S+S*0.2, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      // Inner glow
      ctx.fillStyle='rgba(147,197,253,0.12)';
      ctx.beginPath(); ctx.arc(this.x, drawY, S*1.1, 0, Math.PI*2); ctx.fill();
    }

    // Burn sparks — bigger, more visible fire
    if (this.burnTimer > 0) {
      const t3=_animTime*8;
      ctx.globalAlpha=this.spawnAlpha * 0.9;
      // Fire glow
      ctx.fillStyle='rgba(255,80,0,0.18)';
      ctx.beginPath(); ctx.arc(this.x, drawY, S*1.1, 0, Math.PI*2); ctx.fill();
      // Flame particles
      for(let i=0;i<6;i++){
        const a=t3+i*1.047, r=S*(0.65+Math.sin(t3*1.5+i)*0.22);
        const sz = S*(0.07+Math.sin(t3+i*2)*0.05);
        ctx.fillStyle=i%3===0?'#ff2200':i%3===1?'#ff8800':'#ffdd00';
        ctx.beginPath(); ctx.arc(this.x+Math.cos(a)*r, drawY+Math.sin(a)*r-S*0.1, Math.max(1,sz),0,Math.PI*2); ctx.fill();
      }
    }

    ctx.globalAlpha=1;
  }
}
