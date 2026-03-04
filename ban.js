const { SlashCommandBuilder }        = require('discord.js');
const { getLink }                    = require('./db');
const { banPlayer }                  = require('./playfab');
const { successEmbed, errorEmbed }   = require('./embeds');
const { requirePermission }          = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a player from PlayFab [MOD]')
    .addSubcommand(s =>
      s.setName('user')
        .setDescription('Ban a linked Discord user')
        .addUserOption(o => o.setName('target').setDescription('Discord user to ban').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the ban').setRequired(true))
        .addIntegerOption(o => o.setName('hours').setDescription('Duration in hours — leave blank or 0 for permanent').setRequired(false).setMinValue(0))
    )
    .addSubcommand(s =>
      s.setName('id')
        .setDescription('Ban by PlayFab ID directly')
        .addStringOption(o => o.setName('playfab_id').setDescription('PlayFab Player ID').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the ban').setRequired(true))
        .addIntegerOption(o => o.setName('hours').setDescription('Duration in hours — leave blank or 0 for permanent').setRequired(false).setMinValue(0))
    ),

  async execute(interaction) {
    requirePermission(interaction, 'MOD');
    await interaction.deferReply();

    const sub    = interaction.options.getSubcommand();
    const reason = interaction.options.getString('reason');
    const hours  = interaction.options.getInteger('hours') ?? 0;
    let playfabId, targetLabel;

    if (sub === 'user') {
      const target = interaction.options.getUser('target');
      if (target.id === interaction.user.id) {
        return interaction.editReply({ embeds: [errorEmbed(`You can't ban yourself.`)] });
      }
      const link = getLink(target.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(`${target.username} hasn't linked their PlayFab account.\nUse \`/ban id\` with their PlayFab ID instead.`)],
        });
      }
      playfabId   = link.playfabId;
      targetLabel = `${target.username} (\`${playfabId}\`)`;
    } else {
      playfabId   = interaction.options.getString('playfab_id').trim().toUpperCase();
      targetLabel = `\`${playfabId}\``;
    }

    try {
      await banPlayer(playfabId, hours || null, reason);
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Ban failed: ${err.message}`)] });
    }

    return interaction.editReply({
      embeds: [successEmbed(
        'Player Banned',
        `Successfully banned ${targetLabel} on PlayFab.\n\n` +
        `**Reason:** ${reason}\n` +
        (hours > 0 ? `**Duration:** ${hours} hour${hours !== 1 ? 's' : ''}` : `**Duration:** ⚠️ PERMANENT`) + `\n` +
        `**Banned by:** ${interaction.user.username}`
      ).setColor(0xFF4500)],
    });
  },
};
