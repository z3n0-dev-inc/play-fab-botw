const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function _load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const blank = { links: {}, guilds: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(blank, null, 2), 'utf8');
    return blank;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    const blank = { links: {}, guilds: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(blank, null, 2), 'utf8');
    return blank;
  }
}

function _save(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function linkAccount(discordId, playfabId, displayName) {
  const db = _load();
  db.links[discordId] = { playfabId, displayName: displayName || playfabId, linkedAt: new Date().toISOString() };
  _save(db);
}

function unlinkAccount(discordId) {
  const db = _load();
  const had = !!db.links[discordId];
  delete db.links[discordId];
  _save(db);
  return had;
}

function getLink(discordId) {
  return _load().links[discordId] || null;
}

function getLinkByPlayfabId(playfabId) {
  const links = _load().links;
  const entry = Object.entries(links).find(([, v]) => v.playfabId === playfabId);
  return entry ? { discordId: entry[0], ...entry[1] } : null;
}

function getAllLinks() {
  return _load().links;
}

function getGuildConfig(guildId) {
  return _load().guilds[guildId] || {};
}

function setGuildConfig(guildId, updates) {
  const db = _load();
  db.guilds[guildId] = { ...(db.guilds[guildId] || {}), ...updates };
  _save(db);
}

function resetGuildConfig(guildId) {
  const db = _load();
  delete db.guilds[guildId];
  _save(db);
}

module.exports = {
  linkAccount,
  unlinkAccount,
  getLink,
  getLinkByPlayfabId,
  getAllLinks,
  getGuildConfig,
  setGuildConfig,
  resetGuildConfig,
};
