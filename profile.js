const { SlashCommandBuilder }                    = require('discord.js');
const { getLink }                                = require('./db');
const { getPlayerProfile, getPlayerStatistics }  = require('./playfab');
const { profileEmbed, errorEmbed }               = require('./embeds');
const { hasPermission }                          = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View a PlayFab player profile')
    .addUserOption(o =>
      o.setName('user')
        .setDescription('View another player\'s profile (Moderator / Admin only)')
        .setRequired(false)
    )
    .addStringOption(o =>
      o.setName('playfab_id')
        .setDescription('Look up directly by PlayFab ID (Moderator / Admin only)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');

    // Viewing someone else requires MOD or higher
    const viewingOther = directId || (targetUser && targetUser.id !== interaction.user.id);
    if (viewingOther && !hasPermission(interaction, 'MOD')) {
      return interaction.reply({
        embeds: [errorEmbed('You need the **Moderator** or **Admin** role to view other players\' profiles.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    let playfabId;

    if (directId) {
      playfabId = directId.trim().toUpperCase();
    } else {
      const who  = targetUser || interaction.user;
      const link = getLink(who.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(
            targetUser
              ? `${targetUser.username} hasn't linked their PlayFab account yet.`
              : `You haven't linked your account yet — use **/link** to get started.`
          )],
        });
      }
      playfabId = link.playfabId;
    }

    const [profileResult, statsResult] = await Promise.allSettled([
      getPlayerProfile(playfabId),
      getPlayerStatistics(playfabId),
    ]);

    if (profileResult.status === 'rejected') {
      return interaction.editReply({
        embeds: [errorEmbed(`Could not fetch profile for \`${playfabId}\`.\n${profileResult.reason.message}`)],
      });
    }

    return interaction.editReply({
      embeds: [profileEmbed(
        playfabId,
        profileResult.value,
        statsResult.status === 'fulfilled' ? (statsResult.value?.Statistics ?? []) : [],
      )],
    });
  },
};
