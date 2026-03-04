const https = require('https');

const TITLE_ID   = process.env.PLAYFAB_TITLE_ID;
const SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;

function playfabRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    if (!TITLE_ID || !SECRET_KEY) {
      return reject(new Error('PLAYFAB_TITLE_ID or PLAYFAB_SECRET_KEY is missing from your environment variables.'));
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
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(raw); }
        catch { return reject(new Error('PlayFab returned invalid JSON. Double-check your Title ID.')); }
        if (parsed.code === 200) return resolve(parsed.data ?? {});
        return reject(new Error(parsed.errorMessage || `PlayFab error (code ${parsed.code})`));
      });
    });
    req.on('error', err => reject(new Error(`Network error: ${err.message}`)));
    req.write(payload);
    req.end();
  });
}

/**
 * Search for players by display name using the PlayFab Admin API.
 * Tries both TitleDisplayName (in-game name) and Username (PlayFab account name).
 * Returns an array of matches so duplicate names can be shown in a menu.
 */
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

  // Search by in-game display name
  try {
    const d = await playfabRequest('/Admin/GetUserAccountInfo', { TitleDisplayName: displayName });
    if (d?.UserInfo) addResult(d.UserInfo);
  } catch { /* no match by display name */ }

  // Also search by PlayFab username (some games use this as the visible name)
  try {
    const d = await playfabRequest('/Admin/GetUserAccountInfo', { Username: displayName });
    if (d?.UserInfo) addResult(d.UserInfo);
  } catch { /* no match by username */ }

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
      ShowAvatarUrl: true,
    },
  });
}

async function getPlayerStatistics(playfabId) {
  return playfabRequest('/Server/GetPlayerStatistics', { PlayFabId: playfabId });
}

async function getUserInventory(playfabId) {
  return playfabRequest('/Server/GetUserInventory', { PlayFabId: playfabId });
}

async function getUserData(playfabId, keys = []) {
  const body = { PlayFabId: playfabId };
  if (keys.length) body.Keys = keys;
  return playfabRequest('/Server/GetUserData', body);
}

async function updateUserData(playfabId, dataObj) {
  return playfabRequest('/Server/UpdateUserData', {
    PlayFabId: playfabId,
    Data: dataObj,
    Permission: 'Public',
  });
}

async function banPlayer(playfabId, durationHours, reason) {
  const ban = { PlayFabId: playfabId, Reason: reason };
  if (typeof durationHours === 'number' && durationHours > 0) {
    ban.DurationInHours = durationHours;
  }
  return playfabRequest('/Server/BanUsers', { Bans: [ban] });
}

async function getUserBans(playfabId) {
  return playfabRequest('/Server/GetUserBans', { PlayFabId: playfabId });
}

async function revokeBans(banIds) {
  return playfabRequest('/Server/RevokeBans', { BanIds: banIds });
}

async function addVirtualCurrency(playfabId, currencyCode, amount) {
  return playfabRequest('/Server/AddUserVirtualCurrency', {
    PlayFabId: playfabId,
    VirtualCurrency: currencyCode,
    Amount: amount,
  });
}

async function subtractVirtualCurrency(playfabId, currencyCode, amount) {
  return playfabRequest('/Server/SubtractUserVirtualCurrency', {
    PlayFabId: playfabId,
    VirtualCurrency: currencyCode,
    Amount: amount,
  });
}

async function grantItems(playfabId, itemIds, catalogVersion) {
  return playfabRequest('/Server/GrantItemsToUser', {
    PlayFabId: playfabId,
    ItemIds: Array.isArray(itemIds) ? itemIds : [itemIds],
    CatalogVersion: catalogVersion || process.env.PLAYFAB_CATALOG || 'main',
  });
}

async function revokeInventoryItem(playfabId, itemInstanceId) {
  return playfabRequest('/Server/RevokeInventoryItem', {
    PlayFabId: playfabId,
    ItemInstanceId: itemInstanceId,
  });
}

async function getCatalogItems(catalogVersion) {
  return playfabRequest('/Server/GetCatalogItems', {
    CatalogVersion: catalogVersion || process.env.PLAYFAB_CATALOG || 'main',
  });
}

async function updatePlayerStatistic(playfabId, statName, value) {
  return playfabRequest('/Server/UpdatePlayerStatistics', {
    PlayFabId: playfabId,
    Statistics: [{ StatisticName: statName, Value: value }],
  });
}

async function getLeaderboard(statName, maxResults = 10) {
  return playfabRequest('/Server/GetLeaderboard', {
    StatisticName: statName,
    StartPosition: 0,
    MaxResultsCount: Math.min(maxResults, 100),
  });
}

module.exports = {
  playfabRequest,
  searchPlayersByDisplayName,
  getPlayerProfile,
  getPlayerStatistics,
  getUserInventory,
  getUserData,
  updateUserData,
  banPlayer,
  getUserBans,
  revokeBans,
  addVirtualCurrency,
  subtractVirtualCurrency,
  grantItems,
  revokeInventoryItem,
  getCatalogItems,
  updatePlayerStatistic,
  getLeaderboard,
};
