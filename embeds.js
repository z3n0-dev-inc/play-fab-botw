const { EmbedBuilder } = require('discord.js');

const C = {
  red:    0xE74C3C,
  green:  0x2ECC71,
  gold:   0xF5B215,
  cyan:   0x3DD6F5,
  purple: 0x9B59B6,
  dark:   0x111318,
  grey:   0x2C2F33,
  orange: 0xFF6B35,
  banned: 0xC0392B,
};

const FOOTER = { text: 'ZTD · Zombie Tower Defence' };

function ok(title, desc) {
  return new EmbedBuilder().setColor(C.green).setTitle(`✓  ${title}`).setDescription(desc).setFooter(FOOTER).setTimestamp();
}
function err(desc) {
  return new EmbedBuilder().setColor(C.red).setTitle('✗  error').setDescription(desc).setFooter(FOOTER).setTimestamp();
}
function warn(title, desc) {
  return new EmbedBuilder().setColor(C.gold).setTitle(`⚠  ${title}`).setDescription(desc).setFooter(FOOTER).setTimestamp();
}
function info(title, desc) {
  return new EmbedBuilder().setColor(C.dark).setTitle(title).setDescription(desc).setFooter(FOOTER).setTimestamp();
}

function profileEmbed(playfabId, profileData, statsArr) {
  const p    = profileData?.PlayerProfile || {};
  const name = p.DisplayName || 'unknown player';
  const created   = p.Created   ? `<t:${Math.floor(new Date(p.Created).getTime()/1000)}:D>`   : '—';
  const lastLogin = p.LastLogin ? `<t:${Math.floor(new Date(p.LastLogin).getTime()/1000)}:R>` : 'never';
  const banDate   = p.BannedUntil ? new Date(p.BannedUntil) : null;
  const isBanned  = banDate && banDate > new Date();
  const status    = isBanned ? `🔨 banned until <t:${Math.floor(banDate.getTime()/1000)}:F>` : '✓ active';

  const embed = new EmbedBuilder()
    .setColor(isBanned ? C.banned : C.dark)
    .setTitle(name)
    .setDescription(`\`${playfabId}\``)
    .addFields(
      { name: 'joined',    value: created,   inline: true },
      { name: 'last seen', value: lastLogin,  inline: true },
      { name: 'status',    value: status,     inline: true },
    )
    .setFooter(FOOTER)
    .setTimestamp();

  if (statsArr?.length) {
    embed.addFields({
      name: 'stats',
      value: statsArr.slice(0,10).map(s => `\`${s.StatisticName}\` **${s.Value.toLocaleString()}**`).join('\n'),
    });
  }
  return embed;
}

const RARITY_COLORS = { owner: C.gold, dev: C.orange, legendary: C.gold, rare: C.cyan, uncommon: C.green, common: C.grey };

function grantEmbed({ icon, displayName, itemId, itemClass, rarity, targetName, playfabId, grantedBy, catalogVersion, extraNote }) {
  const color = RARITY_COLORS[rarity?.toLowerCase()] || C.grey;
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`${icon}  granted`)
    .setDescription(`**${icon} ${displayName}** → **${targetName}**\n\`${playfabId}\`` + (extraNote ? `\n\n${extraNote}` : ''))
    .addFields(
      { name: 'item',       value: `\`${itemId}\``,  inline: true },
      { name: 'class',      value: itemClass || '—',  inline: true },
      { name: 'rarity',     value: rarity || '—',     inline: true },
      { name: 'granted by', value: grantedBy,          inline: false },
    )
    .setFooter({ text: `catalog: ${catalogVersion}` })
    .setTimestamp();
}

function revokeEmbed({ icon, displayName, itemId, targetName, playfabId, revokedBy, catalogVersion }) {
  return new EmbedBuilder()
    .setColor(C.grey)
    .setTitle(`${icon}  revoked`)
    .setDescription(`removed **${icon} ${displayName}** from **${targetName}**\n\`${playfabId}\``)
    .addFields(
      { name: 'item',       value: `\`${itemId}\``, inline: true },
      { name: 'revoked by', value: revokedBy,        inline: true },
    )
    .setFooter({ text: `catalog: ${catalogVersion}` })
    .setTimestamp();
}

module.exports = { C, FOOTER, successEmbed: ok, errorEmbed: err, warnEmbed: warn, infoEmbed: info, profileEmbed, grantEmbed, revokeEmbed };
