const https = require('https');

const TITLE_ID    = process.env.PLAYFAB_TITLE_ID;
const SECRET_KEY  = process.env.PLAYFAB_SECRET_KEY;
const CATALOG     = 'ZTD_Cosmetics_v1';

// ── Core request ──────────────────────────────────────────────
function playfabRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    if (!TITLE_ID || !SECRET_KEY) {
      return reject(new Error('PLAYFAB_TITLE_ID or PLAYFAB_SECRET_KEY missing.'));
    }
    const payload = JSON.stringify(body);
    const options = {
      hostname: `${TITLE_ID}.playfabapi.com`,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-SecretKey': SECRET_KEY,
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => { raw += c; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(raw); }
        catch { return reject(new Error('PlayFab returned invalid JSON.')); }
        if (parsed.code === 200) return resolve(parsed.data ?? {});
        return reject(new Error(parsed.errorMessage || `PlayFab error (code ${parsed.code})`));
      });
    });
    req.on('error', e => reject(new Error(`Network error: ${e.message}`)));
    req.write(payload);
    req.end();
  });
}

// ── Player lookup ─────────────────────────────────────────────

async function searchPlayersByDisplayName(displayName) {
  const results = [];
  const seen    = new Set();

  const addResult = (info) => {
    if (!info || seen.has(info.PlayFabId)) return;
    seen.add(info.PlayFabId);
    results.push({
      playfabId:   info.PlayFabId,
      displayName: info.TitleInfo?.DisplayName || info.Username || info.PlayFabId,
      lastLogin:   info.TitleInfo?.LastLogin   || null,
      created:     info.TitleInfo?.Created     || null,
      username:    info.Username               || null,
    });
  };

  try {
    const d = await playfabRequest('/Admin/GetUserAccountInfo', { TitleDisplayName: displayName });
    if (d?.UserInfo) addResult(d.UserInfo);
  } catch { /* no match */ }

  try {
    const d = await playfabRequest('/Admin/GetUserAccountInfo', { Username: displayName });
    if (d?.UserInfo) addResult(d.UserInfo);
  } catch { /* no match */ }

  return results;
}

async function getPlayerProfile(playfabId) {
  return playfabRequest('/Server/GetPlayerProfile', {
    PlayFabId: playfabId,
    ProfileConstraints: {
      ShowDisplayName: true,
      ShowCreated: true,
      ShowLastLogin: true,
      ShowBannedUntil: true,
    },
  });
}

// ── UserData (how YOUR game stores coins, towers, maps) ───────

async function getUserData(playfabId) {
  return playfabRequest('/Server/GetUserData', {
    PlayFabId: playfabId,
    Keys: ['Coins', 'BestWave', 'TotalKills', 'OwnedTowers', 'UnlockedMaps', 'IsOwner', 'Stats'],
  });
}

async function updateUserData(playfabId, dataObj) {
  // dataObj values must all be strings
  const stringified = {};
  for (const [k, v] of Object.entries(dataObj)) {
    stringified[k] = typeof v === 'string' ? v : JSON.stringify(v);
  }
  return playfabRequest('/Server/UpdateUserData', {
    PlayFabId: playfabId,
    Data: stringified,
    Permission: 'Public',
  });
}

// ── Grant cosmetic item + update OwnedTowers if needed ───────
// This mirrors exactly what your server.js does.
async function grantCosmeticItem(playfabId, itemId) {
  // Step 1: Grant item to PlayFab inventory
  const grantResult = await playfabRequest('/Server/GrantItemsToUser', {
    PlayFabId:      playfabId,
    ItemIds:        [itemId],
    CatalogVersion: CATALOG,
  });

  const granted = grantResult?.ItemGrantResults?.[0];
  if (!granted || granted.Result === false) {
    throw new Error(`PlayFab did not grant item "${itemId}". Check the Item ID and catalog version.`);
  }

  // Step 2: Check if item has a towerId in CustomData — if so, update OwnedTowers
  try {
    const catalogData = await playfabRequest('/Server/GetCatalogItems', { CatalogVersion: CATALOG });
    const catItem = (catalogData?.Catalog || []).find(i => i.ItemId === itemId);
    if (catItem) {
      let custom = {};
      try { custom = typeof catItem.CustomData === 'string' ? JSON.parse(catItem.CustomData) : (catItem.CustomData || {}); } catch {}

      if (custom.towerId) {
        // Get current OwnedTowers
        const existing = await getUserData(playfabId);
        const towers   = JSON.parse(existing?.Data?.OwnedTowers?.Value || '["gunner","archer"]');
        if (!towers.includes(custom.towerId)) {
          towers.push(custom.towerId);
          await updateUserData(playfabId, { OwnedTowers: JSON.stringify(towers) });
        }
      }
    }
  } catch { /* tower update failed silently — item was still granted */ }

  return { itemId, displayName: granted.DisplayName || itemId, instanceId: granted.ItemInstanceId };
}

