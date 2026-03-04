const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink } = require('./db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all Zombie Tower Defence bot commands'),

  async execute(interaction) {
    const linked = getLink(interaction.user.id);

    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x00B4D8)
        .setTitle('🧟  Zombie Tower Defence Bot — Commands')
        .setDescription(
          linked
            ? `✅ Linked to **${linked.displayName}**`
            : `❌ Not linked — use **/link <username>** to connect your in-game account!`
        )
        .addFields(
          {
            name: '👤 Everyone',
            value: [
              '`/link <username>` — Link your in-game account',
              '`/unlink` — Unlink your account',
              '`/profile` — View your profile, coins, towers & maps',
              '`/inventory` — View your cosmetics & coins',
              '`/top wave/kills/score` — ZTD leaderboards',
              '`/cosmetics` — Browse all available cosmetics',
              '`/help` — Show this menu',
            ].join('\n'),
          },
          {
            name: '🛡️ Moderators',
            value: [
              '`/ban user/id <reason> [hours]` — Ban a player',
              '`/unban user/id` — Unban a player',
              '`/playerinfo [@user or id]` — Full player details',
            ].join('\n'),
          },
          {
            name: '🔐 Admins',
            value: [
              '`/grant cosmetic <item> [@user or id]` — Grant a cosmetic',
              '`/grant coins <amount> [@user or id]` — Add coins',
              '`/grant maps [@user or id]` — Unlock all maps',
              '`/grant owner [@user or id]` — Grant owner status',
              '`/setcoins <amount> [@user or id]` — Set exact coin balance',
              '`/resetplayer [@user or id]` — Wipe player back to fresh start',
              '`/stats set <stat> <value>` — Override a statistic',
            ].join('\n'),
          },
          {
            name: '⚙️ Server Admin',
            value: [
              '`/config set-admin-role @role` — Set Admin role',
              '`/config set-mod-role @role` — Set Mod role',
              '`/config view` — View current setup',
            ].join('\n'),
          },
        )
        .setFooter({ text: 'Zombie Tower Defence • ZTD_Cosmetics_v1' })
        .setTimestamp()],
      ephemeral: true,
    });
  },
};
