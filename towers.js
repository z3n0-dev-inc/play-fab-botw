/* ═══════════════════════════════════════════════
   towers.js — Tower definitions & classes
   
   ── HOW TO TUNE DAMAGE ───────────────────────────
   Edit TOWER_DAMAGE_CONFIG below.
   Changes apply instantly to every tower in the game.
   Format: id: { damage, fireRate, range }
   ─────────────────────────────────────────────── */

const TOWER_DAMAGE_CONFIG = {
  //              damage  fireRate  range
  gunner:       { damage:  20,  fireRate: 1.4,  range: 125 },
  archer:       { damage:  14,  fireRate: 2.0,  range: 165 },
  sniper:       { damage: 100,  fireRate: 0.42, range: 275 },
  rocketeer:    { damage:  75,  fireRate: 0.6,  range: 135 },
  freezer:      { damage:  12,  fireRate: 0.9,  range: 115 },
  flamer:       { damage:  10,  fireRate: 9.0,  range:  95 },
  tesla:        { damage:  50,  fireRate: 1.0,  range: 145 },
  laser:        { damage:  15,  fireRate: 16,   range: 185 },
  mortar:       { damage: 115,  fireRate: 0.32, range: 210 },
  venom:        { damage:  25,  fireRate: 1.5,  range: 145 },
  omega:        { damage: 500,  fireRate: 0.28, range: 210 },
  phantom:      { damage: 300,  fireRate: 0.80, range: 315 },
  temporal:     { damage:  35,  fireRate: 0.18, range: 999 },
  reaper:       { damage: 200,  fireRate: 0.90, range: 210 },
  shadow_commander: { damage: 9999,  fireRate: 3.0, range: 999 },
  neon_warden:      { damage: 9999,  fireRate: 8.0, range: 999 },
  void_hunter:      { damage: 99999, fireRate: 4.0, range: 999 },
  // NEW TOWERS v13
  crossbow:     { damage:  28,  fireRate: 2.4,  range: 180 },
  cryomancer:   { damage:  42,  fireRate: 0.65, range: 140 },
  buzzsaw:      { damage:  22,  fireRate: 7.0,  range:  90 },
  beacon:       { damage:   6,  fireRate: 0.5,  range: 165 },
  pyre:         { damage:  15,  fireRate: 4.5,  range: 105 },
  railgun:      { damage: 380,  fireRate: 0.25, range: 320 },
  necromancer:  { damage:  55,  fireRate: 1.2,  range: 160 },
  stormcaller:  { damage:  65,  fireRate: 0.95, range: 190 },
  // NEW TOWERS v14
  spiker:       { damage:  38,  fireRate: 1.8,  range: 135 },
  chrono:       { damage:   0,  fireRate: 0.14, range: 175 },
  magnet:       { damage:  30,  fireRate: 2.2,  range: 120 },
  artillery:    { damage: 240,  fireRate: 0.20, range: 250 },
  infector:     { damage:  10,  fireRate: 2.0,  range: 145 },
  golem:        { damage:  85,  fireRate: 0.60, range: 110 },
  drone_bay:     { damage:  18,  fireRate: 2.2,  range: 155 },
  apache:        { damage:  90,  fireRate: 0.52, range: 175 },
  stormwing:     { damage:  35,  fireRate: 1.8,  range: 195 },
  stratobomber:  { damage: 180,  fireRate: 0.27, range: 225 },
  spectre:       { damage: 290,  fireRate: 0.85, range: 345 },
  sky_fortress:  { damage: 800,  fireRate: 0.22, range: 265 },
  // OWNER TOWER v26
  celestial_overlord: { damage: 999999, fireRate: 12.0, range: 9999 },
  // NEW TOWERS v25
  cannon:        { damage: 160,  fireRate: 0.50, range: 155 },
  watchtower:    { damage:  22,  fireRate: 3.5,  range: 220 },
  gauss:         { damage: 440,  fireRate: 0.22, range: 295 },
  pyromancer:    { damage:  18,  fireRate: 5.5,  range: 110 },
  shockwave:     { damage:  95,  fireRate: 0.75, range: 130 },
};
const TOWER_DEFS = (() => {
  const C = TOWER_DAMAGE_CONFIG;
  return [

  // ── BASIC ───────────────────────────────────────────────────────────────
  {
    id:'gunner', name:'GUNNER', icon:'🔫', rarity:'basic',
    cost:138, shopCost:0, unlocked:true,
    desc:'Rapid automatic fire. Good all-rounder.',
    color:'#3498db',
    range:C.gunner.range, fireRate:C.gunner.fireRate, damage:C.gunner.damage,
    bulletSpeed:300, bulletColor:'#f1c40f', bulletSize:4,
    splash:0, slow:0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Rapid Fire',    cost:148,  dmgBonus:8,   rateBonus:0.5,  rangeBonus:0  },
      { name:'Heavy Rounds',  cost:240, dmgBonus:15,  rateBonus:0.4,  rangeBonus:15 },
      { name:'Minigun',       cost:407, dmgBonus:25,  rateBonus:1.8,  rangeBonus:20 },
      { name:'DEATH MACHINE', cost:740, dmgBonus:60,  rateBonus:3.0,  rangeBonus:30, armorPierce:true },
    ],
  },
  {
    id:'archer', name:'ARCHER', icon:'🏹', rarity:'basic',
    cost:111, shopCost:0, unlocked:true,
    desc:'Long range. Great for chokepoints.',
    color:'#27ae60',
    range:C.archer.range, fireRate:C.archer.fireRate, damage:C.archer.damage,
    bulletSpeed:340, bulletColor:'#2ecc71', bulletSize:3,
    splash:0, slow:0, pierce:1, maxUpgrade:4,
    upgrades:[
      { name:'Longbow',        cost:129,  dmgBonus:8,   rateBonus:0.6,  rangeBonus:30  },
      { name:'Poison Arrows',  cost:222, dmgBonus:12,  rateBonus:0.3,  rangeBonus:20,  burnBonus:3 },
      { name:'Storm Arrows',   cost:370, dmgBonus:18,  rateBonus:1.2,  rangeBonus:35,  pierce:2 },
      { name:'ARROW STORM',    cost:703, dmgBonus:35,  rateBonus:2.0,  rangeBonus:40,  pierce:4, burnBonus:5 },
    ],
  },
  {
    id:'sniper', name:'SNIPER', icon:'🎯', rarity:'basic',
    cost:222, shopCost:462, unlocked:false,
    desc:'Extreme range, high damage, slow fire.',
    color:'#8e44ad',
    range:C.sniper.range, fireRate:C.sniper.fireRate, damage:C.sniper.damage,
    bulletSpeed:650, bulletColor:'#e8daef', bulletSize:3,
    splash:0, slow:0, pierce:2, maxUpgrade:4,
    upgrades:[
      { name:'Scope+',         cost:203, dmgBonus:40,  rateBonus:0.1,  rangeBonus:40  },
      { name:'Armour Pierce',  cost:370, dmgBonus:60,  rateBonus:0.1,  rangeBonus:25,  armorPierce:true },
      { name:'Rail Gun',       cost:647, dmgBonus:150, rateBonus:0.2,  rangeBonus:50,  pierce:5 },
      { name:'RAILCANNON',     cost:1295, dmgBonus:350, rateBonus:0.35, rangeBonus:60,  pierce:10, armorPierce:true },
    ],
  },

  // ── ADVANCED ────────────────────────────────────────────────────────────
  {
    id:'rocketeer', name:'ROCKETEER', icon:'🚀', rarity:'advanced',
    cost:370, shopCost:925, unlocked:false,
    desc:'Explosive splash. Demolishes groups.',
    color:'#e67e22',
    range:C.rocketeer.range, fireRate:C.rocketeer.fireRate, damage:C.rocketeer.damage,
    bulletSpeed:210, bulletColor:'#e74c3c', bulletSize:7,
    splash:65, slow:0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Big Rockets',      cost:333, dmgBonus:35,  rateBonus:0.1,  rangeBonus:20,  splashBonus:20 },
      { name:'Cluster Bomb',     cost:518, dmgBonus:60,  rateBonus:0.2,  rangeBonus:15,  splashBonus:35 },
      { name:'Nuclear Warhead',  cost:888, dmgBonus:140, rateBonus:0.18, rangeBonus:25,  splashBonus:65 },
      { name:'ORBITAL STRIKE',   cost:1665, dmgBonus:300, rateBonus:0.25, rangeBonus:40,  splashBonus:120, armorPierce:true },
    ],
  },
  {
    id:'freezer', name:'FREEZER', icon:'❄️', rarity:'advanced',
    cost:296, shopCost:832, unlocked:false,
    desc:'Slows enemies. Crucial support.',
    color:'#3498db',
    range:C.freezer.range, fireRate:C.freezer.fireRate, damage:C.freezer.damage,
    bulletSpeed:250, bulletColor:'#85c1e9', bulletSize:8,
    splash:55, slow:0.45, slowDuration:2.0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Arctic Blast',   cost:277, dmgBonus:6,   rateBonus:0.2,  rangeBonus:20,  slowBonus:0.1  },
      { name:'Deep Freeze',    cost:444, dmgBonus:12,  rateBonus:0.25, rangeBonus:25,  slowBonus:0.15 },
      { name:'Absolute Zero',  cost:703, dmgBonus:18,  rateBonus:0.35, rangeBonus:35,  slowBonus:0.2  },
      { name:'CRYO STORM',     cost:1295, dmgBonus:35,  rateBonus:0.5,  rangeBonus:50,  slowBonus:0.25, splashBonus:30 },
    ],
  },
  {
    id:'flamer', name:'FLAMETHROWER', icon:'🔥', rarity:'advanced',
    cost:333, shopCost:925, unlocked:false,
    desc:'Continuous burn damage over time.',
    color:'#e74c3c',
    range:C.flamer.range, fireRate:C.flamer.fireRate, damage:C.flamer.damage,
    bulletSpeed:185, bulletColor:'#ff6b35', bulletSize:6,
    splash:22, slow:0, burn:3, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Napalm',         cost:296, dmgBonus:5,   rateBonus:2,    rangeBonus:15,  burnBonus:2 },
      { name:'Inferno',        cost:481, dmgBonus:10,  rateBonus:3,    rangeBonus:12,  burnBonus:5 },
      { name:'Dragon Breath',  cost:777, dmgBonus:20,  rateBonus:6,    rangeBonus:22,  burnBonus:9 },
      { name:'HELLFIRE',       cost:1480, dmgBonus:45,  rateBonus:10,   rangeBonus:30,  burnBonus:16, splashBonus:20 },
    ],
  },

  // ── SPECIAL ─────────────────────────────────────────────────────────────
  {
    id:'tesla', name:'TESLA COIL', icon:'⚡', rarity:'special',
    cost:647, shopCost:2220, unlocked:false,
    desc:'Chains lightning to multiple enemies.',
    color:'#f39c12',
    range:C.tesla.range, fireRate:C.tesla.fireRate, damage:C.tesla.damage,
    bulletSpeed:550, bulletColor:'#f9e79f', bulletSize:3,
    splash:0, chain:4, slow:0.2, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Overcharge',      cost:555, dmgBonus:25,  rateBonus:0.3,  rangeBonus:20,  chainBonus:2 },
      { name:'Ball Lightning',  cost:925, dmgBonus:50,  rateBonus:0.35, rangeBonus:30,  chainBonus:3 },
      { name:'Storm God',       cost:1480, dmgBonus:100, rateBonus:0.55, rangeBonus:45,  chainBonus:5 },
      { name:'THUNDER TITAN',   cost:2775,dmgBonus:200, rateBonus:0.8,  rangeBonus:60,  chainBonus:8, armorPierce:true },
    ],
  },
  {
    id:'laser', name:'LASER TOWER', icon:'🔴', rarity:'special',
    cost:740, shopCost:2775, unlocked:false,
    desc:'Continuous beam, ignores armor.',
    color:'#e74c3c',
    range:C.laser.range, fireRate:C.laser.fireRate, damage:C.laser.damage,
    bulletSpeed:999, bulletColor:'#ff0040', bulletSize:2,
    splash:0, slow:0, armorPierce:true, beam:true, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Focused Beam',   cost:647, dmgBonus:10,  rateBonus:4,    rangeBonus:30  },
      { name:'Plasma Cutter',  cost:1073, dmgBonus:20,  rateBonus:6,    rangeBonus:25  },
      { name:'Death Ray',      cost:1757, dmgBonus:40,  rateBonus:10,   rangeBonus:45  },
      { name:'SOLAR CANNON',   cost:3330,dmgBonus:90,  rateBonus:18,   rangeBonus:60,  splashBonus:25 },
    ],
  },
  {
    id:'mortar', name:'MORTAR', icon:'💣', rarity:'special',
    cost:592, shopCost:2035, unlocked:false,
    desc:'Lobs shells with massive splash.',
    color:'#7f8c8d',
    range:C.mortar.range, fireRate:C.mortar.fireRate, damage:C.mortar.damage,
    bulletSpeed:155, bulletColor:'#bdc3c7', bulletSize:10,
    splash:90, slow:0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Heavy Shell',    cost:518, dmgBonus:55,  rateBonus:0.08, rangeBonus:30,  splashBonus:25 },
      { name:'Barrage',        cost:851, dmgBonus:90,  rateBonus:0.15, rangeBonus:25,  splashBonus:45 },
      { name:'Armageddon',     cost:1387, dmgBonus:200, rateBonus:0.22, rangeBonus:45,  splashBonus:90 },
      { name:'CITY DESTROYER', cost:2590,dmgBonus:450, rateBonus:0.3,  rangeBonus:60,  splashBonus:150, armorPierce:true },
    ],
  },
  {
    id:'venom', name:'VENOM TOWER', icon:'☠️', rarity:'special',
    cost:518, shopCost:1665, unlocked:false,
    desc:'Poisons groups. DPS stacks over time.',
    color:'#16a085',
    range:C.venom.range, fireRate:C.venom.fireRate, damage:C.venom.damage,
    bulletSpeed:270, bulletColor:'#1abc9c', bulletSize:6,
    splash:70, slow:0.15, burn:8, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Acid Cloud',     cost:444, dmgBonus:12,  rateBonus:0.45, rangeBonus:20,  burnBonus:6  },
      { name:'Plague',         cost:740, dmgBonus:25,  rateBonus:0.55, rangeBonus:30,  burnBonus:12 },
      { name:'BIOHAZARD',      cost:1295, dmgBonus:55,  rateBonus:1.1,  rangeBonus:45,  burnBonus:22, splashBonus:35 },
      { name:'EXTINCTION VIRUS',cost:2405,dmgBonus:120,rateBonus:2.0,  rangeBonus:60,  burnBonus:40, splashBonus:60 },
    ],
  },

  // ── LEGENDARY ───────────────────────────────────────────────────────────
  {
    id:'omega', name:'OMEGA CANNON', icon:'💥', rarity:'legendary',
    cost:1480, shopCost:7400, unlocked:false,
    desc:'Devastating orbital strike. Rare.',
    color:'#f1c40f',
    range:C.omega.range, fireRate:C.omega.fireRate, damage:C.omega.damage,
    bulletSpeed:360, bulletColor:'#f9e79f', bulletSize:14,
    splash:100, slow:0, armorPierce:true, pierce:0, maxUpgrade:3,
    upgrades:[
      { name:'Overload',       cost:1480,  dmgBonus:250, rateBonus:0.06, rangeBonus:30,  splashBonus:35 },
      { name:'Singularity',    cost:2590, dmgBonus:500, rateBonus:0.07, rangeBonus:35,  splashBonus:60 },
      { name:'EXTINCTION',     cost:4070, dmgBonus:1000,rateBonus:0.12, rangeBonus:60,  splashBonus:100 },
    ],
  },
  {
    id:'phantom', name:'PHANTOM SNIPER', icon:'👻', rarity:'legendary',
    cost:1295, shopCost:6475, unlocked:false,
    desc:'Sees invisible enemies. Insta-kills weak foes.',
    color:'#8e44ad',
    range:C.phantom.range, fireRate:C.phantom.fireRate, damage:C.phantom.damage,
    bulletSpeed:850, bulletColor:'#bb8fce', bulletSize:4,
    splash:0, slow:0, pierce:3, armorPierce:true, canSeeInvis:true, maxUpgrade:3,
    upgrades:[
      { name:'Shadow Mark',    cost:1295,  dmgBonus:120, rateBonus:0.2,  rangeBonus:40  },
      { name:'Soul Rip',       cost:2220, dmgBonus:250, rateBonus:0.25, rangeBonus:50,  instaKill:true },
      { name:'GOD OF DEATH',   cost:3700, dmgBonus:500, rateBonus:0.45, rangeBonus:70,  instaKill:true, pierce:6 },
    ],
  },
  {
    id:'temporal', name:'TIME DISTORTER', icon:'🌀', rarity:'legendary',
    cost:1665, shopCost:9250, unlocked:false,
    desc:'Slows ALL enemies simultaneously.',
    color:'#1abc9c',
    range:C.temporal.range, fireRate:C.temporal.fireRate, damage:C.temporal.damage,
    bulletSpeed:420, bulletColor:'#48c9b0', bulletSize:5,
    splash:0, slow:0.7, slowDuration:3.5, pierce:1, armorPierce:true, maxUpgrade:3,
    upgrades:[
      { name:'Chronostasis',   cost:1665,  dmgBonus:25,  rateBonus:0.05, rangeBonus:0,   slowBonus:0.1  },
      { name:'Temporal Rift',  cost:2960, dmgBonus:60,  rateBonus:0.1,  rangeBonus:0,   slowBonus:0.15 },
      { name:'TIME STOP',      cost:4625, dmgBonus:100, rateBonus:0.17, rangeBonus:0,   slowBonus:0.2  },
    ],
  },
  {
    id:'reaper', name:'SOUL REAPER', icon:'💀', rarity:'legendary',
    cost:1850, shopCost:11100, unlocked:false,
    desc:'Executes enemies below 20% HP.',
    color:'#2c3e50',
    range:C.reaper.range, fireRate:C.reaper.fireRate, damage:C.reaper.damage,
    bulletSpeed:520, bulletColor:'#95a5a6', bulletSize:5,
    splash:0, slow:0, pierce:4, armorPierce:true, instaKillThreshold:0.2, maxUpgrade:3,
    upgrades:[
      { name:'Dark Harvest',   cost:1757,  dmgBonus:100, rateBonus:0.25, rangeBonus:30  },
      { name:'Soul Devour',    cost:2960, dmgBonus:200, rateBonus:0.35, rangeBonus:25,  instaKillThreshold:0.35 },
      { name:'GRIM REAPER',    cost:5180, dmgBonus:400, rateBonus:0.55, rangeBonus:45,  instaKillThreshold:0.5, pierce:8 },
    ],
  },


  // ── AIR TOWERS ──────────────────────────────────────────────────────────
  // Air towers hover above the ground, rotate independently, and can be
  // placed on PATH tiles as well as ground tiles.
  {
    id:'drone_bay', name:'DRONE BAY', icon:'🚁', rarity:'advanced',
    cost:407, shopCost:1110, unlocked:false, isAir:true,
    desc:'Launches swarm drones. Can fire in all directions simultaneously.',
    color:'#00bcd4',
    range:155, fireRate:2.2, damage:18,
    bulletSpeed:280, bulletColor:'#00e5ff', bulletSize:4,
    splash:0, slow:0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Extra Drones',     cost:277, dmgBonus:8,   rateBonus:0.5,  rangeBonus:20 },
      { name:'Homing Missiles',  cost:481, dmgBonus:18,  rateBonus:0.6,  rangeBonus:25, splashBonus:20 },
      { name:'Drone Swarm',      cost:777, dmgBonus:30,  rateBonus:1.0,  rangeBonus:30, pierce:2 },
      { name:'NANODRONE CLOUD',  cost:1480, dmgBonus:70,  rateBonus:2.5,  rangeBonus:45, pierce:4, armorPierce:true },
    ],
  },
  {
    id:'apache', name:'APACHE GUNSHIP', icon:'🚁', rarity:'advanced',
    cost:703, shopCost:2220, unlocked:false, isAir:true,
    desc:'Heavy gunship. Minigun + rocket pods. Circles the field.',
    color:'#ff6f00',
    range:175, fireRate:0.55, damage:90,
    bulletSpeed:320, bulletColor:'#ff9800', bulletSize:8,
    splash:50, slow:0, burn:4, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Hellfire Pods',    cost:555, dmgBonus:45,  rateBonus:0.1,  rangeBonus:20, splashBonus:25 },
      { name:'Chain Gun',        cost:925, dmgBonus:80,  rateBonus:0.4,  rangeBonus:20, burnBonus:4 },
      { name:'Heavy Loadout',    cost:1572, dmgBonus:160, rateBonus:0.3,  rangeBonus:35, splashBonus:45 },
      { name:'DEATH FROM ABOVE', cost:2960,dmgBonus:350, rateBonus:0.5,  rangeBonus:50, splashBonus:80, armorPierce:true },
    ],
  },
  {
    id:'stormwing', name:'STORMWING JET', icon:'✈️', rarity:'special',
    cost:962, shopCost:3700, unlocked:false, isAir:true,
    desc:'Supersonic fighter. Strafes the path at high speed.',
    color:'#7986cb',
    range:195, fireRate:1.8, damage:35,
    bulletSpeed:600, bulletColor:'#9fa8da', bulletSize:5,
    splash:30, slow:0.2, pierce:2, maxUpgrade:4,
    upgrades:[
      { name:'Afterburner',      cost:740, dmgBonus:18,  rateBonus:0.5,  rangeBonus:30 },
      { name:'Plasma Guns',      cost:1295, dmgBonus:40,  rateBonus:0.7,  rangeBonus:30, armorPierce:true },
      { name:'Mach Strike',      cost:2035,dmgBonus:85,  rateBonus:1.2,  rangeBonus:45, pierce:4 },
      { name:'SONIC ANNIHILATOR',cost:4070,dmgBonus:200, rateBonus:2.0,  rangeBonus:60, pierce:6, splashBonus:50, armorPierce:true },
    ],
  },
  {
    id:'stratobomber', name:'STRATO BOMBER', icon:'💣', rarity:'special',
    cost:1202, shopCost:5180, unlocked:false, isAir:true,
    desc:'High altitude carpet bombing. Devastating AoE runs.',
    color:'#78909c',
    range:220, fireRate:0.28, damage:180,
    bulletSpeed:220, bulletColor:'#cfd8dc', bulletSize:12,
    splash:110, slow:0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Payload+',         cost:1017, dmgBonus:90,  rateBonus:0.06, rangeBonus:25, splashBonus:35 },
      { name:'Carpet Bomb',      cost:1757, dmgBonus:180, rateBonus:0.1,  rangeBonus:30, splashBonus:60 },
      { name:'Thermobaric',      cost:2960,dmgBonus:350, rateBonus:0.12, rangeBonus:40, splashBonus:100, burnBonus:10 },
      { name:'TACTICAL NUKE',    cost:5550,dmgBonus:800, rateBonus:0.18, rangeBonus:60, splashBonus:180, armorPierce:true },
    ],
  },
  {
    id:'spectre', name:'SPECTRE AC-130', icon:'🛩️', rarity:'legendary',
    cost:1665, shopCost:9250, unlocked:false, isAir:true,
    desc:'Gunship that orbits and fires three weapons simultaneously.',
    color:'#546e7a',
    range:340, fireRate:0.9, damage:280,
    bulletSpeed:400, bulletColor:'#b0bec5', bulletSize:9,
    splash:70, slow:0.3, pierce:3, armorPierce:true, canSeeInvis:true, maxUpgrade:3,
    upgrades:[
      { name:'Triple Armament',  cost:1850, dmgBonus:140, rateBonus:0.2,  rangeBonus:35, splashBonus:30 },
      { name:'Full Broadside',   cost:3330, dmgBonus:280, rateBonus:0.3,  rangeBonus:40, splashBonus:55, chain:3 },
      { name:'ORBITAL PLATFORM', cost:5920, dmgBonus:600, rateBonus:0.55, rangeBonus:60, splashBonus:90, chain:6, armorPierce:true },
    ],
  },
  {
    id:'sky_fortress', name:'SKY FORTRESS', icon:'🏰', rarity:'legendary',
    cost:2220, shopCost:12950, unlocked:false, isAir:true,
    desc:'Flying fortress. Buffs ALL towers below. Absolute dominance.',
    color:'#f9a825',
    range:260, fireRate:0.22, damage:800,
    bulletSpeed:500, bulletColor:'#ffd54f', bulletSize:16,
    splash:130, slow:0.5, armorPierce:true, pierce:2, aura:true, auraBonus:0.4, canSeeInvis:true, maxUpgrade:3,
    upgrades:[
      { name:'Reinforced Guns',  cost:2220, dmgBonus:400, rateBonus:0.06, rangeBonus:30, splashBonus:40 },
      { name:'Orbital Cannons',  cost:3700, dmgBonus:800, rateBonus:0.08, rangeBonus:40, splashBonus:80, chain:4 },
      { name:'GOD MACHINE',      cost:6475, dmgBonus:1800,rateBonus:0.14, rangeBonus:60, splashBonus:150, chain:8, armorPierce:true },
    ],
  },

  // ── OWNER-ONLY ──────────────────────────────────────────────────────────
  {
    id:'shadow_commander', name:'SHADOW COMMANDER', icon:'🦇', rarity:'legendary',
    cost:0, shopCost:0, unlocked:false, ownerOnly:true,
    desc:'OWNER ONLY. Massive AoE + aura buffs all nearby towers.',
    color:'#9b59b6',
    range:C.shadow_commander.range, fireRate:C.shadow_commander.fireRate, damage:C.shadow_commander.damage,
    bulletSpeed:500, bulletColor:'#9b59b6', bulletSize:10,
    splash:80, slow:0.4, armorPierce:true, aura:true, auraBonus:0.5, pierce:2, canSeeInvis:true,
    maxUpgrade:0, upgrades:[],
  },
  {
    id:'neon_warden', name:'NEON WARDEN', icon:'🌟', rarity:'legendary',
    cost:0, shopCost:0, unlocked:false, ownerOnly:true,
    desc:'OWNER ONLY. Chains lightning to infinite enemies.',
    color:'#00ffaa',
    range:C.neon_warden.range, fireRate:C.neon_warden.fireRate, damage:C.neon_warden.damage,
    bulletSpeed:700, bulletColor:'#00ffaa', bulletSize:6,
    splash:100, slow:0.6, chain:99, armorPierce:true, pierce:3, canSeeInvis:true,
    maxUpgrade:0, upgrades:[],
  },
  {
    id:'void_hunter', name:'VOID HUNTER', icon:'🕳️', rarity:'legendary',
    cost:0, shopCost:0, unlocked:false, ownerOnly:true,
    desc:'OWNER ONLY. Instant-kills everything. Reality shredder.',
    color:'#8e44ad',
    range:C.void_hunter.range, fireRate:C.void_hunter.fireRate, damage:C.void_hunter.damage,
    bulletSpeed:900, bulletColor:'#9b59b6', bulletSize:12,
    splash:50, slow:0.8, pierce:8, armorPierce:true, canSeeInvis:true, instaKill:true,
    maxUpgrade:0, upgrades:[],
  },

  // ── THE ULTIMATE OWNER AIR TOWER ─────────────────────────────────────────
  {
    id:'celestial_overlord', name:'CELESTIAL OVERLORD', icon:'celestial_overlord',
    rarity:'legendary',
    cost:0, shopCost:0, unlocked:false, ownerOnly:true, isAir:true,
    desc:'OWNER ONLY ★ The apex of destruction. Omnipresent divine warship that obliterates ALL enemies every frame. Infinite range, infinite pierce, instant-kill, sees invisible, chains to all, slows all. Reality itself bends.',
    color:'#ffd700',
    range:C.celestial_overlord.range,
    fireRate:C.celestial_overlord.fireRate,
    damage:C.celestial_overlord.damage,
    bulletSpeed:9999, bulletColor:'#ffffff', bulletSize:16,
    splash:9999, slow:0.99, slowDuration:99, chain:9999,
    pierce:9999, armorPierce:true, canSeeInvis:true,
    instaKill:true, instaKillThreshold:999999999,
    aura:true, auraBonus:2.0,
    maxUpgrade:0, upgrades:[],
  },

  // ── NEW TOWERS v13 ──────────────────────────────────────────────────────

  // CROSSBOW — rapid-fire piercing bolts, woodpunk aesthetic
  {
    id:'crossbow', name:'CROSSBOW', icon:'🏹', rarity:'basic',
    cost:110, shopCost:0, unlocked:true,
    desc:'Fires heavy bolts that pierce through multiple enemies.',
    color:'#a0522d',
    range:C.crossbow.range, fireRate:C.crossbow.fireRate, damage:C.crossbow.damage,
    bulletSpeed:420, bulletColor:'#d4a96a', bulletSize:3,
    splash:0, slow:0, pierce:3, maxUpgrade:4,
    upgrades:[
      { name:'Broadhead',      cost:120, dmgBonus:14,  rateBonus:0.4,  rangeBonus:20, pierce:1 },
      { name:'Explosive Bolt', cost:200, dmgBonus:28,  rateBonus:0.3,  rangeBonus:25, splashBonus:25 },
      { name:'Gatling Bow',    cost:340, dmgBonus:40,  rateBonus:1.8,  rangeBonus:30, pierce:2 },
      { name:'RAILBOW',        cost:650, dmgBonus:90,  rateBonus:2.2,  rangeBonus:40, pierce:6, armorPierce:true },
    ],
  },

  // CRYOMANCER — ice mage, freezes and shatters
  {
    id:'cryomancer', name:'CRYOMANCER', icon:'🧊', rarity:'advanced',
    cost:310, shopCost:920, unlocked:false,
    desc:'Deep-freezes enemies solid. Shattered enemies deal area damage.',
    color:'#00b4d8',
    range:C.cryomancer.range, fireRate:C.cryomancer.fireRate, damage:C.cryomancer.damage,
    bulletSpeed:240, bulletColor:'#caf0f8', bulletSize:9,
    splash:50, slow:0.75, slowDuration:3.5, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Frostbite',      cost:270, dmgBonus:20,  rateBonus:0.15, rangeBonus:20,  slowBonus:0.1  },
      { name:'Glacial Surge',  cost:460, dmgBonus:45,  rateBonus:0.2,  rangeBonus:28,  slowBonus:0.1, splashBonus:25 },
      { name:'Permafrost',     cost:740, dmgBonus:90,  rateBonus:0.3,  rangeBonus:35,  slowBonus:0.1, splashBonus:40 },
      { name:'ABSOLUTE ZERO',  cost:1400,dmgBonus:180, rateBonus:0.45, rangeBonus:50,  slowBonus:0.1, splashBonus:70 },
    ],
  },

  // BUZZSAW — spinning blade that hits everything nearby constantly
  {
    id:'buzzsaw', name:'BUZZSAW', icon:'⚙️', rarity:'advanced',
    cost:260, shopCost:760, unlocked:false,
    desc:'Spinning blade attacks all nearby enemies simultaneously.',
    color:'#c0c0c0',
    range:C.buzzsaw.range, fireRate:C.buzzsaw.fireRate, damage:C.buzzsaw.damage,
    bulletSpeed:0, bulletColor:'#e0e0e0', bulletSize:5,
    splash:C.buzzsaw.range, slow:0, pierce:99, maxUpgrade:4,
    upgrades:[
      { name:'Diamond Edge',   cost:230, dmgBonus:12,  rateBonus:1.5,  rangeBonus:10, armorPierce:true },
      { name:'Dual Saws',      cost:390, dmgBonus:22,  rateBonus:2.0,  rangeBonus:15 },
      { name:'Titanium Blade', cost:620, dmgBonus:45,  rateBonus:3.0,  rangeBonus:20, armorPierce:true },
      { name:'OBLITERATOR',    cost:1200,dmgBonus:100, rateBonus:5.0,  rangeBonus:30, armorPierce:true },
    ],
  },

  // BEACON — support tower, buffs all nearby towers' fire rate
  {
    id:'beacon', name:'BEACON', icon:'📡', rarity:'special',
    cost:480, shopCost:1600, unlocked:false,
    desc:'Emits a tactical field that boosts nearby tower fire rate by 40%.',
    color:'#ffd700',
    range:C.beacon.range, fireRate:C.beacon.fireRate, damage:C.beacon.damage,
    bulletSpeed:300, bulletColor:'#ffe066', bulletSize:3,
    splash:0, slow:0, pierce:0, aura:true, auraBonus:0.4, maxUpgrade:3,
    upgrades:[
      { name:'Amplifier',      cost:520, dmgBonus:0,   rateBonus:0.1,  rangeBonus:30,  auraBonus:0.15 },
      { name:'War Beacon',     cost:900, dmgBonus:5,   rateBonus:0.2,  rangeBonus:40,  auraBonus:0.2  },
      { name:'COMMAND NODE',   cost:1800,dmgBonus:15,  rateBonus:0.3,  rangeBonus:55,  auraBonus:0.3  },
    ],
  },

  // PYRE — burns the ground, creates lingering fire pool
  {
    id:'pyre', name:'PYRE TOWER', icon:'🔥', rarity:'special',
    cost:380, shopCost:1300, unlocked:false,
    desc:'Ignites the ground around enemies. Fire pools deal DoT.',
    color:'#ff4500',
    range:C.pyre.range, fireRate:C.pyre.fireRate, damage:C.pyre.damage,
    bulletSpeed:170, bulletColor:'#ff6830', bulletSize:7,
    splash:40, slow:0.1, burn:6, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Hellfire',       cost:340, dmgBonus:8,   rateBonus:1.0,  rangeBonus:18,  burnBonus:4  },
      { name:'Magma Pool',     cost:560, dmgBonus:18,  rateBonus:1.5,  rangeBonus:20,  burnBonus:8, splashBonus:20 },
      { name:'Volcano',        cost:900, dmgBonus:35,  rateBonus:2.5,  rangeBonus:30,  burnBonus:14, splashBonus:40 },
      { name:'SOLAR FLARE',    cost:1700,dmgBonus:75,  rateBonus:4.0,  rangeBonus:45,  burnBonus:25, splashBonus:65 },
    ],
  },

  // RAILGUN — single ultra-pierce beam, slow but devastating
  {
    id:'railgun', name:'RAILGUN', icon:'⚡', rarity:'legendary',
    cost:850, shopCost:4200, unlocked:false,
    desc:'Fires a charged rail beam. Pierces every enemy on screen.',
    color:'#00ffcc',
    range:C.railgun.range, fireRate:C.railgun.fireRate, damage:C.railgun.damage,
    bulletSpeed:950, bulletColor:'#00ffcc', bulletSize:3,
    splash:0, slow:0, pierce:99, armorPierce:true, maxUpgrade:3,
    upgrades:[
      { name:'Overcharge',     cost:900,  dmgBonus:180, rateBonus:0.06, rangeBonus:40 },
      { name:'Gauss Coil',     cost:1600, dmgBonus:360, rateBonus:0.08, rangeBonus:50, splashBonus:20 },
      { name:'PARTICLE LANCE', cost:2800, dmgBonus:700, rateBonus:0.12, rangeBonus:70, splashBonus:45 },
    ],
  },

  // NECROMANCER — raises dead enemies as spectral servants that fight
  {
    id:'necromancer', name:'NECROMANCER', icon:'💀', rarity:'special',
    cost:560, shopCost:2100, unlocked:false,
    desc:'Reanimates fallen enemies as servants that fight for you.',
    color:'#7b2d8b',
    range:C.necromancer.range, fireRate:C.necromancer.fireRate, damage:C.necromancer.damage,
    bulletSpeed:280, bulletColor:'#cc66ff', bulletSize:5,
    splash:0, slow:0.2, pierce:1, burn:3, maxUpgrade:4,
    upgrades:[
      { name:'Dark Rites',     cost:490, dmgBonus:28,  rateBonus:0.3,  rangeBonus:22 },
      { name:'Soul Harvest',   cost:820, dmgBonus:55,  rateBonus:0.4,  rangeBonus:30, splashBonus:25 },
      { name:'Undead Army',    cost:1300,dmgBonus:110, rateBonus:0.6,  rangeBonus:40, pierce:2 },
      { name:'LICH KING',      cost:2500,dmgBonus:220, rateBonus:1.0,  rangeBonus:55, pierce:4, armorPierce:true, burn:8 },
    ],
  },

  // STORMCALLER — calls down lightning storms, wind pushes enemies back
  {
    id:'stormcaller', name:'STORMCALLER', icon:'⛈️', rarity:'legendary',
    cost:960, shopCost:5200, unlocked:false,
    desc:'Summons storms. Lightning chains and wind slows groups.',
    color:'#4a9eda',
    range:C.stormcaller.range, fireRate:C.stormcaller.fireRate, damage:C.stormcaller.damage,
    bulletSpeed:500, bulletColor:'#88ccff', bulletSize:6,
    splash:55, slow:0.35, slowDuration:2.5, chain:5, pierce:1, armorPierce:true, maxUpgrade:3,
    upgrades:[
      { name:'Tempest',        cost:1000, dmgBonus:40,  rateBonus:0.2,  rangeBonus:30,  chainBonus:3, splashBonus:20 },
      { name:'Hurricane',      cost:1700, dmgBonus:80,  rateBonus:0.35, rangeBonus:40,  chainBonus:4, splashBonus:40 },
      { name:'EYE OF STORM',   cost:3000, dmgBonus:160, rateBonus:0.5,  rangeBonus:55,  chainBonus:6, splashBonus:70, armorPierce:true },
    ],
  },

  // ── NEW TOWERS v14 ──────────────────────────────────────────────────────

  // SPIKER — drops caltrops on path; lingering damage field
  {
    id:'spiker', name:'SPIKER', icon:'📌', rarity:'basic',
    cost:95, shopCost:0, unlocked:true,
    desc:'Lobs spike strips onto the path. Balloons that roll over take damage.',
    color:'#8a8060',
    range:C.spiker.range, fireRate:C.spiker.fireRate, damage:C.spiker.damage,
    bulletSpeed:200, bulletColor:'#c0b080', bulletSize:6,
    splash:28, slow:0.2, pierce:99, maxUpgrade:4,
    upgrades:[
      { name:'Razor Tips',     cost:105, dmgBonus:18, rateBonus:0.4,  rangeBonus:15, armorPierce:true },
      { name:'Mine Strip',     cost:175, dmgBonus:35, rateBonus:0.3,  rangeBonus:20, splashBonus:15 },
      { name:'Razor Field',    cost:280, dmgBonus:60, rateBonus:0.6,  rangeBonus:25, splashBonus:30 },
      { name:'DEATH CARPET',   cost:550, dmgBonus:120,rateBonus:1.0,  rangeBonus:35, splashBonus:55, armorPierce:true },
    ],
  },

  // CHRONO BEACON — slows entire screen, global time dilation
  {
    id:'chrono', name:'CHRONO TOWER', icon:'⏱️', rarity:'legendary',
    cost:1100, shopCost:5800, unlocked:false,
    desc:'Emits a chrono-field that slows ALL balloons globally. Stacks with other slow.',
    color:'#00e5cc',
    range:C.chrono.range, fireRate:C.chrono.fireRate, damage:C.chrono.damage,
    bulletSpeed:0, bulletColor:'#80fff0', bulletSize:0,
    splash:0, slow:0.55, slowDuration:9999, pierce:0, armorPierce:true, maxUpgrade:3,
    upgrades:[
      { name:'Deep Time',      cost:1100, dmgBonus:0,  rateBonus:0.04, rangeBonus:0,  slowBonus:0.1 },
      { name:'Temporal Lock',  cost:1900, dmgBonus:0,  rateBonus:0.06, rangeBonus:0,  slowBonus:0.15 },
      { name:'TIME FREEZE',    cost:3200, dmgBonus:5,  rateBonus:0.1,  rangeBonus:0,  slowBonus:0.2 },
    ],
  },

  // MAGNET — pulls enemies sideways, disrupting path position
  {
    id:'magnet', name:'MAGNETRON', icon:'🧲', rarity:'advanced',
    cost:295, shopCost:870, unlocked:false,
    desc:'Magnetic pulse disrupts enemy movement. Metallic balloons take bonus damage.',
    color:'#e05070',
    range:C.magnet.range, fireRate:C.magnet.fireRate, damage:C.magnet.damage,
    bulletSpeed:320, bulletColor:'#ff6090', bulletSize:7,
    splash:45, slow:0.3, slowDuration:1.8, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Polarity Flip',  cost:260, dmgBonus:15, rateBonus:0.4,  rangeBonus:20, slowBonus:0.1 },
      { name:'EM Surge',       cost:440, dmgBonus:35, rateBonus:0.5,  rangeBonus:25, splashBonus:20 },
      { name:'Iron Vortex',    cost:700, dmgBonus:65, rateBonus:0.8,  rangeBonus:30, splashBonus:35 },
      { name:'POLE REVERSAL',  cost:1350,dmgBonus:130,rateBonus:1.2,  rangeBonus:45, splashBonus:60, armorPierce:true },
    ],
  },

  // ARTILLERY CANNON — massive slow cannon, air-bursts at any map point
  {
    id:'artillery', name:'ARTILLERY', icon:'💥', rarity:'special',
    cost:740, shopCost:2800, unlocked:false,
    desc:'Long-range cannon that targets anywhere on map. Massive AoE shell.',
    color:'#5a4a30',
    range:C.artillery.range, fireRate:C.artillery.fireRate, damage:C.artillery.damage,
    bulletSpeed:160, bulletColor:'#c09860', bulletSize:13,
    splash:120, slow:0.2, pierce:0, armorPierce:true, maxUpgrade:4,
    upgrades:[
      { name:'AP Shell',       cost:650, dmgBonus:110, rateBonus:0.05, rangeBonus:30, splashBonus:25 },
      { name:'Howitzer',       cost:1100,dmgBonus:220, rateBonus:0.08, rangeBonus:35, splashBonus:50 },
      { name:'Siege Cannon',   cost:1800,dmgBonus:440, rateBonus:0.12, rangeBonus:45, splashBonus:85 },
      { name:'ARMAGEDDON',     cost:3500,dmgBonus:900, rateBonus:0.2,  rangeBonus:60, splashBonus:150, burn:8 },
    ],
  },

  // INFECTOR — bio tower that spreads viral DOT between balloons
  {
    id:'infector', name:'INFECTOR', icon:'🧬', rarity:'special',
    cost:430, shopCost:1600, unlocked:false,
    desc:'Launches viral payload. Infected enemies spread DoT to nearby balloons.',
    color:'#40c060',
    range:C.infector.range, fireRate:C.infector.fireRate, damage:C.infector.damage,
    bulletSpeed:240, bulletColor:'#60e880', bulletSize:5,
    splash:30, slow:0.1, burn:5, pierce:2, maxUpgrade:4,
    upgrades:[
      { name:'Mutagen',        cost:380, dmgBonus:6,  rateBonus:0.5,  rangeBonus:20, burnBonus:4  },
      { name:'Plague Cloud',   cost:640, dmgBonus:14, rateBonus:0.8,  rangeBonus:28, burnBonus:8, splashBonus:20  },
      { name:'Pandemic',       cost:1050,dmgBonus:28, rateBonus:1.2,  rangeBonus:38, burnBonus:14, splashBonus:45 },
      { name:'EXTINCTION',     cost:2000,dmgBonus:55, rateBonus:2.0,  rangeBonus:50, burnBonus:25, splashBonus:75, armorPierce:true },
    ],
  },

  // GOLEM — slow heavy fist attack, massive close-range damage
  {
    id:'golem', name:'STONE GOLEM', icon:'🗿', rarity:'special',
    cost:610, shopCost:2300, unlocked:false,
    desc:'Ancient golem that smashes nearby enemies. Short range, enormous damage.',
    color:'#807060',
    range:C.golem.range, fireRate:C.golem.fireRate, damage:C.golem.damage,
    bulletSpeed:0, bulletColor:'#b0a090', bulletSize:10,
    splash:C.golem.range, slow:0.4, slowDuration:2.0, pierce:99, armorPierce:true, maxUpgrade:4,
    upgrades:[
      { name:'Stone Skin',     cost:540, dmgBonus:45,  rateBonus:0.1,  rangeBonus:10 },
      { name:'Iron Fists',     cost:900, dmgBonus:90,  rateBonus:0.15, rangeBonus:12, armorPierce:true },
      { name:'Rock Avalanche', cost:1450,dmgBonus:180, rateBonus:0.2,  rangeBonus:18, splashBonus:20 },
      { name:'EARTHBREAKER',   cost:2800,dmgBonus:360, rateBonus:0.3,  rangeBonus:25, splashBonus:40, armorPierce:true },
    ],
  },

  // ── NEW TOWERS v25 ─────────────────────────────────────────────────────────

  // CANNON — heavy iron cannonball, big splash, mid-range brute
  {
    id:'cannon', name:'CANNON', icon:'cannon',
    rarity:'basic',
    cost:185, shopCost:0, unlocked:true,
    desc:'Heavy iron cannon. Fires cannonballs with solid splash damage.',
    color:'#8a7a5a',
    range:C.cannon.range, fireRate:C.cannon.fireRate, damage:C.cannon.damage,
    bulletSpeed:190, bulletColor:'#555566', bulletSize:8,
    splash:50, slow:0, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Iron Barrel',    cost:200, dmgBonus:40,  rateBonus:0.1,  rangeBonus:15, splashBonus:10 },
      { name:'Grapeshot',      cost:340, dmgBonus:80,  rateBonus:0.15, rangeBonus:15, splashBonus:25, pierce:3 },
      { name:'Siege Cannon',   cost:620, dmgBonus:160, rateBonus:0.2,  rangeBonus:25, splashBonus:50 },
      { name:'DOOMSDAY GUN',   cost:1200,dmgBonus:350, rateBonus:0.3,  rangeBonus:40, splashBonus:90, armorPierce:true },
    ],
  },

  // WATCHTOWER — tall stone tower, rapid-fire crossbowmen, great range
  {
    id:'watchtower', name:'WATCHTOWER', icon:'watchtower',
    rarity:'basic',
    cost:165, shopCost:0, unlocked:true,
    desc:'Stone watchtower. Fast multi-arrow volleys, exceptional range.',
    color:'#a0b8c8',
    range:C.watchtower.range, fireRate:C.watchtower.fireRate, damage:C.watchtower.damage,
    bulletSpeed:360, bulletColor:'#c8d8a0', bulletSize:3,
    splash:0, slow:0, pierce:1, maxUpgrade:4,
    upgrades:[
      { name:'Reinforced',     cost:180, dmgBonus:10,  rateBonus:0.8,  rangeBonus:30 },
      { name:'Twin Archers',   cost:310, dmgBonus:18,  rateBonus:1.5,  rangeBonus:30, pierce:2 },
      { name:'Battle Garrison',cost:560, dmgBonus:35,  rateBonus:2.5,  rangeBonus:45, pierce:3 },
      { name:'FORTRESS PEAK',  cost:1100,dmgBonus:70,  rateBonus:5.0,  rangeBonus:65, pierce:5, burnBonus:2 },
    ],
  },

  // GAUSS CANNON — futuristic electromagnetic railgun, ultra-high damage piercing beam
  {
    id:'gauss', name:'GAUSS CANNON', icon:'gauss',
    rarity:'legendary',
    cost:1400, shopCost:4500, unlocked:false,
    desc:'Electromagnetic accelerator cannon. Punches through entire enemy lines.',
    color:'#00aaff',
    range:C.gauss.range, fireRate:C.gauss.fireRate, damage:C.gauss.damage,
    bulletSpeed:900, bulletColor:'#aaddff', bulletSize:3,
    splash:0, slow:0, pierce:20, armorPierce:true, maxUpgrade:4,
    upgrades:[
      { name:'Charged Coils',  cost:1200, dmgBonus:140, rateBonus:0.06, rangeBonus:40 },
      { name:'Overload',       cost:2000, dmgBonus:280, rateBonus:0.08, rangeBonus:50, pierce:30 },
      { name:'Mass Driver',    cost:3200, dmgBonus:500, rateBonus:0.1,  rangeBonus:65, pierce:50 },
      { name:'SINGULARITY',    cost:5800, dmgBonus:1200,rateBonus:0.18, rangeBonus:80, pierce:999, splashBonus:40, armorPierce:true },
    ],
  },

  // PYROMANCER — robed wizard tower, casts wide fire AoE bursts
  {
    id:'pyromancer', name:'PYROMANCER', icon:'pyromancer',
    rarity:'advanced',
    cost:380, shopCost:950, unlocked:false,
    desc:'Fire mage tower. Hurls explosive flame bursts with wide area coverage.',
    color:'#ff6622',
    range:C.pyromancer.range, fireRate:C.pyromancer.fireRate, damage:C.pyromancer.damage,
    bulletSpeed:200, bulletColor:'#ff4400', bulletSize:9,
    splash:45, slow:0, burn:4, pierce:0, maxUpgrade:4,
    upgrades:[
      { name:'Hot Streak',     cost:340, dmgBonus:8,   rateBonus:1.5,  rangeBonus:15, burnBonus:3 },
      { name:'Wildfire',       cost:560, dmgBonus:16,  rateBonus:2.5,  rangeBonus:18, splashBonus:25, burnBonus:5 },
      { name:'Pyroclasm',      cost:900, dmgBonus:30,  rateBonus:4.0,  rangeBonus:25, splashBonus:45, burnBonus:8 },
      { name:'SOLAR FLARE',    cost:1750,dmgBonus:70,  rateBonus:8.0,  rangeBonus:40, splashBonus:80, burnBonus:15, armorPierce:true },
    ],
  },

  // SHOCKWAVE TOWER — ground-pulse emitter, damages everything in radius
  {
    id:'shockwave', name:'SHOCKWAVE', icon:'shockwave',
    rarity:'special',
    cost:720, shopCost:2400, unlocked:false,
    desc:'Emits ground-shaking pulses. Damages and slows every enemy in radius.',
    color:'#dd8800',
    range:C.shockwave.range, fireRate:C.shockwave.fireRate, damage:C.shockwave.damage,
    bulletSpeed:0, bulletColor:'#ffcc44', bulletSize:12,
    splash:C.shockwave.range, slow:0.35, slowDuration:1.5, pierce:99, armorPierce:false, maxUpgrade:4,
    upgrades:[
      { name:'Deep Tremor',    cost:640, dmgBonus:50,  rateBonus:0.15, rangeBonus:20, slowBonus:0.1 },
      { name:'Fault Line',     cost:1050,dmgBonus:100, rateBonus:0.2,  rangeBonus:30, slowBonus:0.15 },
      { name:'Earthquake',     cost:1700,dmgBonus:200, rateBonus:0.3,  rangeBonus:45, slowBonus:0.2, armorPierce:true },
      { name:'WORLD SHATTER',  cost:3200,dmgBonus:420, rateBonus:0.45, rangeBonus:65, slowBonus:0.3, armorPierce:true, splashBonus:40 },
    ],
  },

  // ── ECONOMY TOWERS ──────────────────────────────────────────────────────────

  // BANANA FARM — generates cash each round (BTD6-style)
  {
    id:'banana_farm', name:'BANANA FARM', icon:'🍌', rarity:'special',
    cost:1250, shopCost:0, unlocked:true,
    desc:'Produces $80 per round. Upgrades massively increase yield.',
    range:0, fireRate:0, damage:0,
    isEconomy:true, isFarm:true,
    incomePerRound:80,
    upgrades:[
      { name:'More Bananas',    cost:900,  incomeBonus:70,  desc:'Produces $150/round' },
      { name:'Banana Plantation',cost:1800, incomeBonus:175, desc:'Produces $325/round' },
      { name:'Monkey Bank Mode', cost:3000, bankMode:true,   desc:'Converts to bank — stores & compounds at 15% interest/round, cap $10k' },
      { name:'BANANA CENTRAL',  cost:7200, incomeBonus:1500, bankMode:false, desc:'Produces $1825/round — the ultimate money printer' },
    ],
    maxUpgrade:4,
  },

]})();

