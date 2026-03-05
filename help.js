const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink } = require('./db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const linked = getLink(interaction.user.id);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x23272A)
          .setTitle('PlayFab Bot')
          .setDescription(
            linked
              ? `Linked to **${linked.displayName}**  \`${linked.playfabId}\``
              : `Not linked — use **/link <playfab_id>** to connect your account.`
          )
          .addFields(
            {
              name : 'General',
              value: [
                '`/link <id>` — Link your PlayFab account',
                '`/unlink` — Unlink your account',
                '`/profile` — View your profile',
                '`/leaderboard <stat>` — View a ranked leaderboard',
              ].join('\n'),
            },
            {
              name : 'Moderators',
              value: [
                '`/profile @user` — View another player\'s profile',
                '`/profile playfab_id:<id>` — Look up by PlayFab ID',
                '`/ban user @user <reason> [hours]` — Ban a linked user',
                '`/ban id <playfab_id> <reason> [hours]` — Ban by PlayFab ID',
                '`/unban user @user` — Unban a linked user',
                '`/unban id <playfab_id>` — Unban by PlayFab ID',
              ].join('\n'),
            },
            {
              name : 'Server Admin',
              value: [
                '`/config set-admin-role @role` — Set an Admin role',
                '`/config set-mod-role @role` — Set a Mod role',
                '`/config view` — View current configuration',
                '`/config reset` — Reset configuration',
              ].join('\n'),
            },
          )
          .setFooter({ text: 'hours = 0 or blank for a permanent ban' })
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
