/**
 * server.js — Zombie Tower Defence Backend
 * Handles privileged PlayFab calls (Secret Key stays server-side).
 *
 * SETUP:
 *   npm install
 *   node server.js
 *
 * For deployment: Render, Railway, Fly.io, etc.
 * Then update SERVER_URL in js/playfab.js to your deployed URL.
 */

const express = require('express');
const cors    = require('cors');

// node-fetch v3 is ESM only, use dynamic import
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const TITLE_ID        = '100286';
const SECRET_KEY      = 'PGWTGH1FY6CS4A7SJFHMCKQBADIMOAPKWTCRN8EHMMCUOM7OEK';
const BASE            = `https://${TITLE_ID}.playfabapi.com`;
const CATALOG_VERSION = 'ZTD_Cosmetics_v1';

// ── PlayFab Server API helper ─────────────────────────────
async function pfServer(endpoint, body) {
  const res = await (await fetch)(BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-SecretKey': SECRET_KEY },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { ok: json.code === 200, data: json.data, msg: json.errorMessage };
}

// ── Verify caller has IsOwner = true ──────────────────────
async function verifyOwner(sessionTicket) {
  if (!sessionTicket) return { ok: false, msg: 'No session ticket' };
  // Authenticate session
  const auth = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: sessionTicket });
  if (!auth.ok) return { ok: false, msg: 'Invalid session' };
  const pfId = auth.data.UserInfo.PlayFabId;
  // Check IsOwner flag
  const data = await pfServer('/Server/GetUserData', { PlayFabId: pfId, Keys: ['IsOwner'] });
  if (!data.ok || data.data?.Data?.IsOwner?.Value !== 'true') {
    return { ok: false, msg: 'Not authorized as owner' };
  }
  return { ok: true, callerId: pfId };
}

// ─────────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => res.json({ status: 'ZTD Server online', title: TITLE_ID }));

// ── Public leaderboard — no login required ────────────────────────
app.get('/leaderboard/:stat', async (req, res) => {
  const stat = req.params.stat;
  const max  = Math.min(parseInt(req.query.max) || 100, 100);
  try {
    const r = await pfServer('/Server/GetLeaderboard', {
      StatisticName: stat, StartPosition: 0, MaxResultsCount: max,
    });
    res.json({ ok: true, leaderboard: r.data?.Leaderboard || [] });
  } catch (e) { res.json({ ok: false, msg: e.message, leaderboard: [] }); }
});


// ── Grant catalog item (cosmetics) ───────────────────────
// This is the primary cosmetic grant method.
// All cosmetics live in the PlayFab catalog (ZTD_Cosmetics_v1).
app.post('/owner/grantCatalogItem', async (req, res) => {
  const { callerSession, targetPlayerId, itemId, catalogVersion } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });
  if (!targetPlayerId || !itemId) return res.json({ ok: false, msg: 'Missing targetPlayerId or itemId' });

  const r = await pfServer('/Server/GrantItemsToUser', {
    PlayFabId:      targetPlayerId,
    ItemIds:        [itemId],
    CatalogVersion: catalogVersion || CATALOG_VERSION,
  });

  // If the item has a linked tower ID, also update OwnedTowers
  if (r.ok) {
    // Fetch catalog item CustomData to get towerId
    const catalog = await pfServer('/Server/GetCatalogItems', { CatalogVersion: catalogVersion || CATALOG_VERSION });
    if (catalog.ok) {
      const catItem = (catalog.data.Catalog || []).find(i => i.ItemId === itemId);
      if (catItem) {
        let custom = {};
        try { custom = typeof catItem.CustomData === 'string' ? JSON.parse(catItem.CustomData) : (catItem.CustomData || {}); } catch {}
        if (custom.towerId) {
          const existing = await pfServer('/Server/GetUserData', { PlayFabId: targetPlayerId, Keys: ['OwnedTowers'] });
          const towers = JSON.parse(existing.data?.Data?.OwnedTowers?.Value || '[]');
          if (!towers.includes(custom.towerId)) towers.push(custom.towerId);
          await pfServer('/Server/UpdateUserData', { PlayFabId: targetPlayerId, Data: { OwnedTowers: JSON.stringify(towers) } });
        }
      }
    }
  }

  res.json({ ok: r.ok, msg: r.ok ? 'Item granted' : r.msg });
});

