/* ═══════════════════════════════════════════════
   ui.js — Menu, HUD, Shop, Leaderboard, Profile
   - Auto-login on load via stored credentials
   - Cosmetic inventory from catalog.json / PlayFab
   - Owner trigger shows only after PlayFab grants
   ═══════════════════════════════════════════════ */

const UI = (() => {

  let unlockedMaps  = new Set(['graveyard']);
  let ownedTowers   = new Set(['gunner','archer']);
  let lbInterval    = null;
  let currentLbStat = 'HighScore';
  let particleCtx   = null, particleCanvas = null;
  let particles     = [];
  let autoLoginDone = false;

  // ── INIT ──────────────────────────────────────
  async function init() {
    _loadLocalProgress();
    _initMenuParticles();
    _bindMenuTabs();
    _bindAuthButtons();
    _bindShopFilters();
    _bindLbTabs();
    _startTicker();

    // Try auto-login first, then build UI
    _setAuthStatus('Reconnecting…', '');
    const didLogin = await PF.tryAutoLogin();

    if (didLogin) {
      console.log('[UI] Auto-login success');
      _syncPFProgress();
      _updateProfileUI();
      if (PF.isOwner) _showOwnerTrigger();
    } else {
      _setAuthStatus('', '');
      _updateProfileUI();
    }

    // Build menu after login attempt
    _buildMapGrid();
    _buildShop();
    _refreshLeaderboard(currentLbStat);
    _initInfiniteTab();
    _initMapEditor();
    _initIngameLB();

    // Auto-refresh leaderboard
    lbInterval = setInterval(() => _refreshLeaderboard(currentLbStat), 30000);
    autoLoginDone = true;
  }

  function _syncPFProgress() {
    // Merge PF data into local tracking
    if (PF.playerData.OwnedTowers) {
      PF.playerData.OwnedTowers.forEach(id => ownedTowers.add(id));
    }
    if (PF.playerData.UnlockedMaps) {
      PF.playerData.UnlockedMaps.forEach(id => unlockedMaps.add(id));
    }
    // Also count towers from owner cosmetics
    PF.ownersTowers().forEach(id => ownedTowers.add(id));
    _saveLocalProgress();
  }

  function _loadLocalProgress() {
    try {
      const s = JSON.parse(localStorage.getItem('ztd_progress') || '{}');
      if (s.unlockedMaps) s.unlockedMaps.forEach(id => unlockedMaps.add(id));
      if (s.ownedTowers)  s.ownedTowers.forEach(id => ownedTowers.add(id));
    } catch {}
    unlockedMaps.add('graveyard');
    ownedTowers.add('gunner');
    ownedTowers.add('archer');
  }

  function _saveLocalProgress() {
    localStorage.setItem('ztd_progress', JSON.stringify({
      unlockedMaps: [...unlockedMaps],
      ownedTowers:  [...ownedTowers],
    }));
  }

  // ── SCREENS ───────────────────────────────────
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    if (name === 'menu') {
      _buildMapGrid();
      _buildShop(document.querySelector('.sf.active')?.dataset.sf || 'all');
      _updateProfileUI();
      Owner.setInGame(false);
    }
    if (name === 'game') {
      Owner.setInGame(true);
      // Show in-game leaderboard automatically
      setTimeout(() => _showIngameLB(), 500);
    }
  }

  function startGame(mapId) {
    showScreen('game');
    setTimeout(() => Game.init(mapId), 50);
  }

  // ── OWNER TRIGGER ─────────────────────────────
  function _showOwnerTrigger() {
    const el = document.getElementById('ownerTrigger');
    el.classList.remove('hidden');
    Owner.show();
  }

  function _hideOwnerTrigger() {
    document.getElementById('ownerTrigger').classList.add('hidden');
    document.getElementById('ownerPanel').classList.add('hidden');
  }

  // Arrow flips on open
  function _setOwnerArrow(open) {
    const trigger = document.getElementById('ownerTrigger');
    const arrow   = document.getElementById('otArrow');
    if (open) { trigger.classList.add('open'); arrow.textContent = '▼'; }
    else       { trigger.classList.remove('open'); arrow.textContent = '▲'; }
  }

  // ── MAP GRID ──────────────────────────────────
  function _buildMapGrid() {
    const grid = document.getElementById('mapGrid');
    grid.innerHTML = '';
    MAPS.forEach(map => {
      const locked = !unlockedMaps.has(map.id);
      const card = document.createElement('div');
      card.className = 'map-card' + (locked ? ' locked' : '');
      const diffStars = '⭐'.repeat(map.difficulty);
      card.innerHTML = `
        <div class="map-preview">
          <canvas id="prev-${map.id}" width="230" height="110"></canvas>
          ${locked ? '<div class="map-lock-overlay">🔒</div>' : ''}
          <div class="map-badge ${locked?'map-badge-lock':'map-badge-open'}">${locked?'LOCKED':'OPEN'}</div>
        </div>
        <div class="map-info">
          <div class="map-name">${map.name}</div>
          <div class="map-diff" style="color:var(--txt2);font-size:10px">${diffStars} DIFFICULTY ${map.difficulty}</div>
          <div class="map-waves-chip">🌊 ${map.waves} WAVES</div>
          <div class="map-waves" style="margin-top:3px">${map.description}</div>
        </div>`;
      if (!locked) card.onclick = () => startGame(map.id);
      else card.title = 'Complete the previous map to unlock';
      grid.appendChild(card);
      setTimeout(() => {
        const c = document.getElementById(`prev-${map.id}`);
        if (c) drawMapPreview(c, map);
      }, 0);
    });
  }

  function unlockMap(mapId, unlock = true) {
    if (unlock) {
      unlockedMaps.add(mapId);
      _saveLocalProgress();
    }
  }

  function unlockNextMap(completedId) {
    const idx = MAPS.findIndex(m => m.id === completedId);
    if (idx >= 0 && idx + 1 < MAPS.length) {
      const next = MAPS[idx + 1];
      unlockedMaps.add(next.id);
      if (PF.isLoggedIn()) {
        PF.playerData.UnlockedMaps = [...unlockedMaps];
        PF.savePlayerData();
      }
      _saveLocalProgress();
      toast(`🗺 New map unlocked: ${next.name}!`, 'gold');
    }
  }

  // ── TOWER PALETTE (in-game) ───────────────────
  function updateTowerPalette(map) {
    const palette = document.getElementById('towerPalette');
    palette.innerHTML = '';

    const allOwned = new Set([
      ...ownedTowers,
      ...(PF.isLoggedIn() ? PF.ownersTowers() : []),
    ]);

    // Ground towers by rarity
    const rarityOrder = ['basic','advanced','special','legendary'];
    rarityOrder.forEach(rarity => {
      const defs = TOWER_DEFS.filter(d => !d.ownerOnly && !d.isAir && d.rarity === rarity);
      if (!defs.length) return;
      const sep = document.createElement('div');
      sep.className = `tp-sep tp-sep-${rarity}`;
      sep.textContent = rarity;
      palette.appendChild(sep);
      defs.forEach(def => {
        const owned = allOwned.has(def.id) || def.shopCost === 0;
        _addPaletteItem(palette, def, owned, false);
      });
    });

    // Air towers section
    const airDefs = TOWER_DEFS.filter(d => !d.ownerOnly && d.isAir);
    if (airDefs.length) {
      const airSep = document.createElement('div');
      airSep.className = 'tp-sep tp-sep-air';
      airSep.innerHTML = '✈ AIR';
      palette.appendChild(airSep);
      airDefs.forEach(def => {
        const owned = allOwned.has(def.id) || def.shopCost === 0;
        _addPaletteItem(palette, def, owned, false);
      });
    }

    // Owner-only towers
    if (PF.isOwner || TOWER_DEFS.some(d => d.ownerOnly && allOwned.has(d.id))) {
      const ownerDefs = TOWER_DEFS.filter(d => d.ownerOnly && allOwned.has(d.id));
      if (ownerDefs.length) {
        const sep = document.createElement('div');
        sep.className = 'tp-sep'; sep.style.color = 'var(--neon)';
        sep.textContent = 'OWNER';
        palette.appendChild(sep);
        ownerDefs.forEach(def => _addPaletteItem(palette, def, true, true));
      }
    }
  }

  // Dim towers player can't currently afford (called on HUD money update)
  function refreshCanAfford(money) {
    const items = document.querySelectorAll('#towerPalette .tp-item:not(.locked)');
    items.forEach(item => {
      const def = TOWER_DEFS.find(d => d.id === item.dataset.id);
      if (!def) return;
      const couldAffordBefore = !item.classList.contains('cant-afford');
      const canAffordNow = money >= def.cost;

      if (!canAffordNow) {
        item.classList.add('cant-afford');
        item.classList.remove('affordable', 'just-affordable');
      } else {
        // Was cant-afford, now can afford → fire the unlock glow animation
        if (!couldAffordBefore) {
          item.classList.remove('just-affordable');
          // Force reflow to restart animation
          void item.offsetWidth;
          item.classList.add('just-affordable');
          // Remove after animation completes so it can re-trigger next time
          setTimeout(() => item.classList.remove('just-affordable'), 700);
        }
        item.classList.remove('cant-afford');
        item.classList.add('affordable');
      }
    });
  }

  // ── Tower palette SVG icon renderer ──────────────────────────────────────
  // Returns an inline SVG string representing each tower type visually.
  // Replaces emojis with real drawn icons that match the tower's identity.
  function _towerSvgIcon(def) {
    const id = def.id;
    const col = def.color || '#8899aa';
    const c2 = col;

    // Map of tower id → inline SVG (32×32 viewport)
    const icons = {
      gunner: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,4 28,10 28,22 16,28 4,22 4,10" fill="#1e2e44" stroke="#3a5070" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="7" fill="#2a4060"/>
        <rect x="13" y="3" width="3" height="12" rx="1" fill="#44607a"/>
        <rect x="16" y="3" width="3" height="12" rx="1" fill="#44607a"/>
        <rect x="13" y="3" width="6" height="2" fill="#ffd060"/>
      </svg>`,

      archer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="6" width="8" height="20" rx="2" fill="#2d4420" stroke="#4a6a30" stroke-width="1"/>
        <path d="M10,16 A8,8 0 0,1 22,16" fill="none" stroke="#5a8a30" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="16" y1="8" x2="16" y2="24" stroke="#c8d890" stroke-width="1.5"/>
        <polygon points="16,6 18,11 14,11" fill="#ffe060"/>
      </svg>`,

      sniper: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="4" width="4" height="22" rx="1.5" fill="#5a3a8a"/>
        <rect x="12" y="4" width="8" height="3" rx="1" fill="#7a5aaa"/>
        <circle cx="16" cy="18" r="4" fill="#3a2060" stroke="#7a5aaa" stroke-width="1.5"/>
        <circle cx="16" cy="18" r="2" fill="none" stroke="#aaa0cc" stroke-width="1"/>
        <line x1="16" y1="14" x2="16" y2="22" stroke="#aaa0cc" stroke-width="0.8"/>
        <line x1="12" y1="18" x2="20" y2="18" stroke="#aaa0cc" stroke-width="0.8"/>
        <rect x="10" y="14" width="12" height="2.5" rx="1" fill="#4a3070"/>
      </svg>`,

      rocketeer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 20,14 16,12 12,14" fill="#cc5500"/>
        <rect x="11" y="12" width="10" height="12" rx="3" fill="#c45a1a"/>
        <rect x="9" y="18" width="4" height="8" rx="2" fill="#a04010"/>
        <rect x="19" y="18" width="4" height="8" rx="2" fill="#a04010"/>
        <circle cx="16" cy="17" r="3" fill="#ff8822"/>
        <rect x="14" y="24" width="4" height="3" rx="1" fill="#ff5500"/>
      </svg>`,

      freezer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#1a3050" stroke="#4a90d0" stroke-width="1.5"/>
        <line x1="16" y1="5" x2="16" y2="27" stroke="#88ccee" stroke-width="2"/>
        <line x1="5" y1="16" x2="27" y2="16" stroke="#88ccee" stroke-width="2"/>
        <line x1="8" y1="8" x2="24" y2="24" stroke="#88ccee" stroke-width="1.5"/>
        <line x1="24" y1="8" x2="8" y2="24" stroke="#88ccee" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="3" fill="#aaddff"/>
        <circle cx="16" cy="5" r="1.5" fill="#cceeFF"/><circle cx="16" cy="27" r="1.5" fill="#cceeFF"/>
        <circle cx="5" cy="16" r="1.5" fill="#cceeFF"/><circle cx="27" cy="16" r="1.5" fill="#cceeFF"/>
      </svg>`,

      flamer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="13" y="16" width="6" height="12" rx="1.5" fill="#884420"/>
        <rect x="11" y="14" width="10" height="5" rx="2" fill="#662a10"/>
        <rect x="14" y="8" width="4" height="8" rx="1" fill="#7a3010"/>
        <path d="M13,14 Q9,10 11,6 Q13,10 11,12 Q13,8 16,6 Q14,10 16,12 Q17,8 20,7 Q18,11 20,14 Z" fill="#ff5500"/>
        <path d="M14,14 Q12,11 13,9 Q15,11 14,13 Q16,9 18,10 Q17,12 18,14 Z" fill="#ffaa00"/>
        <circle cx="16" cy="9" r="2" fill="#ffdd00"/>
      </svg>`,

      tesla: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="#1a1a2a" stroke="#f0c030" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="7" fill="#2a2a10" stroke="#f0c030" stroke-width="1"/>
        <path d="M16,8 L13,15 L16,14 L13,24 L18,15 L15,16 Z" fill="#fff060"/>
      </svg>`,

      laser: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="11" y="12" width="10" height="14" rx="3" fill="#3a1010"/>
        <rect x="13" y="5" width="6" height="10" rx="2" fill="#5a1010"/>
        <circle cx="16" cy="10" r="4" fill="#cc0020" stroke="#ff0040" stroke-width="1"/>
        <circle cx="16" cy="10" r="2" fill="#ff2244"/>
        <line x1="16" y1="5" x2="16" y2="3" stroke="#ff0040" stroke-width="2" stroke-linecap="round"/>
      </svg>`,

      mortar: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="20" width="16" height="6" rx="2" fill="#555566"/>
        <rect x="10" y="18" width="12" height="5" rx="2" fill="#6a6a7a"/>
        <rect x="14" y="6" width="4" height="15" rx="2" fill="#4a4a5a"/>
        <ellipse cx="16" cy="6" rx="5" ry="3" fill="#3a3a4a" stroke="#7a7a8a" stroke-width="1"/>
        <circle cx="16" cy="6" r="2" fill="#aaaacc"/>
      </svg>`,

      venom: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 26,8 26,24 16,30 6,24 6,8" fill="#0a2820" stroke="#10a070" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="6" fill="#103a28" stroke="#10d090" stroke-width="1"/>
        <path d="M13,13 Q16,10 19,13 Q16,18 13,13 Z" fill="#00ee88"/>
        <path d="M13,19 Q16,22 19,19" fill="none" stroke="#00ee88" stroke-width="1.5"/>
        <circle cx="13" cy="15" r="1.5" fill="#00ff88"/><circle cx="19" cy="15" r="1.5" fill="#00ff88"/>
      </svg>`,

      omega: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#1a0830" stroke="#9944ff" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="9" fill="#2a1040" stroke="#cc66ff" stroke-width="1"/>
        <text x="16" y="21" text-anchor="middle" font-size="13" font-weight="bold" fill="#cc88ff" font-family="serif">Ω</text>
      </svg>`,

      phantom: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="4" width="4" height="20" rx="1" fill="#4a3a6a"/>
        <rect x="10" y="8" width="12" height="3" rx="1" fill="#6a5a8a"/>
        <circle cx="16" cy="18" r="5" fill="#2a1a50" stroke="#6a5a9a" stroke-width="1"/>
        <line x1="16" y1="13" x2="16" y2="23" stroke="#9a8acc" stroke-width="0.8"/>
        <line x1="11" y1="18" x2="21" y2="18" stroke="#9a8acc" stroke-width="0.8"/>
        <circle cx="16" cy="18" r="1.5" fill="#cc99ff"/>
      </svg>`,

      temporal: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="13" fill="#102030" stroke="#0099cc" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="9" fill="none" stroke="#0099cc" stroke-width="1" stroke-dasharray="3,2"/>
        <line x1="16" y1="16" x2="16" y2="8" stroke="#00ccee" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="16" x2="22" y2="18" stroke="#0099cc" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="2" fill="#00eeff"/>
      </svg>`,

      reaper: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16,4 Q8,8 8,18 L12,28 L20,28 L24,18 Q24,8 16,4 Z" fill="#1a1a2a"/>
        <path d="M16,6 Q10,10 10,17" fill="none" stroke="#cc0040" stroke-width="2"/>
        <path d="M14,26 Q16,20 18,26" fill="#cc0040"/>
        <circle cx="16" cy="12" r="3" fill="#880020" stroke="#ff0040" stroke-width="1"/>
        <line x1="8" y1="16" x2="24" y2="16" stroke="#440020" stroke-width="1.5"/>
      </svg>`,

      // New towers
      cannon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="18" width="20" height="8" rx="2" fill="#6b4a1e"/>
        <ellipse cx="8" cy="24" rx="5" ry="5" fill="#7a5a28" stroke="#3a2a0e" stroke-width="1.5"/>
        <ellipse cx="24" cy="24" rx="5" ry="5" fill="#7a5a28" stroke="#3a2a0e" stroke-width="1.5"/>
        <rect x="11" y="15" width="10" height="7" rx="1" fill="#887050"/>
        <rect x="13" y="4" width="7" height="18" rx="3" fill="#555566"/>
        <ellipse cx="16.5" cy="4" rx="4.5" ry="3" fill="#333344"/>
        <rect x="12" y="8" width="9" height="2" rx="1" fill="#333344"/>
        <rect x="12" y="13" width="9" height="2" rx="1" fill="#333344"/>
      </svg>`,

      watchtower: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="6" width="12" height="22" rx="1" fill="#8a9aaa"/>
        <rect x="8" y="4" width="4" height="6" rx="0.5" fill="#9aaabb"/>
        <rect x="14" y="4" width="4" height="6" rx="0.5" fill="#9aaabb"/>
        <rect x="20" y="4" width="4" height="6" rx="0.5" fill="#9aaabb"/>
        <rect x="13" y="12" width="6" height="9" rx="0.5" fill="#1a2530"/>
        <rect x="14" y="13" width="4" height="7" rx="0.5" fill="#0a1520"/>
        <line x1="10" y1="15" x2="22" y2="15" stroke="#707880" stroke-width="1"/>
        <line x1="10" y1="20" x2="22" y2="20" stroke="#707880" stroke-width="1"/>
        <rect x="8" y="26" width="16" height="4" rx="1" fill="#707880"/>
      </svg>`,

      gauss: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 28,8 28,24 16,30 4,24 4,8" fill="#0a1828" stroke="#0088cc" stroke-width="1.5"/>
        <rect x="14" y="4" width="4" height="20" rx="1.5" fill="#1a3048"/>
        <rect x="12" y="7" width="8" height="2.5" rx="1" fill="#0066aa"/>
        <rect x="12" y="11" width="8" height="2.5" rx="1" fill="#0066aa"/>
        <rect x="12" y="15" width="8" height="2.5" rx="1" fill="#0066aa"/>
        <ellipse cx="16" cy="4" rx="4" ry="2.5" fill="#003366" stroke="#00aaff" stroke-width="1"/>
        <circle cx="16" cy="4" r="1.5" fill="#00ccff"/>
      </svg>`,

      pyromancer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M11,30 L11,18 L8,18 L16,6 L24,18 L21,18 L21,30 Z" fill="#6a1010"/>
        <rect x="12" y="22" width="8" height="3" rx="1" fill="#cc8820"/>
        <circle cx="16" cy="10" r="4" fill="#cc7755"/>
        <path d="M12,8 Q13,5 16,4 Q14,7 15,8 Q16,5 19,5 Q17,8 18,9 Q16,6 14,8 Z" fill="#ff5500"/>
        <path d="M14,9 Q15,7 16,8 Q15.5,7 17,8 Z" fill="#ffcc00"/>
        <line x1="20" y1="14" x2="26" y2="6" stroke="#8a5020" stroke-width="2" stroke-linecap="round"/>
        <circle cx="26" cy="6" r="3" fill="#ff6600"/>
        <circle cx="26" cy="6" r="1.5" fill="#ffdd00"/>
      </svg>`,

      shockwave: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="#2a2010" stroke="#cc9900" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="9" fill="#3a3010"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="#cc9900" stroke-width="2"/>
        <circle cx="16" cy="16" r="3" fill="#ffaa00"/>
        <circle cx="16" cy="16" r="1.5" fill="#ffffff"/>
        <line x1="16" y1="7" x2="16" y2="10" stroke="#cc9900" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="16" y1="22" x2="16" y2="25" stroke="#cc9900" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="7" y1="16" x2="10" y2="16" stroke="#cc9900" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22" y1="16" x2="25" y2="16" stroke="#cc9900" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,

      crossbow: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="4" width="4" height="22" rx="1" fill="#5a3a18"/>
        <rect x="6" y="14" width="20" height="4" rx="2" fill="#8a6030"/>
        <path d="M6,16 Q6,12 16,11 Q26,12 26,16" fill="none" stroke="#c8a040" stroke-width="2"/>
        <line x1="8" y1="16" x2="24" y2="16" stroke="#c8d880" stroke-width="1"/>
        <polygon points="16,4 18,8 14,8" fill="#ffe060"/>
      </svg>`,

      cryomancer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#0a1830" stroke="#2266aa" stroke-width="1.5"/>
        <polygon points="16,6 17.7,11.5 23.5,11.5 18.9,14.8 20.6,20.3 16,17 11.4,20.3 13.1,14.8 8.5,11.5 14.3,11.5" fill="#4488cc"/>
        <circle cx="16" cy="16" r="3" fill="#88ccff"/>
      </svg>`,

      buzzsaw: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#2a2a2a" stroke="#888" stroke-width="1"/>
        <circle cx="16" cy="16" r="7" fill="#1a1a1a" stroke="#aaa" stroke-width="1"/>
        <circle cx="16" cy="16" r="2.5" fill="#888"/>
        <polygon points="16,4 17.2,8 20,6 18.8,10 23,10 20,13 24,16 20,19 23,22 18.8,22 20,26 17.2,24 16,28 14.8,24 12,26 13.2,22 9,22 12,19 8,16 12,13 9,10 13.2,10 12,6 14.8,8" fill="#cccccc"/>
      </svg>`,

      beacon: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="13" y="18" width="6" height="10" rx="1" fill="#2a3040"/>
        <rect x="10" y="26" width="12" height="3" rx="1" fill="#1a2030"/>
        <circle cx="16" cy="14" r="6" fill="#1a3040" stroke="#0088cc" stroke-width="1.5"/>
        <circle cx="16" cy="14" r="3" fill="#0066aa"/>
        <path d="M10,8 Q16,4 22,8" fill="none" stroke="#00aaff" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8,5 Q16,0 24,5" fill="none" stroke="#0066cc" stroke-width="1" stroke-linecap="round"/>
      </svg>`,

      pyre: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 24,12 20,12 22,22 16,18 10,22 12,12 8,12" fill="#cc3300"/>
        <polygon points="16,6 21,13 18,13 19.5,20 16,17 12.5,20 14,13 11,13" fill="#ff6600"/>
        <circle cx="16" cy="14" r="3" fill="#ffcc00"/>
        <rect x="13" y="22" width="6" height="8" rx="1" fill="#4a2010"/>
      </svg>`,

      railgun: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="#0a1420" stroke="#4488cc" stroke-width="1"/>
        <rect x="14" y="4" width="4" height="22" rx="1" fill="#1a2840"/>
        <rect x="12" y="4" width="8" height="2.5" rx="1" fill="#334466"/>
        <rect x="10" y="8" width="12" height="1.5" rx="0.7" fill="#2244aa"/>
        <rect x="10" y="11.5" width="12" height="1.5" rx="0.7" fill="#2244aa"/>
        <rect x="10" y="15" width="12" height="1.5" rx="0.7" fill="#2244aa"/>
        <circle cx="16" cy="4" r="2" fill="#4488ff"/>
      </svg>`,

      necromancer: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,30 L10,18 L8,18 L16,8 L24,18 L22,18 L22,30 Z" fill="#1a1a2a"/>
        <circle cx="16" cy="12" r="5" fill="#2a2a40" stroke="#8844cc" stroke-width="1.5"/>
        <circle cx="14" cy="11" r="1.5" fill="#aa44ff"/><circle cx="18" cy="11" r="1.5" fill="#aa44ff"/>
        <path d="M13,14 Q16,16 19,14" fill="none" stroke="#6622aa" stroke-width="1.5"/>
        <line x1="16" y1="17" x2="16" y2="22" stroke="#6622aa" stroke-width="2"/>
        <path d="M12,22 Q16,20 20,22" fill="none" stroke="#8844cc" stroke-width="1.5"/>
      </svg>`,

      stormcaller: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="13" fill="#0a1025" stroke="#5588cc" stroke-width="1.5"/>
        <path d="M20,8 L14,16 L17,16 L12,24 L18,16 L15,16 Z" fill="#88aaff"/>
        <path d="M10,12 Q16,6 22,12 Q26,18 20,22 Q16,24 12,22 Q8,18 10,12 Z" fill="none" stroke="#4466aa" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="2" fill="#aaccff"/>
      </svg>`,

      spiker: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="13" y="12" width="6" height="16" rx="2" fill="#442244"/>
        <polygon points="16,4 18.5,11 13.5,11" fill="#aa4488"/>
        <polygon points="8,16 13,14 13,18" fill="#882266"/>
        <polygon points="24,16 19,14 19,18" fill="#882266"/>
        <circle cx="16" cy="16" r="3" fill="#cc66aa"/>
      </svg>`,

      chrono: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="13" fill="#0a1a2a" stroke="#0099cc" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="9" fill="none" stroke="#0066aa" stroke-width="1"/>
        <circle cx="16" cy="16" r="5" fill="none" stroke="#0088cc" stroke-width="1"/>
        <line x1="16" y1="16" x2="16" y2="9" stroke="#00ccff" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="16" x2="21" y2="18" stroke="#0099aa" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="16" cy="16" r="2" fill="#00eeff"/>
      </svg>`,

      magnet: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M6,24 L6,14 Q6,6 16,6 Q26,6 26,14 L26,24 L22,24 L22,14 Q22,10 16,10 Q10,10 10,14 L10,24 Z" fill="#993322"/>
        <rect x="6" y="22" width="6" height="5" rx="1" fill="#4444cc"/>
        <rect x="20" y="22" width="6" height="5" rx="1" fill="#cccc00"/>
        <circle cx="16" cy="16" r="3" fill="#cc2222"/>
      </svg>`,

      artillery: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="22" width="20" height="6" rx="2" fill="#556677"/>
        <ellipse cx="9" cy="26" rx="4" ry="4" fill="#667788" stroke="#445566" stroke-width="1"/>
        <ellipse cx="23" cy="26" rx="4" ry="4" fill="#667788" stroke="#445566" stroke-width="1"/>
        <rect x="11" y="19" width="10" height="5" rx="1" fill="#778899"/>
        <rect x="14" y="5" width="5" height="17" rx="2.5" fill="#445566"/>
        <ellipse cx="16.5" cy="5" rx="3.5" ry="2.5" fill="#334455" stroke="#667788" stroke-width="1"/>
      </svg>`,

      infector: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#0a1a10" stroke="#22aa44" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="7" fill="#102210" stroke="#44cc66" stroke-width="1"/>
        <circle cx="16" cy="13" r="2.5" fill="#22dd66"/>
        <circle cx="13" cy="18" r="2" fill="#22dd66"/>
        <circle cx="19" cy="18" r="2" fill="#22dd66"/>
        <line x1="16" y1="15.5" x2="13" y2="18" stroke="#22aa44" stroke-width="1"/>
        <line x1="16" y1="15.5" x2="19" y2="18" stroke="#22aa44" stroke-width="1"/>
      </svg>`,

      golem: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="16" width="12" height="14" rx="2" fill="#6a6050"/>
        <rect x="8" y="20" width="4" height="8" rx="2" fill="#5a5040"/>
        <rect x="20" y="20" width="4" height="8" rx="2" fill="#5a5040"/>
        <circle cx="16" cy="12" r="7" fill="#7a7060"/>
        <circle cx="13" cy="11" r="2" fill="#e08020"/>
        <circle cx="19" cy="11" r="2" fill="#e08020"/>
        <circle cx="13" cy="11" r="1" fill="#0a0a0a"/>
        <circle cx="19" cy="11" r="1" fill="#0a0a0a"/>
      </svg>`,

      drone_bay: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="14" width="12" height="12" rx="2" fill="#2a3a44"/>
        <rect x="12" y="16" width="8" height="8" rx="1" fill="#1a2a34"/>
        <ellipse cx="9" cy="12" rx="5" ry="3" fill="#334455"/>
        <ellipse cx="23" cy="12" rx="5" ry="3" fill="#334455"/>
        <circle cx="9" cy="12" r="2" fill="#4488aa"/>
        <circle cx="23" cy="12" r="2" fill="#4488aa"/>
        <line x1="9" y1="12" x2="14" y2="16" stroke="#224466" stroke-width="1.5"/>
        <line x1="23" y1="12" x2="18" y2="16" stroke="#224466" stroke-width="1.5"/>
      </svg>`,

      apache: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="18" rx="11" ry="5" fill="#4a5a2a"/>
        <ellipse cx="14" cy="16" rx="5" ry="4" fill="#5a6a34"/>
        <rect x="23" y="17" width="7" height="2" rx="1" fill="#3a4a1a"/>
        <rect x="2" y="18" width="4" height="2" rx="1" fill="#3a4a1a"/>
        <line x1="16" y1="10" x2="16" y2="12" stroke="#555" stroke-width="2"/>
        <line x1="6" y1="10" x2="26" y2="10" stroke="#666" stroke-width="2" stroke-linecap="round"/>
        <line x1="16" y1="24" x2="28" y2="22" stroke="#3a4a1a" stroke-width="1.5"/>
        <circle cx="14" cy="18" r="2" fill="#aabbcc"/>
      </svg>`,

      stormwing: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,5 28,20 22,19 22,26 10,26 10,19 4,20" fill="#335577"/>
        <polygon points="16,8 25,19 20,18 20,23 12,23 12,18 7,19" fill="#446688"/>
        <circle cx="16" cy="18" r="3" fill="#aabbcc"/>
        <line x1="16" y1="10" x2="16" y2="6" stroke="#8899aa" stroke-width="2"/>
      </svg>`,

      stratobomber: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,6 30,16 26,18 26,24 6,24 6,18 2,16" fill="#3a4a2a"/>
        <rect x="13" y="12" width="6" height="12" rx="2" fill="#4a5a34"/>
        <ellipse cx="10" cy="20" rx="3" ry="2" fill="#2a3a1a"/>
        <ellipse cx="22" cy="20" rx="3" ry="2" fill="#2a3a1a"/>
        <circle cx="16" cy="18" r="2.5" fill="#778866"/>
        <polygon points="14,24 16,30 18,24" fill="#555"/>
      </svg>`,

      spectre: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,5 30,14 28,24 4,24 2,14" fill="#2a3040"/>
        <ellipse cx="16" cy="16" rx="8" ry="5" fill="#3a4050"/>
        <circle cx="16" cy="16" r="3" fill="#5566aa"/>
        <ellipse cx="8" cy="22" rx="3" ry="2" fill="#1a2030"/>
        <ellipse cx="24" cy="22" rx="3" ry="2" fill="#1a2030"/>
        <line x1="4" y1="18" x2="28" y2="18" stroke="#4455aa" stroke-width="1"/>
      </svg>`,

      sky_fortress: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="#1a2030" stroke="#cc8820" stroke-width="1.5"/>
        <polygon points="16,6 26,12 26,20 16,26 6,20 6,12" fill="#2a3040" stroke="#886610" stroke-width="1"/>
        <circle cx="16" cy="16" r="6" fill="#1a2030" stroke="#cc8820" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="3" fill="#cc8820"/>
        <line x1="16" y1="6" x2="16" y2="10" stroke="#cc8820" stroke-width="2"/>
        <line x1="16" y1="22" x2="16" y2="26" stroke="#cc8820" stroke-width="2"/>
        <line x1="6" y1="16" x2="10" y2="16" stroke="#cc8820" stroke-width="2"/>
        <line x1="22" y1="16" x2="26" y2="16" stroke="#cc8820" stroke-width="2"/>
      </svg>`,

      celestial_overlord: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="#1a1000"/>
        <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="#ffd700" stroke-width="1.2" opacity="0.8"/>
        <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#ff88ff" stroke-width="1" opacity="0.7" transform="rotate(60,16,16)"/>
        <ellipse cx="16" cy="16" rx="10" ry="4" fill="none" stroke="#00eeff" stroke-width="1" opacity="0.7" transform="rotate(120,16,16)"/>
        <!-- hull -->
        <polygon points="16,4 19,13 16,20 13,13" fill="#ffd700"/>
        <polygon points="16,6 17.5,12 16,17 14.5,12" fill="#fff8a0"/>
        <!-- wings -->
        <polygon points="19,12 28,10 26,17 19,15" fill="rgba(255,215,0,0.7)"/>
        <polygon points="13,12 4,10 6,17 13,15" fill="rgba(255,215,0,0.7)"/>
        <!-- crown -->
        <polygon points="14,4 15,2 16,4 17,2 18,4 19,3 18,5 14,5 13,3" fill="#ffd700" stroke="#fff8a0" stroke-width="0.5"/>
        <!-- gem -->
        <circle cx="16" cy="3" r="1" fill="#ff4444"/>
        <!-- engine glow -->
        <circle cx="16" cy="20" r="3" fill="rgba(255,140,0,0.8)"/>
        <circle cx="16" cy="20" r="1.5" fill="#ffffff"/>
        <!-- sparkles -->
        <circle cx="6" cy="8" r="1" fill="#ffd700" opacity="0.9"/>
        <circle cx="26" cy="8" r="1" fill="#ff88ff" opacity="0.9"/>
        <circle cx="4" cy="18" r="1" fill="#00eeff" opacity="0.9"/>
        <circle cx="28" cy="18" r="1" fill="#ffd700" opacity="0.9"/>
      </svg>`,

      banana_farm: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="18" width="20" height="12" rx="2" fill="#4a7a20"/>
        <ellipse cx="16" cy="18" rx="12" ry="5" fill="#5a8a28"/>
        <path d="M10,14 Q12,8 16,10 Q14,14 10,14 Z" fill="#ffd020"/>
        <path d="M14,12 Q16,6 20,9 Q17,13 14,12 Z" fill="#ffdd00"/>
        <path d="M18,13 Q22,8 24,12 Q20,14 18,13 Z" fill="#ffd020"/>
      </svg>`,

      monkey_bank: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="12" width="20" height="16" rx="3" fill="#aa7722"/>
        <rect x="8" y="10" width="16" height="5" rx="2" fill="#cc9933"/>
        <rect x="12" y="8" width="8" height="4" rx="1.5" fill="#bb8822"/>
        <rect x="14" y="6" width="4" height="4" rx="1" fill="#ddaa44"/>
        <rect x="13" y="16" width="6" height="2" rx="1" fill="#665511"/>
        <text x="16" y="25" text-anchor="middle" font-size="8" font-weight="bold" fill="#ffdd66" font-family="sans-serif">$</text>
      </svg>`,
    };

    // Look up icon by id, fallback to a generic icon using the tower's color
    if (icons[id]) {
      return `<span class="tp-svg-icon">${icons[id]}</span>`;
    }
    // Generic fallback — colored circle with first letter
    const letter = def.name ? def.name[0] : '?';
    return `<span class="tp-svg-icon"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${col}44" stroke="${col}" stroke-width="1.5"/>
      <text x="16" y="21" text-anchor="middle" font-size="14" font-weight="bold" fill="${col}" font-family="sans-serif">${letter}</text>
    </svg></span>`;
  }

  function _addPaletteItem(palette, def, owned, isOwnerItem) {
    const item = document.createElement('div');
    item.className = 'tp-item' + (owned ? '' : ' locked');
    item.dataset.id = def.id;
    item.dataset.rarity = def.rarity;
    if (isOwnerItem) item.style.borderColor = def.color;

    const costColor = isOwnerItem ? def.color : '';
    const dps = (def.damage * def.fireRate).toFixed(1);
    const ecoChip = def.isEconomy
      ? (def.isFarm ? `<div class="tp-eco-chip">$${def.incomePerRound}/rd</div>`
                    : `<div class="tp-eco-chip">BANK</div>`)
      : '';

    item.innerHTML = `
      <div class="tp-icon">${_towerSvgIcon(def)}${def.isAir ? '<span class="tp-air-badge">AIR</span>' : ''}</div>
      <div class="tp-name">${def.name}</div>
      <div class="tp-cost" style="color:${costColor}">${owned ? '💰'+def.cost : '🔒'}</div>
      ${ecoChip}
      ${!owned ? '<div class="tp-locked-icon">🔒</div>' : ''}
      ${owned ? `<div class="tp-tip">
        <div class="tp-tip-name">${def.name}</div>
        <div class="tp-tip-desc">${def.desc || ''}</div>
        ${def.isEconomy ? `<div class="tp-tip-stat"><span>${def.isFarm?'Income/Round':'Bank Cap'}</span><strong>${def.isFarm?'$'+def.incomePerRound+'/rd':'$'+(def.bankCap||7000).toLocaleString()}</strong></div>` : `
        <div class="tp-tip-stat"><span>DMG</span><strong>${def.damage}</strong></div>
        <div class="tp-tip-stat"><span>RNG</span><strong>${def.range}</strong></div>
        <div class="tp-tip-stat"><span>DPS</span><strong>${dps}</strong></div>
        ${def.splash>0?`<div class="tp-tip-stat"><span>SPLASH</span><strong>${def.splash}</strong></div>`:''}
        ${def.slow>0?`<div class="tp-tip-stat"><span>SLOW</span><strong>${Math.round(def.slow*100)}%</strong></div>`:''}
        ${def.chain>0?`<div class="tp-tip-stat"><span>CHAIN</span><strong>×${def.chain}</strong></div>`:''}`}
      </div>` : ''}
    `;
    if (owned) item.onclick = () => Game.selectTowerToPlace(def.id);
    else item.onclick = () => toast('Buy this tower in the Shop first!', 'gold');
    palette.appendChild(item);
  }

  // ── TOWER INFO ────────────────────────────────
  function showTowerInfo(tower) {
    const panel  = document.getElementById('selPanel');
    const info   = document.getElementById('selInfo');
    const upgBtn = document.getElementById('btnUpgrade');
    const price  = document.getElementById('upgradePrice');
    panel.style.display = 'block';

    const upgCost = tower.getUpgradeCost();
    const nextUpg = tower.level < tower.def.maxUpgrade ? tower.def.upgrades[tower.level] : null;
    const upgName = nextUpg ? nextUpg.name : 'MAX LEVEL';

    // Upgrade path nodes
    const maxUp = tower.def.maxUpgrade;
    let upgPath = '<div class="upg-path">';
    for (let i = 0; i < maxUp; i++) {
      if (i > 0) upgPath += `<div class="upg-line${i <= tower.level ? ' done' : ''}"></div>`;
      const cls = i < tower.level ? 'done' : (i === tower.level ? 'current' : 'future');
      upgPath += `<div class="upg-node ${cls}" title="${tower.def.upgrades[i]?.name||''}">${i+1}</div>`;
    }
    upgPath += '</div>';

    // Economy tower display
    if (tower.isEconomy) {
      const isBankMode = tower.isBank || tower.bankMode;
      const pct = isBankMode && tower.bankCap > 0 ? Math.round(tower.bankBalance / tower.bankCap * 100) : 0;
      const nextDesc = nextUpg?.desc || '';

      info.innerHTML = `
        <div class="si-name">${tower.def.icon} ${tower.def.name}</div>
        <div style="margin-bottom:4px">
          <span class="rarity-${tower.def.rarity}">${tower.def.rarity.toUpperCase()}</span>
          &nbsp;<span style="color:var(--txt2);font-size:10px">Lv ${tower.level}/${maxUp}</span>
        </div>
        ${maxUp > 0 ? upgPath : ''}
        ${tower.isFarm && !tower.bankMode ? `
          <div class="eco-stat"><span>💰 Income/Round</span><strong style="color:#4ade80">$${tower.incomePerRound}</strong></div>
          <div class="eco-stat"><span>📈 Total Earned</span><strong style="color:#fbbf24">$${tower.totalEarned}</strong></div>
        ` : ''}
        ${isBankMode ? `
          <div class="eco-stat"><span>🏦 Balance</span><strong style="color:#4ade80">$${tower.bankBalance.toLocaleString()}</strong></div>
          <div class="eco-stat"><span>📊 Cap</span><strong style="color:var(--txt2)">$${tower.bankCap.toLocaleString()}</strong></div>
          <div class="eco-stat"><span>💹 Rate</span><strong style="color:#4ade80">${Math.round((tower.bankRate||0.15)*100)}%/round</strong></div>
          <div class="bank-bar-wrap"><div class="bank-bar-fill" style="width:${pct}%"></div><span class="bank-bar-pct">${pct}%</span></div>
          <button id="btnWithdraw" class="withdraw-btn" style="${tower.bankBalance>0?'':'opacity:0.4;cursor:not-allowed'}" ${tower.bankBalance<=0?'disabled':''}>
            💸 WITHDRAW $${tower.bankBalance.toLocaleString()}
          </button>
        ` : ''}
        ${nextDesc ? `<div style="font-size:10px;color:var(--txt2);margin-top:4px;font-style:italic">Next: ${nextDesc}</div>` : ''}
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin-top:6px;padding-top:5px;font-family:var(--f-mono);font-size:10px;color:var(--txt2)">
          SELL <strong style="color:var(--amber3)">💰${tower.getSellValue()}</strong>
          <span style="opacity:0.45;margin-left:3px">[S]</span>
        </div>
        ${upgCost ? `<div style="color:var(--amber3);font-size:10px;margin-top:3px;font-family:var(--f-mono)">⬆ ${upgName} <span style="opacity:0.45">[G]</span></div>` : ''}
      `;

      // Wire withdraw button
      const wBtn = document.getElementById('btnWithdraw');
      if (wBtn) {
        wBtn.onclick = () => {
          if (tower.bankBalance <= 0) return;
          if (typeof Game !== 'undefined') {
            Game.withdrawBank(tower);
            showTowerInfo(tower);
          }
        };
      }
    } else {
      const auraMult = tower.auraBuff || 1;
      const effDmg = Math.floor(tower.damage * auraMult);
      const dps = (tower.damage * tower.fireRate * auraMult).toFixed(1);
      const buffed = auraMult > 1.0;

      const statBar = (label, val, maxVal, color) => `
        <div class="sbar-row">
          <span class="sbar-lbl">${label}</span>
          <div class="sbar-track"><div class="sbar-fill" style="width:${Math.min(100,val/maxVal*100).toFixed(1)}%;background:${color}"></div></div>
          <span class="sbar-val">${val}</span>
        </div>`;

      info.innerHTML = `
        <div class="si-name">${tower.def.icon} ${tower.def.name}</div>
        <div style="margin-bottom:4px">
          <span class="rarity-${tower.def.rarity}">${tower.def.rarity.toUpperCase()}</span>
          &nbsp;<span style="color:var(--txt2);font-size:10px">Lv ${tower.level}/${maxUp}</span>
          ${buffed ? ' <span style="color:#f1c40f;font-size:9px;letter-spacing:1px">⬆ BUFFED</span>' : ''}
        </div>
        ${maxUp > 0 ? upgPath : ''}
        ${statBar('DMG', effDmg, 600, 'var(--red2)')}
        ${statBar('RNG', Math.floor(tower.range), 350, 'var(--cyan2)')}
        ${statBar('DPS', parseFloat(dps), 200, 'var(--amber2)')}
        ${tower.splash>0 ? statBar('SPLASH', Math.floor(tower.splash), 200, '#f97316') : ''}
        ${tower.slow>0   ? statBar('SLOW', Math.floor(tower.slow*100)+'%', '100%', '#60a5fa') : ''}
        ${tower.chain>0  ? `<div style="font-size:10px;color:var(--txt2);font-family:var(--f-mono)">CHAIN: <strong style="color:var(--cyan3)">×${tower.chain}</strong></div>` : ''}
        ${tower.burn>0   ? `<div style="font-size:10px;color:var(--txt2);font-family:var(--f-mono)">BURN: <strong style="color:#f97316">${tower.burn}/s</strong></div>` : ''}
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin-top:6px;padding-top:5px;font-family:var(--f-mono);font-size:10px;color:var(--txt2)">
          SELL <strong style="color:var(--amber3)">💰${tower.getSellValue()}</strong>
          <span style="opacity:0.45;margin-left:3px">[S]</span>
        </div>
        ${upgCost ? `<div style="color:var(--amber3);font-size:10px;margin-top:3px;font-family:var(--f-mono)">⬆ ${upgName} <span style="opacity:0.45">[G]</span></div>` : ''}
      `;
    }

    if (upgCost) {
      upgBtn.style.display = 'block';
      price.textContent    = '💰' + upgCost;
      upgBtn.style.opacity = (typeof Game !== 'undefined' && Game.money >= upgCost) ? '1' : '0.5';
    } else {
      upgBtn.style.display = 'none';
    }
  }

  // ── SHOP ─────────────────────────────────────
  function _buildShop(filter = 'all') {
    document.getElementById('shopCoins').textContent = PF.getCoins();
    const allOwned = new Set([
      ...ownedTowers,
      ...(PF.isLoggedIn() ? PF.ownersTowers() : []),
    ]);
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';
    TOWER_DEFS
      .filter(d => !d.ownerOnly && d.shopCost > 0)
      .filter(d => filter === 'all' || d.rarity === filter)
      .forEach(def => {
        const owned = allOwned.has(def.id);
        const card  = document.createElement('div');
        card.className = 'shop-card' + (owned ? ' owned' : '');

        // Rarity colour for the label
        const rarityColors = { basic:'#8cb2c8', advanced:'#3dd6f5', special:'#9b59b6', legendary:'#f5b215' };
        const rarityCol = rarityColors[def.rarity] || '#8cb2c8';

        // Build tooltip stats
        const statRows = def.isEconomy
          ? (def.isFarm
              ? `<div class="sc-tip-stat"><span>Income</span><strong>$${def.incomePerRound}/rd</strong></div>`
              : `<div class="sc-tip-stat"><span>Bank Cap</span><strong>$${(def.bankCap||7000).toLocaleString()}</strong></div>`)
          : `<div class="sc-tip-stat"><span>Damage</span><strong>${def.damage}</strong></div>
             <div class="sc-tip-stat"><span>Range</span><strong>${def.range}</strong></div>
             <div class="sc-tip-stat"><span>Fire Rate</span><strong>${def.fireRate}/s</strong></div>
             ${def.splash>0 ? `<div class="sc-tip-stat"><span>Splash</span><strong>${def.splash}</strong></div>` : ''}
             ${def.slow>0   ? `<div class="sc-tip-stat"><span>Slow</span><strong>${Math.round(def.slow*100)}%</strong></div>` : ''}`;

        card.innerHTML = `
          <div class="sc-rarity" style="color:${rarityCol}">${def.rarity.toUpperCase()}</div>
          <div class="sc-icon">${def.icon}</div>
          <div class="sc-name">${def.name}</div>
          <div class="sc-price">${owned ? '✓ OWNED' : '💰 ' + def.shopCost.toLocaleString()}</div>
          <div class="sc-tip">
            <div class="sc-tip-name">${def.name}</div>
            <div class="sc-tip-desc">${def.desc || ''}</div>
            ${statRows}
          </div>
        `;
        if (!owned) card.onclick = () => _buyTower(def);
        grid.appendChild(card);
      });
  }

  async function _buyTower(def) {
    const coins = PF.getCoins();
    if (coins < def.shopCost) { toast('Not enough coins!', 'red'); return; }
    if (!PF.isLoggedIn()) {
      const c = parseInt(localStorage.getItem('ztd_coins') || '100');
      if (c < def.shopCost) { toast('Not enough coins!', 'red'); return; }
      localStorage.setItem('ztd_coins', c - def.shopCost);
      ownedTowers.add(def.id); _saveLocalProgress();
      toast(`${def.name} unlocked!`, 'green');
      _buildShop(document.querySelector('.sf.active')?.dataset.sf || 'all');
      return;
    }
    const res = await PF.buyTower(def.id, def.shopCost);
    if (res.ok) {
      ownedTowers.add(def.id); _saveLocalProgress();
      toast(`${def.name} unlocked!`, 'green');
      _buildShop(document.querySelector('.sf.active')?.dataset.sf || 'all');
      _updateProfileUI();
    } else { toast(res.msg, 'red'); }
  }

  function _bindShopFilters() {
    document.querySelectorAll('.sf').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.sf').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _buildShop(btn.dataset.sf);
      };
    });
  }

  // ── LEADERBOARD ───────────────────────────────
  function _bindLbTabs() {
    document.querySelectorAll('.lbt').forEach(btn => {
      btn.onclick = () => {
        if (btn.id === 'btnRefreshLB') { _refreshLeaderboard(currentLbStat); return; }
        document.querySelectorAll('.lbt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLbStat = btn.dataset.lb;
        _refreshLeaderboard(currentLbStat);
      };
    });
    document.getElementById('btnRefreshLB').onclick = () => _refreshLeaderboard(currentLbStat);
  }

  async function _refreshLeaderboard(stat) {
    const wrap = document.getElementById('lbWrap');
    if (!wrap) return;
    wrap.innerHTML = '<p class="lb-loading">⏳ Loading leaderboard…</p>';
    // Show login hint if not logged in
    const hint = document.getElementById('lbLoginHint');
    if (hint) hint.style.display = PF.isLoggedIn() ? 'none' : 'block';
    try {
      const entries = await PF.getLeaderboard(stat, 100);
      if (!entries.length) {
        wrap.innerHTML = `
          <div style="text-align:center;padding:24px;font-family:var(--f-mono)">
            <div style="font-size:28px;margin-bottom:10px">📊</div>
            <div style="color:var(--txt2);font-size:10px;margin-bottom:6px">No scores yet.</div>
            <div style="color:var(--txt3);font-size:9px;line-height:1.7">
              Make sure the statistic <strong style="color:var(--amber3)">${stat}</strong> is created in your PlayFab Dashboard.<br>
              Dashboard → Leaderboards → New Statistic → name it exactly: <strong style="color:var(--cyan3)">${stat}</strong>
            </div>
          </div>`;
        return;
      }
      const isMod = PF.getPanelRole && (PF.getPanelRole() === 'owner' || PF.getPanelRole() === 'moderator');
      const myId  = PF.playFabId || '';
      wrap.innerHTML = entries.map((e, i) => {
        const isMe   = myId && e.PlayFabId === myId;
        const medal  = i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1);
        const name   = (e.DisplayName || e.PlayFabId?.slice(0,8) || 'Player');
        const pfChip = isMod
          ? `<span class="lb-pfid" title="Click to copy PlayFab ID" onclick="navigator.clipboard.writeText('${e.PlayFabId}').then(()=>UI.toast('ID copied!','green'))">[${(e.PlayFabId||'').slice(0,8)}]</span>`
          : '';
        return `
          <div class="lb-row${isMe ? ' lb-me' : ''}">
            <span class="lb-rank rank-${Math.min(i+1,4)}">${medal}</span>
            <span class="lb-name">${name}${pfChip}</span>
            <span class="lb-val">${(e.StatValue||0).toLocaleString()}</span>
          </div>`;
      }).join('');
    } catch(err) {
      wrap.innerHTML = `<p class="lb-loading" style="color:var(--red2)">Failed to load leaderboard. Check console.</p>`;
      console.error('[LB]', err);
    }
  }

  // ── AUTH / PROFILE ────────────────────────────
  function _bindAuthButtons() {
    document.getElementById('btnLogin').onclick    = _doLogin;
    document.getElementById('btnRegister').onclick = _doRegister;
    document.getElementById('btnLogout').onclick   = _doLogout;
    // Allow enter key
    ['authUser','authPass'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') _doLogin();
      });
    });
  }

  async function _doLogin() {
    const u = document.getElementById('authUser').value.trim();
    const p = document.getElementById('authPass').value;
    if (!u || !p) { _setAuthStatus('Please fill in both fields', 'err'); return; }
    _setAuthStatus('Logging in…', '');
    const res = await PF.login(u, p);
    if (res.ok) {
      _setAuthStatus('Welcome back, ' + (PF.displayName || u) + '!', 'ok');
      _syncPFProgress();
      _updateProfileUI();
      _buildShop();
      _buildMapGrid();
      if (PF.isOwner) _showOwnerTrigger();
      else _hideOwnerTrigger();
    } else {
      _setAuthStatus(res.msg, 'err');
    }
  }

  async function _doRegister() {
    const u = document.getElementById('authUser').value.trim();
    const p = document.getElementById('authPass').value;
    if (!u || !p)   { _setAuthStatus('Fill in both fields', 'err'); return; }
    if (p.length<6) { _setAuthStatus('Password must be 6+ characters', 'err'); return; }
    _setAuthStatus('Creating account…', '');
    const res = await PF.register(u, p);
    if (res.ok) {
      _setAuthStatus('Account created! Welcome, ' + u + '!', 'ok');
      _updateProfileUI();
      if (PF.isOwner) _showOwnerTrigger();
    } else {
      _setAuthStatus(res.msg, 'err');
    }
  }

  function _doLogout() {
    PF.logout();
    _updateProfileUI();
    _hideOwnerTrigger();
    _buildShop();
    _buildMapGrid();
    _setAuthStatus('', '');
    toast('Logged out', '');
  }

  function _setAuthStatus(msg, type) {
    const el = document.getElementById('authMsg');
    if (!el) return;
    el.textContent = msg;
    el.className   = 'auth-msg ' + (type || '');
  }

  // ── PROFILE UI ────────────────────────────────
  function _updateProfileUI() {
    const authBox      = document.getElementById('authBox');
    const profilePanel = document.getElementById('profilePanel');

    if (PF.isLoggedIn()) {
      authBox.classList.add('hidden');
      profilePanel.classList.remove('hidden');

      // Stats
      const d = PF.playerData;
      document.getElementById('pName').textContent        = PF.displayName || 'Survivor';
      document.getElementById('pCoins').textContent       = d.Coins || 0;
      document.getElementById('pBestWave').textContent    = d.BestWave || 0;
      document.getElementById('pTotalKills').textContent  = d.TotalKills || 0;
      document.getElementById('pTowersOwned').textContent = (d.OwnedTowers||[]).length;
      // Level/XP
      if (typeof AccountLevel !== 'undefined') {
        AccountLevel.load(d.AccountXP || 0);
        _updateProfileLevelUI();
      }

      // Cosmetics from inventory using catalog details
      _renderCosmeticInventory();

    } else {
      authBox.classList.remove('hidden');
      profilePanel.classList.add('hidden');
    }
  }

  function _updateProfileLevelUI() {
    if (typeof AccountLevel === 'undefined') return;
    const prog = AccountLevel.getProgress();
    const col  = AccountLevel.getLevelColor(prog.level);
    const title = AccountLevel.getTitle(prog.level);
    const badge = document.getElementById('pAcctLevelBadge');
    if (badge) {
      badge.textContent  = prog.level;
      badge.style.color  = col;
      badge.style.borderColor = col;
      badge.style.boxShadow = `0 0 12px ${col}55`;
    }
    const titleEl = document.getElementById('pAcctTitle');
    if (titleEl) titleEl.textContent = title;
    const xpCur = document.getElementById('pXPCurrent');
    if (xpCur) xpCur.textContent = prog.level >= 100 ? 'MAX LEVEL' : `${prog.current.toLocaleString()} XP`;
    const xpNeed = document.getElementById('pXPNeeded');
    if (xpNeed) xpNeed.textContent = prog.level >= 100 ? '' : `/ ${prog.needed.toLocaleString()}`;
    const xpBar = document.getElementById('pXPBar');
    if (xpBar) { xpBar.style.width = (prog.pct*100).toFixed(1)+'%'; xpBar.style.background = col; }
    // Next unlock
    const nextUnlockEl = document.getElementById('pNextUnlock');
    if (nextUnlockEl && prog.level < 100) {
      const nextLvl = Object.keys(AccountLevel.LEVEL_UNLOCKS)
        .map(Number).sort((a,b)=>a-b).find(l => l > prog.level);
      if (nextLvl) {
        const un = AccountLevel.LEVEL_UNLOCKS[nextLvl];
        nextUnlockEl.textContent = `LVL ${nextLvl}: ${un.display}`;
      }
    }
    // Games played
    const gamesEl = document.getElementById('pGamesPlayed');
    if (gamesEl) gamesEl.textContent = PF.playerData?.GamesPlayed || 0;
    const mapsEl = document.getElementById('pMapsCompleted');
    if (mapsEl) mapsEl.textContent = PF.playerData?.MapsCompleted || 0;
  }

  // Render cosmetic cards from PlayFab inventory + catalog
  function _renderCosmeticInventory() {
    const container = document.getElementById('cosmeticList');
    if (!container) return;
    const items = PF.getOwnedCosmeticDetails();

    if (items.length === 0) {
      container.innerHTML = '<span class="cc-empty">No cosmetics yet. Ask the owner!</span>';
      return;
    }

    container.innerHTML = '';
    items.forEach(item => {
      const isOwner = item.tags?.includes('owner') || item.itemClass === 'OwnerCharacter';
      const card = document.createElement('div');
      card.className = 'cosmetic-card' + (isOwner ? ' owner-cosmetic' : '');
      card.style.setProperty('--cc-glow', item.custom?.glowColor || '#f1c40f');
      card.innerHTML = `
        <div class="cc-icon">${item.custom?.icon || '🎁'}</div>
        <div class="cc-name">${item.displayName}</div>
        <div class="cc-rarity">${(item.custom?.rarity || 'common').toUpperCase()}</div>
        <div class="cc-type">${item.itemClass || 'Cosmetic'}</div>
        <div class="cc-desc">${item.description || ''}</div>
      `;
      container.appendChild(card);
    });
  }

  // ── MENU TABS ────────────────────────────────
  function _bindMenuTabs() {
    document.querySelectorAll('.mtab').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
        if (btn.dataset.tab === 'leaderboard') _refreshLeaderboard(currentLbStat);
        if (btn.dataset.tab === 'shop')        _buildShop(document.querySelector('.sf.active')?.dataset.sf || 'all');
        if (btn.dataset.tab === 'profile')     _updateProfileUI();
        if (btn.dataset.tab === 'infinite')    _refreshInfiniteLb();
        if (btn.dataset.tab === 'editor')      _initMapEditor();
      };
    });
  }

  // ── TICKER ────────────────────────────────────
  function _startTicker() {
    const msgs = [
      'ZOMBIE TOWER DEFENCE // BUILD · SURVIVE · DOMINATE',
      'TIP: Freezer + Rocketeer = maximum crowd control',
      'TIP: Sell towers for 60% of total investment',
      'TIP: Tesla Coil chains lightning to 4+ enemies',
      'Leaderboards refresh every 30s — every kill counts',
      'TIP: Phantom Sniper ignores all armour',
      'TIP: Press Space to send wave, G to upgrade, S to sell',
    ];
    let i = 0;
    // Sidebar ticker (new layout)
    const el = document.getElementById('tickerText');
    if (el) {
      el.textContent = msgs[0];
      setInterval(() => { el.textContent = msgs[++i % msgs.length]; }, 6000);
    }
  }

  // ── WAVE ANNOUNCE ─────────────────────────────
  const _WAVE_TAGLINES = [
    'INCOMING!', 'BRACE YOURSELF!', 'HERE THEY COME!',
    'DEFEND THE BASE!', 'NO MERCY!', 'HOLD THE LINE!',
    'THEY MULTIPLY!', 'STAY SHARP!', 'PREPARE FOR IMPACT!',
  ];
  function announceWave(num, isBoss) {
    const el     = document.getElementById('waveAnnounce');
    const numEl  = document.getElementById('waNum');
    const subEl  = document.getElementById('waSub');
    const eyeEl  = document.getElementById('waEyebrow');
    if (!el) return;
    numEl.textContent = num;
    if (isBoss) {
      eyeEl.textContent = '⚠ BOSS —';
      subEl.textContent = 'BRACE FOR IMPACT!';
      numEl.className = 'wa-number boss';
      subEl.className = 'wa-tagline boss';
    } else {
      eyeEl.textContent = 'WAVE';
      subEl.textContent = _WAVE_TAGLINES[Math.floor(Math.random() * _WAVE_TAGLINES.length)];
      numEl.className = 'wa-number';
      subEl.className = 'wa-tagline';
    }
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 2200);
  }

  // ── TOAST ─────────────────────────────────────
  function toast(msg, type = '') {
    const el = document.createElement('div');
    const colors = { red:'var(--red2)', green:'var(--grn2)', gold:'var(--amber3)', '':'var(--txt)' };
    el.style.cssText = `
      position:fixed;top:65px;left:50%;transform:translateX(-50%);
      background:rgba(17,17,24,0.97);border:1px solid rgba(255,255,255,0.1);
      color:${colors[type]||colors['']};
      padding:9px 22px;border-radius:6px;
      font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:600;letter-spacing:2.5px;
      z-index:9999;pointer-events:none;
      box-shadow:0 8px 24px rgba(0,0,0,0.6);
      animation:tIn 0.2s ease-out,tOut 0.3s ease-in 1.7s forwards;
    `;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2100);
    if (!document.getElementById('_toastKf')) {
      const s = document.createElement('style'); s.id = '_toastKf';
      s.textContent = `
        @keyframes tIn  { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%)} }
        @keyframes tOut { from{opacity:1} to{opacity:0;transform:translateX(-50%) translateY(-8px)} }
      `;
      document.head.appendChild(s);
    }
  }

  // ── PARTICLES ─────────────────────────────────
  function _initMenuParticles() {
    particleCanvas = document.getElementById('menuParticles');
    if (!particleCanvas) return;
    particleCtx = particleCanvas.getContext('2d');
    _resizeParticles();
    window.addEventListener('resize', _resizeParticles);
    for (let i = 0; i < 50; i++) _addParticle(true);
    _animParticles();
  }

  function _resizeParticles() {
    if (!particleCanvas) return;
    particleCanvas.width  = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }

  function _addParticle(init = false) {
    particles.push({
      x:  Math.random() * window.innerWidth,
      y:  init ? Math.random() * window.innerHeight : window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.18 + Math.random() * 0.45),
      r:  0.8 + Math.random() * 1.8,
      a:  0.08 + Math.random() * 0.3,
      c:  Math.random() < 0.25 ? '#c0392b' : '#2a2a3a',
    });
  }

  function _animParticles() {
    requestAnimationFrame(_animParticles);
    if (!particleCtx) return;
    const W = particleCanvas.width, H = particleCanvas.height;
    particleCtx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { particles.splice(i, 1); _addParticle(); continue; }
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      particleCtx.fillStyle = p.c;
      particleCtx.globalAlpha = p.a;
      particleCtx.fill();
    }
    particleCtx.globalAlpha = 1;
  }

  // ── INFINITE MODE ─────────────────────────────
  function _initInfiniteTab() {
    const card = document.getElementById('infiniteCard');
    const btn  = document.getElementById('btnPlayInfinite');
    if (!card || !btn) return;
    setTimeout(() => {
      const c = document.getElementById('prev-infinite');
      if (c) drawMapPreview(c, getMap('infinite'));
    }, 0);
    card.onclick = btn.onclick = () => { startGame('infinite'); };
    _refreshInfiniteLb();
  }

  function _refreshInfiniteLb() {
    const el = document.getElementById('infiniteLb');
    if (!el) return;
    let lb = [];
    try { lb = Game.getInfiniteLeaderboard ? Game.getInfiniteLeaderboard() : JSON.parse(localStorage.getItem('ztd_infinite_lb')||'[]'); } catch(e){}
    if (!lb.length) { el.innerHTML = '<span style="color:var(--txt2)">No runs yet. Be the first!</span>'; return; }
    el.innerHTML = lb.slice(0,15).map((e,i)=>`
      <div style="display:flex;gap:12px;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <span style="color:${i<3?'#f1c40f':'var(--txt2)'};font-weight:700;min-width:22px">#${i+1}</span>
        <span style="flex:1;color:var(--txt)">${e.name||'ANON'}</span>
        <span style="color:var(--amber3)">Wave ${e.wave}</span>
        <span style="color:var(--txt3);font-size:9px">${new Date(e.date).toLocaleDateString()}</span>
      </div>`).join('');
  }

  // ── MAP EDITOR ────────────────────────────────
  let _edState = {
    cols:20, rows:12, tiles:null, tool:'path',
    spawn:null, end:null, theme:'graveyard',
    history:[], painting:false,
  };

  function _initMapEditor() {
    const canvas = document.getElementById('editorCanvas');
    if (!canvas || canvas._edInited) return;
    canvas._edInited = true;

    const TSIZE = 32;
    const cols = _edState.cols, rows = _edState.rows;
    canvas.width  = cols * TSIZE;
    canvas.height = rows * TSIZE;
    _edState.tiles = Array.from({length:rows}, ()=>Array(cols).fill(0));

    const ctx = canvas.getContext('2d');
    function _edRender() {
      const T = TSIZE;
      ctx.fillStyle = '#1a2a15';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      // Grid
      ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=0.5;
      for(let r=0;r<=rows;r++){ctx.beginPath();ctx.moveTo(0,r*T);ctx.lineTo(cols*T,r*T);ctx.stroke();}
      for(let c=0;c<=cols;c++){ctx.beginPath();ctx.moveTo(c*T,0);ctx.lineTo(c*T,rows*T);ctx.stroke();}
      // Path tiles
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        if (_edState.tiles[r][c]===1) {
          const bg=ctx.createLinearGradient(c*T,r*T,c*T+T,r*T+T);
          bg.addColorStop(0,'#8a6a40'); bg.addColorStop(1,'#5a4020');
          ctx.fillStyle=bg; ctx.fillRect(c*T,r*T,T,T);
          ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=0.5;
          ctx.strokeRect(c*T+0.5,r*T+0.5,T-1,T-1);
        }
      }
      // Spawn
      if (_edState.spawn) {
        const [sc,sr]=_edState.spawn;
        ctx.fillStyle='rgba(39,174,96,0.7)';ctx.fillRect(sc*T,sr*T,T,T);
        ctx.fillStyle='#fff';ctx.font=`bold ${T*0.5}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('S',sc*T+T/2,sr*T+T/2);
      }
      // End
      if (_edState.end) {
        const [ec,er]=_edState.end;
        ctx.fillStyle='rgba(192,57,43,0.7)';ctx.fillRect(ec*T,er*T,T,T);
        ctx.fillStyle='#fff';ctx.font=`bold ${T*0.5}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('E',ec*T+T/2,er*T+T/2);
      }
    }

    function _edGetCell(e) {
      const rect=canvas.getBoundingClientRect();
      const x=(e.clientX-rect.left)*cols*TSIZE/rect.width;
      const y=(e.clientY-rect.top)*rows*TSIZE/rect.height;
      return [Math.floor(x/TSIZE), Math.floor(y/TSIZE)];
    }

    function _edApply(c,r) {
      if(c<0||c>=cols||r<0||r>=rows) return;
      const t=_edState.tool;
      if(t==='path')  { _edState.tiles[r][c]=1; }
      if(t==='erase') { _edState.tiles[r][c]=0; if(_edState.spawn&&_edState.spawn[0]===c&&_edState.spawn[1]===r)_edState.spawn=null; if(_edState.end&&_edState.end[0]===c&&_edState.end[1]===r)_edState.end=null; }
      if(t==='spawn') { _edState.tiles[r][c]=1; _edState.spawn=[c,r]; }
      if(t==='end')   { _edState.tiles[r][c]=1; _edState.end=[c,r]; }
      _edValidate();
      _edRender();
    }

    canvas.onmousedown=e=>{ _edState.painting=true; const [c,r]=_edGetCell(e); _edApply(c,r); };
    canvas.onmousemove=e=>{ if(_edState.painting){ const [c,r]=_edGetCell(e); _edApply(c,r); }};
    canvas.onmouseup=canvas.onmouseleave=()=>{ _edState.painting=false; };

    document.querySelectorAll('.ed-tool').forEach(b=>b.onclick=()=>{
      document.querySelectorAll('.ed-tool').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); _edState.tool=b.dataset.tool;
    });

    document.getElementById('edClear').onclick=()=>{ _edState.tiles=Array.from({length:rows},()=>Array(cols).fill(0)); _edState.spawn=null; _edState.end=null; _edValidate(); _edRender(); };
    document.getElementById('edUndo').onclick=()=>{
      if(_edState.history.length===0) return;
      _edState.tiles=_edState.history.pop();
      _edValidate(); _edRender();
    };
    document.getElementById('edPlay').onclick=()=>{ _edLaunchCustom(); };
    document.getElementById('edTheme')?.addEventListener('change',e=>{ _edState.theme=e.target.value; _edRender(); });

    _edRender();
  }

  function _edValidate() {
    const hasPath = _edState.tiles.some(r=>r.some(c=>c===1));
    const ok = hasPath && _edState.spawn && _edState.end;
    const btn = document.getElementById('edPlay');
    if(btn) btn.disabled = !ok;
    const st = document.getElementById('edStatus');
    if(st){
      if(!hasPath) st.textContent='Draw a path first';
      else if(!_edState.spawn) st.textContent='Set a spawn point (🟢)';
      else if(!_edState.end) st.textContent='Set an end point (🔴)';
      else st.textContent='✅ Ready to test!';
    }
  }

  function _edLaunchCustom() {
    if(!_edState.spawn||!_edState.end) return;
    // Build path from BFS/flood fill connected path tiles starting from spawn
    const cols=_edState.cols, rows=_edState.rows;
    const tiles=_edState.tiles;
    const [sc,sr]=_edState.spawn;
    const [ec,er]=_edState.end;
    // Build adjacency list and BFS
    const visited=new Set();
    const queue=[[sc,sr,[]]];
    let foundPath=null;
    const key=(c,r)=>`${c},${r}`;
    visited.add(key(sc,sr));
    while(queue.length&&!foundPath){
      const [c,r,path]=queue.shift();
      const np=[...path,[c,r]];
      if(c===ec&&r===er){ foundPath=np; break; }
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dc,dr])=>{
        const nc=c+dc,nr=r+dr;
        if(nc<0||nc>=cols||nr<0||nr>=rows) return;
        if(tiles[nr][nc]!==1) return;
        const k=key(nc,nr);
        if(visited.has(k)) return;
        visited.add(k); queue.push([nc,nr,np]);
      });
    }
    if(!foundPath||foundPath.length<3){ toast('No valid path from Spawn→End!','red'); return; }

    // Create custom map
    const customMap = {
      id:'custom', name:'CUSTOM MAP', theme:_edState.theme||'graveyard',
      difficulty:3, waves:20, unlocked:true,
      description:'Your custom map',
      bgColor:'#1a2a15', pathColor:'#6b5530',
      cols, rows, path:foundPath,
      startGold:200, livesStart:20, waveModifier:1.5,
    };
    // Inject into MAPS temporarily
    const existing=MAPS.findIndex(m=>m.id==='custom');
    if(existing>=0) MAPS[existing]=customMap; else MAPS.push(customMap);
    startGame('custom');
  }

  // ── IN-GAME LEADERBOARD ───────────────────────
  let _iglInterval = null;
  let _iglVisible  = false;
  let _iglStat     = 'HighScore';

  function _initIngameLB() {
    const toggleBtn = document.getElementById('btnToggleLB');
    const closeBtn  = document.getElementById('btnCloseIGL');
    if (toggleBtn) toggleBtn.onclick = toggleIngameLB;
    if (closeBtn)  closeBtn.onclick  = () => _hideIngameLB();
  }

  function toggleIngameLB() {
    _iglVisible ? _hideIngameLB() : _showIngameLB();
  }

  function _showIngameLB() {
    const el = document.getElementById('ingameLeaderboard');
    if (!el) return;
    el.classList.remove('hidden');
    _iglVisible = true;
    _refreshIngameLB();
    // Auto-refresh every 30s while open
    clearInterval(_iglInterval);
    _iglInterval = setInterval(_refreshIngameLB, 30000);
  }

  function _hideIngameLB() {
    const el = document.getElementById('ingameLeaderboard');
    if (el) el.classList.add('hidden');
    _iglVisible = false;
    clearInterval(_iglInterval);
  }

  async function _refreshIngameLB() {
    const body = document.getElementById('iglBody');
    if (!body) return;
    body.innerHTML = '<div class="igl-loading">Loading…</div>';
    try {
      const entries = await PF.getLeaderboard(_iglStat, 10);
      if (!entries.length) {
        body.innerHTML = '<div class="igl-loading">No scores yet!</div>';
        return;
      }
      const myId = PF.playFabId || '';
      body.innerHTML = entries.map((e, i) => {
        const isMe = myId && e.PlayFabId === myId;
        const medal = i < 3 ? ['🥇','🥈','🥉'][i] : (i+1);
        const rankClass = i < 3 ? ['rank-1','rank-2','rank-3'][i] : '';
        const name = (e.DisplayName || e.PlayFabId?.slice(0,8) || 'Player').slice(0, 12);
        const val  = (e.StatValue || 0).toLocaleString();
        return `<div class="igl-row${isMe ? ' igl-me' : ''}">
          <span class="igl-rank ${rankClass}">${medal}</span>
          <span class="igl-name">${name}</span>
          <span class="igl-score">${val}</span>
        </div>`;
      }).join('');
    } catch {
      body.innerHTML = '<div class="igl-loading">Failed to load</div>';
    }
  }

  // Call this when entering game screen
  function showIngameLeaderboard() {
    _showIngameLB();
  }
  function hideIngameLeaderboard() {
    _hideIngameLB();
  }

  // ── ACHIEVEMENT POPUPS ────────────────────────
  const _ACHIEVEMENTS = {
    first_kill:    { icon:'⚔️', title:'FIRST BLOOD',      desc:'Kill your first zombie'             },
    kills_100:     { icon:'💀', title:'CENTURY KILLER',   desc:'100 total kills'                    },
    kills_500:     { icon:'☠️', title:'MASS EXTERMINATOR',desc:'500 total kills'                    },
    kills_1000:    { icon:'🔱', title:'ZOMBIE NIGHTMARE', desc:'1,000 total kills'                  },
    wave_5:        { icon:'🌊', title:'WAVE SURVIVOR',    desc:'Survive wave 5'                     },
    wave_10:       { icon:'🏄', title:'RIDING THE STORM', desc:'Survive wave 10'                    },
    wave_20:       { icon:'⚡', title:'VETERAN DEFENDER', desc:'Survive wave 20'                    },
    wave_30:       { icon:'🔥', title:'LEGENDARY STAND',  desc:'Survive wave 30'                    },
    combo_10:      { icon:'🔥', title:'COMBO MASTER',     desc:'10× kill combo'                     },
    combo_25:      { icon:'💥', title:'UNSTOPPABLE',      desc:'25× kill combo'                     },
    boss_kill:     { icon:'👑', title:'BOSS SLAYER',      desc:'Defeat a boss'                      },
    all_towers:    { icon:'🗼', title:'TOWER COLLECTOR',  desc:'Build 10 towers in one game'        },
    no_damage_wave:{ icon:'🛡', title:'PERFECT DEFENSE',  desc:'Complete a wave without losing lives'},
  };
  const _shownAchievements = new Set(JSON.parse(localStorage.getItem('ztd_achievements') || '[]'));

  function showAchievement(id) {
    const a = _ACHIEVEMENTS[id];
    if (!a || _shownAchievements.has(id)) return;
    _shownAchievements.add(id);
    localStorage.setItem('ztd_achievements', JSON.stringify([..._shownAchievements]));

    const el = document.createElement('div');
    el.className = 'achievement-pop';
    el.innerHTML = `
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-text">
        <div class="ach-label">ACHIEVEMENT UNLOCKED</div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>`;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('ach-show'), 50);
    setTimeout(() => { el.classList.remove('ach-show'); setTimeout(() => el.remove(), 500); }, 3500);
  }

  // ── PUBLIC ────────────────────────────────────
  return {
    init, showScreen, startGame,
    updateTowerPalette, showTowerInfo,
    unlockMap, unlockNextMap,
    announceWave, toast, refreshCanAfford,
    addOwnedTower: id => { ownedTowers.add(id); _saveLocalProgress(); },
    get ownedTowers() { return ownedTowers; },
    toggleIngameLB, showIngameLeaderboard, hideIngameLeaderboard,
    showAchievement,
  };

})();
