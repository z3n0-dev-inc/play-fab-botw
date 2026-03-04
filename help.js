const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink } = require('./db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all PlayFab Bot commands'),

  async execute(interaction) {
    const linked = getLink(interaction.user.id);

    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x00B4D8)
        .setTitle('🎮  PlayFab Bot — Commands')
        .setDescription(
          linked
            ? `✅ Linked to **${linked.displayName}** (\`${linked.playfabId}\`)`
            : `❌ Not linked yet — use **/link <playfab_id>** to connect your account!`
        )
        .addFields(
          {
            name: '👤 Everyone',
            value: [
              '`/link <id>` — Link your PlayFab account',
              '`/unlink` — Unlink your account',
              '`/profile` — Your profile, stats & inventory',
              '`/inventory` — Your inventory & currency',
              '`/stats view` — Your statistics',
              '`/leaderboard <stat>` — Ranked leaderboard',
            ].join('\n'),
          },
          {
            name: '🛡️ Moderators',
            value: [
              '`/ban user @user <reason> [hours]` — Ban a linked user',
              '`/ban id <playfab_id> <reason> [hours]` — Ban by PlayFab ID',
              '`/unban user @user` — Unban a linked user',
              '`/unban id <playfab_id>` — Unban by PlayFab ID',
              '`/profile @user` — View any profile',
            ].join('\n'),
          },
          {
            name: '🔐 Admins',
            value: [
              '`/grant item <item_id> [@user or id]` — Grant a cosmetic/item',
              '`/grant currency <code> <amount> [@user or id]` — Grant currency',
              '`/stats set <stat> <value> [@user or id]` — Set a stat',
            ].join('\n'),
          },
          {
            name: '⚙️ Server Admin',
            value: [
              '`/config set-admin-role @role` — Set an Admin role',
              '`/config set-mod-role @role` — Set a Mod role',
              '`/config view` — View current setup',
              '`/config reset` — Reset config',
            ].join('\n'),
          },
        )
        .setFooter({ text: 'hours=0 or blank = permanent ban' })
        .setTimestamp()],
      ephemeral: true,
    });
  },
};