// ── Give all towers ───────────────────────────────────────
app.post('/owner/giveAllTowers', async (req, res) => {
  const { callerSession, targetPlayerId, towerIds } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: { OwnedTowers: JSON.stringify(towerIds || []) },
  });
  res.json({ ok: r.ok, msg: r.ok ? 'All towers granted' : r.msg });
});

// ── Unlock all maps + perks ──────────────────────────────
app.post('/owner/unlockAllPerks', async (req, res) => {
  const { callerSession, targetPlayerId, mapIds } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const allMaps = mapIds || [
    'graveyard','city_ruins','volcano','arctic','inferno',
    'nuclear_wasteland','shadow_realm','omega_facility'
  ];

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: {
      AllPerksUnlocked: 'true',
      UnlockedMaps: JSON.stringify(allMaps),
    },
  });
  res.json({ ok: r.ok, msg: r.ok ? `All ${allMaps.length} maps unlocked` : r.msg });
});

// ── Give coins ────────────────────────────────────────────
app.post('/owner/giveCoins', async (req, res) => {
  const { callerSession, targetPlayerId, amount } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const existing = await pfServer('/Server/GetUserData', { PlayFabId: targetPlayerId, Keys: ['Coins'] });
  const current  = parseInt(existing.data?.Data?.Coins?.Value || '0');
  const newCoins = current + (parseInt(amount) || 0);

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: { Coins: String(newCoins) },
  });
  res.json({ ok: r.ok, msg: r.ok ? `${newCoins} total coins set` : r.msg });
});

// ── Grant owner status ────────────────────────────────────
app.post('/owner/makeOwner', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: { IsOwner: 'true' },
  });
  res.json({ ok: r.ok, msg: r.ok ? 'Owner status granted' : r.msg });
});

// ── Grant dev panel ───────────────────────────────────────
app.post('/owner/grantDevPanel', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: { HasDevPanel: 'true' },
  });
  res.json({ ok: r.ok, msg: r.ok ? 'Dev panel granted' : r.msg });
});

// ── Revoke dev panel ──────────────────────────────────────
app.post('/owner/revokeDevPanel', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: { HasDevPanel: 'false' },
  });
  res.json({ ok: r.ok, msg: r.ok ? 'Dev panel revoked' : r.msg });
});

// ── Reset player ──────────────────────────────────────────
app.post('/owner/resetPlayer', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) return res.json({ ok: false, msg: auth.msg });

  const r = await pfServer('/Server/UpdateUserData', {
    PlayFabId: targetPlayerId,
    Data: { Coins:'100', BestWave:'0', TotalKills:'0',
            OwnedTowers:'["gunner","archer"]',
            UnlockedMaps:'["graveyard"]' },
  });
  res.json({ ok: r.ok, msg: r.ok ? 'Player reset' : r.msg });
});

// ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🧟 ZTD Server running → http://localhost:${PORT}`);
  console.log(`   PlayFab Title:    ${TITLE_ID}`);
  console.log(`   Catalog Version:  ${CATALOG_VERSION}`);
  console.log(`   Endpoints:        /owner/*\n`);
});

// ── Resolve PlayFab ID from username OR ID ────────────────
async function resolvePlayFabId(nameOrId) {
  // If it looks like a PlayFab ID (hex, ~16 chars), use directly
  if (/^[0-9A-Fa-f]{16}$/.test(nameOrId)) return { ok: true, playFabId: nameOrId };
  // Otherwise look up by username
  const r = await pfServer('/Server/GetUserAccountInfo', { Username: nameOrId });
  if (r.ok && r.data?.UserInfo?.PlayFabId) return { ok: true, playFabId: r.data.UserInfo.PlayFabId };
  // Try DisplayName lookup via leaderboard isn't great; try direct account lookup
  return { ok: false, msg: `Player "${nameOrId}" not found. Try their PlayFab ID instead.` };
}

