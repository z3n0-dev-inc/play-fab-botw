/* ═══════════════════════════════════════════════════════════
   owner.js — Owner & Moderator Panels
   
   TWO SEPARATE PANELS:
   • ownerPanel  → shown when inventory has "owner_panel"
                   Full controls: everything below + admin tools
   • modPanel    → shown when inventory has "mod_panel"
                   Moderation + in-game commands, no admin section

   Both panels are triggered by the same bottom-right button.
   The button icon/label changes based on which role the player has.
   ═══════════════════════════════════════════════════════════ */

const Owner = (() => {
  let inGame      = false;
  let isOpen      = false;
  let _openedAt   = 0;
  let _role       = null; // 'owner' | 'moderator' | null

  // ── Init ────────────────────────────────────────────────
  function init() {
    // Shared trigger button
    document.getElementById('ownerTrigger').onclick = toggle;

    // Owner panel close
    document.getElementById('btnCloseOwner').onclick = close;

    // Mod panel close
    const btnCloseMod = document.getElementById('btnCloseMod');
    if (btnCloseMod) btnCloseMod.onclick = close;

    // Copy-my-ID buttons
    _bindCopyBtn('btnCopyMyId',  () => PF.playFabId);
    _bindCopyBtn('btnCopyModId', () => PF.playFabId);

    // Owner panel action buttons (data-oa)
    document.querySelectorAll('[data-oa]').forEach(btn => {
      btn.onclick = () => _handleOwnerAction(btn.dataset.oa);
    });

    // Mod panel action buttons (data-mod)
    document.querySelectorAll('[data-mod]').forEach(btn => {
      btn.onclick = () => _handleModAction(btn.dataset.mod);
    });

    // Outside-click to close
    document.addEventListener('pointerup', e => {
      if (!isOpen) return;
      if (Date.now() - _openedAt < 200) return;
      const ownerPanel = document.getElementById('ownerPanel');
      const modPanel   = document.getElementById('modPanel');
      const trigger    = document.getElementById('ownerTrigger');
      const inOwner    = ownerPanel && ownerPanel.contains(e.target);
      const inMod      = modPanel   && modPanel.contains(e.target);
      const inTrigger  = trigger    && trigger.contains(e.target);
      if (!inOwner && !inMod && !inTrigger) close();
    });

    // Proximity glow on trigger
    document.addEventListener('mousemove', _handleProximity);
  }

  // ── Proximity glow ────────────────────────────────────
  function _handleProximity(e) {
    const trigger = document.getElementById('ownerTrigger');
    if (!trigger || trigger.classList.contains('hidden')) return;
    const rect = trigger.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (rect.left + rect.width/2), e.clientY - (rect.top + rect.height/2));
    if (dist < 200) {
      trigger.style.setProperty('--prox', (1 - dist/200).toFixed(3));
      trigger.classList.add('prox-active');
    } else {
      trigger.style.setProperty('--prox', '0');
      trigger.classList.remove('prox-active');
    }
  }

  // ── Show / Hide / Toggle ──────────────────────────────
  function show() {
    _role = PF.getPanelRole ? PF.getPanelRole() : (PF.hasOwnerPanel() ? 'owner' : null);
    if (!_role) return;
    _updateTriggerButton();
    document.getElementById('ownerTrigger').classList.remove('hidden');
    _syncIngameSection();
  }

  function hide() {
    document.getElementById('ownerTrigger').classList.add('hidden');
    _panelEl('owner').classList.add('hidden');
    _panelEl('mod').classList.add('hidden');
    isOpen = false;
  }

  function toggle() { isOpen ? close() : open(); }

  function open() {
    // Determine which panel to open
    _role = PF.getPanelRole ? PF.getPanelRole() : (PF.hasOwnerPanel() ? 'owner' : null);
    if (!_role) return;

    const panel = _role === 'owner' ? _panelEl('owner') : _panelEl('mod');
    panel.classList.remove('hidden', 'op-closing');
    panel.classList.add('op-opening');
    isOpen = true;
    _openedAt = Date.now();

    document.getElementById('otArrow').textContent = '▼';
    document.getElementById('ownerTrigger').classList.add('open');

    _syncIngameSection();
    _updateMyPlayfabId();

    if (_role === 'owner') _populateCosmeticButtons();
  }

  function close() {
    ['owner','mod'].forEach(type => {
      const p = _panelEl(type);
      p.classList.remove('op-opening');
      p.classList.add('op-closing');
      setTimeout(() => { p.classList.add('hidden'); p.classList.remove('op-closing'); }, 300);
    });
    isOpen = false;
    document.getElementById('otArrow').textContent = '▲';
    document.getElementById('ownerTrigger').classList.remove('open');
  }

  function setInGame(val) { inGame = val; _syncIngameSection(); }

  // ── Helpers ───────────────────────────────────────────
  function _panelEl(type) {
    return document.getElementById(type === 'owner' ? 'ownerPanel' : 'modPanel');
  }

  function _syncIngameSection() {
    ['opIngame','modIngame'].forEach(id => {
      const s = document.getElementById(id);
      if (s) s.style.display = inGame ? 'block' : 'none';
    });
  }

  function _updateTriggerButton() {
    const lbl  = document.querySelector('.ot-label');
    const icon = document.querySelector('.ot-crown');
    if (_role === 'owner') {
      if (lbl)  lbl.textContent  = 'OWNER';
      if (icon) icon.textContent = '👑';
    } else {
      if (lbl)  lbl.textContent  = 'MOD';
      if (icon) icon.textContent = '🛡';
    }
  }

  function _updateMyPlayfabId() {
    const id = PF.playFabId || '— not logged in —';
    const ownerEl = document.getElementById('opMyIdText');
    const modEl   = document.getElementById('modMyIdText');
    if (ownerEl) ownerEl.textContent = id;
    if (modEl)   modEl.textContent   = id;
  }

  function _bindCopyBtn(btnId, getVal) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.onclick = () => {
      const val = getVal();
      if (!val || val.startsWith('—')) return;
      navigator.clipboard.writeText(val).then(() => {
        btn.textContent = '✅';
        setTimeout(() => btn.textContent = '📋', 1500);
      }).catch(() => {
        btn.textContent = '❌';
        setTimeout(() => btn.textContent = '📋', 1500);
      });
    };
  }

  // ── Player lookup ─────────────────────────────────────
  async function _lookupPlayer(targetId, infoElId) {
    const infoEl = document.getElementById(infoElId);
    if (!infoEl) return;
    if (!targetId) { _logTo(infoElId === 'ownerPlayerInfo' ? 'ownerLog' : 'modLog', 'Enter a target player ID first', 'err'); return; }

    infoEl.innerHTML = '<div style="font-family:var(--f-mono);font-size:9px;color:var(--txt2);padding:6px 0">🔍 Looking up player…</div>';
    infoEl.classList.remove('hidden');

    try {
      const res = await PF.serverCall('lookupPlayer', { targetPlayerId: targetId });
      if (!res.ok) {
        infoEl.innerHTML = `<div style="font-family:var(--f-mono);font-size:9px;color:var(--red2);padding:4px 0">✗ ${res.msg}</div>`;
        return;
      }
      const p = res.profile || {};
      const stats = res.stats || {};
      const isBanned = !!p.BannedUntil && new Date(p.BannedUntil) > new Date();
      const lastLogin = p.LastLogin ? _timeAgo(new Date(p.LastLogin)) : 'Never';
      const created   = p.Created   ? new Date(p.Created).toLocaleDateString() : '?';
      infoEl.innerHTML = `
        <span class="opi-name">${p.DisplayName || targetId}</span>
        <div class="opi-row"><span class="opi-lbl">STATUS</span><span class="opi-val ${isBanned?'opi-banned':'opi-ok'}">${isBanned ? '🔨 BANNED' : '✅ ACTIVE'}</span></div>
        <div class="opi-row"><span class="opi-lbl">JOINED</span><span class="opi-val">${created}</span></div>
        <div class="opi-row"><span class="opi-lbl">LAST SEEN</span><span class="opi-val">${lastLogin}</span></div>
        ${stats.BestWave   !== undefined ? `<div class="opi-row"><span class="opi-lbl">BEST WAVE</span><span class="opi-val">${stats.BestWave}</span></div>` : ''}
        ${stats.TotalKills !== undefined ? `<div class="opi-row"><span class="opi-lbl">TOTAL KILLS</span><span class="opi-val">${stats.TotalKills}</span></div>` : ''}
        ${stats.HighScore  !== undefined ? `<div class="opi-row"><span class="opi-lbl">HIGH SCORE</span><span class="opi-val">${stats.HighScore}</span></div>` : ''}
      `;
    } catch (err) {
      infoEl.innerHTML = `<div style="font-family:var(--f-mono);font-size:9px;color:var(--red2);padding:4px 0">✗ Lookup failed: ${err.message}</div>`;
    }
  }

  function _timeAgo(date) {
    const s = Math.floor((Date.now() - date) / 1000);
    if (s < 60)    return `${s}s ago`;
    if (s < 3600)  return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  }

  // ── Cosmetic buttons (owner panel only) ──────────────
  function _populateCosmeticButtons() {
    const container = document.getElementById('opCosmeticBtns');
    if (!container) return;
    container.innerHTML = '';

    const ownerItems = PF.catalogItems.filter(c => c.tags.includes('owner') || c.itemClass === 'OwnerCharacter');

    if (!ownerItems.length) {
      container.innerHTML = `<div class="op-catalog-empty"><span>📡</span><p>Catalog not loaded from PlayFab.<br>Check your network & Title ID.</p></div>`;
      return;
    }

    ownerItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'op-btn gold op-cosmetic-btn';
      btn.innerHTML = `
        <span class="op-btn-icon">${item.custom?.icon || '🎁'}</span>
        <div class="op-btn-info">
          <span class="op-btn-name">${item.displayName}</span>
          <span class="op-btn-sub">${(item.description || '').slice(0,50)}</span>
        </div>
        <span class="op-btn-arrow">→</span>`;
      btn.onclick = () => _grantCatalogItem(item.itemId, item.displayName, 'ownerLog');
      container.appendChild(btn);
    });

    const other = PF.catalogItems.filter(c => !c.tags.includes('owner') && c.itemClass !== 'OwnerCharacter');
    if (other.length) {
      const hdr = document.createElement('div');
      hdr.className = 'op-subsection';
      hdr.textContent = 'ALL COSMETICS';
      container.appendChild(hdr);
      other.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'op-btn blue op-cosmetic-btn';
        btn.innerHTML = `
          <span class="op-btn-icon">${item.custom?.icon || '🎁'}</span>
          <div class="op-btn-info">
            <span class="op-btn-name">${item.displayName}</span>
            <span class="op-btn-sub">${item.itemClass || 'Cosmetic'}</span>
          </div>
          <span class="op-btn-arrow">→</span>`;
        btn.onclick = () => _grantCatalogItem(item.itemId, item.displayName, 'ownerLog');
        container.appendChild(btn);
      });
    }
  }

  async function _grantCatalogItem(itemId, displayName, logId) {
    const target = _getTarget('owner');
    if (!target) { _logTo(logId, 'Enter a target Player ID first', 'err'); return; }
    _logTo(logId, `Granting ${displayName} → ${target}…`);
    const res = await PF.serverCall('grantCatalogItem', {
      targetPlayerId: target, itemId, catalogVersion: 'ZTD_Cosmetics_v1',
    });
    _logTo(logId, res.ok ? `✅ ${displayName} granted!` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
  }

  // ── Get target from whichever panel ──────────────────
  function _getTarget(panel) {
    const id = panel === 'owner' ? 'ownerTarget' : 'modTarget';
    return (document.getElementById(id)?.value || '').trim() || null;
  }

  // ── Shared moderation call ────────────────────────────
  async function _moderationAction(action, params, logId) {
    const res = await PF.serverCall(action, params);
    return res;
  }

  // ══════════════════════════════════════════════════════
  // OWNER PANEL — action handler
  // ══════════════════════════════════════════════════════
  async function _handleOwnerAction(action) {
    const target = _getTarget('owner');
    const log = 'ownerLog';

    switch (action) {

      // ── Player lookup ─────────────────────────────────
      case 'lookupPlayer':
        await _lookupPlayer(target, 'ownerPlayerInfo');
        break;

      // ── Moderation ────────────────────────────────────
      case 'banPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        const reason = document.getElementById('ownerBanReason')?.value?.trim() || 'No reason given';
        const hours  = parseInt(document.getElementById('ownerBanHours')?.value || '0') || 0;
        if (!confirm(`Ban "${target}"?\nReason: ${reason}\nDuration: ${hours > 0 ? hours + 'h' : 'PERMANENT'}`)) return;
        _logTo(log, `🔨 Banning "${target}"…`);
        const res = await PF.serverCall('banPlayer', { targetPlayerId: target, reason, hours: hours || null });
        _logTo(log, res.ok ? `✅ "${target}" banned${hours > 0 ? ` for ${hours}h` : ' permanently'}` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'unbanPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        _logTo(log, `✅ Unbanning "${target}"…`);
        const res = await PF.serverCall('unbanPlayer', { targetPlayerId: target });
        _logTo(log, res.ok ? `✅ "${target}" unbanned` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'warnPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        const reason = document.getElementById('ownerBanReason')?.value?.trim() || 'No reason given';
        _logTo(log, `⚠️ Warning "${target}"…`);
        const res = await PF.serverCall('warnPlayer', { targetPlayerId: target, reason });
        _logTo(log, res.ok ? `✅ Warning issued to "${target}"` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'kickPlayer': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        _logTo(log, `Kicking ${target}…`);
        const res = await PF.serverCall('kickPlayer', { targetPlayerId: target });
        _logTo(log, res.ok ? `✅ ${target} kicked` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'mutePlayer': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        _logTo(log, `Muting ${target} for 1h…`);
        const res = await PF.serverCall('mutePlayer', { targetPlayerId: target, hours: 1 });
        _logTo(log, res.ok ? `✅ ${target} muted for 1h` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      // ── Inventory ─────────────────────────────────────
      case 'giveAllTowers': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        _logTo(log, 'Granting all towers…');
        const allIds = TOWER_DEFS.filter(d => !d.ownerOnly).map(d => d.id);
        const res = await PF.serverCall('giveAllTowers', { targetPlayerId: target, towerIds: allIds });
        _logTo(log, res.ok ? `✅ All ${allIds.length} towers granted!` : `✗ ${res.msg}`, res.ok?'ok':'err');
        break;
      }

      case 'giveOwnerTowers': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        const ownerItems = ['cosmetic_shadow_commander','cosmetic_neon_warden','cosmetic_void_hunter','cosmetic_celestial_overlord'];
        _logTo(log, 'Granting all 3 owner characters…');
        let allOk = true;
        for (const itemId of ownerItems) {
          const res = await PF.serverCall('grantCatalogItem', { targetPlayerId: target, itemId, catalogVersion: 'ZTD_Cosmetics_v1' });
          if (!res.ok) { allOk = false; _logTo(log, `✗ ${itemId}: ${res.msg}`, 'err'); }
        }
        if (allOk) _logTo(log, '✅ All 3 owner characters granted!', 'ok');
        break;
      }

      case 'unlockAllMaps': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        _logTo(log, 'Unlocking all maps…');
        const res = await PF.serverCall('unlockAllPerks', { targetPlayerId: target, mapIds: MAPS.map(m => m.id) });
        _logTo(log, res.ok ? '✅ All maps unlocked!' : `✗ ${res.msg}`, res.ok?'ok':'err');
        break;
      }

      case 'giveCoins': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        const amount = parseInt(document.getElementById('ownerCoinAmt')?.value) || 0;
        _logTo(log, `Sending ${amount} coins → ${target}…`);
        const res = await PF.serverCall('giveCoins', { targetPlayerId: target, amount });
        _logTo(log, res.ok ? `✅ ${amount} coins granted!` : `✗ ${res.msg}`, res.ok?'ok':'err');
        break;
      }

      // ── Admin ─────────────────────────────────────────
      case 'makeOwner': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        if (!confirm(`Grant OWNER status to "${target}"? Cannot be undone.`)) return;
        _logTo(log, `Promoting ${target} to Owner…`);
        const res = await PF.serverCall('makeOwner', { targetPlayerId: target });
        _logTo(log, res.ok ? '✅ Owner status granted!' : `✗ ${res.msg}`, res.ok?'ok':'err');
        break;
      }

      case 'grantDevPanel': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        if (!confirm(`Grant DEV PANEL access to "${target}"?`)) return;
        _logTo(log, `Granting dev panel → ${target}…`);
        // Uses PlayFab Admin UpdateUserData directly — no backend server needed
        const res = await PF.serverCall('grantDevPanel', { targetPlayerId: target });
        if (res.ok) {
          _logTo(log, `✅ Dev panel granted to ${target}!`, 'ok');
        } else {
          // Fallback: try direct PlayFab client data write (only works on self)
          if (target === PF.playFabId) {
            PF.playerData.HasDevPanel = true;
            await PF.savePlayerData();
            Dev.show();
            _logTo(log, '✅ Dev panel granted (self)!', 'ok');
          } else {
            _logTo(log, `✗ ${res.msg} — set HasDevPanel=true in PlayFab dashboard for this player`, 'err');
          }
        }
        break;
      }

      case 'revokeDevPanel': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        if (!confirm(`Revoke DEV PANEL from "${target}"?`)) return;
        _logTo(log, `Revoking dev panel from ${target}…`);
        const res2 = await PF.serverCall('revokeDevPanel', { targetPlayerId: target });
        if (res2.ok) {
          _logTo(log, `✅ Dev panel revoked from ${target}!`, 'ok');
        } else {
          if (target === PF.playFabId) {
            PF.playerData.HasDevPanel = false;
            await PF.savePlayerData();
            Dev.hide();
            _logTo(log, '✅ Dev panel revoked (self)!', 'ok');
          } else {
            _logTo(log, `✗ ${res2.msg} — set HasDevPanel=false in PlayFab dashboard`, 'err');
          }
        }
        break;
      }

      case 'resetPlayer': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        if (!confirm(`RESET ALL DATA for "${target}"? THIS CANNOT BE UNDONE.`)) return;
        _logTo(log, `Resetting ${target}…`);
        const res = await PF.serverCall('resetPlayer', { targetPlayerId: target });
        _logTo(log, res.ok ? '✅ Player reset.' : `✗ ${res.msg}`, res.ok?'ok':'err');
        break;
      }

      // ── In-game commands ──────────────────────────────
      case 'addIngameMoney': {
        const amt = parseInt(document.getElementById('ownerIngameMoney')?.value) || 0;
        if (!Game.isRunning()) { _logTo(log, 'No active game', 'err'); return; }
        Game.ownerAddMoney(amt);
        _logTo(log, `✅ +$${amt} added`, 'ok');
        break;
      }
      case 'setLives': {
        const lives = parseInt(document.getElementById('ownerLivesAmt')?.value) || 99;
        if (!Game.isRunning()) { _logTo(log, 'No active game', 'err'); return; }
        Game.ownerSetLives(lives);
        _logTo(log, `✅ Lives set to ${lives}`, 'ok');
        break;
      }
      case 'skipWave':      if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerSkipWave();    _logTo(log,'✅ Wave skipped!','ok'); break;
      case 'godMode':       if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } { const on=Game.ownerGodMode(); _logTo(log,`✅ God Mode: ${on?'ON 🛡':'OFF'}`,'ok'); } break;
      case 'nukeEnemies':   if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerNukeEnemies(); _logTo(log,'✅ 💥 All enemies nuked!','ok'); break;
      case 'freezeAll':     if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerFreezeAll();   _logTo(log,'✅ ❄️ All frozen!','ok'); break;
      case 'speedHack':     if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } { const s=Game.ownerSpeedHack(); _logTo(log,`✅ Speed set to ${s}x`,'ok'); } break;
      case 'maxAllTowers':  if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerMaxAllTowers(); _logTo(log,'✅ All towers maxed!','ok'); break;
      case 'spawnBoss': {
        if (!Game.isRunning()) { _logTo(log, 'No active game', 'err'); return; }
        const bossType = document.getElementById('ownerBossType')?.value || 'boss_zombie_king';
        Game.ownerSpawnBoss(bossType);
        _logTo(log, `✅ ${bossType} spawned!`, 'ok');
        break;
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // MOD PANEL — action handler
  // ══════════════════════════════════════════════════════
  async function _handleModAction(action) {
    const target = _getTarget('mod');
    const log = 'modLog';

    switch (action) {

      case 'lookupPlayer':
        await _lookupPlayer(target, 'modPlayerInfo');
        break;

      case 'banPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        const reason = document.getElementById('modBanReason')?.value?.trim() || 'No reason given';
        const hours  = parseInt(document.getElementById('modBanHours')?.value || '0') || 0;
        if (!confirm(`Ban "${target}"?\nReason: ${reason}\nDuration: ${hours > 0 ? hours + 'h' : 'PERMANENT'}`)) return;
        _logTo(log, `🔨 Banning "${target}"…`);
        const res = await PF.serverCall('banPlayer', { targetPlayerId: target, reason, hours: hours || null });
        _logTo(log, res.ok ? `✅ "${target}" banned${hours > 0 ? ` for ${hours}h` : ' permanently'}` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'unbanPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        _logTo(log, `✅ Unbanning "${target}"…`);
        const res = await PF.serverCall('unbanPlayer', { targetPlayerId: target });
        _logTo(log, res.ok ? `✅ "${target}" unbanned` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'warnPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        const reason = document.getElementById('modBanReason')?.value?.trim() || 'No reason given';
        _logTo(log, `⚠️ Warning "${target}"…`);
        const res = await PF.serverCall('warnPlayer', { targetPlayerId: target, reason });
        _logTo(log, res.ok ? `✅ Warning issued to "${target}"` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'kickPlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        _logTo(log, `👢 Kicking "${target}"…`);
        const res = await PF.serverCall('kickPlayer', { targetPlayerId: target });
        _logTo(log, res.ok ? `✅ "${target}" kicked` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'mutePlayer': {
        if (!target) { _logTo(log, 'Enter a username or Player ID', 'err'); return; }
        _logTo(log, `🔇 Muting "${target}" for 1h…`);
        const res = await PF.serverCall('mutePlayer', { targetPlayerId: target, hours: 1 });
        _logTo(log, res.ok ? `✅ "${target}" muted for 1h` : `✗ ${res.msg}`, res.ok ? 'ok' : 'err');
        break;
      }

      case 'giveCoins': {
        if (!target) { _logTo(log, 'Enter a target Player ID', 'err'); return; }
        const amount = parseInt(document.getElementById('modCoinAmt')?.value) || 0;
        _logTo(log, `Sending ${amount} coins → ${target}…`);
        const res = await PF.serverCall('giveCoins', { targetPlayerId: target, amount });
        _logTo(log, res.ok ? `✅ ${amount} coins granted!` : `✗ ${res.msg}`, res.ok?'ok':'err');
        break;
      }

      // In-game commands
      case 'addIngameMoney': {
        const amt = parseInt(document.getElementById('modIngameMoney')?.value) || 0;
        if (!Game.isRunning()) { _logTo(log, 'No active game', 'err'); return; }
        Game.ownerAddMoney(amt);
        _logTo(log, `✅ +$${amt} added`, 'ok');
        break;
      }
      case 'setLives': {
        const lives = parseInt(document.getElementById('modLivesAmt')?.value) || 20;
        if (!Game.isRunning()) { _logTo(log, 'No active game', 'err'); return; }
        Game.ownerSetLives(lives);
        _logTo(log, `✅ Lives set to ${lives}`, 'ok');
        break;
      }
      case 'skipWave':     if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerSkipWave();    _logTo(log,'✅ Wave skipped!','ok'); break;
      case 'nukeEnemies':  if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerNukeEnemies(); _logTo(log,'✅ 💥 Nuked!','ok'); break;
      case 'freezeAll':    if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerFreezeAll();   _logTo(log,'✅ ❄️ Frozen!','ok'); break;
      case 'maxAllTowers': if (!Game.isRunning()) { _logTo(log,'No active game','err'); return; } Game.ownerMaxAllTowers(); _logTo(log,'✅ All towers maxed!','ok'); break;
    }
  }

  // ── Log ───────────────────────────────────────────────
  function _logTo(logId, msg, type = '') {
    const log = document.getElementById(logId);
    if (!log) return;
    const ph = log.querySelector('.op-placeholder');
    if (ph) ph.remove();
    const el = document.createElement('div');
    el.className = 'op-log-entry ' + type;
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    log.insertBefore(el, log.firstChild);
    while (log.children.length > 30) log.lastChild.remove();
  }

  // ── Public API ────────────────────────────────────────
  return { init, show, hide, toggle, open, close, setInGame };

})();