function getTowerDef(id) { return TOWER_DEFS.find(t => t.id === id); }

// ── Tower class ───────────────────────────────────────────
/* ── Tower Art — hand-drawn per-tower sprites ────────────── */
const TowerArt = {

  // GUNNER — squat military turret, thick barrel, ammo belt
  gunner(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Base plate — octagonal
    ctx.fillStyle = '#2a3545';
    ctx.beginPath();
    for(let i=0;i<8;i++){
      const a = (i/8)*Math.PI*2 - Math.PI/8;
      const r = S*.36;
      i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
    // Turret dome
    ctx.fillStyle = '#3a4a5e';
    ctx.beginPath(); ctx.arc(0, 0, S*.28, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4a5e72';
    ctx.beginPath(); ctx.arc(-S*.06, -S*.06, S*.18, 0, Math.PI*2); ctx.fill(); // highlight
    // Thick barrel — double
    ctx.fillStyle = flash>0 ? '#ffe080' : '#2a3545';
    ctx.beginPath(); ctx.roundRect(-S*.1, -S*.38, S*.07, S*.32, S*.02); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.03, -S*.38, S*.07, S*.32, S*.02); ctx.fill();
    // Barrel cooling rings
    ctx.strokeStyle = '#1a2535'; ctx.lineWidth = S*.025;
    for(let i=0;i<3;i++) ctx.strokeRect(-S*.1, -S*.35+i*S*.09, S*.2, S*.025);
    // Muzzle flash
    if(flash>0){
      ctx.fillStyle = '#fff8c0';
      ctx.beginPath();
      ctx.moveTo(-S*.14, -S*.38); ctx.lineTo(0, -S*.58); ctx.lineTo(S*.14, -S*.38);
      ctx.fill(); }
    // Ammo belt — side detail
    ctx.fillStyle = '#f5c842';
    for(let i=0;i<4;i++) ctx.fillRect(S*.2+i*S*.07, -S*.12+i*S*.04, S*.05, S*.08);
    ctx.restore();
  },

  // ARCHER — tall narrow tower with arrow slits, bow mechanism on top
  archer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Stone tower base — rectangular
    ctx.fillStyle = '#3d5228';
    ctx.beginPath(); ctx.roundRect(-S*.22, -S*.3, S*.44, S*.42, S*.03); ctx.fill();
    ctx.fillStyle = '#2d4018';
    ctx.fillRect(-S*.22, -S*.3, S*.44, S*.08); // top darker
    // Arrow slits
    ctx.fillStyle = '#1a2810';
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.26, S*.08, S*.16, S*.01); ctx.fill();
    // Bow frame
    ctx.strokeStyle = '#5a7030'; ctx.lineWidth = S*.06; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -S*.34, S*.2, Math.PI*.7, Math.PI*1.3); ctx.stroke();
    // Bowstring
    ctx.strokeStyle = flash>0 ? '#fff' : '#c8d890'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.moveTo(Math.cos(Math.PI*.7)*S*.2, Math.sin(Math.PI*.7)*S*.2-S*.34); ctx.lineTo(0, flash>0 ? -S*.28 : -S*.24); ctx.lineTo(Math.cos(Math.PI*1.3)*S*.2, Math.sin(Math.PI*1.3)*S*.2-S*.34); ctx.stroke();
    // Arrow on string
    ctx.strokeStyle = '#8a6030'; ctx.lineWidth = S*.03;
    ctx.beginPath(); ctx.moveTo(0, -S*.44); ctx.lineTo(0, flash>0 ? -S*.14 : -S*.18); ctx.stroke();
    // Arrow tip
    ctx.fillStyle = flash>0 ? '#fff8c0' : '#c0c8a0';
    if(flash>0){}
    ctx.beginPath(); ctx.moveTo(-S*.04, -S*.46); ctx.lineTo(0, -S*.56); ctx.lineTo(S*.04, -S*.46); ctx.fill();
    // Leafy decoration
    ctx.fillStyle = '#4a6820';
    ctx.beginPath(); ctx.ellipse(-S*.22, S*.04, S*.1, S*.06, -0.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S*.22, S*.04, S*.1, S*.06, 0.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  },

  // SNIPER — sleek long-barrel rifle on elevated platform, crosshair reticle
  sniper(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Raised platform
    ctx.fillStyle = '#4a3a6e';
    ctx.beginPath(); ctx.ellipse(0, S*.12, S*.3, S*.14, 0, 0, Math.PI*2); ctx.fill();
    // Tripod legs
    ctx.strokeStyle = '#3a2a5e'; ctx.lineWidth = S*.05; ctx.lineCap = 'round';
    [[-0.35,0.32],[0,0.36],[0.35,0.32]].forEach(([lx,ly])=>{
      ctx.beginPath(); ctx.moveTo(0, S*.12); ctx.lineTo(lx*S, ly*S); ctx.stroke();
    });
    // Barrel — very long, thin
    ctx.fillStyle = flash>0 ? '#ffe0a0' : '#2e2048';
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.55, S*.08, S*.55, S*.02); ctx.fill();
    // Silencer
    ctx.fillStyle = '#3a2e58';
    ctx.beginPath(); ctx.roundRect(-S*.055, -S*.6, S*.11, S*.12, S*.03); ctx.fill();
    // Scope
    ctx.fillStyle = '#2a1a40';
    ctx.beginPath(); ctx.roundRect(-S*.06, -S*.36, S*.12, S*.1, S*.02); ctx.fill();
    ctx.fillStyle = '#1a0a30';
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.35, S*.08, S*.08, S*.02); ctx.fill();
    ctx.fillStyle = 'rgba(80,140,255,0.4)';
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.35, S*.08, S*.08, S*.02); ctx.fill();
    // Scope crosshair detail
    ctx.strokeStyle = 'rgba(200,220,255,0.6)'; ctx.lineWidth = S*.01;
    ctx.beginPath(); ctx.moveTo(-S*.04, -S*.31); ctx.lineTo(S*.04, -S*.31); ctx.stroke();
    // Muzzle flash
    if(flash>0){
      ctx.fillStyle = '#fff0a0';
      ctx.beginPath(); ctx.moveTo(-S*.06, -S*.6); ctx.lineTo(0, -S*.78); ctx.lineTo(S*.06, -S*.6); ctx.fill();
      }
    ctx.restore();
  },

  // ROCKETEER — chunky launcher, four-tube salvo pod, fins
  rocketeer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Body
    ctx.fillStyle = '#6a3810';
    ctx.beginPath(); ctx.arc(0, 0, S*.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8a4818';
    ctx.beginPath(); ctx.arc(-S*.06, -S*.06, S*.2, 0, Math.PI*2); ctx.fill();
    // 2x2 rocket pod
    const tubePositions = [[-S*.1,-S*.1],[S*.1,-S*.1],[-S*.1,S*.1],[S*.1,S*.1]];
    ctx.fillStyle = '#4a2808';
    tubePositions.forEach(([tx,ty])=>{
      ctx.beginPath(); ctx.roundRect(tx-S*.06, ty-S*.38, S*.12, S*.42, S*.03); ctx.fill();
    });
    ctx.fillStyle = '#2e1800';
    tubePositions.forEach(([tx,ty])=>{
      ctx.beginPath(); ctx.arc(tx, ty-S*.38, S*.05, 0, Math.PI*2); ctx.fill();
    });
    // Active rocket(s) if flashing
    if(flash>0){
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.moveTo(-S*.06,-S*.38); ctx.lineTo(0,-S*.58); ctx.lineTo(S*.06,-S*.38); ctx.fill();
      ctx.beginPath(); ctx.moveTo(S*.04,-S*.38); ctx.lineTo(S*.1,-S*.56); ctx.lineTo(S*.16,-S*.38); ctx.fill();
      }
    // Fins
    ctx.fillStyle = '#5a3008';
    [[-S*.3,S*.1],[S*.3,S*.1]].forEach(([fx,fy])=>{
      ctx.beginPath(); ctx.moveTo(fx, fy-S*.12); ctx.lineTo(fx+(fx>0?S*.12:-S*.12), fy+S*.14); ctx.lineTo(fx, fy+S*.08); ctx.fill();
    });
    ctx.restore();
  },

  // FREEZER — cryo-cannon, ice crystal housing, frost vents on sides
  freezer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Ice crystal housing — hexagonal
    ctx.fillStyle = '#1a3a5a';
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2;
      i===0?ctx.moveTo(Math.cos(a)*S*.32, Math.sin(a)*S*.32):ctx.lineTo(Math.cos(a)*S*.32, Math.sin(a)*S*.32);
    }
    ctx.closePath(); ctx.fill();
    // Ice facets
    ctx.fillStyle = '#2a5a8a';
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2;
      i===0?ctx.moveTo(Math.cos(a)*S*.2, Math.sin(a)*S*.2):ctx.lineTo(Math.cos(a)*S*.2, Math.sin(a)*S*.2);
    }
    ctx.closePath(); ctx.fill();
    // Frost sheen
    ctx.fillStyle = 'rgba(180,230,255,0.2)';
    ctx.beginPath(); ctx.ellipse(-S*.08, -S*.1, S*.15, S*.1, -0.5, 0, Math.PI*2); ctx.fill();
    // Cryo barrel — frosted tube
    ctx.fillStyle = flash>0 ? '#a0e8ff' : '#1a4060';
    ctx.beginPath(); ctx.roundRect(-S*.07, -S*.44, S*.14, S*.34, S*.04); ctx.fill();
    // Frost rings on barrel
    ctx.strokeStyle = 'rgba(140,200,255,0.5)'; ctx.lineWidth = S*.025;
    for(let i=0;i<3;i++) {
      ctx.beginPath(); ctx.arc(0, -S*.32+i*S*.1, S*.08, 0, Math.PI*2); ctx.stroke();
    }
    // Ice spray from tip
    if(flash>0){
      ctx.fillStyle = 'rgba(140,220,255,0.7)';
      for(let i=0;i<5;i++){
        const a = -Math.PI/2 + (i-2)*0.2;
        ctx.beginPath(); ctx.moveTo(0,-S*.44); ctx.lineTo(Math.cos(a)*S*.32, Math.sin(a)*S*.32-S*.44); ctx.lineWidth=S*.03; ctx.strokeStyle='rgba(140,220,255,0.7)'; ctx.stroke();
      }
      }
    // Side vent crystals
    ctx.fillStyle = '#5ab0e0';
    [[-S*.32,0],[S*.32,0]].forEach(([vx,vy])=>{
      ctx.beginPath(); ctx.moveTo(vx, vy-S*.08); ctx.lineTo(vx+(vx>0?S*.14:-S*.14), vy); ctx.lineTo(vx, vy+S*.08); ctx.fill();
    });
    ctx.restore();
  },

  // FLAMER — wide nozzle, fuel tank on back, heat fins
  flamer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Fuel tank
    ctx.fillStyle = '#c43a00';
    ctx.beginPath(); ctx.ellipse(0, S*.14, S*.2, S*.26, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e05000';
    ctx.fillRect(-S*.18, S*.04, S*.36, S*.08); // band
    // Warning stripes on tank
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(-S*.18, S*.08, S*.06, S*.04);
    ctx.fillRect(-S*.04, S*.08, S*.06, S*.04);
    ctx.fillRect(S*.1, S*.08, S*.06, S*.04);
    // Main body
    ctx.fillStyle = '#8a2800';
    ctx.beginPath(); ctx.ellipse(0, -S*.04, S*.28, S*.22, 0, 0, Math.PI*2); ctx.fill();
    // Heat fins
    ctx.fillStyle = '#6a2000';
    [[-S*.26,-S*.1],[-S*.22,-S*.2],[S*.26,-S*.1],[S*.22,-S*.2]].forEach(([fx,fy])=>{
      ctx.beginPath(); ctx.roundRect(fx<0?fx-S*.08:fx, fy, S*.08, S*.18, S*.02); ctx.fill();
    });
    // Nozzle — wide, conical
    ctx.fillStyle = '#5a1800';
    ctx.beginPath(); ctx.moveTo(-S*.12, -S*.26); ctx.lineTo(-S*.18, -S*.48); ctx.lineTo(S*.18, -S*.48); ctx.lineTo(S*.12, -S*.26); ctx.closePath(); ctx.fill();
    // Flame — animated
    if(flash>0){
      // t already param
      const flames = [[0,-0.62,0.14],[0.12,-0.58,0.1],[-0.12,-0.58,0.1],[0,-0.72,0.08]];
      flames.forEach(([fx,fy,fr],i)=>{
        ctx.fillStyle = i%2===0?'#ff4400':'#ffaa00';
        ctx.beginPath(); ctx.arc(fx*S, fy*S+Math.sin(t+i)*S*.04, fr*S, 0, Math.PI*2); ctx.fill();
      });
      }
    ctx.restore();
  },

  // TESLA — coil tower, electric arcs, Jacob's ladder design
  tesla(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Base insulator — ceramic look
    ctx.fillStyle = '#2a3048';
    ctx.beginPath(); ctx.arc(0, 0, S*.3, 0, Math.PI*2); ctx.fill();
    // Coil rings
    ctx.strokeStyle = '#3a4068'; ctx.lineWidth = S*.06;
    ctx.beginPath(); ctx.arc(0, 0, S*.22, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#4a5080'; ctx.lineWidth = S*.04;
    ctx.beginPath(); ctx.arc(0, 0, S*.15, 0, Math.PI*2); ctx.stroke();
    // Tower spine
    ctx.fillStyle = '#1e2840';
    ctx.beginPath(); ctx.roundRect(-S*.05, -S*.5, S*.1, S*.46, S*.02); ctx.fill();
    // Top electrode — ball
    ctx.fillStyle = '#6080c8';
    ctx.beginPath(); ctx.arc(0, -S*.5, S*.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(180,200,255,0.4)';
    ctx.beginPath(); ctx.arc(-S*.03, -S*.54, S*.05, 0, Math.PI*2); ctx.fill();
    // Electric arcs when firing
    if(flash>0){
      ctx.strokeStyle = '#88ccff';
      ctx.lineWidth = S*.025; ctx.lineCap = 'round';
      // Zigzag arcs
      for(let arc=0;arc<3;arc++){
        const a = arc/3*Math.PI*2 + Date.now()*.02;
        ctx.beginPath(); ctx.moveTo(0,-S*.5);
        let cx2=0, cy=-S*.5;
        for(let i=0;i<4;i++){
          cx2 += Math.cos(a+i)*S*.2;
          cy -= S*.08;
          ctx.lineTo(cx2, cy);
        }
        ctx.stroke();
      }
      }
    // Side spark gap contacts
    ctx.fillStyle = '#5070b0';
    ctx.beginPath(); ctx.roundRect(-S*.3, -S*.06, S*.14, S*.12, S*.03); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.16, -S*.06, S*.14, S*.12, S*.03); ctx.fill();
    ctx.restore();
  },

  // LASER — sleek cylinder, lens array, targeting beam
  laser(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Smooth casing
    ctx.fillStyle = '#1e1e3a';
    ctx.beginPath(); ctx.ellipse(0, 0, S*.26, S*.3, 0, 0, Math.PI*2); ctx.fill();
    // Metallic sheen
    ctx.fillStyle = 'rgba(100,100,200,0.2)';
    ctx.beginPath(); ctx.ellipse(-S*.08, -S*.1, S*.14, S*.18, -0.5, 0, Math.PI*2); ctx.fill();
    // Lens array — three rings
    ctx.fillStyle = '#0a0a20';
    ctx.beginPath(); ctx.roundRect(-S*.08, -S*.46, S*.16, S*.2, S*.06); ctx.fill();
    [S*.04, S*.07, S*.1].forEach((r,i)=>{
      ctx.strokeStyle = `rgba(80,120,255,${0.8-i*.2})`; ctx.lineWidth = S*.02;
      ctx.beginPath(); ctx.arc(0, -S*.36, r, 0, Math.PI*2); ctx.stroke();
    });
    // Beam
    if(flash>0){
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = S*.04;
      ctx.beginPath(); ctx.moveTo(0, -S*.46); ctx.lineTo(0, -S*.9); ctx.stroke();
      ctx.lineWidth = S*.02; ctx.strokeStyle = '#ffaacc';
      ctx.beginPath(); ctx.moveTo(0, -S*.46); ctx.lineTo(0, -S*.9); ctx.stroke();
      }
    // Cooling vents on sides
    ctx.strokeStyle = '#2a2a50'; ctx.lineWidth = S*.03;
    for(let i=0;i<3;i++){
      ctx.beginPath(); ctx.moveTo(-S*.28, -S*.08+i*S*.14); ctx.lineTo(-S*.22, -S*.08+i*S*.14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(S*.22, -S*.08+i*S*.14); ctx.lineTo(S*.28, -S*.08+i*S*.14); ctx.stroke();
    }
    ctx.restore();
  },

  // MORTAR — stubby wide barrel, recoil system, blast shield
  mortar(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Baseplate
    ctx.fillStyle = '#3a3020';
    ctx.beginPath(); ctx.ellipse(0, S*.2, S*.38, S*.16, 0, 0, Math.PI*2); ctx.fill();
    // Bipod legs
    ctx.strokeStyle = '#2a2210'; ctx.lineWidth = S*.06; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, S*.04); ctx.lineTo(-S*.3, S*.22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, S*.04); ctx.lineTo(S*.3, S*.22); ctx.stroke();
    // Barrel — short and very wide
    ctx.fillStyle = '#4a4030';
    ctx.beginPath(); ctx.roundRect(-S*.18, -S*.38, S*.36, S*.46, S*.06); ctx.fill();
    // Barrel bore
    ctx.fillStyle = '#1a1408';
    ctx.beginPath(); ctx.arc(0, -S*.38, S*.13, 0, Math.PI*2); ctx.fill();
    // Recoil spring
    ctx.strokeStyle = '#6a5a30'; ctx.lineWidth = S*.04;
    for(let i=0;i<5;i++) {
      ctx.beginPath(); ctx.moveTo(-S*.18, -S*.12+i*S*.08); ctx.lineTo(S*.18, -S*.12+i*S*.08); ctx.stroke();
    }
    // Blast shield
    ctx.fillStyle = '#5a4828';
    ctx.beginPath(); ctx.roundRect(-S*.24, -S*.52, S*.12, S*.22, S*.04); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.12, -S*.52, S*.12, S*.22, S*.04); ctx.fill();
    if(flash>0){
      ctx.fillStyle = '#ffaa40';
      ctx.beginPath(); ctx.arc(0, -S*.38, S*.18, -Math.PI, 0); ctx.fill();
      }
    ctx.restore();
  },

  // VENOM — organic living plant-tower, thorns, toxic pods
  venom(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    const _t = t || Date.now()*0.002;
    // Root base
    ctx.strokeStyle = '#2a5a10'; ctx.lineWidth = S*.08; ctx.lineCap = 'round';
    [[-0.28,0.24],[0,0.3],[0.28,0.24]].forEach(([rx,ry])=>{
      ctx.beginPath(); ctx.moveTo(0, S*.14); ctx.quadraticCurveTo(rx*S*.6, ry*S*.8, rx*S, ry*S); ctx.stroke();
    });
    // Bulb body — organic
    ctx.fillStyle = '#2a6a10';
    ctx.beginPath();
    for(let i=0;i<=12;i++){
      const a=(i/12)*Math.PI*2;
      const r=S*(0.28+0.06*Math.sin(a*3+t));
      i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a8a20';
    ctx.beginPath(); ctx.ellipse(-S*.08, -S*.06, S*.18, S*.15, -0.4, 0, Math.PI*2); ctx.fill();
    // Thorns on sides
    ctx.fillStyle = '#1a4008';
    [[-S*.3,-S*.05,0.6],[S*.3,-S*.05,-0.6],[-S*.24,S*.1,0.3],[S*.24,S*.1,-0.3]].forEach(([tx,ty,rot])=>{
      ctx.save(); ctx.translate(tx,ty); ctx.rotate(rot);
      ctx.beginPath(); ctx.moveTo(0,-S*.1); ctx.lineTo(S*.05,S*.08); ctx.lineTo(-S*.05,S*.08); ctx.fill();
      ctx.restore();
    });
    // Poison pod — tip
    ctx.fillStyle = '#60a820';
    ctx.beginPath(); ctx.ellipse(0, -S*.32, S*.1, S*.16, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#88cc30';
    ctx.beginPath(); ctx.ellipse(-S*.04, -S*.37, S*.06, S*.08, -0.2, 0, Math.PI*2); ctx.fill();
    // Squirt
    if(flash>0){
      ctx.strokeStyle = '#aaee40';
      ctx.lineWidth = S*.04; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0,-S*.46); ctx.lineTo(S*.06,-S*.62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,-S*.46); ctx.lineTo(-S*.04,-S*.6); ctx.stroke();
      }
    ctx.restore();
  },

  // OMEGA — massive alien obelisk, four pulsing gems, hovering
  omega(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    const _t = t || Date.now()*0.002;
    // Gravity shadow
    ctx.fillStyle = 'rgba(80,0,180,0.18)';
    ctx.beginPath(); ctx.ellipse(0, S*.28, S*.3, S*.1, 0, 0, Math.PI*2); ctx.fill();
    // Hover offset
    const hov = Math.sin(t)*S*.04;
    ctx.translate(0, hov);
    // Main obelisk — dark, four-sided taper
    ctx.fillStyle = '#0a0018';
    ctx.beginPath(); ctx.moveTo(-S*.14, -S*.5); ctx.lineTo(S*.14, -S*.5); ctx.lineTo(S*.22, S*.3); ctx.lineTo(-S*.22, S*.3); ctx.closePath(); ctx.fill();
    // Purple sheen
    ctx.fillStyle = 'rgba(140,0,220,0.28)'; ctx.beginPath(); ctx.moveTo(-S*.14,-S*.5); ctx.lineTo(S*.14,-S*.5); ctx.lineTo(S*.22,S*.3); ctx.lineTo(-S*.22,S*.3); ctx.closePath(); ctx.fill();
    // Glowing runes — four gems embedded
    [[0,-S*.38,'#ff00aa'],[0,-S*.18,'#aa00ff'],[0,S*.02,'#6600ff'],[0,S*.2,'#3300cc']].forEach(([gx,gy,gc])=>{
      ctx.fillStyle = gc;
      ctx.beginPath(); ctx.moveTo(gx, gy-S*.07); ctx.lineTo(gx+S*.07, gy); ctx.lineTo(gx, gy+S*.07); ctx.lineTo(gx-S*.07, gy); ctx.closePath(); ctx.fill();
      });
    // Apex
    ctx.fillStyle = '#cc00ff';
    ctx.beginPath(); ctx.moveTo(-S*.04,-S*.5); ctx.lineTo(0,-S*.65); ctx.lineTo(S*.04,-S*.5); ctx.fill();
    if(flash>0){
      ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = S*.03;
      ctx.beginPath(); ctx.moveTo(0,-S*.65); ctx.lineTo(0,-S*.95); ctx.stroke();
      }
    ctx.restore();
  },

  // PHANTOM — ghostly spectral cannon, transparent form, purple aura
  phantom(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    const _t = t || Date.now()*0.002;
    // Spectral shimmer rings
    for(let i=2;i>=0;i--){
      ctx.globalAlpha = 0.15-i*.04;
      ctx.fillStyle = '#8833ff';
      ctx.beginPath(); ctx.arc(0, 0, S*(0.28+i*.12)+Math.sin(t+i)*S*.04, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Translucent body
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#4422aa';
    ctx.beginPath(); ctx.arc(0, 0, S*.28, 0, Math.PI*2); ctx.fill();
    // Inner glow - solid approximation, no gradient
    ctx.fillStyle = 'rgba(160,80,255,0.35)'; ctx.beginPath(); ctx.arc(0, 0, S*.18, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // Phase barrel — wispy
    ctx.strokeStyle = flash>0 ? '#ff88ff' : 'rgba(180,100,255,0.7)';
    ctx.lineWidth = S*.08; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -S*.5); ctx.stroke();
    // Skull motif — two eye sockets
    ctx.fillStyle = 'rgba(220,180,255,0.5)';
    ctx.beginPath(); ctx.arc(-S*.1, -S*.06, S*.07, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.1, -S*.06, S*.07, 0, Math.PI*2); ctx.fill();
    if(flash>0){
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(0, -S*.52, S*.1, 0, Math.PI*2); ctx.fill();
      }
    ctx.restore();
  },

  // TEMPORAL — clockwork time-distortion device, spinning gears, hourglass
  temporal(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const _t = t || Date.now()*0.001;
    // Outer gear ring
    ctx.save();
    ctx.rotate(t*0.5);
    ctx.strokeStyle = '#8a7040'; ctx.lineWidth = S*.05;
    ctx.setLineDash([S*.14, S*.08]);
    ctx.beginPath(); ctx.arc(0, 0, S*.36, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // Gear teeth
    ctx.save(); ctx.rotate(-t*0.8);
    ctx.strokeStyle = '#6a5030'; ctx.lineWidth = S*.04;
    ctx.setLineDash([S*.1, S*.1]);
    ctx.beginPath(); ctx.arc(0, 0, S*.28, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    // Center clock face
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath(); ctx.arc(0, 0, S*.2, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#8a7040'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.arc(0, 0, S*.2, 0, Math.PI*2); ctx.stroke();
    // Hour/minute hands
    ctx.strokeStyle = '#e0c060'; ctx.lineWidth = S*.03; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(-Math.PI/2+t)*S*.14, Math.sin(-Math.PI/2+t)*S*.14); ctx.stroke();
    ctx.strokeStyle = '#fff0a0'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(-Math.PI/2+t*3)*S*.18, Math.sin(-Math.PI/2+t*3)*S*.18); ctx.stroke();
    // Center dot
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, 0, S*.04, 0, Math.PI*2); ctx.fill();
    // Hourglass symbol
    if(flash>0){
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = S*.04;
      ctx.beginPath(); ctx.arc(0, 0, S*.38, 0, Math.PI*2); ctx.stroke();
      }
    ctx.restore();
  },

  // REAPER — scythe-mounted turret, bone-white housing, death aura
  reaper(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Base — dark skull platform
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.arc(0, 0, S*.3, 0, Math.PI*2); ctx.fill();
    // Skull face on base
    ctx.fillStyle = '#d4cfc0';
    ctx.beginPath(); ctx.ellipse(0, S*.02, S*.2, S*.18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a2a';
    // Eye sockets
    ctx.beginPath(); ctx.ellipse(-S*.08, -S*.02, S*.06, S*.07, -0.1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S*.08, -S*.02, S*.06, S*.07, 0.1, 0, Math.PI*2); ctx.fill();
    // Nose hole
    ctx.beginPath(); ctx.arc(0, S*.06, S*.03, 0, Math.PI*2); ctx.fill();
    // Scythe blade — crescent
    ctx.fillStyle = flash>0 ? '#ccffcc' : '#8aafa8';
    ctx.beginPath();
    ctx.arc(S*.05, -S*.42, S*.28, -Math.PI*.8, -Math.PI*.05);
    ctx.arc(S*.05, -S*.42, S*.18, -Math.PI*.05, -Math.PI*.8, true);
    ctx.closePath(); ctx.fill();
    // Blade edge highlight
    ctx.strokeStyle = flash>0 ? '#ffffff' : '#c0d8d0'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.arc(S*.05, -S*.42, S*.27, -Math.PI*.8, -Math.PI*.05); ctx.stroke();
    // Handle
    ctx.strokeStyle = '#3a3030'; ctx.lineWidth = S*.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -S*.16); ctx.lineTo(S*.12, -S*.62); ctx.stroke();
    // Soul wisps if active
    if(flash>0){
      ctx.fillStyle = '#88ffaa'; ctx.globalAlpha=0.6;
      ctx.beginPath(); ctx.arc(-S*.14, -S*.32, S*.08, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1; }
    ctx.restore();
  },


  // ── AIR TOWER ART ─────────────────────────────────────────────────────

  // DRONE BAY — floating hexagonal launch pad, spinning rotors, drones orbit
  drone_bay(ctx, x, y, s, angle, flash, t) {
    const S = s; const _t = t || Date.now()*0.002;
    // Drop shadow (air = hovering)
    ctx.fillStyle = 'rgba(0,180,212,0.12)';
    ctx.beginPath(); ctx.ellipse(x, y+S*.55, S*.42, S*.14, 0, 0, Math.PI*2); ctx.fill();
    // Hover offset
    ctx.save(); ctx.translate(x, y + Math.sin(t)*S*.04);
    // Platform — hexagon
    ctx.fillStyle = '#0d3a42';
    ctx.beginPath();
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;i===0?ctx.moveTo(Math.cos(a)*S*.3,Math.sin(a)*S*.3):ctx.lineTo(Math.cos(a)*S*.3,Math.sin(a)*S*.3);}
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = S*.04;
    ctx.beginPath();
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;i===0?ctx.moveTo(Math.cos(a)*S*.3,Math.sin(a)*S*.3):ctx.lineTo(Math.cos(a)*S*.3,Math.sin(a)*S*.3);}
    ctx.closePath(); ctx.stroke();
    // Rotor arms — 4
    ctx.save(); ctx.rotate(t*2);
    ctx.strokeStyle = '#006064'; ctx.lineWidth = S*.05; ctx.lineCap = 'round';
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*S*.38,Math.sin(a)*S*.38);ctx.stroke();}
    // Rotor discs
    ctx.fillStyle = 'rgba(0,200,220,0.35)';
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2;ctx.beginPath();ctx.arc(Math.cos(a)*S*.38,Math.sin(a)*S*.38,S*.1,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    // Center launch tube
    ctx.fillStyle = '#00bcd4';
    ctx.beginPath(); ctx.arc(0,0,S*.1,0,Math.PI*2); ctx.fill();
    // Mini drone orbiting if firing
    if(flash>0){
      const da = t*8;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(da)*S*.5, Math.sin(da)*S*.5, S*.07, 0, Math.PI*2); ctx.fill();
      }
    ctx.restore();
  },

  // APACHE GUNSHIP — rotary wing warbird, stub wings with rocket pods, nose cannon
  apache(ctx, x, y, s, angle, flash, t) {
    const S = s; const _t = t || Date.now()*0.002;
    ctx.fillStyle = 'rgba(100,60,0,0.12)';
    ctx.beginPath(); ctx.ellipse(x, y+S*.6, S*.55, S*.15, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(x, y + Math.sin(t*0.8)*S*.05); ctx.rotate(angle + Math.PI/2);
    // Fuselage
    ctx.fillStyle = '#2d3b1a';
    ctx.beginPath(); ctx.ellipse(0, 0, S*.2, S*.42, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3d5025';
    ctx.beginPath(); ctx.ellipse(-S*.04, -S*.12, S*.14, S*.26, 0, 0, Math.PI*2); ctx.fill();
    // Cockpit bubble
    ctx.fillStyle = '#1a2810';
    ctx.beginPath(); ctx.ellipse(0, -S*.32, S*.14, S*.18, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(100,200,255,0.35)';
    ctx.beginPath(); ctx.ellipse(-S*.04, -S*.36, S*.08, S*.1, -0.2, 0, Math.PI*2); ctx.fill();
    // Stub wings
    ctx.fillStyle = '#2d3b1a';
    ctx.beginPath(); ctx.moveTo(-S*.16,S*.05); ctx.lineTo(-S*.52,-S*.02); ctx.lineTo(-S*.5,S*.12); ctx.lineTo(-S*.16,S*.18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S*.16,S*.05); ctx.lineTo(S*.52,-S*.02); ctx.lineTo(S*.5,S*.12); ctx.lineTo(S*.16,S*.18); ctx.fill();
    // Rocket pods on wings
    ctx.fillStyle = '#1a2410';
    ctx.beginPath(); ctx.roundRect(-S*.52,-S*.04,S*.18,S*.22,S*.04); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.34,-S*.04,S*.18,S*.22,S*.04); ctx.fill();
    if(flash>0){
      ctx.fillStyle='#ff9800'; ctx.beginPath(); ctx.moveTo(-S*.42,-S*.04); ctx.lineTo(-S*.34,-S*.24); ctx.lineTo(-S*.26,-S*.04); ctx.fill();
      ctx.beginPath(); ctx.moveTo(S*.36,-S*.04); ctx.lineTo(S*.43,-S*.24); ctx.lineTo(S*.5,-S*.04); ctx.fill();
      }
    // Tail boom + rotor
    ctx.fillStyle = '#1e2810';
    ctx.beginPath(); ctx.roundRect(-S*.04,S*.38,S*.08,S*.3,S*.02); ctx.fill();
    // Main rotor — spinning
    ctx.save(); ctx.rotate(t*5);
    ctx.strokeStyle='rgba(60,90,30,0.8)'; ctx.lineWidth=S*.04; ctx.lineCap='round';
    for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(i===0?-S*.55:S*.55,0);ctx.lineTo(i===0?S*.55:-S*.55,0);ctx.stroke();}
    ctx.restore();
    // Nose cannon
    ctx.fillStyle = flash>0?'#ffcc00':'#1a2410';
    ctx.beginPath(); ctx.roundRect(-S*.03,-S*.6,S*.06,S*.24,S*.02); ctx.fill();
    ctx.restore();
  },

  // STORMWING — swept delta fighter jet, sharp angles, afterburner glow
  stormwing(ctx, x, y, s, angle, flash, t) {
    const S = s; const _t = t || Date.now()*0.002;
    ctx.fillStyle = 'rgba(80,100,200,0.1)';
    ctx.beginPath(); ctx.ellipse(x, y+S*.58, S*.5, S*.13, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(x, y + Math.sin(t*1.2)*S*.04); ctx.rotate(angle + Math.PI/2);
    // Delta wing body
    ctx.fillStyle = '#2a3060';
    ctx.beginPath();
    ctx.moveTo(0,-S*.55);
    ctx.lineTo(-S*.48,S*.3);
    ctx.lineTo(-S*.18,S*.22);
    ctx.lineTo(0,S*.1);
    ctx.lineTo(S*.18,S*.22);
    ctx.lineTo(S*.48,S*.3);
    ctx.closePath(); ctx.fill();
    // Wing underside lighter
    ctx.fillStyle = '#363c78';
    ctx.beginPath(); ctx.moveTo(0,-S*.45); ctx.lineTo(-S*.38,S*.22); ctx.lineTo(0,S*.04); ctx.lineTo(S*.38,S*.22); ctx.closePath(); ctx.fill();
    // Cockpit — narrow teardrop
    ctx.fillStyle = '#1a1e40';
    ctx.beginPath(); ctx.ellipse(0,-S*.28,S*.08,S*.2,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(120,160,255,0.4)';
    ctx.beginPath(); ctx.ellipse(-S*.02,-S*.3,S*.04,S*.12,-0.15,0,Math.PI*2); ctx.fill();
    // Twin engine nozzles
    ctx.fillStyle='#1a1e40';
    ctx.beginPath(); ctx.roundRect(-S*.14,S*.24,S*.1,S*.2,S*.04); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.04,S*.24,S*.1,S*.2,S*.04); ctx.fill();
    // Afterburner glow
    ctx.fillStyle=flash>0?'#fff':'rgba(255,120,0,0.7)';
    ctx.beginPath(); ctx.arc(-S*.09,S*.46,S*.08,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.09,S*.46,S*.08,0,Math.PI*2); ctx.fill();
    // Missiles under wings
    ctx.fillStyle='#1a1e40';
    ctx.beginPath(); ctx.roundRect(-S*.42,S*.04,S*.06,S*.18,S*.02); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.36,S*.04,S*.06,S*.18,S*.02); ctx.fill();
    ctx.restore();
  },

  // STRATO BOMBER — huge wide-body, four engines, bomb bay doors open
  stratobomber(ctx, x, y, s, angle, flash, t) {
    const S = s; const _t = t || Date.now()*0.002;
    ctx.fillStyle = 'rgba(100,110,120,0.12)';
    ctx.beginPath(); ctx.ellipse(x, y+S*.65, S*.7, S*.18, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(x, y + Math.sin(t*0.6)*S*.05); ctx.rotate(angle + Math.PI/2);
    // Wide fuselage
    ctx.fillStyle = '#3a4248';
    ctx.beginPath(); ctx.ellipse(0, 0, S*.18, S*.52, 0, 0, Math.PI*2); ctx.fill();
    // High-mount swept wings
    ctx.fillStyle = '#2e3840';
    ctx.beginPath(); ctx.moveTo(-S*.1,-S*.08); ctx.lineTo(-S*.75,S*.2); ctx.lineTo(-S*.72,S*.36); ctx.lineTo(-S*.1,S*.18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S*.1,-S*.08); ctx.lineTo(S*.75,S*.2); ctx.lineTo(S*.72,S*.36); ctx.lineTo(S*.1,S*.18); ctx.fill();
    // Four engines under wings
    ctx.fillStyle = '#1e2830';
    [[-S*.55,S*.24],[-S*.36,S*.2],[S*.36,S*.2],[S*.55,S*.24]].forEach(([ex,ey])=>{
      ctx.beginPath(); ctx.roundRect(ex-S*.07,ey,S*.14,S*.2,S*.04); ctx.fill();
      ctx.fillStyle='rgba(255,120,0,'+(flash>0?'0.9':'0.5')+')';
      ctx.beginPath(); ctx.arc(ex,ey+S*.2,S*.06,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1e2830';
    });
    // Cockpit
    ctx.fillStyle='#1e2830';
    ctx.beginPath(); ctx.ellipse(0,-S*.42,S*.1,S*.16,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(150,200,255,0.3)';
    ctx.beginPath(); ctx.ellipse(-S*.02,-S*.44,S*.05,S*.09,-0.1,0,Math.PI*2); ctx.fill();
    // Bomb bay — open if firing
    if(flash>0){
      ctx.fillStyle='#0a1218';
      ctx.beginPath(); ctx.roundRect(-S*.12,S*.08,S*.24,S*.18,S*.02); ctx.fill();
      ctx.fillStyle='#555'; ctx.beginPath(); ctx.ellipse(0,S*.2,S*.08,S*.12,0,0,Math.PI*2); ctx.fill();
      }
    // Tail
    ctx.fillStyle='#2e3840';
    ctx.beginPath(); ctx.moveTo(-S*.06,S*.5); ctx.lineTo(-S*.26,S*.42); ctx.lineTo(-S*.24,S*.56); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S*.06,S*.5); ctx.lineTo(S*.26,S*.42); ctx.lineTo(S*.24,S*.56); ctx.fill();
    ctx.fillStyle='#3a4248';
    ctx.beginPath(); ctx.moveTo(0,S*.52); ctx.lineTo(0,S*.72); ctx.lineTo(S*.04,S*.72); ctx.lineTo(S*.04,S*.52); ctx.fill();
    ctx.restore();
  },

  // SPECTRE AC-130 — lumbering gunship, side-firing cannons, three weapon ports
  spectre(ctx, x, y, s, angle, flash, t) {
    const S = s; const _t = t || Date.now()*0.002;
    ctx.fillStyle = 'rgba(60,80,90,0.14)';
    ctx.beginPath(); ctx.ellipse(x, y+S*.62, S*.65, S*.17, 0, 0, Math.PI*2); ctx.fill();
    ctx.save(); ctx.translate(x, y + Math.sin(t*0.7)*S*.04); ctx.rotate(angle + Math.PI/2);
    // Big fuselage — C-130 style
    ctx.fillStyle = '#2e3a40';
    ctx.beginPath(); ctx.ellipse(0, S*.06, S*.22, S*.55, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a4850';
    ctx.beginPath(); ctx.ellipse(-S*.05, S*.0, S*.14, S*.35, -0.08, 0, Math.PI*2); ctx.fill();
    // High-mounted wings
    ctx.fillStyle = '#252e35';
    ctx.beginPath(); ctx.moveTo(-S*.12,-S*.12); ctx.lineTo(-S*.72,S*.1); ctx.lineTo(-S*.7,S*.28); ctx.lineTo(-S*.12,S*.1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(S*.12,-S*.12); ctx.lineTo(S*.72,S*.1); ctx.lineTo(S*.7,S*.28); ctx.lineTo(S*.12,S*.1); ctx.fill();
    // Four turboprop engines
    ctx.fillStyle='#1a2428';
    [[-S*.62,S*.12],[-S*.44,S*.08],[S*.44,S*.08],[S*.62,S*.12]].forEach(([ex,ey])=>{
      ctx.beginPath(); ctx.ellipse(ex,ey,S*.08,S*.12,0,0,Math.PI*2); ctx.fill();
      // Prop disk
      ctx.fillStyle='rgba(200,220,255,'+(flash>0?'0.6':'0.25')+')';
      ctx.beginPath(); ctx.arc(ex,ey-S*.06,S*.1,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a2428';
    });
    // Three side gun ports — the spectre signature
    ctx.fillStyle='#0e1820';
    ctx.beginPath(); ctx.roundRect(S*.2,-S*.35,S*.1,S*.08,S*.02); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.2,-S*.1,S*.1,S*.08,S*.02); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.2,S*.15,S*.1,S*.1,S*.02); ctx.fill();
    if(flash>0){
      ctx.fillStyle='#fff8c0'; [S*.3,-S*.3,S*.3,-S*.06,S*.3,S*.19].forEach((v,i)=>{
        if(i%2===0) return;
        ctx.beginPath(); ctx.arc(S*.3,v,S*.07,0,Math.PI*2); ctx.fill();
      });
      }
    // Cockpit
    ctx.fillStyle='#1e2830';
    ctx.beginPath(); ctx.ellipse(0,-S*.45,S*.12,S*.15,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(130,180,255,0.3)';
    ctx.beginPath(); ctx.ellipse(-S*.02,-S*.47,S*.06,S*.08,-.1,0,Math.PI*2); ctx.fill();
    ctx.restore();
  },

  // SKY FORTRESS — massive airborne castle, turrets all around, glowing core
  sky_fortress(ctx, x, y, s, angle, flash, t) {
    const S = s; const _t = t || Date.now()*0.002;
    ctx.fillStyle = 'rgba(200,160,0,0.14)';
    ctx.beginPath(); ctx.ellipse(x, y+S*.7, S*.75, S*.2, 0, 0, Math.PI*2); ctx.fill();
    const hov = Math.sin(t)*S*.06;
    ctx.save(); ctx.translate(x, y + hov);
    // Engine glow rings underneath
    for(let i=0;i<4;i++){
      const a = (i/4)*Math.PI*2 + t*0.4;
      ctx.fillStyle='rgba(255,180,0,0.2)';
      ctx.beginPath(); ctx.arc(Math.cos(a)*S*.28, S*.35+Math.sin(a)*S*.08, S*.1, 0, Math.PI*2); ctx.fill();
    }
    // Main hull — wide hexagonal fortress
    ctx.fillStyle = '#2a2218';
    ctx.beginPath();
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2-Math.PI/6;i===0?ctx.moveTo(Math.cos(a)*S*.55,Math.sin(a)*S*.38):ctx.lineTo(Math.cos(a)*S*.55,Math.sin(a)*S*.38);}
    ctx.closePath(); ctx.fill();
    // Wall battlements
    ctx.fillStyle = '#3a3020';
    for(let i=0;i<6;i++){
      const a = i/6*Math.PI*2-Math.PI/6;
      const mx = Math.cos(a)*S*.5, my = Math.sin(a)*S*.35;
      ctx.beginPath(); ctx.roundRect(mx-S*.06, my-S*.1, S*.12, S*.16, S*.02); ctx.fill();
    }
    // Corner turrets — 6
    ctx.fillStyle='#4a4030';
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2;
      const tx=Math.cos(a)*S*.44, ty=Math.sin(a)*S*.3;
      ctx.beginPath(); ctx.arc(tx, ty, S*.1, 0, Math.PI*2); ctx.fill();
      // Turret barrel pointing outward
      ctx.strokeStyle=flash>0?'#ffd700':'#6a6040'; ctx.lineWidth=S*.04; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx+Math.cos(a)*S*.2,ty+Math.sin(a)*S*.14); ctx.stroke();
    }
    // Inner courtyard
    ctx.fillStyle='#1e1a10';
    ctx.beginPath(); ctx.arc(0, 0, S*.28, 0, Math.PI*2); ctx.fill();
    // Central power crystal — animated
    const pulse = S*(0.12 + 0.04*Math.sin(t*3));
    ctx.fillStyle='rgba(255,170,0,0.5)'; ctx.beginPath(); ctx.arc(0,0,pulse*1.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff8d0'; ctx.beginPath(); ctx.arc(0,0,pulse,0,Math.PI*2); ctx.fill();
    // Spinning aura ring
    ctx.save(); ctx.rotate(t);
    ctx.strokeStyle='rgba(255,180,0,0.5)'; ctx.lineWidth=S*.04;
    ctx.setLineDash([S*.18,S*.12]);
    ctx.beginPath(); ctx.arc(0,0,S*.38,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.restore();
  },

  // BANANA FARM — tropical farm tower generating income each round
  banana_farm(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s * 0.42;
    // Dirt mound base
    ctx.fillStyle = '#8b5e3c';
    ctx.beginPath(); ctx.ellipse(0, S*0.55, S*0.85, S*0.32, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#a67c52';
    ctx.beginPath(); ctx.ellipse(0, S*0.5, S*0.72, S*0.24, 0, 0, Math.PI*2); ctx.fill();
    // Trunk
    ctx.fillStyle = '#7a5c28';
    ctx.beginPath(); ctx.roundRect(-S*0.12, -S*0.55, S*0.24, S*1.1, S*0.06); ctx.fill();
    ctx.fillStyle = '#9a7a40';
    ctx.beginPath(); ctx.roundRect(-S*0.05, -S*0.5, S*0.08, S*0.9, S*0.03); ctx.fill();
    // Leaves (palm fronds)
    const leafCols = ['#22a828','#2ec434','#18901e'];
    [[-0.7,-0.6, 0.3],[-0.3,-0.85, -0.1],[0.1,-0.85, -0.3],[0.65,-0.6, 0.4],[0.0,-0.9, 0.0]].forEach(([lx,ly,rot],i)=>{
      ctx.save(); ctx.translate(lx*S, ly*S); ctx.rotate(rot);
      ctx.fillStyle = leafCols[i%3];
      ctx.beginPath(); ctx.ellipse(0,0,S*0.55,S*0.15,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#18801a'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(-S*0.5,0); ctx.lineTo(S*0.5,0); ctx.strokeStyle='#18801a'; ctx.lineWidth=S*0.03; ctx.stroke();
      ctx.restore();
    });
    // Bananas hanging
    const bunches = [[-0.28,-0.22],[0.22,-0.28],[-0.1,-0.08]];
    bunches.forEach(([bx,by])=>{
      ctx.fillStyle = '#f5d020';
      ctx.beginPath(); ctx.ellipse(bx*S, by*S, S*0.18, S*0.09, -0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8b800';
      ctx.beginPath(); ctx.ellipse(bx*S+S*0.04, by*S+S*0.03, S*0.08, S*0.05, 0.3, 0, Math.PI*2); ctx.fill();
    });
    // Coin sparkle if t-animated
    if (t && Math.sin(t*2.5) > 0.7) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#ffd700';
      ctx.font = `bold ${Math.floor(S*0.55)}px sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('$', 0, -S*1.3);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },

  // MONKEY BANK — stone vault building with coin slots
  monkey_bank(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s * 0.38;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, S*1.1, S*0.9, S*0.22, 0, 0, Math.PI*2); ctx.fill();
    // Building body — stone vault
    ctx.fillStyle = '#7a8a9a';
    ctx.beginPath(); ctx.roundRect(-S*0.72, -S*0.7, S*1.44, S*1.65, S*0.12); ctx.fill();
    // Stone texture lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = S*0.04;
    [-0.3,0.0,0.3].forEach(hy => {
      ctx.beginPath(); ctx.moveTo(-S*0.72, hy*S+S*0.15); ctx.lineTo(S*0.72, hy*S+S*0.15); ctx.stroke();
    });
    // Vault door — circular
    ctx.fillStyle = '#c8a030';
    ctx.beginPath(); ctx.arc(0, S*0.2, S*0.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#e0b840';
    ctx.beginPath(); ctx.arc(0, S*0.2, S*0.38, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#a07820'; ctx.lineWidth = S*0.06;
    ctx.beginPath(); ctx.arc(0, S*0.2, S*0.5, 0, Math.PI*2); ctx.stroke();
    // Vault spokes
    ctx.strokeStyle = '#8a6010'; ctx.lineWidth = S*0.05;
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*S*0.14, S*0.2+Math.sin(a)*S*0.14);
      ctx.lineTo(Math.cos(a)*S*0.36, S*0.2+Math.sin(a)*S*0.36); ctx.stroke();
    }
    // Vault center knob
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(0, S*0.2, S*0.12, 0, Math.PI*2); ctx.fill();
    // Bank sign / coin slot on top
    ctx.fillStyle = '#4a5a6a';
    ctx.beginPath(); ctx.roundRect(-S*0.4, -S*0.68, S*0.8, S*0.2, S*0.04); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${Math.floor(S*0.28)}px 'Barlow Condensed',sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('BANK', 0, -S*0.58);
    // Coin slot
    ctx.fillStyle = '#2a3040';
    ctx.beginPath(); ctx.roundRect(-S*0.18, -S*0.45, S*0.36, S*0.07, S*0.02); ctx.fill();
    // Pulsing $ if generating interest
    if (t && Math.sin(t*1.8) > 0.6) {
      ctx.globalAlpha = Math.min(1, (Math.sin(t*1.8)-0.6)*2.5);
      ctx.fillStyle = '#ffd700';
      ctx.font = `bold ${Math.floor(S*0.6)}px sans-serif`;
      ctx.fillText('$', S*0.9, -S*0.5);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },

  // Fallback for owner-only or missing towers
  _default(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    ctx.fillStyle = '#444';
    ctx.beginPath(); ctx.arc(0, 0, S*.3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#666';
    ctx.beginPath(); ctx.roundRect(-S*.06, -S*.38, S*.12, S*.34, S*.02); ctx.fill();
    ctx.restore();
  },

  // CROSSBOW — mechanical wooden crossbow with string tension animation
  crossbow(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Stock — dark walnut grain
    ctx.fillStyle = '#5c3317';
    ctx.beginPath(); ctx.roundRect(-S*.08, -S*.06, S*.16, S*.42, S*.04); ctx.fill();
    ctx.fillStyle = '#7a4422'; // highlight
    ctx.beginPath(); ctx.roundRect(-S*.05, -S*.04, S*.06, S*.36, S*.02); ctx.fill();
    // Crossbar (limbs)
    ctx.fillStyle = '#4a2810';
    ctx.beginPath(); ctx.roundRect(-S*.44, -S*.12, S*.88, S*.09, S*.04); ctx.fill();
    // Limb curves (bent tips)
    ctx.strokeStyle = '#3a1e08'; ctx.lineWidth = S*.07; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-S*.44, -S*.08); ctx.quadraticCurveTo(-S*.52, -S*.22, -S*.48, -S*.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S*.44, -S*.08); ctx.quadraticCurveTo(S*.52, -S*.22, S*.48, -S*.3); ctx.stroke();
    // String (taut when not fired, slack when flash)
    const slack = flash > 0 ? 0.12 : 0;
    ctx.strokeStyle = flash>0 ? '#ffe' : '#c8b880'; ctx.lineWidth = S*.018;
    ctx.beginPath();
    ctx.moveTo(-S*.48, -S*.3);
    ctx.quadraticCurveTo(0, -S*.3 + slack*S, S*.48, -S*.3);
    ctx.stroke();
    // Bolt nocked on string
    ctx.strokeStyle = '#8b6420'; ctx.lineWidth = S*.03;
    ctx.beginPath(); ctx.moveTo(0, -S*.5); ctx.lineTo(0, -S*.04); ctx.stroke();
    ctx.fillStyle = flash>0 ? '#fffacc' : '#aaa890';
    ctx.beginPath(); ctx.moveTo(-S*.04,-S*.5); ctx.lineTo(0,-S*.62); ctx.lineTo(S*.04,-S*.5); ctx.fill();
    // Trigger mechanism
    ctx.fillStyle = '#666';
    ctx.beginPath(); ctx.roundRect(-S*.04, S*.14, S*.08, S*.12, S*.02); ctx.fill();
    if (flash>0) {
      ctx.fillStyle = 'rgba(255,240,150,0.5)';
      ctx.beginPath(); ctx.arc(0, -S*.55, S*.12, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  },

  // CRYOMANCER — hooded ice mage tower with swirling crystal orbs
  cryomancer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Stone base — rough hexagonal pedestal
    ctx.fillStyle = '#2a3a4a';
    for (let i = 0; i < 6; i++) {
      const a = (i/6)*Math.PI*2 - Math.PI/6;
      const r = S*.35;
      i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r + S*.1) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r + S*.1);
    }
    ctx.closePath(); ctx.fill();
    // Ice veins on base
    ctx.strokeStyle = 'rgba(140,220,255,0.3)'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.moveTo(-S*.3, S*.15); ctx.lineTo(-S*.05, 0); ctx.lineTo(-S*.2, -S*.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S*.25, S*.12); ctx.lineTo(S*.08, -S*.02); ctx.lineTo(S*.18, -S*.12); ctx.stroke();
    // Robe — cone shape
    ctx.fillStyle = '#1a2d3a';
    ctx.beginPath();
    ctx.moveTo(0, -S*.55);
    ctx.bezierCurveTo(S*.28, -S*.3, S*.32, S*.05, S*.28, S*.1);
    ctx.lineTo(-S*.28, S*.1);
    ctx.bezierCurveTo(-S*.32, S*.05, -S*.28, -S*.3, 0, -S*.55);
    ctx.fill();
    // Robe highlight
    ctx.fillStyle = '#243c4e';
    ctx.beginPath();
    ctx.moveTo(0, -S*.55);
    ctx.bezierCurveTo(S*.1, -S*.35, S*.12, -S*.05, S*.08, S*.08);
    ctx.lineTo(0, S*.08);
    ctx.bezierCurveTo(-S*.02, -S*.05, -S*.04, -S*.35, 0, -S*.55);
    ctx.fill();
    // Hood
    ctx.fillStyle = '#0e1e2a';
    ctx.beginPath(); ctx.ellipse(0, -S*.52, S*.18, S*.14, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a2e3c';
    ctx.beginPath(); ctx.ellipse(-S*.04, -S*.54, S*.11, S*.09, -0.2, 0, Math.PI*2); ctx.fill();
    // Glowing eyes
    ctx.fillStyle = flash>0 ? '#fff' : '#88ddff';
    ctx.beginPath(); ctx.arc(-S*.06, -S*.52, S*.03, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.06, -S*.52, S*.03, 0, Math.PI*2); ctx.fill();
    // Orbiting ice crystals (animated)
    for (let i = 0; i < 3; i++) {
      const a = T*1.8 + i*(Math.PI*2/3);
      const r = S*.42;
      const cx2 = Math.cos(a)*r, cy2 = Math.sin(a)*r - S*.1;
      ctx.fillStyle = `rgba(${120+Math.sin(a)*80},${200+Math.sin(a)*40},255,0.85)`;
      ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(a*2);
      // Diamond crystal
      ctx.beginPath();
      ctx.moveTo(0, -S*.1); ctx.lineTo(S*.06, 0); ctx.lineTo(0, S*.1); ctx.lineTo(-S*.06, 0);
      ctx.closePath(); ctx.fill();
      // Crystal shine
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.moveTo(0, -S*.1); ctx.lineTo(S*.02, -S*.04); ctx.lineTo(-S*.01, -S*.06); ctx.fill();
      ctx.restore();
    }
    // Freeze ray (on fire)
    if (flash > 0) {
      ctx.save(); ctx.rotate(angle + Math.PI/2);
      ctx.strokeStyle = '#88eeff'; ctx.lineWidth = S*.08; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(0, -S*.5); ctx.lineTo(0, -S*.9); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = S*.03; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(0, -S*.5); ctx.lineTo(0, -S*.9); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  },

  // BUZZSAW — industrial spinning blade tower with animated rotation
  buzzsaw(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Heavy base plate with bolts
    ctx.fillStyle = '#2e2e2e';
    ctx.beginPath(); ctx.arc(0, 0, S*.38, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(0, 0, S*.36, 0, Math.PI*2); ctx.fill();
    // Bolt pattern
    ctx.fillStyle = '#444';
    for (let i = 0; i < 6; i++) {
      const a = i*Math.PI/3;
      ctx.beginPath(); ctx.arc(Math.cos(a)*S*.28, Math.sin(a)*S*.28, S*.04, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.arc(Math.cos(a)*S*.28+S*.01, Math.sin(a)*S*.28+S*.01, S*.02, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#444';
    }
    // Spinning blade — fast rotation with t
    const spinSpeed = flash>0 ? T * 18 : T * 8;
    ctx.save(); ctx.rotate(spinSpeed);
    // Main circular blade
    ctx.fillStyle = '#c8c8c8';
    ctx.beginPath(); ctx.arc(0, 0, S*.26, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath(); ctx.arc(0, 0, S*.24, 0, Math.PI*2); ctx.fill();
    // Blade teeth (8 triangular)
    ctx.fillStyle = '#dde0e0';
    for (let i = 0; i < 8; i++) {
      const a = i*Math.PI/4;
      ctx.save(); ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-S*.04, -S*.22); ctx.lineTo(0, -S*.36); ctx.lineTo(S*.04, -S*.22);
      ctx.fill();
      ctx.restore();
    }
    // Blade highlight (speed lines)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = S*.015;
    for (let i = 0; i < 4; i++) {
      const a = i*Math.PI/2 + 0.3;
      ctx.beginPath(); ctx.arc(0, 0, S*.18, a, a+0.5); ctx.stroke();
    }
    // Center hub
    ctx.fillStyle = '#555';
    ctx.beginPath(); ctx.arc(0, 0, S*.08, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(-S*.02, -S*.02, S*.04, 0, Math.PI*2); ctx.fill();
    ctx.restore(); // end spin rotation
    // Motion blur ring when active
    if (flash > 0) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = S*.04;
      ctx.beginPath(); ctx.arc(0, 0, S*.3, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  },

  // BEACON — tactical support beacon with rotating scan ring
  beacon(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Concrete base
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath(); ctx.roundRect(-S*.3, S*.05, S*.6, S*.32, S*.06); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.roundRect(-S*.25, S*.08, S*.5, S*.06, S*.03); ctx.fill();
    // Central pylon
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(-S*.14, S*.05);
    ctx.lineTo(-S*.1, -S*.55);
    ctx.lineTo(S*.1, -S*.55);
    ctx.lineTo(S*.14, S*.05);
    ctx.fill();
    ctx.fillStyle = '#242438';
    ctx.beginPath(); ctx.roundRect(-S*.06, -S*.52, S*.12, S*.5, S*.02); ctx.fill();
    // Dish (rotates slowly)
    ctx.save(); ctx.translate(0, -S*.42); ctx.rotate(T * 0.5);
    ctx.fillStyle = '#d4a020';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, S*.28, -Math.PI*.7, Math.PI*.7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0b830';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, S*.22, -Math.PI*.65, Math.PI*.65);
    ctx.closePath(); ctx.fill();
    // Dish struts
    ctx.strokeStyle = '#a07818'; ctx.lineWidth = S*.025;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(i*0.5)*S*.28, Math.sin(i*0.5)*S*.28); ctx.stroke();
    }
    // Center emitter
    ctx.fillStyle = flash>0 ? '#fff' : '#ffee44';
    ctx.beginPath(); ctx.arc(0, 0, S*.06, 0, Math.PI*2); ctx.fill();
    ctx.restore(); // end dish rotation
    // Pulse rings
    const pulse = (T*1.5) % 1;
    ctx.globalAlpha = (1-pulse)*0.4;
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = S*.03;
    ctx.beginPath(); ctx.arc(0, -S*.42, S*.3 + pulse*S*.5, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
    // Indicator LEDs
    ctx.fillStyle = '#0f0'; ctx.beginPath(); ctx.arc(-S*.1, -S*.2, S*.025, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#0f0'; ctx.beginPath(); ctx.arc(S*.1, -S*.2, S*.025, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  },

  // PYRE — volcanic stone altar with animated fire
  pyre(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Stone altar base — rough irregular shape
    ctx.fillStyle = '#2d1a0a';
    ctx.beginPath();
    ctx.moveTo(-S*.38, S*.38); ctx.lineTo(-S*.42, S*.1); ctx.lineTo(-S*.28, -S*.1);
    ctx.lineTo(0, -S*.18); ctx.lineTo(S*.28, -S*.1);
    ctx.lineTo(S*.42, S*.1); ctx.lineTo(S*.38, S*.38);
    ctx.closePath(); ctx.fill();
    // Lava cracks
    ctx.strokeStyle = 'rgba(255,80,0,0.6)'; ctx.lineWidth = S*.03;
    ctx.beginPath(); ctx.moveTo(-S*.2, S*.2); ctx.lineTo(-S*.08, S*.05); ctx.lineTo(-S*.15, -S*.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S*.15, S*.25); ctx.lineTo(S*.05, S*.08); ctx.lineTo(S*.18, -S*.04); ctx.stroke();
    // Stone bowl
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.ellipse(0, -S*.12, S*.24, S*.14, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2e1200';
    ctx.beginPath(); ctx.ellipse(0, -S*.14, S*.2, S*.1, 0, 0, Math.PI*2); ctx.fill();
    // Glowing embers in bowl
    ctx.fillStyle = '#ff4400';
    ctx.beginPath(); ctx.ellipse(0, -S*.14, S*.16, S*.07, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.ellipse(0, -S*.15, S*.1, S*.04, 0, 0, Math.PI*2); ctx.fill();
    // Animated flame (3 layers, different speeds)
    for (let fi = 0; fi < 3; fi++) {
      const fT = T * (1.5 + fi * 0.4) + fi * 0.8;
      const fw = S * (0.18 - fi * 0.04);
      const fh = S * (0.32 + fi * 0.08 + Math.sin(fT * 2) * 0.05);
      const fx = Math.sin(fT) * S * 0.06;
      const cols = ['rgba(255,50,0,0.9)','rgba(255,140,0,0.8)','rgba(255,220,50,0.6)'];
      ctx.fillStyle = cols[fi];
      ctx.beginPath();
      ctx.moveTo(fx - fw, -S*.14);
      ctx.quadraticCurveTo(fx - fw*0.5, -S*.14 - fh*0.5, fx, -S*.14 - fh);
      ctx.quadraticCurveTo(fx + fw*0.5, -S*.14 - fh*0.5, fx + fw, -S*.14);
      ctx.fill();
    }
    // Smoke particles
    ctx.fillStyle = 'rgba(60,40,30,0.25)';
    for (let si = 0; si < 3; si++) {
      const sa = T * 0.8 + si * 1.1;
      const sy = -S*.45 - (sa % 1) * S*.3;
      const sx = Math.sin(sa * 3) * S*.12;
      ctx.beginPath(); ctx.arc(sx, sy, S*.04 + si*S*.02, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  },

  // RAILGUN — sci-fi magnetic accelerator with charge coils
  railgun(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    const T = t || 0;
    // Base — sleek angular platform
    ctx.fillStyle = '#0a1520';
    ctx.beginPath();
    ctx.moveTo(-S*.3, S*.32); ctx.lineTo(-S*.38, -S*.04); ctx.lineTo(-S*.28, -S*.14);
    ctx.lineTo(S*.28, -S*.14); ctx.lineTo(S*.38, -S*.04); ctx.lineTo(S*.3, S*.32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0e1e30';
    ctx.beginPath(); ctx.roundRect(-S*.24, -S*.12, S*.48, S*.32, S*.04); ctx.fill();
    // Acceleration coils along barrel (animated charge)
    const coilCount = 5;
    for (let ci = 0; ci < coilCount; ci++) {
      const cy = -S*.12 - ci * S*.1;
      const charge = flash > 0 ? 1 : Math.max(0, (T % 2 - ci * 0.2));
      ctx.strokeStyle = `rgba(0,${150+Math.floor(charge*105)},${180+Math.floor(charge*75)},${0.3+charge*0.7})`;
      ctx.lineWidth = S*.04 + charge * S*.03;
      ctx.beginPath(); ctx.roundRect(-S*.12, cy, S*.24, S*.07, S*.035); ctx.stroke();
    }
    // Main barrel — twin rails
    ctx.fillStyle = '#14283c';
    ctx.beginPath(); ctx.roundRect(-S*.09, -S*.65, S*.07, S*.55, S*.02); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.02, -S*.65, S*.07, S*.55, S*.02); ctx.fill();
    // Rail highlight (teal)
    ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = S*.015;
    ctx.beginPath(); ctx.moveTo(-S*.055, -S*.62); ctx.lineTo(-S*.055, -S*.12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S*.055, -S*.62); ctx.lineTo(S*.055, -S*.12); ctx.stroke();
    // Charge buildup before fire
    if (flash > 0) {
      ctx.fillStyle = 'rgba(0,255,200,0.8)';
      ctx.beginPath(); ctx.arc(0, -S*.65, S*.1, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath(); ctx.arc(0, -S*.65, S*.05, 0, Math.PI*2); ctx.fill();
    } else {
      // Ambient glow between shots
      ctx.globalAlpha = 0.2 + Math.sin(T*3)*0.15;
      ctx.fillStyle = '#00ffcc';
      ctx.beginPath(); ctx.arc(0, -S*.65, S*.06, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Muzzle device
    ctx.fillStyle = '#0a1520';
    ctx.beginPath(); ctx.roundRect(-S*.14, -S*.72, S*.28, S*.1, S*.04); ctx.fill();
    ctx.restore();
  },

  // NECROMANCER — dark wizard tower with orbiting skulls and bone staff
  necromancer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Tomb-stone base — uneven dark stone
    ctx.fillStyle = '#1a1228';
    ctx.beginPath();
    ctx.moveTo(-S*.35, S*.38); ctx.lineTo(-S*.38, S*.1); ctx.lineTo(-S*.3, -S*.08);
    ctx.lineTo(-S*.22, -S*.18); ctx.lineTo(S*.22, -S*.18);
    ctx.lineTo(S*.3, -S*.08); ctx.lineTo(S*.38, S*.1); ctx.lineTo(S*.35, S*.38);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#22183a';
    ctx.beginPath(); ctx.roundRect(-S*.28, -S*.16, S*.56, S*.3, S*.04); ctx.fill();
    // Cracked runes on base
    ctx.strokeStyle = 'rgba(150,50,220,0.4)'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.moveTo(-S*.2, S*.1); ctx.lineTo(-S*.08, -S*.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S*.18, S*.08); ctx.lineTo(S*.06, -S*.04); ctx.stroke();
    // Robe body (hunched figure)
    ctx.fillStyle = '#100820';
    ctx.beginPath();
    ctx.moveTo(0, -S*.58);
    ctx.bezierCurveTo(S*.35, -S*.4, S*.38, S*.0, S*.32, S*.1);
    ctx.lineTo(-S*.32, S*.1);
    ctx.bezierCurveTo(-S*.38, S*.0, -S*.35, -S*.4, 0, -S*.58);
    ctx.fill();
    ctx.fillStyle = '#1a1030';
    ctx.beginPath();
    ctx.moveTo(0, -S*.58);
    ctx.bezierCurveTo(S*.12, -S*.42, S*.14, -S*.08, S*.1, S*.08);
    ctx.lineTo(-S*.1, S*.08);
    ctx.bezierCurveTo(-S*.14, -S*.08, -S*.12, -S*.42, 0, -S*.58);
    ctx.fill();
    // Staff — held forward at aim angle
    ctx.save(); ctx.rotate(angle + Math.PI/2);
    ctx.strokeStyle = '#4a3060'; ctx.lineWidth = S*.05; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -S*.15); ctx.lineTo(0, -S*.62); ctx.stroke();
    // Skull atop staff
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath(); ctx.arc(0, -S*.66, S*.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a1228'; // eye sockets
    ctx.beginPath(); ctx.arc(-S*.04, -S*.67, S*.03, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.04, -S*.67, S*.03, 0, Math.PI*2); ctx.fill();
    // Death orb on skull
    ctx.fillStyle = flash>0 ? '#cc00ff' : 'rgba(120,0,200,0.7)';
    ctx.beginPath(); ctx.arc(0, -S*.74, S*.05, 0, Math.PI*2); ctx.fill();
    if (flash>0) {
      ctx.fillStyle = 'rgba(200,100,255,0.5)';
      ctx.beginPath(); ctx.arc(0, -S*.74, S*.1, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // Hood
    ctx.fillStyle = '#080614';
    ctx.beginPath(); ctx.ellipse(0, -S*.52, S*.2, S*.16, 0, 0, Math.PI*2); ctx.fill();
    // Glowing eye
    ctx.fillStyle = flash>0 ? '#ee88ff' : '#8833cc';
    ctx.beginPath(); ctx.arc(0, -S*.52, S*.04, 0, Math.PI*2); ctx.fill();
    // Orbiting mini-skulls
    for (let oi = 0; oi < 2; oi++) {
      const oa = T * 2.5 + oi * Math.PI;
      const or = S*.44;
      const ox = Math.cos(oa)*or, oy = Math.sin(oa)*or - S*.1;
      ctx.save(); ctx.translate(ox, oy);
      ctx.fillStyle = '#ddd5c5';
      ctx.beginPath(); ctx.arc(0, 0, S*.08, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1228';
      ctx.beginPath(); ctx.arc(-S*.03, 0, S*.025, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(S*.03, 0, S*.025, 0, Math.PI*2); ctx.fill();
      // Skull trail
      ctx.fillStyle = 'rgba(120,0,180,0.3)';
      ctx.beginPath(); ctx.arc(-Math.cos(oa)*S*.1, -Math.sin(oa)*S*.1, S*.06, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  },

  // STORMCALLER — elemental storm tower, swirling wind vortex + lightning rod
  stormcaller(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Rocky pedestal
    ctx.fillStyle = '#1c2a38';
    ctx.beginPath();
    ctx.moveTo(-S*.32, S*.38); ctx.lineTo(-S*.4, S*.06); ctx.lineTo(-S*.26, -S*.14);
    ctx.lineTo(0, -S*.2); ctx.lineTo(S*.26, -S*.14); ctx.lineTo(S*.4, S*.06); ctx.lineTo(S*.32, S*.38);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#243444';
    ctx.beginPath(); ctx.roundRect(-S*.26, -S*.12, S*.52, S*.26, S*.04); ctx.fill();
    // Storm core — swirling animated ring
    ctx.save(); ctx.rotate(T * 1.4);
    for (let wi = 0; wi < 6; wi++) {
      const wa = wi * Math.PI / 3;
      const wr = S*.24, wr2 = S*.32;
      ctx.strokeStyle = `rgba(80,160,255,${0.15 + wi*0.05})`;
      ctx.lineWidth = S*.04;
      ctx.beginPath();
      ctx.arc(0, -S*.08, wr + wi*S*.01, wa, wa + Math.PI*.8);
      ctx.stroke();
    }
    ctx.restore();
    // Lightning rod (aim-tracked)
    ctx.save(); ctx.rotate(angle + Math.PI/2);
    // Metallic mast
    ctx.fillStyle = '#344858';
    ctx.beginPath();
    ctx.moveTo(-S*.06, S*.05);
    ctx.lineTo(-S*.04, -S*.5);
    ctx.lineTo(S*.04, -S*.5);
    ctx.lineTo(S*.06, S*.05);
    ctx.fill();
    // Mast edge highlight
    ctx.strokeStyle = '#4a6880'; ctx.lineWidth = S*.02;
    ctx.beginPath(); ctx.moveTo(-S*.04, -S*.48); ctx.lineTo(-S*.04, S*.03); ctx.stroke();
    // Tesla coils on mast
    ctx.strokeStyle = '#3a6090'; ctx.lineWidth = S*.035;
    for (let ci = 0; ci < 3; ci++) {
      const cy = -S*.15 - ci * S*.12;
      ctx.beginPath(); ctx.roundRect(-S*.1, cy, S*.2, S*.055, S*.025); ctx.stroke();
    }
    // Lightning fork at tip
    if (flash > 0) {
      ctx.strokeStyle = '#aae0ff'; ctx.lineWidth = S*.04; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -S*.5);
      ctx.lineTo(-S*.06, -S*.62); ctx.lineTo(S*.02, -S*.68);
      ctx.lineTo(-S*.04, -S*.78);
      ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = S*.02;
      ctx.beginPath();
      ctx.moveTo(0, -S*.5);
      ctx.lineTo(-S*.06, -S*.62); ctx.lineTo(S*.02, -S*.68);
      ctx.lineTo(-S*.04, -S*.78);
      ctx.stroke();
      // Charge burst
      ctx.fillStyle = 'rgba(150,220,255,0.4)';
      ctx.beginPath(); ctx.arc(0, -S*.5, S*.12, 0, Math.PI*2); ctx.fill();
    } else {
      // Ambient charge glow
      ctx.globalAlpha = 0.3 + Math.sin(T*4)*0.2;
      ctx.fillStyle = '#4499ff';
      ctx.beginPath(); ctx.arc(0, -S*.5, S*.05, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // Storm clouds around (subtle)
    for (let ci = 0; ci < 3; ci++) {
      const ca = T * 0.6 + ci * Math.PI * 2 / 3;
      const cr = S*.38;
      ctx.fillStyle = `rgba(50,80,120,${0.25 + Math.sin(ca)*0.1})`;
      ctx.beginPath(); ctx.arc(Math.cos(ca)*cr, Math.sin(ca)*cr - S*.08, S*.1, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  },

  // ═══════════════ v14 NEW TOWER ART ═══════════════

  // SPIKER — squat catapult-style caltrop launcher, weathered wood + iron
  spiker(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s; const T = t||0;
    // Wheeled base
    ctx.fillStyle = '#3a2c18';
    ctx.beginPath(); ctx.roundRect(-S*.32, -S*.08, S*.64, S*.42, S*.04); ctx.fill();
    // Wheel bolts
    ctx.fillStyle = '#5a4628';
    [-S*.22, S*.22].forEach(wx => {
      ctx.beginPath(); ctx.arc(wx, S*.22, S*.14, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2a1c08';
      ctx.beginPath(); ctx.arc(wx, S*.22, S*.09, 0, Math.PI*2); ctx.fill();
      // Spokes
      ctx.strokeStyle = '#4a3c1c'; ctx.lineWidth = S*.025;
      for (let sp=0;sp<4;sp++){
        const sa=sp*Math.PI/2+T*0.3;
        ctx.beginPath(); ctx.moveTo(wx,S*.22); ctx.lineTo(wx+Math.cos(sa)*S*.08, S*.22+Math.sin(sa)*S*.08); ctx.stroke();
      }
      ctx.fillStyle = '#5a4628';
    });
    // Arm (catapult)
    const armAngle = flash>0 ? -0.7 : 0.2;
    ctx.save(); ctx.translate(0, S*.02); ctx.rotate(armAngle);
    ctx.fillStyle = '#4a3418';
    ctx.beginPath(); ctx.roundRect(-S*.05, -S*.52, S*.1, S*.54, S*.04); ctx.fill();
    // Spike bucket at top
    ctx.fillStyle = '#808080';
    ctx.beginPath(); ctx.arc(0, -S*.52, S*.1, 0, Math.PI*2); ctx.fill();
    // Spikes in bucket
    ctx.fillStyle = '#b0b0b0';
    for (let si=0;si<4;si++){
      const sa=si*Math.PI/2;
      ctx.beginPath(); ctx.moveTo(Math.cos(sa)*S*.06,-S*.52+Math.sin(sa)*S*.06);
      ctx.lineTo(Math.cos(sa)*S*.12,-S*.52+Math.sin(sa)*S*.12); ctx.lineWidth=S*.03; ctx.stroke();
    }
    if (flash>0) {
      ctx.fillStyle='rgba(255,240,180,0.5)';
      ctx.beginPath(); ctx.arc(0,-S*.52,S*.18,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // Tension cord
    ctx.strokeStyle='#a08040'; ctx.lineWidth=S*.025;
    ctx.beginPath(); ctx.moveTo(-S*.28,S*.02); ctx.quadraticCurveTo(0,-S*.05+armAngle*S*.1,S*.28,S*.02); ctx.stroke();
    ctx.restore();
  },

  // CHRONO TOWER — ancient brass clockwork with spinning gear rings
  chrono(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s; const T = t||0;
    // Stone plinth with rune carvings
    ctx.fillStyle = '#1e1e2a';
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2-Math.PI/6, r=S*.38;
      i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r+S*.05):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r+S*.05);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(0,200,180,0.2)'; ctx.lineWidth=S*.025;
    // Carved rune lines
    for(let i=0;i<6;i++){
      const a=i/6*Math.PI*2, r1=S*.22, r2=S*.34;
      ctx.beginPath(); ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1); ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2); ctx.stroke();
    }
    // Outer gear ring — counter-rotates
    ctx.save(); ctx.rotate(-T*0.4);
    ctx.strokeStyle='#c09030'; ctx.lineWidth=S*.05;
    ctx.beginPath(); ctx.arc(0,0,S*.3,0,Math.PI*2); ctx.stroke();
    for(let i=0;i<12;i++){
      const ga=i/12*Math.PI*2;
      const gr1=S*.26, gr2=S*.35;
      ctx.fillStyle='#c09030';
      ctx.beginPath();
      ctx.moveTo(Math.cos(ga-0.15)*gr1, Math.sin(ga-0.15)*gr1);
      ctx.lineTo(Math.cos(ga)*gr2, Math.sin(ga)*gr2);
      ctx.lineTo(Math.cos(ga+0.15)*gr1, Math.sin(ga+0.15)*gr1);
      ctx.fill();
    }
    ctx.restore();
    // Middle gear ring — rotates forward
    ctx.save(); ctx.rotate(T*0.8);
    ctx.strokeStyle='#a07820'; ctx.lineWidth=S*.04;
    ctx.beginPath(); ctx.arc(0,0,S*.2,0,Math.PI*2); ctx.stroke();
    for(let i=0;i<8;i++){
      const ga=i/8*Math.PI*2;
      ctx.fillStyle='#a07820';
      ctx.beginPath(); ctx.arc(Math.cos(ga)*S*.2, Math.sin(ga)*S*.2, S*.03,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // Clock face
    ctx.fillStyle='#0e0e18';
    ctx.beginPath(); ctx.arc(0,0,S*.16,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,220,200,0.6)'; ctx.lineWidth=S*.015;
    ctx.beginPath(); ctx.arc(0,0,S*.14,0,Math.PI*2); ctx.stroke();
    // Clock hands (spin fast when firing)
    const hourA = T*0.5, minA = T*2.5;
    ctx.strokeStyle='#00e5cc'; ctx.lineWidth=S*.025; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(hourA-Math.PI/2)*S*.09, Math.sin(hourA-Math.PI/2)*S*.09); ctx.stroke();
    ctx.strokeStyle='#80fff0'; ctx.lineWidth=S*.015;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(minA-Math.PI/2)*S*.12, Math.sin(minA-Math.PI/2)*S*.12); ctx.stroke();
    // Center jewel
    ctx.fillStyle = flash>0 ? '#fff' : '#00e5cc';
    ctx.beginPath(); ctx.arc(0,0,S*.03,0,Math.PI*2); ctx.fill();
    // Chrono pulse when active
    if (flash>0) {
      ctx.globalAlpha=0.3; ctx.strokeStyle='#00e5cc'; ctx.lineWidth=S*.05;
      ctx.beginPath(); ctx.arc(0,0,S*.5,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.restore();
  },

  // MAGNETRON — industrial electromagnet tower, U-shaped with sparks
  magnet(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s; const T = t||0;
    // Heavy base
    ctx.fillStyle = '#2a1825';
    ctx.beginPath(); ctx.roundRect(-S*.32, S*.0, S*.64, S*.38, S*.05); ctx.fill();
    ctx.fillStyle = '#3a2235';
    ctx.beginPath(); ctx.roundRect(-S*.26, S*.04, S*.52, S*.1, S*.03); ctx.fill();
    // U-shaped magnet body
    ctx.fillStyle = '#cc2255';
    // Left arm
    ctx.beginPath(); ctx.roundRect(-S*.28, -S*.52, S*.18, S*.56, S*.05); ctx.fill();
    // Right arm
    ctx.beginPath(); ctx.roundRect(S*.1, -S*.52, S*.18, S*.56, S*.05); ctx.fill();
    // Bridge
    ctx.beginPath(); ctx.roundRect(-S*.28, -S*.06, S*.56, S*.18, S*.04); ctx.fill();
    // Coil windings
    ctx.strokeStyle = '#880022'; ctx.lineWidth = S*.04;
    for(let wi=0;wi<4;wi++){
      const wy = -S*.42 + wi*S*.1;
      ctx.beginPath(); ctx.roundRect(-S*.27,wy,S*.16,S*.07,S*.03); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(S*.11,wy,S*.16,S*.07,S*.03); ctx.stroke();
    }
    // Pole tips — glowing
    const glow = 0.5 + Math.sin(T*4)*0.3;
    ctx.fillStyle = `rgba(255,${80+Math.floor(glow*60)},${120+Math.floor(glow*40)},${0.8+glow*0.2})`;
    ctx.beginPath(); ctx.roundRect(-S*.28,-S*.56,S*.18,S*.1,S*.04); ctx.fill();
    ctx.beginPath(); ctx.roundRect(S*.1,-S*.56,S*.18,S*.1,S*.04); ctx.fill();
    // Spark arc between poles when firing
    if (flash>0) {
      ctx.strokeStyle='#ff80c0'; ctx.lineWidth=S*.04;
      ctx.beginPath();
      ctx.moveTo(-S*.18,-S*.52);
      ctx.quadraticCurveTo(0,-S*.78,S*.18,-S*.52);
      ctx.stroke();
      ctx.strokeStyle='#fff'; ctx.lineWidth=S*.015;
      ctx.beginPath();
      ctx.moveTo(-S*.18,-S*.52);
      ctx.quadraticCurveTo(0,-S*.78,S*.18,-S*.52);
      ctx.stroke();
    } else {
      // Idle static spark
      ctx.globalAlpha=0.2+glow*0.3;
      ctx.strokeStyle='#ff4488'; ctx.lineWidth=S*.02;
      ctx.beginPath(); ctx.moveTo(-S*.18,-S*.52); ctx.quadraticCurveTo(0,-S*.64,S*.18,-S*.52); ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.restore();
  },

  // ARTILLERY CANNON — massive siege gun on rotating platform
  artillery(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s; const T = t||0;
    // Sandbag fortification base
    ctx.fillStyle = '#5a4828';
    ctx.beginPath(); ctx.ellipse(0, S*.18, S*.4, S*.22, 0, 0, Math.PI*2); ctx.fill();
    // Individual sandbag bumps
    ctx.fillStyle = '#6a5838';
    for(let bi=0;bi<7;bi++){
      const ba = bi/7*Math.PI*2;
      ctx.beginPath(); ctx.ellipse(Math.cos(ba)*S*.3, S*.18+Math.sin(ba)*S*.14, S*.12, S*.08, ba, 0, Math.PI*2); ctx.fill();
    }
    // Rotating platform
    ctx.fillStyle = '#3a3028';
    ctx.beginPath(); ctx.ellipse(0, S*.04, S*.28, S*.14, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2a2018';
    ctx.beginPath(); ctx.arc(0, S*.04, S*.12, 0, Math.PI*2); ctx.fill();
    // Barrel shield
    ctx.fillStyle = '#4a3e2c';
    ctx.beginPath();
    ctx.moveTo(-S*.22, -S*.05); ctx.lineTo(-S*.26, -S*.32); ctx.lineTo(S*.26, -S*.32); ctx.lineTo(S*.22, -S*.05);
    ctx.fill();
    ctx.fillStyle = '#3a2e1c';
    ctx.beginPath(); ctx.roundRect(-S*.2, -S*.3, S*.4, S*.08, S*.02); ctx.fill();
    // Massive barrel
    const recoil = flash>0 ? S*.1 : 0;
    ctx.fillStyle = '#2a2418';
    ctx.beginPath(); ctx.roundRect(-S*.12, -S*.28+recoil, S*.24, S*.3, S*.05); ctx.fill();
    ctx.fillStyle = '#3a3428';
    ctx.beginPath(); ctx.roundRect(-S*.09, -S*.28+recoil, S*.1, S*.28, S*.04); ctx.fill();
    // Barrel rings
    ctx.strokeStyle = '#1e1810'; ctx.lineWidth = S*.04;
    [-.2,-.1,.0].forEach(ry => {
      ctx.beginPath(); ctx.roundRect(-S*.12, ry+recoil, S*.24, S*.04, S*.02); ctx.stroke();
    });
    // Muzzle brake
    ctx.fillStyle = '#1a1408';
    ctx.beginPath(); ctx.roundRect(-S*.15, -S*.3+recoil, S*.3, S*.06, S*.02); ctx.fill();
    // Muzzle blast
    if(flash>0){
      ctx.fillStyle='rgba(255,220,80,0.8)';
      ctx.beginPath(); ctx.arc(0,-S*.3+recoil,S*.16,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,200,0.9)';
      ctx.beginPath(); ctx.arc(0,-S*.3+recoil,S*.08,0,Math.PI*2); ctx.fill();
      // Shockwave ring
      ctx.strokeStyle='rgba(255,200,50,0.4)'; ctx.lineWidth=S*.04;
      ctx.beginPath(); ctx.arc(0,-S*.3+recoil,S*.28,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  },

  // INFECTOR — glass bio-containment tower with pulsing pathogen pods
  infector(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s; const T = t||0;
    // Lab base — industrial metal
    ctx.fillStyle = '#182820';
    ctx.beginPath(); ctx.roundRect(-S*.3, S*.0, S*.6, S*.38, S*.06); ctx.fill();
    ctx.fillStyle = '#223c2c';
    ctx.beginPath(); ctx.roundRect(-S*.24, S*.04, S*.48, S*.1, S*.04); ctx.fill();
    // Warning stripes
    ctx.fillStyle = '#e0c020';
    for(let ws=0;ws<3;ws++){
      ctx.beginPath(); ctx.roundRect(-S*.3+ws*S*.2, S*.0, S*.08, S*.06, S*.01); ctx.fill();
    }
    // Bio containment vessel (aimed)
    ctx.save(); ctx.rotate(angle + Math.PI/2);
    // Glass cylinder
    ctx.strokeStyle='rgba(80,220,120,0.5)'; ctx.lineWidth=S*.06;
    ctx.beginPath(); ctx.roundRect(-S*.12,-S*.48,S*.24,S*.48,S*.06); ctx.stroke();
    ctx.fillStyle='rgba(20,40,25,0.7)';
    ctx.beginPath(); ctx.roundRect(-S*.09,-S*.45,S*.18,S*.42,S*.04); ctx.fill();
    // Glowing pathogen inside
    const pulseR = 0.6+Math.sin(T*3)*0.25;
    ctx.fillStyle=`rgba(60,${200+Math.floor(pulseR*40)},80,${pulseR})`;
    ctx.beginPath(); ctx.arc(0,-S*.24,S*.07+pulseR*S*.02,0,Math.PI*2); ctx.fill();
    // Bubbles rising
    for(let bi=0;bi<3;bi++){
      const by = -S*.12 - ((T*0.5+bi*0.33)%1)*S*.3;
      ctx.fillStyle=`rgba(80,220,100,${0.3+bi*0.1})`;
      ctx.beginPath(); ctx.arc((bi-1)*S*.04,by,S*.02,0,Math.PI*2); ctx.fill();
    }
    // Metal casing rings
    ctx.strokeStyle='#2a4a30'; ctx.lineWidth=S*.04;
    [-S*.38,-S*.2,-S*.05].forEach(ry=>{
      ctx.beginPath(); ctx.roundRect(-S*.12,ry,S*.24,S*.06,S*.02); ctx.stroke();
    });
    // Launch nozzle
    ctx.fillStyle='#1a3020';
    ctx.beginPath(); ctx.roundRect(-S*.07,-S*.52,S*.14,S*.08,S*.02); ctx.fill();
    if(flash>0){
      ctx.fillStyle='rgba(80,255,120,0.6)';
      ctx.beginPath(); ctx.arc(0,-S*.5,S*.12,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  },

  // STONE GOLEM — massive hunched creature that stomps; no barrel needed
  golem(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s; const T = t||0;
    // Ground crack / impact radius when stomping
    if(flash>0){
      ctx.strokeStyle='rgba(180,150,100,0.5)'; ctx.lineWidth=S*.03;
      for(let ci=0;ci<5;ci++){
        const ca=ci/5*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(Math.cos(ca)*S*.12,Math.sin(ca)*S*.12+S*.18);
        ctx.lineTo(Math.cos(ca)*S*.44,Math.sin(ca)*S*.22+S*.2); ctx.stroke();
      }
    }
    // Legs
    ctx.fillStyle='#5a5040';
    [-S*.16,S*.16].forEach(lx=>{
      ctx.beginPath(); ctx.roundRect(lx-S*.12, S*.1, S*.24, S*.3, S*.06); ctx.fill();
      // Foot
      ctx.fillStyle='#6a6050';
      ctx.beginPath(); ctx.ellipse(lx, S*.4, S*.16, S*.1, 0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5a5040';
    });
    // Body torso
    ctx.fillStyle='#6a6050';
    ctx.beginPath();
    ctx.moveTo(-S*.3, S*.12); ctx.lineTo(-S*.36, -S*.22); ctx.lineTo(-S*.28, -S*.42);
    ctx.lineTo(S*.28, -S*.42); ctx.lineTo(S*.36, -S*.22); ctx.lineTo(S*.3, S*.12);
    ctx.fill();
    ctx.fillStyle='#7a7060';
    ctx.beginPath();
    ctx.moveTo(-S*.18, S*.1); ctx.lineTo(-S*.2, -S*.38); ctx.lineTo(S*.2, -S*.38); ctx.lineTo(S*.18, S*.1);
    ctx.fill();
    // Stone texture cracks on body
    ctx.strokeStyle='rgba(40,35,25,0.6)'; ctx.lineWidth=S*.02;
    ctx.beginPath(); ctx.moveTo(-S*.1,-S*.3); ctx.lineTo(S*.06,-S*.1); ctx.lineTo(-S*.05,S*.0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S*.08,-S*.25); ctx.lineTo(S*.18,-S*.05); ctx.stroke();
    // Arms — raised for stomp
    const armLift = flash>0 ? -0.6 : Math.sin(T*0.8)*0.1;
    [-1,1].forEach(side=>{
      ctx.save(); ctx.translate(side*S*.32, -S*.22); ctx.rotate(side*(0.5+armLift));
      ctx.fillStyle='#5a5040';
      ctx.beginPath(); ctx.roundRect(-S*.1,-S*.32,S*.2,S*.38,S*.07); ctx.fill();
      // Fist
      ctx.fillStyle='#7a6a55';
      ctx.beginPath(); ctx.arc(0,-S*.36,S*.14,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#6a5c48';
      // Knuckle bumps
      for(let ki=0;ki<3;ki++){
        ctx.beginPath(); ctx.arc((ki-1)*S*.06,-S*.44,S*.04,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });
    // Head — massive boulder
    ctx.fillStyle='#6a6050';
    ctx.beginPath(); ctx.arc(0,-S*.48, S*.22, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='#7a7060';
    ctx.beginPath(); ctx.arc(-S*.05,-S*.52, S*.14, 0, Math.PI*2); ctx.fill();
    // Eyes — glowing orange
    ctx.fillStyle = flash>0 ? '#ffff80' : '#e08020';
    ctx.beginPath(); ctx.arc(-S*.08,-S*.48,S*.05,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.08,-S*.48,S*.05,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.beginPath(); ctx.arc(-S*.08,-S*.48,S*.025,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.08,-S*.48,S*.025,0,Math.PI*2); ctx.fill();
    // Stomp dust
    if(flash>0){
      ctx.fillStyle='rgba(160,140,100,0.3)';
      for(let di=0;di<4;di++){
        const da=di/4*Math.PI*2;
        ctx.beginPath(); ctx.arc(Math.cos(da)*S*.35, S*.35+Math.sin(da)*S*.12, S*.08,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  },

  // CANNON — classic iron siege cannon on wooden carriage
  cannon(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    // Wooden carriage wheels
    ctx.fillStyle = '#6b4a1e';
    ctx.beginPath(); ctx.ellipse(-S*.28, S*.2, S*.12, S*.12, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(S*.28, S*.2, S*.12, S*.12, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#3a2a0e'; ctx.lineWidth = S*.035;
    ctx.beginPath(); ctx.ellipse(-S*.28, S*.2, S*.12, S*.12, 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(S*.28, S*.2, S*.12, S*.12, 0, 0, Math.PI*2); ctx.stroke();
    // Wheel spokes
    ctx.strokeStyle = '#4a3010'; ctx.lineWidth = S*.02;
    for(let i=0;i<4;i++){
      const a = i/4*Math.PI*2;
      [-S*.28, S*.28].forEach(wx=>{
        ctx.beginPath(); ctx.moveTo(wx, S*.2); ctx.lineTo(wx+Math.cos(a)*S*.1, S*.2+Math.sin(a)*S*.1); ctx.stroke();
      });
    }
    // Carriage body
    ctx.fillStyle = '#7a5c28';
    ctx.beginPath(); ctx.roundRect(-S*.32, -S*.04, S*.64, S*.2, S*.03); ctx.fill();
    ctx.fillStyle = '#5a3c10';
    ctx.fillRect(-S*.32, -S*.04, S*.64, S*.03);
    // Cannon barrel — big iron tube
    ctx.fillStyle = flash>0 ? '#cc9944' : '#444455';
    ctx.beginPath(); ctx.roundRect(-S*.09, -S*.6, S*.18, S*.55, S*.05); ctx.fill();
    // Barrel band rings
    ctx.strokeStyle = '#2a2a35'; ctx.lineWidth = S*.035; ctx.lineCap = 'butt';
    [-.5, -.3, -.12].forEach(ry => {
      ctx.beginPath(); ctx.roundRect(-S*.1, ry*S, S*.2, S*.04, S*.01); ctx.stroke();
    });
    // Muzzle — wider bell shape
    ctx.fillStyle = flash>0 ? '#ffdd88' : '#333344';
    ctx.beginPath(); ctx.ellipse(0, -S*.6, S*.12, S*.09, 0, 0, Math.PI*2); ctx.fill();
    // Muzzle flash
    if(flash>0){
      ctx.fillStyle='rgba(255,200,80,0.8)';
      ctx.beginPath(); ctx.ellipse(0, -S*.7, S*.18, S*.14, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,200,0.6)';
      ctx.beginPath(); ctx.ellipse(0, -S*.7, S*.1, S*.08, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  },

  // WATCHTOWER — tall stone castle tower with battlements and arrow slits
  watchtower(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, S*.38, S*.28, S*.08, 0, 0, Math.PI*2); ctx.fill();
    // Main tower body — tall rectangle
    ctx.fillStyle = '#8a9aaa';
    ctx.beginPath(); ctx.roundRect(-S*.2, -S*.55, S*.4, S*.9, S*.02); ctx.fill();
    // Stone texture lines
    ctx.strokeStyle = '#707880'; ctx.lineWidth = S*.015;
    for(let i=0;i<5;i++){
      const hy = -S*.45 + i*S*.16;
      ctx.beginPath(); ctx.moveTo(-S*.2, hy); ctx.lineTo(S*.2, hy); ctx.stroke();
    }
    for(let i=0;i<3;i++){
      ctx.beginPath(); ctx.moveTo(-S*.05+i*S*.1, -S*.55); ctx.lineTo(-S*.05+i*S*.1, S*.35); ctx.stroke();
    }
    // Arrow slit windows
    ctx.fillStyle = '#1a2530';
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.38, S*.08, S*.2, S*.02); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.1, S*.06, S*.14, S*.02); ctx.fill();
    // Battlement top
    ctx.fillStyle = '#9aaabb';
    [-S*.18, -S*.06, S*.06].forEach(bx => {
      ctx.beginPath(); ctx.roundRect(bx, -S*.62, S*.08, S*.1, S*.01); ctx.fill();
    });
    // Archer figure on top
    ctx.fillStyle = '#2a3040';
    ctx.beginPath(); ctx.arc(0, -S*.6, S*.06, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-S*.04, -S*.55, S*.08, S*.12);
    // Bow drawn toward angle
    ctx.save(); ctx.translate(0, -S*.58); ctx.rotate(angle + Math.PI/2);
    ctx.strokeStyle = flash>0 ? '#fff' : '#8a6030'; ctx.lineWidth = S*.025;
    ctx.beginPath(); ctx.arc(0, 0, S*.14, -Math.PI*.5, Math.PI*.5); ctx.stroke();
    ctx.strokeStyle = flash>0 ? '#ffe060' : '#c0c880'; ctx.lineWidth = S*.012;
    ctx.beginPath(); ctx.moveTo(0, -S*.14); ctx.lineTo(0, S*.14); ctx.stroke();
    if(flash>0){
      ctx.fillStyle='rgba(255,255,160,0.9)';
      ctx.beginPath(); ctx.moveTo(-S*.03, 0); ctx.lineTo(S*.22, 0); ctx.lineTo(-S*.03, S*.03); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  },

  // GAUSS CANNON — sleek sci-fi electromagnetic accelerator with glowing coils
  gauss(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI/2);
    const S = s;
    const T = t || 0;
    // Base — hexagonal armored plate
    ctx.fillStyle = '#1a2840';
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2 - Math.PI/6;
      i===0 ? ctx.moveTo(Math.cos(a)*S*.38, Math.sin(a)*S*.38) : ctx.lineTo(Math.cos(a)*S*.38, Math.sin(a)*S*.38);
    }
    ctx.closePath(); ctx.fill();
    // Hex border glow
    ctx.strokeStyle = flash>0 ? '#88ccff' : 'rgba(0,160,255,0.5)';
    ctx.lineWidth = S*.025;
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2 - Math.PI/6;
      i===0 ? ctx.moveTo(Math.cos(a)*S*.38, Math.sin(a)*S*.38) : ctx.lineTo(Math.cos(a)*S*.38, Math.sin(a)*S*.38);
    }
    ctx.closePath(); ctx.stroke();
    // Electromagnetic coils around barrel
    ctx.strokeStyle = '#0088cc'; ctx.lineWidth = S*.04; ctx.lineCap='round';
    const coilPositions = [-S*.42, -S*.28, -S*.14, -S*.01, S*.12];
    coilPositions.forEach((cy2, i) => {
      const glow = flash>0 ? 1 : (0.4 + 0.3*Math.sin(T*4 + i*1.2));
      ctx.strokeStyle = `rgba(0,${Math.floor(160*glow+80)},255,${glow})`;
      ctx.beginPath(); ctx.roundRect(-S*.08, cy2, S*.16, S*.07, S*.01); ctx.stroke();
    });
    // Main barrel — slim and angular
    ctx.fillStyle = '#2a3a54';
    ctx.beginPath(); ctx.roundRect(-S*.07, -S*.62, S*.14, S*.56, S*.02); ctx.fill();
    // Barrel inner core
    ctx.fillStyle = flash>0 ? '#aaddff' : '#1a2a40';
    ctx.beginPath(); ctx.roundRect(-S*.03, -S*.60, S*.06, S*.52, S*.01); ctx.fill();
    // Muzzle
    ctx.fillStyle = flash>0 ? '#ffffff' : '#3a4a64';
    ctx.beginPath(); ctx.ellipse(0, -S*.62, S*.1, S*.07, 0, 0, Math.PI*2); ctx.fill();
    // Muzzle flash beam
    if(flash>0){
      const grad = ctx.createLinearGradient(0, -S*.62, 0, -S*1.2);
      grad.addColorStop(0, 'rgba(150,220,255,0.9)');
      grad.addColorStop(1, 'rgba(0,100,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.rect(-S*.025, -S*.62, S*.05, -S*.6); ctx.fill();
      // Energy pulse ring
      ctx.strokeStyle = 'rgba(0,180,255,0.7)'; ctx.lineWidth = S*.06;
      ctx.beginPath(); ctx.ellipse(0, -S*.62, S*.18, S*.07, 0, 0, Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  },

  // PYROMANCER — robed sorcerer tower with staff, fire orb, arcane runes
  pyromancer(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Base plinth
    ctx.fillStyle = '#3a2010';
    ctx.beginPath(); ctx.roundRect(-S*.28, S*.2, S*.56, S*.18, S*.04); ctx.fill();
    ctx.fillStyle = '#5a3820';
    ctx.beginPath(); ctx.roundRect(-S*.22, S*.1, S*.44, S*.14, S*.03); ctx.fill();
    // Robe body
    ctx.fillStyle = '#6a1010';
    ctx.beginPath();
    ctx.moveTo(-S*.14, S*.1); ctx.lineTo(S*.14, S*.1);
    ctx.lineTo(S*.18, -S*.22); ctx.lineTo(-S*.18, -S*.22);
    ctx.closePath(); ctx.fill();
    // Robe highlight
    ctx.fillStyle = '#8a2020';
    ctx.beginPath(); ctx.roundRect(-S*.04, -S*.22, S*.1, S*.3, S*.02); ctx.fill();
    // Cloak belt
    ctx.fillStyle = '#cc8820';
    ctx.beginPath(); ctx.roundRect(-S*.18, -S*.06, S*.36, S*.05, S*.02); ctx.fill();
    // Head + hood
    ctx.fillStyle = '#3a0808';
    ctx.beginPath();
    ctx.moveTo(-S*.15, -S*.22); ctx.lineTo(S*.15, -S*.22);
    ctx.lineTo(S*.08, -S*.5); ctx.lineTo(-S*.08, -S*.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#cc8860'; // face
    ctx.beginPath(); ctx.arc(0, -S*.3, S*.1, 0, Math.PI*2); ctx.fill();
    // Eyes glow
    ctx.fillStyle = flash>0 ? '#ffffff' : '#ff4400';
    ctx.beginPath(); ctx.arc(-S*.04, -S*.32, S*.025, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(S*.04, -S*.32, S*.025, 0, Math.PI*2); ctx.fill();
    // Staff — pointed toward angle
    ctx.save(); ctx.translate(S*.14, -S*.1); ctx.rotate(angle + Math.PI/2);
    ctx.strokeStyle = '#7a5020'; ctx.lineWidth = S*.04; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -S*.55); ctx.stroke();
    // Fire orb at tip
    const orbPulse = flash>0 ? 1.0 : 0.7+0.3*Math.sin(T*5);
    ctx.fillStyle = `rgba(255,${Math.floor(80+100*orbPulse)},0,${orbPulse})`;
    ctx.beginPath(); ctx.arc(0, -S*.55, S*.1*orbPulse, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = `rgba(255,220,80,${orbPulse*0.8})`;
    ctx.beginPath(); ctx.arc(0, -S*.55, S*.06*orbPulse, 0, Math.PI*2); ctx.fill();
    if(flash>0){
      ctx.fillStyle='rgba(255,200,60,0.5)';
      ctx.beginPath(); ctx.arc(0, -S*.55, S*.2, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // Arcane rune circle
    ctx.strokeStyle = `rgba(255,100,0,${0.3+0.2*Math.sin(T*2)})`;
    ctx.lineWidth = S*.012; ctx.setLineDash([S*.04, S*.04]);
    ctx.beginPath(); ctx.arc(0, 0, S*.32, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  // SHOCKWAVE TOWER — armored plinth with resonance ring emitter, ground-pulse
  shockwave(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s;
    const T = t || 0;
    // Expanding ground rings when firing
    if(flash>0){
      [0.5, 0.75, 1.0].forEach((frac, i)=>{
        const r = frac * S * 1.2 * flash;
        ctx.strokeStyle = `rgba(255,180,0,${0.5*(1-frac)*flash})`;
        ctx.lineWidth = S*.08*(1-frac);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
      });
    }
    // Base — heavy armored octagon
    ctx.fillStyle = '#2a2010';
    ctx.beginPath();
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2 - Math.PI/8;
      i===0 ? ctx.moveTo(Math.cos(a)*S*.42, Math.sin(a)*S*.42) : ctx.lineTo(Math.cos(a)*S*.42, Math.sin(a)*S*.42);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(200,150,0,0.3)'; ctx.lineWidth=S*.02;
    ctx.beginPath();
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2 - Math.PI/8;
      i===0 ? ctx.moveTo(Math.cos(a)*S*.42, Math.sin(a)*S*.42) : ctx.lineTo(Math.cos(a)*S*.42, Math.sin(a)*S*.42);
    }
    ctx.closePath(); ctx.stroke();
    // Emitter dome center
    ctx.fillStyle = '#5a4020';
    ctx.beginPath(); ctx.arc(0, 0, S*.28, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#7a5a28';
    ctx.beginPath(); ctx.arc(-S*.05, -S*.05, S*.18, 0, Math.PI*2); ctx.fill();
    // Resonance ring — animated
    const ringAlpha = flash>0 ? 0.9 : (0.35+0.25*Math.sin(T*3));
    ctx.strokeStyle = `rgba(255,180,0,${ringAlpha})`;
    ctx.lineWidth = S*.06;
    ctx.beginPath(); ctx.arc(0, 0, S*.2, 0, Math.PI*2); ctx.stroke();
    // Inner core glow
    const coreColor = flash>0 ? '#ffffff' : '#ffaa00';
    ctx.fillStyle = coreColor;
    ctx.beginPath(); ctx.arc(0, 0, S*.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = flash>0 ? 'rgba(255,240,180,0.9)' : 'rgba(255,160,0,0.6)';
    ctx.beginPath(); ctx.arc(0, 0, S*.06, 0, Math.PI*2); ctx.fill();
    // Decorative prongs around emitter
    ctx.strokeStyle = '#8a6020'; ctx.lineWidth = S*.04; ctx.lineCap='round';
    for(let i=0;i<6;i++){
      const a = (i/6)*Math.PI*2 + T*0.5;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*S*.18, Math.sin(a)*S*.18);
      ctx.lineTo(Math.cos(a)*S*.32, Math.sin(a)*S*.32);
      ctx.stroke();
    }
    ctx.restore();
  },

  // CELESTIAL OVERLORD — divine warship, the apex of all towers
  // Massive golden battleship with rotating energy rings, divine wings, god-beam
  celestial_overlord(ctx, x, y, s, angle, flash, t) {
    ctx.save(); ctx.translate(x, y);
    const S = s * 1.6; // Bigger than any other tower
    const T = t || 0;

    // ── OUTER DIVINE AURA (always present) ──
    const auraR = S * 1.4;
    const auraGrad = ctx.createRadialGradient(0,0,auraR*0.3, 0,0,auraR);
    auraGrad.addColorStop(0, `rgba(255,215,0,${0.12+0.08*Math.sin(T*2)})`);
    auraGrad.addColorStop(0.6, `rgba(255,140,0,${0.07+0.04*Math.sin(T*2.3)})`);
    auraGrad.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath(); ctx.arc(0,0,auraR,0,Math.PI*2); ctx.fill();

    // ── 3 ROTATING ENERGY ORBIT RINGS ──
    for(let ri=0;ri<3;ri++){
      const ringAngle = T*(1.2+ri*0.5) + ri*(Math.PI*2/3);
      const ringR = S*(0.55+ri*0.18);
      ctx.save(); ctx.rotate(ringAngle);
      ctx.strokeStyle = ri===0 ? `rgba(255,215,0,${0.7+0.3*Math.sin(T*3)})` 
                      : ri===1 ? `rgba(255,100,255,${0.5+0.2*Math.sin(T*2.5+1)})` 
                      :          `rgba(0,220,255,${0.5+0.2*Math.sin(T*2+2)})`;
      ctx.lineWidth = S*0.04;
      ctx.setLineDash([S*0.12, S*0.06]);
      ctx.beginPath(); ctx.ellipse(0,0,ringR,ringR*0.35,0,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      // Glowing orbs on ring
      for(let oi=0;oi<4;oi++){
        const oa = oi/4*Math.PI*2;
        const ox = Math.cos(oa)*ringR, oy = Math.sin(oa)*ringR*0.35;
        ctx.fillStyle = ri===0 ? '#ffd700' : ri===1 ? '#ff88ff' : '#00eeff';
        ctx.beginPath(); ctx.arc(ox,oy,S*0.055,0,Math.PI*2); ctx.fill();
        // Inner bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(ox,oy,S*0.025,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }

    // ── DIVINE WINGS (animated flap) ──
    const wingFlap = Math.sin(T*4)*0.12;
    ctx.save(); ctx.rotate(angle + Math.PI/2);
    // Left wing
    ctx.save(); ctx.scale(-1,1);
    ctx.fillStyle = 'rgba(255,215,0,0.85)';
    ctx.beginPath();
    ctx.moveTo(S*0.15, 0);
    ctx.bezierCurveTo(S*0.4, -S*(0.3+wingFlap), S*0.9, -S*(0.5+wingFlap*2), S*1.1, -S*(0.1+wingFlap));
    ctx.bezierCurveTo(S*0.8, S*(0.15+wingFlap*0.5), S*0.35, S*(0.1+wingFlap*0.3), S*0.15, S*0.05);
    ctx.closePath(); ctx.fill();
    // Wing feather details
    ctx.strokeStyle = 'rgba(255,255,200,0.5)'; ctx.lineWidth = S*0.018;
    for(let fi=0;fi<4;fi++){
      const t2 = fi/4;
      ctx.beginPath();
      ctx.moveTo(S*(0.15+t2*0.4), -S*t2*(0.08+wingFlap));
      ctx.lineTo(S*(0.3+t2*0.55), -S*(0.35+t2*0.15+wingFlap));
      ctx.stroke();
    }
    ctx.restore();
    // Right wing (mirror)
    ctx.fillStyle = 'rgba(255,215,0,0.85)';
    ctx.beginPath();
    ctx.moveTo(S*0.15, 0);
    ctx.bezierCurveTo(S*0.4, -S*(0.3+wingFlap), S*0.9, -S*(0.5+wingFlap*2), S*1.1, -S*(0.1+wingFlap));
    ctx.bezierCurveTo(S*0.8, S*(0.15+wingFlap*0.5), S*0.35, S*(0.1+wingFlap*0.3), S*0.15, S*0.05);
    ctx.closePath(); ctx.fill();
    for(let fi=0;fi<4;fi++){
      const t2 = fi/4;
      ctx.strokeStyle = 'rgba(255,255,200,0.5)'; ctx.lineWidth = S*0.018;
      ctx.beginPath();
      ctx.moveTo(S*(0.15+t2*0.4), -S*t2*(0.08+wingFlap));
      ctx.lineTo(S*(0.3+t2*0.55), -S*(0.35+t2*0.15+wingFlap));
      ctx.stroke();
    }

    // ── SHIP HULL — sleek divine warcraft ──
    // Main body
    const hullGrad = ctx.createLinearGradient(-S*0.18, -S*0.5, S*0.18, S*0.5);
    hullGrad.addColorStop(0, '#fff8d0');
    hullGrad.addColorStop(0.25, '#ffd700');
    hullGrad.addColorStop(0.6, '#cc9900');
    hullGrad.addColorStop(1, '#886600');
    ctx.fillStyle = hullGrad;
    ctx.beginPath();
    ctx.moveTo(0, -S*0.55);
    ctx.bezierCurveTo(S*0.2, -S*0.4, S*0.22, -S*0.1, S*0.18, S*0.3);
    ctx.lineTo(S*0.08, S*0.48);
    ctx.lineTo(-S*0.08, S*0.48);
    ctx.bezierCurveTo(-S*0.22, -S*0.1, -S*0.2, -S*0.4, 0, -S*0.55);
    ctx.closePath(); ctx.fill();
    // Hull highlight
    ctx.fillStyle = 'rgba(255,255,220,0.45)';
    ctx.beginPath();
    ctx.moveTo(0, -S*0.52);
    ctx.bezierCurveTo(S*0.08, -S*0.38, S*0.1, -S*0.1, S*0.06, S*0.18);
    ctx.bezierCurveTo(-S*0.02, -S*0.1, -S*0.04, -S*0.38, 0, -S*0.52);
    ctx.closePath(); ctx.fill();
    // Armor plating lines
    ctx.strokeStyle = 'rgba(180,120,0,0.6)'; ctx.lineWidth = S*0.015;
    [-0.2, 0, 0.2].forEach(py => {
      ctx.beginPath(); ctx.moveTo(-S*0.15, py*S); ctx.lineTo(S*0.15, py*S); ctx.stroke();
    });
    // Side nacelles
    [-1,1].forEach(side => {
      ctx.fillStyle = '#cc8800';
      ctx.beginPath();
      ctx.moveTo(side*S*0.18, -S*0.1);
      ctx.lineTo(side*S*0.34, -S*0.05);
      ctx.lineTo(side*S*0.34, S*0.18);
      ctx.lineTo(side*S*0.18, S*0.22);
      ctx.closePath(); ctx.fill();
      // Engine glow
      const engGrad = ctx.createRadialGradient(side*S*0.28, S*0.22, 0, side*S*0.28, S*0.22, S*0.12);
      engGrad.addColorStop(0, flash>0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,160,0,0.9)');
      engGrad.addColorStop(1, 'rgba(255,80,0,0)');
      ctx.fillStyle = engGrad;
      ctx.beginPath(); ctx.arc(side*S*0.28, S*0.22, S*0.12, 0, Math.PI*2); ctx.fill();
    });

    // ── DIVINE CANNON BARREL ──
    ctx.fillStyle = '#ffe060';
    ctx.beginPath(); ctx.roundRect(-S*0.06, -S*0.72, S*0.12, S*0.22, S*0.02); ctx.fill();
    ctx.fillStyle = '#fff8a0';
    ctx.beginPath(); ctx.roundRect(-S*0.025, -S*0.72, S*0.05, S*0.22, S*0.01); ctx.fill();
    // Barrel tip — glowing muzzle
    ctx.fillStyle = flash>0 ? '#ffffff' : '#ffcc00';
    ctx.beginPath(); ctx.ellipse(0, -S*0.72, S*0.09, S*0.06, 0, 0, Math.PI*2); ctx.fill();

    // ── GOD-BEAM FIRE EFFECT ──
    if(flash>0){
      // Expanding divine explosion
      const fbR = S*0.8*flash;
      const fbGrad = ctx.createRadialGradient(0,-S*0.72,0, 0,-S*0.72,fbR);
      fbGrad.addColorStop(0, 'rgba(255,255,255,1)');
      fbGrad.addColorStop(0.2, 'rgba(255,220,80,0.9)');
      fbGrad.addColorStop(0.5, 'rgba(255,100,0,0.6)');
      fbGrad.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = fbGrad;
      ctx.beginPath(); ctx.arc(0,-S*0.72,fbR,0,Math.PI*2); ctx.fill();
      // Beam ray lines
      ctx.strokeStyle = 'rgba(255,255,200,0.8)'; ctx.lineWidth = S*0.04;
      for(let ri=0;ri<8;ri++){
        const ra = (ri/8)*Math.PI*2 + T;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ra)*S*0.09, -S*0.72+Math.sin(ra)*S*0.06);
        ctx.lineTo(Math.cos(ra)*fbR*0.8, -S*0.72+Math.sin(ra)*fbR*0.4);
        ctx.stroke();
      }
    }

    // ── COCKPIT WINDOW ──
    const cockGrad = ctx.createRadialGradient(-S*0.03, -S*0.3, 0, 0, -S*0.25, S*0.12);
    cockGrad.addColorStop(0, 'rgba(180,240,255,0.95)');
    cockGrad.addColorStop(0.4, 'rgba(0,160,255,0.7)');
    cockGrad.addColorStop(1, 'rgba(0,40,100,0.8)');
    ctx.fillStyle = cockGrad;
    ctx.beginPath(); ctx.ellipse(0, -S*0.28, S*0.1, S*0.08, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(180,240,255,0.6)'; ctx.lineWidth = S*0.012;
    ctx.beginPath(); ctx.ellipse(0, -S*0.28, S*0.1, S*0.08, 0, 0, Math.PI*2); ctx.stroke();
    // Cockpit shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(-S*0.03, -S*0.31, S*0.04, S*0.025, -0.4, 0, Math.PI*2); ctx.fill();

    // ── CROWN ON TOP ── (because it's the overlord)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-S*0.12, -S*0.52);
    ctx.lineTo(-S*0.12, -S*0.68);
    ctx.lineTo(-S*0.06, -S*0.6);
    ctx.lineTo(0, -S*0.72);
    ctx.lineTo(S*0.06, -S*0.6);
    ctx.lineTo(S*0.12, -S*0.68);
    ctx.lineTo(S*0.12, -S*0.52);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#fff8a0'; ctx.lineWidth = S*0.015;
    ctx.stroke();
    // Crown gems
    [[-S*0.09,-S*0.67],[0,-S*0.71],[S*0.09,-S*0.67]].forEach(([gx,gy],gi)=>{
      ctx.fillStyle = gi===0?'#ff4444':gi===1?'#44ffaa':'#4488ff';
      ctx.beginPath(); ctx.arc(gx,gy,S*0.025,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(gx-S*0.008,gy-S*0.008,S*0.01,0,Math.PI*2); ctx.fill();
    });

    ctx.restore(); // angle rotation

    // ── DIVINE SPARKLES orbiting (always on) ──
    for(let sp=0;sp<8;sp++){
      const sAngle = T*2 + sp/8*Math.PI*2;
      const sR = S*(0.4+0.15*Math.sin(T*3+sp));
      const sx = Math.cos(sAngle)*sR, sy = Math.sin(sAngle)*sR*0.6;
      const sAlpha = 0.4+0.4*Math.sin(T*4+sp*0.8);
      ctx.fillStyle = sp%3===0?`rgba(255,215,0,${sAlpha})`:sp%3===1?`rgba(255,120,255,${sAlpha})`:`rgba(100,220,255,${sAlpha})`;
      const sSize = S*(0.025+0.015*Math.sin(T*5+sp));
      // Draw a 4-pointed star sparkle
      ctx.save(); ctx.translate(sx,sy); ctx.rotate(T*3+sp);
      ctx.beginPath();
      ctx.moveTo(0,-sSize*2); ctx.lineTo(sSize*0.4,-sSize*0.4);
      ctx.lineTo(sSize*2,0);   ctx.lineTo(sSize*0.4,sSize*0.4);
      ctx.lineTo(0,sSize*2);   ctx.lineTo(-sSize*0.4,sSize*0.4);
      ctx.lineTo(-sSize*2,0);  ctx.lineTo(-sSize*0.4,-sSize*0.4);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  },

}; // end TowerArt



class Tower {
  constructor(def, tileX, tileY, tileSize) {
    this.def      = def;
    this.tileX    = tileX;
    this.tileY    = tileY;
    this.tileSize = tileSize;
    this.x        = tileX * tileSize + tileSize / 2;
    this.y        = tileY * tileSize + tileSize / 2;

    this.level      = 0;
    this.damage     = def.damage;
    this.range      = def.range;
    this.fireRate   = def.fireRate;
    this.slow       = def.slow   || 0;
    this.splash     = def.splash || 0;
    this.burn       = def.burn   || 0;
    this.chain      = def.chain  || 0;
    this.pierce     = def.pierce || 0;
    this.armorPierce = def.armorPierce || false;
    this.instaKill  = def.instaKill || false;
    this.instaKillThreshold = def.instaKillThreshold || 0;
    this.canSeeInvis = def.canSeeInvis || false;

    // Economy tower state
    this.isEconomy      = def.isEconomy || false;
    this.isFarm         = def.isFarm    || false;
    this.isBank         = def.isBank    || false;
    this.incomePerRound = def.incomePerRound || 0;
    this.bankBalance    = 0;
    this.bankCap        = def.bankCap   || 0;
    this.bankRate       = def.bankRate  || 0;
    this.bankMode       = false; // farm can convert to bank on upgrade 3
    this.totalEarned    = 0;    // lifetime income generated

    this.fireCooldown = 0;
    this.target       = null;
    this.bullets      = [];
    this.angle        = 0;
    this.shootFlash   = 0;
    this.auraBuff     = 1.0;
    this.selected     = false;
    this.auraAlpha    = 0;
    this.targetMode   = 'first';
    this.totalCostSpent = def.cost;

    // Air tower orbit state
    if (def.isAir) {
      this.orbitAngle  = Math.random() * Math.PI * 2;
      this.orbitRadius = tileSize * 1.5;
      this.orbitSpeed  = 0.7 + Math.random() * 0.5;
      this.orbitBaseX  = tileX * tileSize + tileSize / 2;
      this.orbitBaseY  = tileY * tileSize + tileSize / 2;
    }
  }

  get cost()  { return this.def.cost; }
  get name()  { return this.def.name; }
  get icon()  { return this.def.icon; }

  getSellValue() { return Math.floor(this.totalCostSpent * 0.65); }

  getUpgradeCost() {
    if (this.level >= this.def.maxUpgrade || !this.def.upgrades[this.level]) return 0;
    return this.def.upgrades[this.level].cost;
  }

  upgrade() {
    if (this.level >= this.def.maxUpgrade) return false;
    const u = this.def.upgrades[this.level];
    if (!u) return false;
    this.totalCostSpent += u.cost;
    this.damage   += u.dmgBonus    || 0;
    this.fireRate += u.rateBonus   || 0;
    this.range    += u.rangeBonus  || 0;
    this.slow     += u.slowBonus   || 0;
    this.splash   += u.splashBonus || 0;
    this.burn     += u.burnBonus   || 0;
    this.chain    += u.chainBonus  || 0;
    if (u.armorPierce) this.armorPierce = true;
    if (u.instaKill)   this.instaKill   = true;
    if (u.instaKillThreshold) this.instaKillThreshold = u.instaKillThreshold;
    if (u.pierce)      this.pierce = u.pierce;
    if (u.burn)        this.burn   = u.burn;
    // Economy upgrades
    if (u.incomeBonus)   this.incomePerRound += u.incomeBonus;
    if (u.bankCapBonus)  this.bankCap += u.bankCapBonus;
    if (u.bankRateBonus) this.bankRate += u.bankRateBonus;
    if (u.bankMode === true)  this.bankMode = true;
    if (u.bankMode === false) this.bankMode = false;
    this.level++;
    return true;
  }

  update(dt, enemies) {
    this.shootFlash   = Math.max(0, this.shootFlash - dt * 8);
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);

    const isAir = !!this.def.isAir;

    if (isAir) {
      // ── AIR TOWER: Orbiting aircraft BTD6-style ──────────────────
      if (!this.orbitAngle) this.orbitAngle = Math.random() * Math.PI * 2;
      if (!this.orbitRadius) this.orbitRadius = this.tileSize * 1.5;
      if (!this.orbitSpeed) this.orbitSpeed = 0.8 + Math.random() * 0.5; // rad/s
      if (!this.orbitBaseX) this.orbitBaseX = this.tileX * this.tileSize + this.tileSize / 2;
      if (!this.orbitBaseY) this.orbitBaseY = this.tileY * this.tileSize + this.tileSize / 2;

      // Pick target first
      this.target = this._pickTarget(enemies);

      if (this.target) {
        // Fly toward target, orbiting around them
        const tx = this.target.x, ty = this.target.y;
        const dx = tx - this.x, dy = ty - this.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        // Angle of flight
        this.angle = Math.atan2(dy, dx);
        // Move toward target
        const speed = this.tileSize * 3.5;
        if (dist > this.tileSize * 0.8) {
          this.x += (dx/dist) * speed * dt;
          this.y += (dy/dist) * speed * dt;
        }
        // Fire
        if (this.fireCooldown <= 0) {
          this.fireCooldown = 1 / (this.fireRate * this.auraBuff);
          this.shootFlash = 1;
          this._fire(this.target, enemies);
        }
      } else {
        // No target — orbit base tile
        this.orbitAngle += this.orbitSpeed * dt;
        const targetX = this.orbitBaseX + Math.cos(this.orbitAngle) * this.orbitRadius;
        const targetY = this.orbitBaseY + Math.sin(this.orbitAngle) * this.orbitRadius;
        const dx = targetX - this.x, dy = targetY - this.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const speed = this.tileSize * 3.0;
        if (dist > 4) {
          this.x += (dx/dist) * Math.min(speed*dt, dist);
          this.y += (dy/dist) * Math.min(speed*dt, dist);
          this.angle = Math.atan2(dy, dx);
        }
      }
    } else if (!this.isEconomy) {
      // Ground combat tower — stationary
      this.target = this._pickTarget(enemies);
      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.angle = Math.atan2(dy, dx) - Math.PI / 2;
      }
      if (this.target && this.fireCooldown <= 0) {
        this.fireCooldown = 1 / (this.fireRate * this.auraBuff);
        this.shootFlash   = 1;
        this._fire(this.target, enemies);
      }
    }

    // In-place bullet update + removal (no filter allocation)
    let bw = 0;
    for (let bi = 0; bi < this.bullets.length; bi++) {
      const b = this.bullets[bi];
      b.update(dt);
      if (!b.dead) this.bullets[bw++] = b;
    }
    this.bullets.length = bw;
  }

  _pickTarget(enemies) {
    const myX = this.def.isAir ? this.x : (this.tileX * this.tileSize + this.tileSize/2);
    const myY = this.def.isAir ? this.y : (this.tileY * this.tileSize + this.tileSize/2);
    const range = this.def.isAir ? this.range * 2.5 : this.range;
    const rangeSq = range * range;
    const mode = this.targetMode;

    let best = null, bestVal = -Infinity;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.dead || (e.invisible && !this.canSeeInvis)) continue;
      const dx = e.x - myX, dy = e.y - myY;
      const distSq = dx*dx + dy*dy;
      if (distSq > rangeSq) continue;
      let val;
      if (mode === 'first')  val = e.pathProgress;
      else if (mode === 'last')  val = -e.pathProgress;
      else if (mode === 'strong') val = e.hp;
      else val = -(distSq); // close
      if (val > bestVal) { bestVal = val; best = e; }
    }
    return best;
  }

  _fire(target, allEnemies) {
    const d = this.def;
    const effDmg = this.damage * this.auraBuff;

    // Determine damage type for immunity checks — specific IDs take priority
    let damageType = 'bullet';
    const _id = d.id;
    if (_id === 'tesla' || _id === 'stormcaller' || _id === 'neon_warden' || _id === 'beacon' || _id === 'buzzsaw' || _id === 'magnet')
      damageType = 'electric';
    else if (_id === 'freezer' || _id === 'cryomancer' || _id === 'temporal' || _id === 'chrono')
      damageType = 'ice';
    else if (_id === 'mortar' || _id === 'rocketeer' || _id === 'stratobomber' || _id === 'artillery')
      damageType = 'explosive';
    else if (_id === 'flamer' || _id === 'pyre' || _id === 'infector' || _id === 'apache')
      damageType = 'fire';
    else if (this.burn > 0)
      damageType = 'fire';
    else if (this.slow > 0 && this.burn === 0)
      damageType = 'ice';

    this.bullets.push(new Bullet({
      x: this.x, y: this.y,
      target,
      damage:      effDmg,
      speed:       d.bulletSpeed,
      color:       d.bulletColor,
      size:        d.bulletSize,
      splash:      this.splash,
      slow:        this.slow,
      slowDuration: d.slowDuration || 2,
      burn:        this.burn,
      chain:       this.chain,
      pierce:      this.pierce,
      armorPierce: this.armorPierce,
      damageType,
      instaKill:   this.instaKill || (this.level >= 2 && d.id === 'phantom'),
      instaKillThreshold: this.instaKillThreshold,
      allEnemies,
    }));
  }

  draw(ctx) {
    const s = this.tileSize;
    const tx = this.tileX * s, ty = this.tileY * s;
    const isAir = !!this.def.isAir;
    const cx = isAir ? this.x : (this.tileX * s + s/2);
    const cy = isAir ? this.y : (this.tileY * s + s/2);
    const flash = this.shootFlash;
    const col = this.def.color;

    const rarityColors = { basic:'#3b82f6', advanced:'#06b6d4', special:'#a78bfa', legendary:'#f59e0b' };
    const rarityCol = rarityColors[this.def.rarity] || col;

    ctx.save();

    if (isAir) {
      // ── Air: minimal landing pad ──────────────────────────────────
      const pad = 6;
      ctx.strokeStyle = 'rgba(0,188,212,0.28)';
      ctx.lineWidth = 1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.roundRect(tx+pad,ty+pad,s-pad*2,s-pad*2,4); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(0,188,212,0.06)';
      ctx.beginPath(); ctx.roundRect(tx+pad,ty+pad,s-pad*2,s-pad*2,4); ctx.fill();
      // H marker
      ctx.font=`bold ${Math.floor(s*0.28)}px sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle='rgba(0,188,212,0.4)'; ctx.fillText('H',tx+s/2,ty+s/2);
      // Orbit ring
      ctx.strokeStyle='rgba(0,188,212,0.09)'; ctx.lineWidth=1; ctx.setLineDash([2,5]);
      ctx.beginPath(); ctx.arc(tx+s/2,ty+s/2,s*1.48,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      // Aircraft shadow
      ctx.fillStyle='rgba(0,0,0,0.15)';
      ctx.beginPath(); ctx.ellipse(cx+s*0.07,this.tileY*s+s*0.88,s*0.28,s*0.07,0,0,Math.PI*2); ctx.fill();

    } else if (this.isEconomy) {
      // ── Economy towers: simple clean tile ────────────────────────
      const pad = 5;
      ctx.fillStyle = this.selected ? 'rgba(74,222,128,0.15)' : 'rgba(22,163,74,0.08)';
      ctx.beginPath(); ctx.roundRect(tx+pad,ty+pad,s-pad*2,s-pad*2,5); ctx.fill();
      ctx.strokeStyle = this.selected ? 'rgba(74,222,128,0.7)' : 'rgba(74,222,128,0.28)';
      ctx.lineWidth = this.selected ? 1.5 : 1;
      ctx.beginPath(); ctx.roundRect(tx+pad,ty+pad,s-pad*2,s-pad*2,5); ctx.stroke();

    } else {
      // ── Ground tower: clean flat tile with rarity accent ─────────
      const pad = 4;
      const bx=tx+pad, by=ty+pad, bw=s-pad*2, bh=s-pad*2;

      // Tile base
      ctx.fillStyle = this.selected ? 'rgba(40,34,8,0.95)' : 'rgba(18,26,38,0.92)';
      ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,4); ctx.fill();

      // Aura buff tint
      if (this.auraBuff > 1.0) {
        ctx.fillStyle = 'rgba(241,196,15,0.10)';
        ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,4); ctx.fill();
      }

      // Rarity border
      const isLegendary = this.def.rarity === 'legendary';
      const borderAlpha = this.selected ? 'cc' : (isLegendary ? '88' : '42');
      ctx.strokeStyle = this.selected ? '#f1c40f' : (rarityCol + borderAlpha);
      ctx.lineWidth = this.selected ? 2 : (isLegendary ? 1.5 : 1);
      ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,4); ctx.stroke();

      // Selected: corner accent marks
      if (this.selected) {
        const cs = 5;
        ctx.strokeStyle='#f1c40f'; ctx.lineWidth=1.5;
        // TL
        ctx.beginPath(); ctx.moveTo(bx+cs,by); ctx.lineTo(bx,by); ctx.lineTo(bx,by+cs); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(bx+bw-cs,by); ctx.lineTo(bx+bw,by); ctx.lineTo(bx+bw,by+cs); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(bx,by+bh-cs); ctx.lineTo(bx,by+bh); ctx.lineTo(bx+cs,by+bh); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(bx+bw-cs,by+bh); ctx.lineTo(bx+bw,by+bh); ctx.lineTo(bx+bw,by+bh-cs); ctx.stroke();
      }
    }
    ctx.restore();

    // ── Sprite ────────────────────────────────────────────────────────────
    if (!this.isEconomy || (this.isFarm || this.isBank)) {
      const spriteY = isAir ? cy : cy - Math.floor(s * 0.04);
      const artFn = TowerArt[this.def.id] || TowerArt._default;
      artFn(ctx, cx, spriteY, s, this.angle, flash, typeof _animTime !== 'undefined' ? _animTime : 0);
    }

    // ── Level pips ───────────────────────────────────────────────────────
    if (this.level > 0 && !isAir) {
      ctx.save();
      for (let i=0; i<this.level; i++) {
        const rx = cx + (i-(this.level-1)/2)*s*0.15;
        const ry = cy + s*0.36;
        ctx.beginPath(); ctx.arc(rx,ry,s*0.05,0,Math.PI*2);
        ctx.fillStyle = i<3 ? '#f1c40f' : '#e0e0e0';
        ctx.fill();
      }
      ctx.restore();
    }

    // ── Range ring (selected) ────────────────────────────────────────────
    if (this.selected && !this.isEconomy) {
      ctx.beginPath(); ctx.arc(cx,cy,this.range,0,Math.PI*2);
      ctx.strokeStyle = rarityCol + '44';
      ctx.lineWidth=1.5; ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
    }

    // ── Aura pulse ───────────────────────────────────────────────────────
    if (this.def.aura) {
      const t=Date.now()*0.003;
      this.auraAlpha=(Math.sin(t)+1)*0.09;
      ctx.beginPath(); ctx.arc(cx,cy,this.range*0.7,0,Math.PI*2);
      ctx.fillStyle=`rgba(241,196,15,${this.auraAlpha})`; ctx.fill();
    }

    // ── Owner glow ───────────────────────────────────────────────────────
    if (this.def.ownerOnly) {
      const t=Date.now()*0.002;
      ctx.save();
      ctx.globalAlpha=0.32+Math.sin(t)*0.22;
      ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,s*0.44,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
  }
}

// ── Bullet class ──────────────────────────────────────────
class Bullet {
  constructor(opts) {
    Object.assign(this, opts);
    this.dead = false;
    this.hitEnemies = [];  // array is faster for small N (< 20 hits)
    this.age = 0;
  }

  update(dt) {
    this.age += dt;
    if (!this.target || this.target.dead) {
      // Always try to retarget to nearest live enemy within reasonable range
      if (this.allEnemies) {
        let nearest = null, bestDist = this.pierce > 0 ? Infinity : 120;
        for (const e of this.allEnemies) {
          if (e.dead || this.hitEnemies.includes(e)) continue;
          const d = Math.hypot(e.x-this.x, e.y-this.y);
          if (d < bestDist) { bestDist = d; nearest = e; }
        }
        if (nearest) this.target = nearest;
        else { this.dead = true; return; }
      } else { this.dead = true; return; }
    }

    // Instant-hit towers (bulletSpeed = 0): spawn at tower, immediately apply to all in splash range
    if (this.speed === 0) {
      // If splash is 0, treat as a global AoE (e.g. chrono tower)
      if (this.splash === 0 && this.allEnemies) {
        for (const e of this.allEnemies) {
          if (!e.dead) e.takeDamage(this.damage, this);
        }
        this.dead = true;
      } else {
        this._hit(this.target);
      }
      return;
    }

    const dx = this.target.x - this.x, dy = this.target.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 8) { this._hit(this.target); return; }
    const spd = this.speed * dt;
    this.prevX = this.x; this.prevY = this.y;
    this.x += (dx/dist)*spd;
    this.y += (dy/dist)*spd;
  }

  _hit(enemy) {
    if (this.hitEnemies.includes(enemy)) { this.dead = true; return; }

    // Apply damage — immunity is checked inside takeDamage
    const threshold = this.instaKillThreshold || 0;
    if (this.instaKill || (threshold > 0 && enemy.hp < enemy.maxHp * threshold)) {
      enemy.takeDamage(enemy.hp + 1, this);
    } else {
      enemy.takeDamage(this.damage, this);
    }
    this.hitEnemies.push(enemy);

    // Splash — skip already-hit enemies, apply damage type immunity
    if (this.splash > 0 && this.allEnemies) {
      for (const e of this.allEnemies) {
        if (e === enemy || e.dead || this.hitEnemies.includes(e)) continue;
        const d = Math.hypot(e.x - enemy.x, e.y - enemy.y);
        if (d <= this.splash) {
          const falloff = 1 - (d / this.splash) * 0.5;
          e.takeDamage(this.damage * falloff, this);
          this.hitEnemies.push(e);
        }
      }
    }

    // Chain lightning — sort by distance for more natural chaining
    if (this.chain > 0 && this.allEnemies) {
      let chained = 0, prev = enemy;
      let chainDmg = this.damage * 0.65;
      while (chained < this.chain) {
        // Find nearest unchit enemy to current chain node
        let nearest = null, nearDist = 200;
        for (const e of this.allEnemies) {
          if (e.dead || this.hitEnemies.includes(e)) continue;
          const d = Math.hypot(e.x - prev.x, e.y - prev.y);
          if (d < nearDist) { nearDist = d; nearest = e; }
        }
        if (!nearest) break;
        nearest.takeDamage(chainDmg, this);
        this.hitEnemies.push(nearest);
        prev = nearest;
        chainDmg *= 0.8; // each chain link does less damage
        chained++;
      }
    }

    if (this.pierce <= 0) this.dead = true;
    else this.pierce--;
  }

  draw(ctx) {
    // Instant beams (laser / phantom) — no gradient, just two lines
    if (this.speed >= 900 && this.target && !this.target.dead) {
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size || 2;
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.target.x, this.target.y); ctx.stroke();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = (this.size||2) * 0.35;
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.target.x, this.target.y); ctx.stroke();
      ctx.globalAlpha = 1;
      this.dead = true;
      return;
    }

    // Trail — simple line, no gradient
    if (this.prevX !== undefined) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.6;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(this.prevX, this.prevY); ctx.lineTo(this.x, this.y); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Main bullet — solid circle, no shadow, no gradient
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
    // White core dot
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 0.38, 0, Math.PI*2); ctx.fill();
  }
}