// ── Lookup player profile (for mod panel) ─────────────────
app.post('/owner/lookupPlayer', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  if (!callerSession) return res.json({ ok: false, msg: 'Not authenticated' });
  // Verify caller has at least mod access
  const auth = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: callerSession });
  if (!auth.ok) return res.json({ ok: false, msg: 'Invalid session' });
  const callerId = auth.data.UserInfo.PlayFabId;
  const callerData = await pfServer('/Server/GetUserData', { PlayFabId: callerId, Keys: ['IsOwner', 'IsMod'] });
  const callerD = callerData.data?.Data || {};
  const isOwnerOrMod = callerD.IsOwner?.Value === 'true' || callerD.IsMod?.Value === 'true';
  if (!isOwnerOrMod) return res.json({ ok: false, msg: 'Not authorized' });

  const resolved = await resolvePlayFabId(targetPlayerId);
  if (!resolved.ok) return res.json({ ok: false, msg: resolved.msg });
  const pfId = resolved.playFabId;

  const [profileRes, statsRes, banRes] = await Promise.all([
    pfServer('/Server/GetUserAccountInfo', { PlayFabId: pfId }),
    pfServer('/Server/GetPlayerStatistics', { PlayFabId: pfId }),
    pfServer('/Server/GetUserBans', { PlayFabId: pfId }),
  ]);

  const profile = profileRes.data?.UserInfo || {};
  const statsArr = statsRes.data?.Statistics || [];
  const stats = {};
  statsArr.forEach(s => { stats[s.StatisticName] = s.Value; });

  const now = new Date();
  const activeBan = (banRes.data?.BanData || []).find(b => !b.Expires || new Date(b.Expires) > now);

  res.json({
    ok: true,
    playFabId: pfId,
    profile: {
      DisplayName: profile.TitleInfo?.DisplayName || profile.Username || pfId,
      Username: profile.Username,
      Created: profile.TitleInfo?.Created,
      LastLogin: profile.TitleInfo?.LastLogin,
      BannedUntil: activeBan?.Expires || null,
    },
    stats,
  });
});

// ── Ban player (by name or ID) ─────────────────────────────
app.post('/owner/banPlayer', async (req, res) => {
  const { callerSession, targetPlayerId, reason, hours } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) {
    // Allow mods too — verify mod access
    const authAny = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: callerSession });
    if (!authAny.ok) return res.json({ ok: false, msg: 'Invalid session' });
    const callerId = authAny.data.UserInfo.PlayFabId;
    const callerData = await pfServer('/Server/GetUserData', { PlayFabId: callerId, Keys: ['IsMod'] });
    if (callerData.data?.Data?.IsMod?.Value !== 'true') return res.json({ ok: false, msg: 'Not authorized' });
  }

  const resolved = await resolvePlayFabId(targetPlayerId);
  if (!resolved.ok) return res.json({ ok: false, msg: resolved.msg });
  const pfId = resolved.playFabId;

  const banReq = {
    Bans: [{
      PlayFabId: pfId,
      Reason: reason || 'No reason given',
      ...(hours && hours > 0 ? { DurationInHours: parseInt(hours) } : {}),
    }]
  };
  const r = await pfServer('/Server/BanUsers', banReq);
  if (r.ok) {
    // Also store ban flag in user data for in-game checks
    await pfServer('/Server/UpdateUserData', { PlayFabId: pfId, Data: { IsBanned: 'true', BanReason: reason || 'Banned' } });
  }
  res.json({ ok: r.ok, msg: r.ok ? `Player banned${hours > 0 ? ` for ${hours}h` : ' permanently'}` : (r.msg || 'Ban failed') });
});

