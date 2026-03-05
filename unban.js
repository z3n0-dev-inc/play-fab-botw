const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink } = require('./db');
const { getUserBans, revokeBans } = require('./playfab');
const { errorEmbed, C, FOOTER } = require('./embeds');
const { requirePermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Remove a PlayFab ban [MOD]')
    .addSubcommand(s =>
      s.setName('user').setDescription('Unban a linked Discord user')
        .addUserOption(o => o.setName('target').setDescription('User to unban').setRequired(true))
    )
    .addSubcommand(s =>
      s.setName('id').setDescription('Unban by PlayFab ID')
        .addStringOption(o => o.setName('playfab_id').setDescription('PlayFab ID').setRequired(true))
    ),

  async execute(interaction) {
    requirePermission(interaction, 'MOD');
    await interaction.deferReply();

    const sub = interaction.options.getSubcommand();
    let playfabId, targetLabel;

    if (sub === 'user') {
      const target = interaction.options.getUser('target');
      const link   = getLink(target.id);
      if (!link) return interaction.editReply({ embeds: [errorEmbed(`**${target.username}** hasn't linked their account\nuse \`/unban id\` instead`)] });
      playfabId   = link.playfabId;
      targetLabel = `${target.username} · \`${playfabId}\``;
    } else {
      playfabId   = interaction.options.getString('playfab_id').trim().toUpperCase();
      targetLabel = `\`${playfabId}\``;
    }

    let bansData;
    try { bansData = await getUserBans(playfabId); }
    catch (e) { return interaction.editReply({ embeds: [errorEmbed(`couldn't fetch bans: ${e.message}`)] }); }

    const active = (bansData?.BanData ?? []).filter(b => b.Active);
    if (!active.length) return interaction.editReply({ embeds: [errorEmbed(`**${targetLabel}** has no active bans`)] });

    try { await revokeBans(active.map(b => b.BanId)); }
    catch (e) { return interaction.editReply({ embeds: [errorEmbed(`failed to revoke: ${e.message}`)] }); }

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(C.green)
        .setTitle('✓  ban removed')
        .setDescription(`**${targetLabel}**\n${active.length} ban(s) revoked`)
        .addFields({ name: 'by', value: interaction.user.tag, inline: true })
        .setFooter(FOOTER).setTimestamp()],
    });
  },
};
