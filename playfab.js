/* ═══════════════════════════════════════════════
   playfab.js — PlayFab Client API
   Title: 100286
   - Persistent auto-login via localStorage
   - Catalog-based cosmetics (catalog.json)
   - Real inventory (GrantItemsToUser)
   ═══════════════════════════════════════════════ */

const PF = {
  TITLE_ID:   '100286',
  BASE:       'https://100286.playfabapi.com',
  SERVER_URL: 'http://localhost:3000', // Change to deployed URL in production

  sessionTicket: null,
  playFabId:     null,
  playerData:    {},
  catalogItems:  [],
  inventory:     [],
  isOwner:       false,
  displayName:   '',

  // ── Auto-login on page load ───────────────────
  async tryAutoLogin() {
    const creds = this._getCreds();
    if (!creds) return false;
    const res = await this.login(creds.u, creds.p, true);
    return res.ok;
  },

  _getCreds()          { try { return JSON.parse(localStorage.getItem('ztd_creds')); } catch { return null; } },
  _saveCreds(u, p)     { localStorage.setItem('ztd_creds', JSON.stringify({ u, p })); },
  _clearCreds()        { localStorage.removeItem('ztd_creds'); },

  // ── Register ──────────────────────────────────
  async register(username, password) {
    const r = await this._post('/Client/RegisterPlayFabUser', {
      TitleId: this.TITLE_ID, Username: username,
      Password: password, DisplayName: username,
      RequireBothUsernameAndEmail: false,
    });
    if (r.code === 200) {
      this.sessionTicket = r.data.SessionTicket;
      this.playFabId     = r.data.PlayFabId;
      this.displayName   = username;
      this._saveCreds(username, password);
      await this._initNewPlayer();
      await this.loadPlayerData();
      await this.loadCatalog();
      await this.loadInventory();
      return { ok: true };
    }
    return { ok: false, msg: r.errorMessage || 'Registration failed' };
  },

  // ── Login ─────────────────────────────────────
  async login(username, password, silent = false) {
    const r = await this._post('/Client/LoginWithPlayFab', {
      TitleId: this.TITLE_ID, Username: username, Password: password,
    });
    if (r.code === 200) {
      this.sessionTicket = r.data.SessionTicket;
      this.playFabId     = r.data.PlayFabId;
      if (!silent) this._saveCreds(username, password);
      await this.loadPlayerData();
      await this.loadCatalog();
      await this.loadInventory();
      this.displayName   = await this.getDisplayName();
      return { ok: true };
    }
    return { ok: false, msg: r.errorMessage || 'Login failed' };
  },

  logout() {
    this.sessionTicket = null; this.playFabId = null;
    this.playerData = {}; this.inventory = [];
    this.isOwner = false; this.displayName = '';
    this._clearCreds();
  },

  isLoggedIn() { return !!this.sessionTicket; },

  // ── Player data ───────────────────────────────
  async loadPlayerData() {
    if (!this.sessionTicket) return;
    const r = await this._post('/Client/GetUserData', {
      Keys: ['Coins','BestWave','TotalKills','OwnedTowers','UnlockedMaps','IsOwner','Stats','AccountXP','GamesPlayed','MapsCompleted','HasDevPanel']
    });
    if (r.code === 200 && r.data.Data) {
      const d = r.data.Data;
      this.playerData = {
        Coins:        parseInt(d.Coins?.Value       || '100'),
        BestWave:     parseInt(d.BestWave?.Value    || '0'),
        TotalKills:   parseInt(d.TotalKills?.Value  || '0'),
        OwnedTowers:   JSON.parse(d.OwnedTowers?.Value  || '["gunner","archer"]'),
        UnlockedMaps:  JSON.parse(d.UnlockedMaps?.Value || '["graveyard"]'),
        IsOwner:       d.IsOwner?.Value === 'true',
        HasDevPanel:   d.HasDevPanel?.Value === 'true',
        Stats:         JSON.parse(d.Stats?.Value || '{}'),
        AccountXP:     parseInt(d.AccountXP?.Value     || '0'),
        GamesPlayed:   parseInt(d.GamesPlayed?.Value   || '0'),
        MapsCompleted: parseInt(d.MapsCompleted?.Value || '0'),
      };
      this.isOwner = this.playerData.IsOwner;
    } else {
      this.playerData = { Coins:100, BestWave:0, TotalKills:0,
        OwnedTowers:['gunner','archer'], UnlockedMaps:['graveyard'], IsOwner:false, Stats:{},
        AccountXP:0, GamesPlayed:0, MapsCompleted:0 };
      await this.savePlayerData();
    }
  },

  async savePlayerData() {
    if (!this.sessionTicket) return;
    await this._post('/Client/UpdateUserData', {
      Data: {
        Coins:        String(this.playerData.Coins),
        BestWave:     String(this.playerData.BestWave),
        TotalKills:   String(this.playerData.TotalKills),
        OwnedTowers:   JSON.stringify(this.playerData.OwnedTowers),
        UnlockedMaps:  JSON.stringify(this.playerData.UnlockedMaps),
        Stats:         JSON.stringify(this.playerData.Stats),
        AccountXP:     String(this.playerData.AccountXP     || 0),
        GamesPlayed:   String(this.playerData.GamesPlayed   || 0),
        MapsCompleted: String(this.playerData.MapsCompleted || 0),
      }
    });
  },

  async _initNewPlayer() {
    await this._post('/Client/UpdateUserData', {
      Data: { Coins:'100', BestWave:'0', TotalKills:'0',
        OwnedTowers:JSON.stringify(['gunner','archer']),
        UnlockedMaps:JSON.stringify(['graveyard']),
        IsOwner:'false', Stats:'{}' }
    });
  },

  async saveGameResult(wave, score, kills, coinsEarned, accountXP, victory) {
    if (!this.sessionTicket) {
      const best = parseInt(localStorage.getItem('ztd_bestWave')||'0');
      if (wave > best) localStorage.setItem('ztd_bestWave', wave);
      localStorage.setItem('ztd_coins', (parseInt(localStorage.getItem('ztd_coins')||'100') + coinsEarned));
      localStorage.setItem('ztd_xp', String(accountXP||0));
      localStorage.setItem('ztd_gamesPlayed', String((parseInt(localStorage.getItem('ztd_gamesPlayed')||'0')+1)));
      return;
    }
    if (wave > this.playerData.BestWave) this.playerData.BestWave = wave;
    this.playerData.TotalKills += kills;
    this.playerData.Coins      += coinsEarned;
    this.playerData.AccountXP   = accountXP || this.playerData.AccountXP || 0;
    this.playerData.GamesPlayed = (this.playerData.GamesPlayed || 0) + 1;
    if (victory) this.playerData.MapsCompleted = (this.playerData.MapsCompleted || 0) + 1;
    await this.savePlayerData();
    await this._post('/Client/UpdatePlayerStatistics', { Statistics: [
      { StatisticName:'HighScore',  Value: score },
      { StatisticName:'BestWave',   Value: wave  },
      { StatisticName:'TotalKills', Value: this.playerData.TotalKills },
    ]});
  },

  // ── Catalog ───────────────────────────────────
  async loadCatalog() {
    const r = await this._post('/Client/GetCatalogItems', { CatalogVersion:'ZTD_Cosmetics_v1' });
    if (r.code === 200 && r.data.Catalog?.length > 0) {
      this.catalogItems = r.data.Catalog.map(i => this._mapCatalogItem(i));
    } else {
      await this._loadLocalCatalog();
    }
  },

  async _loadLocalCatalog() {
    try {
      const r = await fetch('catalog.json');
      const j = await r.json();
      this.catalogItems = (j.Catalog||[]).map(i => this._mapCatalogItem(i));
    } catch { this.catalogItems = []; }
  },

  _mapCatalogItem(i) {
    const custom = typeof i.CustomData === 'string' ? JSON.parse(i.CustomData||'{}') : (i.CustomData||{});
    return { itemId: i.ItemId, displayName: i.DisplayName, description: i.Description,
             itemClass: i.ItemClass, tags: i.Tags||[], custom, prices: i.VirtualCurrencyPrices||{} };
  },

  getCatalogItem(id) { return this.catalogItems.find(i => i.itemId === id) || null; },

  // ── Inventory ─────────────────────────────────
  async loadInventory() {
    if (!this.sessionTicket) return;
    const r = await this._post('/Client/GetUserInventory', {});
    if (r.code === 200) {
      this.inventory = (r.data.Inventory||[]).map(i => ({
        instanceId: i.ItemInstanceId, itemId: i.ItemId
      }));
    }
    // After inventory loads, show the correct panel(s) based on what items exist.
    // owner_panel → full Owner Console
    // mod_panel   → Moderator Console
    // Both can coexist if somehow a player has both (e.g. the owner themselves)
    // Show the appropriate panel based on inventory items.
    // Owner.show() internally calls getPanelRole() to decide which panel to display.
    // It handles both 'owner_panel' and 'mod_panel' — no separate Mod object needed.
    if (typeof Owner !== 'undefined') {
      const hasPanel = this.inventory.some(i => i.itemId === 'owner_panel' || i.itemId === 'mod_panel');
      hasPanel ? Owner.show() : Owner.hide();
    }
    // Show Dev panel if player has been explicitly granted the dev_panel item
    // OR has HasDevPanel=true set in their PlayFab user data (set via dashboard or owner panel)
    if (typeof Dev !== 'undefined') {
      const hasDev = this.inventory.some(i => i.itemId === 'dev_panel')
                  || this.playerData.HasDevPanel === true;
      hasDev ? Dev.show() : Dev.hide();
    }
  },

  getOwnedCosmeticDetails() {
    return this.inventory.map(inv => {
      const cat = this.getCatalogItem(inv.itemId);
      return cat ? { ...cat, instanceId: inv.instanceId } : null;
    }).filter(Boolean);
  },

  hasCosmetic(itemId) { return this.inventory.some(i => i.itemId === itemId); },

  // Panel access: true if inventory contains "owner_panel" (full owner) OR "mod_panel" (moderator).
  // Nothing in the code shows the panel unless this returns true.
  hasOwnerPanel() {
    return this.inventory.some(i => i.itemId === 'owner_panel' || i.itemId === 'mod_panel');
  },

  // Returns 'owner', 'moderator', 'dev', or null
  getPanelRole() {
    if (this.inventory.some(i => i.itemId === 'owner_panel')) return 'owner';
    if (this.inventory.some(i => i.itemId === 'mod_panel'))   return 'moderator';
    if (this.inventory.some(i => i.itemId === 'dev_panel'))   return 'dev';
    return null;
  },

  ownersTowers() {
    const t = [...(this.playerData.OwnedTowers||[])];
    this.getOwnedCosmeticDetails().forEach(c => {
      if (c.custom?.towerId && !t.includes(c.custom.towerId)) t.push(c.custom.towerId);
    });
    return t;
  },

  // ── Leaderboard ───────────────────────────────
  // Uses server-side endpoint (no login required) if available,
  // falls back to client API when session is active.
  async getLeaderboard(stat, max=100) {
    // Try the public server endpoint first — works even when logged out
    try {
      const r = await fetch(`${this.SERVER_URL}/leaderboard/${encodeURIComponent(stat)}?max=${Math.min(max,100)}`);
      const j = await r.json();
      if (j.ok && j.leaderboard) {
        console.log('[PF LB server]', stat, '→', j.leaderboard.length, 'entries');
        return j.leaderboard;
      }
      console.warn('[PF LB server] returned no data, trying client API…', j.msg);
    } catch (e) {
      console.warn('[PF LB] server unreachable, falling back to client API:', e.message);
    }
    // Fallback: client API (requires login)
    if (!this.sessionTicket) {
      console.warn('[PF LB] not logged in and server unreachable — no leaderboard data');
      return [];
    }
    try {
      const r = await this._post('/Client/GetLeaderboard',
        { StatisticName:stat, StartPosition:0, MaxResultsCount:Math.min(max,100) });
      console.log('[PF LB client]', stat, '→ code:', r.code, 'entries:', r.data?.Leaderboard?.length, 'err:', r.errorMessage);
      if (r.code === 200) return r.data?.Leaderboard || [];
      if (r.code === 1003) console.warn('[PF LB] Statistic "' + stat + '" not found in PlayFab Dashboard → Leaderboards.');
      return [];
    } catch(e) {
      console.error('[PF] getLeaderboard failed:', e);
      return [];
    }
  },

  // ── Shop ──────────────────────────────────────
  async buyTower(towerId, cost) {
    if (this.playerData.Coins < cost) return { ok:false, msg:'Not enough coins' };
    this.playerData.Coins -= cost;
    if (!this.playerData.OwnedTowers.includes(towerId)) this.playerData.OwnedTowers.push(towerId);
    await this.savePlayerData();
    return { ok:true };
  },

  getCoins() {
    if (!this.sessionTicket) return parseInt(localStorage.getItem('ztd_coins')||'100');
    return this.playerData.Coins;
  },

  // ── Server (owner) calls ──────────────────────
  async serverCall(action, params) {
    try {
      const r = await fetch(`${this.SERVER_URL}/owner/${action}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ callerSession:this.sessionTicket, ...params }),
      });
      const j = await r.json();
      if (j.ok) { await this.loadInventory(); await this.loadPlayerData(); }
      return j;
    } catch {
      return { ok:false, msg:'Backend unreachable. Run server.js locally or deploy it.' };
    }
  },

  async getDisplayName() {
    const r = await this._post('/Client/GetAccountInfo', {});
    return r?.data?.AccountInfo?.TitleInfo?.DisplayName
        || r?.data?.AccountInfo?.Username || 'Survivor';
  },

  async _post(endpoint, body) {
    try {
      const headers = { 'Content-Type':'application/json' };
      if (this.sessionTicket) headers['X-Authorization'] = this.sessionTicket;
      const r = await fetch(this.BASE + endpoint,
        { method:'POST', headers, body:JSON.stringify(body) });
      const j = await r.json();
      return { code:j.code, data:j.data, errorMessage:j.errorMessage };
    } catch { return { code:0, errorMessage:'Network error' }; }
  },
};
