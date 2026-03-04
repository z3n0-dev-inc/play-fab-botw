const { SlashCommandBuilder }        = require('discord.js');
const { getLink }                    = require('./db');
const { getUserBans, revokeBans }    = require('./playfab');
const { successEmbed, errorEmbed }   = require('./embeds');
const { requirePermission }          = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Remove a PlayFab ban [MOD]')
    .addSubcommand(s =>
      s.setName('user')
        .setDescription('Unban a linked Discord user')
        .addUserOption(o => o.setName('target').setDescription('Discord user to unban').setRequired(true))
    )
    .addSubcommand(s =>
      s.setName('id')
        .setDescription('Unban by PlayFab ID directly')
        .addStringOption(o => o.setName('playfab_id').setDescription('PlayFab Player ID').setRequired(true))
    ),

  async execute(interaction) {
    requirePermission(interaction, 'MOD');
    await interaction.deferReply();

    const sub = interaction.options.getSubcommand();
    let playfabId, targetLabel;

    if (sub === 'user') {
      const target = interaction.options.getUser('target');
      const link   = getLink(target.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(`${target.username} hasn't linked their PlayFab account.\nUse \`/unban id\` with their PlayFab ID instead.`)],
        });
      }
      playfabId   = link.playfabId;
      targetLabel = `${target.username} (\`${playfabId}\`)`;
    } else {
      playfabId   = interaction.options.getString('playfab_id').trim().toUpperCase();
      targetLabel = `\`${playfabId}\``;
    }

    let bansData;
    try {
      bansData = await getUserBans(playfabId);
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Couldn't fetch bans: ${err.message}`)] });
    }

    const activeBans = (bansData?.BanData ?? []).filter(b => b.Active);
    if (!activeBans.length) {
      return interaction.editReply({ embeds: [errorEmbed(`${targetLabel} has no active bans on PlayFab.`)] });
    }

    try {
      await revokeBans(activeBans.map(b => b.BanId));
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Failed to revoke bans: ${err.message}`)] });
    }

    return interaction.editReply({
      embeds: [successEmbed(
        'Player Unbanned',
        `Removed ${activeBans.length} ban(s) for ${targetLabel}.\n\n` +
        `**Unbanned by:** ${interaction.user.username}`
      )],
    });
  },
};