// ── Unban player ──────────────────────────────────────────
app.post('/owner/unbanPlayer', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  const auth = await verifyOwner(callerSession);
  if (!auth.ok) {
    const authAny = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: callerSession });
    if (!authAny.ok) return res.json({ ok: false, msg: 'Invalid session' });
    const callerId = authAny.data.UserInfo.PlayFabId;
    const callerData = await pfServer('/Server/GetUserData', { PlayFabId: callerId, Keys: ['IsMod'] });
    if (callerData.data?.Data?.IsMod?.Value !== 'true') return res.json({ ok: false, msg: 'Not authorized' });
  }

  const resolved = await resolvePlayFabId(targetPlayerId);
  if (!resolved.ok) return res.json({ ok: false, msg: resolved.msg });
  const pfId = resolved.playFabId;

  // Get active bans first
  const banRes = await pfServer('/Server/GetUserBans', { PlayFabId: pfId });
  const activeBans = (banRes.data?.BanData || []).filter(b => !b.Expires || new Date(b.Expires) > new Date());
  if (!activeBans.length) return res.json({ ok: false, msg: 'No active bans found' });

  const r = await pfServer('/Server/RevokeBans', { BanIds: activeBans.map(b => b.BanId) });
  if (r.ok) {
    await pfServer('/Server/UpdateUserData', { PlayFabId: pfId, Data: { IsBanned: 'false', BanReason: '' } });
  }
  res.json({ ok: r.ok, msg: r.ok ? 'Player unbanned' : (r.msg || 'Unban failed') });
});

// ── Warn player ───────────────────────────────────────────
app.post('/owner/warnPlayer', async (req, res) => {
  const { callerSession, targetPlayerId, reason } = req.body;
  const authAny = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: callerSession });
  if (!authAny.ok) return res.json({ ok: false, msg: 'Invalid session' });

  const resolved = await resolvePlayFabId(targetPlayerId);
  if (!resolved.ok) return res.json({ ok: false, msg: resolved.msg });
  const pfId = resolved.playFabId;

  const existing = await pfServer('/Server/GetUserData', { PlayFabId: pfId, Keys: ['Warnings'] });
  const warnings = JSON.parse(existing.data?.Data?.Warnings?.Value || '[]');
  warnings.push({ reason: reason || 'No reason', date: new Date().toISOString() });

  const r = await pfServer('/Server/UpdateUserData', { PlayFabId: pfId, Data: { Warnings: JSON.stringify(warnings) } });
  res.json({ ok: r.ok, msg: r.ok ? `Warning issued (total: ${warnings.length})` : (r.msg || 'Failed') });
});

// ── Kick player (flag for forced logout) ──────────────────
app.post('/owner/kickPlayer', async (req, res) => {
  const { callerSession, targetPlayerId } = req.body;
  const authAny = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: callerSession });
  if (!authAny.ok) return res.json({ ok: false, msg: 'Invalid session' });

  const resolved = await resolvePlayFabId(targetPlayerId);
  if (!resolved.ok) return res.json({ ok: false, msg: resolved.msg });
  const pfId = resolved.playFabId;

  const r = await pfServer('/Server/UpdateUserData', { PlayFabId: pfId, Data: { ForceKick: Date.now().toString() } });
  res.json({ ok: r.ok, msg: r.ok ? 'Kick signal sent' : (r.msg || 'Failed') });
});

// ── Mute player ───────────────────────────────────────────
app.post('/owner/mutePlayer', async (req, res) => {
  const { callerSession, targetPlayerId, hours } = req.body;
  const authAny = await pfServer('/Server/AuthenticateSessionTicket', { SessionTicket: callerSession });
  if (!authAny.ok) return res.json({ ok: false, msg: 'Invalid session' });

  const resolved = await resolvePlayFabId(targetPlayerId);
  if (!resolved.ok) return res.json({ ok: false, msg: resolved.msg });
  const pfId = resolved.playFabId;

  const muteUntil = new Date(Date.now() + (hours || 1) * 3600000).toISOString();
  const r = await pfServer('/Server/UpdateUserData', { PlayFabId: pfId, Data: { MutedUntil: muteUntil } });
  res.json({ ok: r.ok, msg: r.ok ? `Muted until ${muteUntil}` : (r.msg || 'Failed') });
});
