const { EmbedBuilder } = require('discord.js');

const COLORS = {
  success : 0x2ECC71,
  error   : 0xE74C3C,
  info    : 0x2C2F33,
  profile : 0x23272A,
  banned  : 0xC0392B,
};

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle('Error')
    .setDescription(description)
    .setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function profileEmbed(playfabId, profileData, statsArr) {
  const p           = profileData?.PlayerProfile || {};
  const displayName = p.DisplayName || 'Unknown Player';
  const created     = p.Created   ? `<t:${Math.floor(new Date(p.Created).getTime()   / 1000)}:D>` : 'Unknown';
  const lastLogin   = p.LastLogin ? `<t:${Math.floor(new Date(p.LastLogin).getTime() / 1000)}:R>` : 'Never';
  const bannedUntil = p.BannedUntil ? new Date(p.BannedUntil) : null;
  const isBanned    = bannedUntil && bannedUntil > new Date();

  const embed = new EmbedBuilder()
    .setColor(isBanned ? COLORS.banned : COLORS.profile)
    .setTitle(displayName)
    .setFooter({ text: `PlayFab  ·  ${playfabId}` })
    .setTimestamp();

  embed.addFields(
    { name: 'Joined',    value: created,  inline: true },
    { name: 'Last Seen', value: lastLogin, inline: true },
    { name: 'Status',
      value: isBanned
        ? `Banned until <t:${Math.floor(bannedUntil.getTime() / 1000)}:F>`
        : 'Active',
      inline: true,
    },
  );

  if (statsArr?.length) {
    embed.addFields({
      name : 'Statistics',
      value: statsArr
        .slice(0, 12)
        .map(s => `\`${s.StatisticName}\`  ${s.Value.toLocaleString()}`)
        .join('\n'),
      inline: false,
    });
  }

  return embed;
}

module.exports = { successEmbed, errorEmbed, infoEmbed, profileEmbed };
