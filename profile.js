const { SlashCommandBuilder }                                    = require('discord.js');
const { getLink }                                                = require('./db');
const { getPlayerProfile, getPlayerStatistics, getUserInventory } = require('./playfab');
const { profileEmbed, errorEmbed }                               = require('./embeds');
const { requirePermission }                                      = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View a PlayFab player profile')
    .addUserOption(o => o.setName('user').setDescription('Discord user to look up (blank = yourself)').setRequired(false))
    .addStringOption(o => o.setName('playfab_id').setDescription('Or look up directly by PlayFab ID [MOD only]').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');

    if (directId) requirePermission(interaction, 'MOD');
    if (targetUser && targetUser.id !== interaction.user.id) requirePermission(interaction, 'MOD');

    await interaction.deferReply({ ephemeral: !directId && !targetUser });

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
              : `You haven't linked your account yet — use **/link <playfab_id>** to get started!`
          )],
        });
      }
      playfabId = link.playfabId;
    }

    const [profileResult, statsResult, inventoryResult] = await Promise.allSettled([
      getPlayerProfile(playfabId),
      getPlayerStatistics(playfabId),
      getUserInventory(playfabId),
    ]);

    if (profileResult.status === 'rejected') {
      return interaction.editReply({
        embeds: [errorEmbed(`Couldn't fetch profile for \`${playfabId}\`.\n*${profileResult.reason.message}*`)],
      });
    }

    return interaction.editReply({
      embeds: [profileEmbed(
        playfabId,
        profileResult.value,
        statsResult.status === 'fulfilled'    ? (statsResult.value?.Statistics ?? [])    : [],
        inventoryResult.status === 'fulfilled' ? inventoryResult.value                    : null,
      )],
    });
  },
};
