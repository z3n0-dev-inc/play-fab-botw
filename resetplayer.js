const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }        = require('./db');
const { resetPlayer }    = require('./playfab');
const { errorEmbed }     = require('./embeds');
const { requirePermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetplayer')
    .setDescription('Reset a player back to a fresh account [ADMIN]')
    .addUserOption(o => o.setName('user').setDescription('Discord user to reset').setRequired(false))
    .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID').setRequired(false)),

  async execute(interaction) {
    requirePermission(interaction, 'ADMIN');
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');
    let playfabId, targetLabel;

    if (directId) {
      playfabId   = directId.trim().toUpperCase();
      targetLabel = `\`${playfabId}\``;
    } else if (targetUser) {
      const link = getLink(targetUser.id);
      if (!link) return interaction.editReply({ embeds: [errorEmbed(`${targetUser.username} hasn't linked their account.`)] });
      playfabId   = link.playfabId;
      targetLabel = `**${targetUser.username}**`;
    } else {
      return interaction.editReply({ embeds: [errorEmbed('Provide a Discord user or PlayFab ID.')] });
    }

    try {
      await resetPlayer(playfabId);
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Reset failed: ${err.message}`)] });
    }

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('🔄  Player Reset')
        .setDescription(`${targetLabel}'s account has been wiped back to a fresh start.`)
        .addFields(
          { name: '💰 Coins',      value: '100',               inline: true },
          { name: '🌊 Best Wave',  value: '0',                 inline: true },
          { name: '🏰 Towers',     value: 'Gunner, Archer',    inline: true },
          { name: '🗺️ Maps',       value: 'Graveyard only',    inline: true },
          { name: '👤 Reset by',   value: interaction.user.username, inline: true },
        )
        .setTimestamp()],
    });
  },
};
