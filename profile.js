const { SlashCommandBuilder } = require('discord.js');
const { getLink } = require('./db');
const { getPlayerProfile, getPlayerStatistics } = require('./playfab');
const { profileEmbed, errorEmbed } = require('./embeds');
const { hasPermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View a PlayFab profile')
    .addUserOption(o =>
      o.setName('user').setDescription('View another player (mod/admin only)').setRequired(false)
    )
    .addStringOption(o =>
      o.setName('playfab_id').setDescription('Look up by PlayFab ID (mod/admin only)').setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');
    const viewingOther = directId || (targetUser && targetUser.id !== interaction.user.id);

    if (viewingOther && !hasPermission(interaction, 'MOD')) {
      return interaction.reply({ embeds: [errorEmbed("you need the **moderator** or **admin** role to view other players' profiles")], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    let playfabId;
    if (directId) {
      playfabId = directId.trim().toUpperCase();
    } else {
      const who  = targetUser || interaction.user;
      const link = getLink(who.id);
      if (!link) {
        return interaction.editReply({ embeds: [errorEmbed(
          targetUser
            ? `**${targetUser.username}** hasn't linked their account`
            : "you haven't linked your account yet — run **/link** to get started"
        )] });
      }
      playfabId = link.playfabId;
    }

    const [profRes, statsRes] = await Promise.allSettled([
      getPlayerProfile(playfabId),
      getPlayerStatistics(playfabId),
    ]);

    if (profRes.status === 'rejected') {
      return interaction.editReply({ embeds: [errorEmbed(`couldn't load profile for \`${playfabId}\`\n${profRes.reason.message}`)] });
    }

    return interaction.editReply({ embeds: [profileEmbed(
      playfabId,
      profRes.value,
      statsRes.status === 'fulfilled' ? (statsRes.value?.Statistics ?? []) : [],
    )] });
  },
};
