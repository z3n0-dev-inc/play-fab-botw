const { SlashCommandBuilder } = require('discord.js');
const { getLink, unlinkAccount } = require('./db');
const { successEmbed, errorEmbed } = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Unlink your Discord from PlayFab'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const existing = getLink(interaction.user.id);
    if (!existing) {
      return interaction.editReply({ embeds: [errorEmbed("you don't have a linked account — use **/link** to connect one")] });
    }
    unlinkAccount(interaction.user.id);
    return interaction.editReply({ embeds: [successEmbed(
      'unlinked',
      `your discord is no longer linked to **${existing.displayName}** (\`${existing.playfabId}\`)\n\nuse **/link** anytime to reconnect`
    )] });
  },
};
