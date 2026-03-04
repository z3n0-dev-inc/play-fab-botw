const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }       = require('./db');
const { setCoins }      = require('./playfab');
const { errorEmbed }    = require('./embeds');
const { requirePermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setcoins')
    .setDescription('Set a player\'s coin balance to an exact amount [ADMIN]')
    .addIntegerOption(o => o.setName('amount').setDescription('Exact coin balance to set').setRequired(true).setMinValue(0).setMaxValue(9999999))
    .addUserOption(o => o.setName('user').setDescription('Discord user').setRequired(false))
    .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID').setRequired(false)),

  async execute(interaction) {
    requirePermission(interaction, 'ADMIN');
    await interaction.deferReply();

    const amount     = interaction.options.getInteger('amount');
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
      await setCoins(playfabId, amount);
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
    }

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle('💰  Coins Set')
        .setDescription(`${targetLabel}'s coin balance has been set to **${amount.toLocaleString()} coins**.`)
        .addFields({ name: '👤 Set by', value: interaction.user.username, inline: true })
        .setTimestamp()],
    });
  },
};
