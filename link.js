const { SlashCommandBuilder }            = require('discord.js');
const { getLink, linkAccount }           = require('./db');
const { getPlayerProfile }               = require('./playfab');
const { successEmbed, errorEmbed, infoEmbed } = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your PlayFab account')
    .addStringOption(o =>
      o.setName('playfab_id')
        .setDescription('Your PlayFab Player ID — the hex code found in-game or on playfab.com')
        .setRequired(true)
        .setMinLength(10)
        .setMaxLength(20)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId = interaction.user.id;
    const playfabId = interaction.options.getString('playfab_id').trim().toUpperCase();

    // Basic format check — PlayFab IDs are hex strings
    if (!/^[0-9A-F]{10,20}$/.test(playfabId)) {
      return interaction.editReply({
        embeds: [errorEmbed(
          `\`${playfabId}\` doesn't look like a valid PlayFab ID.\n\n` +
          `PlayFab IDs are **hex codes** like \`AB12CD34EF56\`.\n` +
          `Find yours in-game in settings, or on [developer.playfab.com](https://developer.playfab.com) → Players.`
        )],
      });
    }

    // Already linked?
    const existing = getLink(discordId);
    if (existing) {
      return interaction.editReply({
        embeds: [infoEmbed(
          'Already Linked',
          `Your Discord is already linked to **${existing.displayName}** (\`${existing.playfabId}\`).\n\n` +
          `Use **/unlink** first if you want to switch accounts.`
        )],
      });
    }

    // Verify the PlayFab ID actually exists
    let displayName = playfabId;
    try {
      const data = await getPlayerProfile(playfabId);
      displayName = data?.PlayerProfile?.DisplayName || playfabId;
    } catch (err) {
      const isAuthErr = err.message.toLowerCase().includes('secret') || err.message.toLowerCase().includes('auth');
      if (isAuthErr) {
        return interaction.editReply({
          embeds: [errorEmbed(`The bot's PlayFab secret key may be wrong. Contact a server admin.`)],
        });
      }
      return interaction.editReply({
        embeds: [errorEmbed(
          `Couldn't find a PlayFab account with ID \`${playfabId}\`.\n\n` +
          `Make sure you're using your **PlayFab Player ID** (hex code), not your username.\n` +
          `PlayFab says: *${err.message}*`
        )],
      });
    }

    linkAccount(discordId, playfabId, displayName);

    return interaction.editReply({
      embeds: [successEmbed(
        'Account Linked!',
        `Your Discord is now linked to PlayFab!\n\n` +
        `**PlayFab ID:** \`${playfabId}\`\n` +
        `**Display Name:** ${displayName}\n\n` +
        `You can now use **/profile** and **/leaderboard**!`
      )],
    });
  },
};
