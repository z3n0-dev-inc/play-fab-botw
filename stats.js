const { SlashCommandBuilder, EmbedBuilder }              = require('discord.js');
const { getLink }                                        = require('./db');
const { getPlayerStatistics, updatePlayerStatistic }     = require('./playfab');
const { successEmbed, errorEmbed }                       = require('./embeds');
const { requirePermission }                              = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View or set PlayFab player statistics')
    .addSubcommand(s =>
      s.setName('view')
        .setDescription("View a player's statistics")
        .addUserOption(o => o.setName('user').setDescription('Discord user (blank = yourself)').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID [MOD]').setRequired(false))
    )
    .addSubcommand(s =>
      s.setName('set')
        .setDescription('Set a statistic for a player [ADMIN]')
        .addStringOption(o => o.setName('stat').setDescription('Statistic name (must match exactly)').setRequired(true))
        .addIntegerOption(o => o.setName('value').setDescription('New value').setRequired(true))
        .addUserOption(o => o.setName('user').setDescription('Target Discord user').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or target by PlayFab ID').setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'set') requirePermission(interaction, 'ADMIN');

    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');

    if (directId) requirePermission(interaction, 'MOD');
    if (targetUser && targetUser.id !== interaction.user.id) requirePermission(interaction, 'MOD');

    await interaction.deferReply({ ephemeral: sub === 'view' });

    let playfabId, ownerLabel;
    if (directId) {
      playfabId  = directId.trim().toUpperCase();
      ownerLabel = `\`${playfabId}\``;
    } else {
      const who  = targetUser || interaction.user;
      const link = getLink(who.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(targetUser ? `${targetUser.username} hasn't linked their PlayFab account.` : `You haven't linked your account yet. Use **/link** first!`)],
        });
      }
      playfabId  = link.playfabId;
      ownerLabel = who.username;
    }

    if (sub === 'view') {
      let data;
      try { data = await getPlayerStatistics(playfabId); }
      catch (err) { return interaction.editReply({ embeds: [errorEmbed(`Failed to fetch stats: ${err.message}`)] }); }

      const stats = data?.Statistics ?? [];
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊  ${ownerLabel}'s Statistics`)
        .setFooter({ text: `PlayFab ID: ${playfabId}` })
        .setTimestamp()
        .setDescription(stats.length
          ? stats.map(s => `\`${s.StatisticName}\` → **${s.Value.toLocaleString()}**`).join('\n')
          : 'No statistics recorded yet.'
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'set') {
      const statName = interaction.options.getString('stat');
      const value    = interaction.options.getInteger('value');
      try { await updatePlayerStatistic(playfabId, statName, value); }
      catch (err) { return interaction.editReply({ embeds: [errorEmbed(`Failed to update stat: ${err.message}`)] }); }

      return interaction.editReply({
        embeds: [successEmbed(
          'Statistic Updated',
          `Updated stat for ${ownerLabel}.\n\n` +
          `**Stat:** \`${statName}\`\n` +
          `**New Value:** ${value.toLocaleString()}\n\n` +
          `**Updated by:** ${interaction.user.username}`
        )],
      });
    }
  },
};
