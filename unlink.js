const { SlashCommandBuilder }        = require('discord.js');
const { getLink, unlinkAccount }     = require('./db');
const { successEmbed, errorEmbed }   = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Unlink your Discord account from PlayFab'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const existing = getLink(interaction.user.id);
    if (!existing) {
      return interaction.editReply({
        embeds: [errorEmbed(`You don't have a linked PlayFab account. Use **/link** to link one.`)],
      });
    }

    unlinkAccount(interaction.user.id);

    return interaction.editReply({
      embeds: [successEmbed(
        'Account Unlinked',
        `Your Discord is no longer linked to **${existing.displayName}** (\`${existing.playfabId}\`).\n\n` +
        `Use **/link** anytime to re-link.`
      )],
    });
  },
};
