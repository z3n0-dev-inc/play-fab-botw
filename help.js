const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink } = require('./db');
const { C, FOOTER } = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands'),

  async execute(interaction) {
    const linked = getLink(interaction.user.id);
    return interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(C.dark)
        .setTitle('zombie tower defence — bot')
        .setDescription(
          linked
            ? `linked to **${linked.displayName}** · \`${linked.playfabId}\``
            : `not linked — run **/link** with your PlayFab ID`
        )
        .addFields(
          { name: '— general',
            value: [
              '`/link <id>` — link your PlayFab account',
              '`/unlink` — unlink',
              '`/profile` — your stats & status',
              '`/leaderboard <stat>` — ranked board',
            ].join('\n') },
          { name: '— moderators',
            value: [
              '`/profile @user` or `playfab_id:<id>`',
              '`/ban user @user <reason> [hours]`',
              '`/ban id <playfab_id> <reason> [hours]`',
              '`/unban user @user`',
              '`/unban id <playfab_id>`',
            ].join('\n') },
          { name: '— admins',
            value: [
              '`/grant item:<id> playfab_id:<id>` — grant anything',
              '`/grant item:owner_panel` — owner console',
              '`/grant item:mod_panel` — mod console',
              '`/grant item:dev_panel` — dev/chaos console',
              '`/grant ... revoke:true` — remove an item',
              '`/catalog` — browse all item IDs',
              '`/config set-admin-role @role`',
              '`/config set-mod-role @role`',
            ].join('\n') },
        )
        .setFooter({ text: 'hours blank or 0 = permanent ban' })
        .setTimestamp()],
      ephemeral: true,
    });
  },
};
