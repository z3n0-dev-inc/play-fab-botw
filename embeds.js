const { EmbedBuilder } = require('discord.js');

function successEmbed(title, description) {
  return new EmbedBuilder().setColor(0x57F287).setTitle(`✅  ${title}`).setDescription(description).setTimestamp();
}

function errorEmbed(description) {
  return new EmbedBuilder().setColor(0xED4245).setTitle('❌  Error').setDescription(description).setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder().setColor(0x5865F2).setTitle(`ℹ️  ${title}`).setDescription(description).setTimestamp();
}

function profileEmbed(playfabId, profileData, statsArr, inventoryData) {
  const p           = profileData?.PlayerProfile || {};
  const displayName = p.DisplayName || 'Unknown Player';
  const created     = p.Created    ? `<t:${Math.floor(new Date(p.Created).getTime()   / 1000)}:D>` : 'Unknown';
  const lastLogin   = p.LastLogin  ? `<t:${Math.floor(new Date(p.LastLogin).getTime() / 1000)}:R>` : 'Never';
  const bannedUntil = p.BannedUntil ? new Date(p.BannedUntil) : null;
  const isBanned    = bannedUntil && bannedUntil > new Date();

  const embed = new EmbedBuilder()
    .setColor(isBanned ? 0xFF4500 : 0x00B4D8)
    .setTitle(`🎮  ${displayName}`)
    .setFooter({ text: `PlayFab ID: ${playfabId}` })
    .setTimestamp();

  embed.addFields(
    { name: '📅 Joined',    value: created,  inline: true },
    { name: '🕐 Last Seen', value: lastLogin, inline: true },
    { name: '⚡ Status',    value: isBanned ? `⛔ Banned until <t:${Math.floor(bannedUntil.getTime()/1000)}:F>` : '✅ Active', inline: true },
  );

  if (statsArr?.length) {
    embed.addFields({
      name: '📊 Statistics',
      value: statsArr.slice(0, 12).map(s => `\`${s.StatisticName}\` → **${s.Value.toLocaleString()}**`).join('\n'),
      inline: false,
    });
  }

  const vc = inventoryData?.VirtualCurrency;
  if (vc && Object.keys(vc).length) {
    embed.addFields({
      name: '💰 Currency',
      value: Object.entries(vc).map(([k, v]) => `**${k}:** ${v.toLocaleString()}`).join('  |  '),
      inline: false,
    });
  }

  const items = inventoryData?.Inventory;
  if (items?.length) {
    const preview = items.slice(0, 8).map(i => `• ${i.DisplayName || i.ItemId}`).join('\n');
    embed.addFields({
      name: `🎒 Inventory (${items.length} items)`,
      value: preview + (items.length > 8 ? `\n*…and ${items.length - 8} more*` : ''),
      inline: false,
    });
  }

  return embed;
}

module.exports = { successEmbed, errorEmbed, infoEmbed, profileEmbed };