// ── Grant coins (stored in UserData.Coins, not PlayFab GD) ───
async function grantCoins(playfabId, amount) {
  const existing = await getUserData(playfabId);
  const current  = parseInt(existing?.Data?.Coins?.Value || '0');
  const newTotal = current + amount;
  await updateUserData(playfabId, { Coins: String(newTotal) });
  return { previous: current, added: amount, newTotal };
}

// ── Set coins to exact amount ─────────────────────────────────
async function setCoins(playfabId, amount) {
  await updateUserData(playfabId, { Coins: String(amount) });
  return { newTotal: amount };
}

// ── Unlock maps ───────────────────────────────────────────────
async function unlockAllMaps(playfabId) {
  const allMaps = ['graveyard','city_ruins','volcano','arctic','inferno','nuclear_wasteland','shadow_realm','omega_facility'];
  await updateUserData(playfabId, {
    UnlockedMaps: JSON.stringify(allMaps),
    AllPerksUnlocked: 'true',
  });
  return allMaps;
}

// ── Grant owner status ────────────────────────────────────────
async function grantOwnerStatus(playfabId) {
  await updateUserData(playfabId, { IsOwner: 'true' });
  // Also grant the owner_panel item so the in-game panel shows
  try {
    await playfabRequest('/Server/GrantItemsToUser', {
      PlayFabId: playfabId,
      ItemIds: ['owner_panel'],
      CatalogVersion: CATALOG,
    });
  } catch { /* may already have it */ }
}

// ── Reset player ──────────────────────────────────────────────
async function resetPlayer(playfabId) {
  await updateUserData(playfabId, {
    Coins:        '100',
    BestWave:     '0',
    TotalKills:   '0',
    OwnedTowers:  '["gunner","archer"]',
    UnlockedMaps: '["graveyard"]',
    IsOwner:      'false',
    Stats:        '{}',
  });
}

// ── Banning ───────────────────────────────────────────────────
async function banPlayer(playfabId, durationHours, reason) {
  const ban = { PlayFabId: playfabId, Reason: reason };
  if (typeof durationHours === 'number' && durationHours > 0) ban.DurationInHours = durationHours;
  return playfabRequest('/Server/BanUsers', { Bans: [ban] });
}

async function getUserBans(playfabId) {
  return playfabRequest('/Server/GetUserBans', { PlayFabId: playfabId });
}

async function revokeBans(banIds) {
  return playfabRequest('/Server/RevokeBans', { BanIds: banIds });
}

// ── Stats ─────────────────────────────────────────────────────
async function getPlayerStatistics(playfabId) {
  return playfabRequest('/Server/GetPlayerStatistics', { PlayFabId: playfabId });
}

async function updatePlayerStatistic(playfabId, statName, value) {
  return playfabRequest('/Server/UpdatePlayerStatistics', {
    PlayFabId:  playfabId,
    Statistics: [{ StatisticName: statName, Value: value }],
  });
}

async function getLeaderboard(statName, maxResults = 10) {
  return playfabRequest('/Server/GetLeaderboard', {
    StatisticName:   statName,
    StartPosition:   0,
    MaxResultsCount: Math.min(maxResults, 100),
  });
}

// ── Inventory ─────────────────────────────────────────────────
async function getUserInventory(playfabId) {
  return playfabRequest('/Server/GetUserInventory', { PlayFabId: playfabId });
}

module.exports = {
  playfabRequest,
  searchPlayersByDisplayName,
  getPlayerProfile,
  getUserData,
  updateUserData,
  grantCosmeticItem,
  grantCoins,
  setCoins,
  unlockAllMaps,
  grantOwnerStatus,
  resetPlayer,
  banPlayer,
  getUserBans,
  revokeBans,
  getPlayerStatistics,
  updatePlayerStatistic,
  getLeaderboard,
  getUserInventory,
  CATALOG,
};
