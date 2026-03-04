const { PermissionFlagsBits } = require('discord.js');
const { getGuildConfig } = require('./db');

function hasPermission(interaction, tier) {
  const member = interaction.member;
  if (!member) return false;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

  const config     = getGuildConfig(interaction.guildId);
  const adminRoles = config.adminRoles || [];
  const modRoles   = config.modRoles   || [];
  const memberRoles = member.roles.cache;

  if (tier === 'ADMIN') return adminRoles.some(id => memberRoles.has(id));
  if (tier === 'MOD')   return modRoles.some(id => memberRoles.has(id)) || adminRoles.some(id => memberRoles.has(id));
  return true; // USER — everyone
}

function requirePermission(interaction, tier) {
  if (!hasPermission(interaction, tier)) {
    const label = tier === 'ADMIN' ? 'Admin' : 'Moderator';
    throw new Error(`🚫 You need the **${label}** role to use this command.\nA server admin can set roles with \`/config set-admin-role\` or \`/config set-mod-role\`.`);
  }
}

module.exports = { hasPermission, requirePermission };
