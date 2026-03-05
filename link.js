const { SlashCommandBuilder } = require('discord.js');
const { getLink, linkAccount } = require('./db');
const { getPlayerProfile } = require('./playfab');
const { successEmbed, errorEmbed, infoEmbed } = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord to your PlayFab account')
    .addStringOption(o =>
      o.setName('playfab_id')
        .setDescription('Your PlayFab Player ID — hex code found in-game or at playfab.com/Players')
        .setRequired(true).setMinLength(10).setMaxLength(20)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const playfabId = interaction.options.getString('playfab_id').trim().toUpperCase();

    if (!/^[0-9A-F]{10,20}$/.test(playfabId)) {
      return interaction.editReply({ embeds: [errorEmbed(
        `\`${playfabId}\` doesn't look right.\n\nPlayFab IDs are hex codes like \`AB12CD34EF56\`.\nFind yours in-game under Settings, or at developer.playfab.com → Players.`
      )] });
    }

    const existing = getLink(discordId);
    if (existing) {
      return interaction.editReply({ embeds: [infoEmbed(
        'already linked',
        `your discord is linked to **${existing.displayName}** (\`${existing.playfabId}\`)\n\nrun **/unlink** first to switch accounts`
      )] });
    }

    let displayName = playfabId;
    try {
      const data = await getPlayerProfile(playfabId);
      displayName = data?.PlayerProfile?.DisplayName || playfabId;
    } catch (e) {
      return interaction.editReply({ embeds: [errorEmbed(
        `couldn't find a PlayFab account with ID \`${playfabId}\`\n\n*${e.message}*`
      )] });
    }

    linkAccount(discordId, playfabId, displayName);

    return interaction.editReply({ embeds: [successEmbed(
      'account linked',
      `**${displayName}** · \`${playfabId}\`\n\nyou can now use **/profile** and appear on **/leaderboard**`
    )] });
  },
};
