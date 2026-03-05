const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink } = require('./db');
const { banPlayer } = require('./playfab');
const { errorEmbed, C, FOOTER } = require('./embeds');
const { requirePermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a player on PlayFab [MOD]')
    .addSubcommand(s =>
      s.setName('user').setDescription('Ban a linked Discord user')
        .addUserOption(o => o.setName('target').setDescription('User to ban').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
        .addIntegerOption(o => o.setName('hours').setDescription('Hours — 0 or blank = permanent').setRequired(false).setMinValue(0))
    )
    .addSubcommand(s =>
      s.setName('id').setDescription('Ban by PlayFab ID directly')
        .addStringOption(o => o.setName('playfab_id').setDescription('PlayFab ID').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
        .addIntegerOption(o => o.setName('hours').setDescription('Hours — 0 or blank = permanent').setRequired(false).setMinValue(0))
    ),

  async execute(interaction) {
    requirePermission(interaction, 'MOD');
    await interaction.deferReply();

    const sub    = interaction.options.getSubcommand();
    const reason = interaction.options.getString('reason');
    const hours  = interaction.options.getInteger('hours') ?? 0;
    let playfabId, targetLabel;

    if (sub === 'user') {
      const target = interaction.options.getUser('target');
      if (target.id === interaction.user.id) {
        return interaction.editReply({ embeds: [errorEmbed("you can't ban yourself")] });
      }
      const link = getLink(target.id);
      if (!link) {
        return interaction.editReply({ embeds: [errorEmbed(`**${target.username}** hasn't linked their account\nuse \`/ban id\` with their PlayFab ID instead`)] });
      }
      playfabId   = link.playfabId;
      targetLabel = `${target.username} · \`${playfabId}\``;
    } else {
      playfabId   = interaction.options.getString('playfab_id').trim().toUpperCase();
      targetLabel = `\`${playfabId}\``;
    }

    try {
      await banPlayer(playfabId, hours || null, reason);
    } catch (e) {
      return interaction.editReply({ embeds: [errorEmbed(`ban failed: ${e.message}`)] });
    }

    const isPerm = !hours || hours === 0;
    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(C.banned)
        .setTitle('🔨  player banned')
        .setDescription(`**${targetLabel}**`)
        .addFields(
          { name: 'reason',   value: reason,                                              inline: false },
          { name: 'duration', value: isPerm ? '⚠️ permanent' : `${hours}h`,             inline: true  },
          { name: 'by',       value: interaction.user.tag,                               inline: true  },
        )
        .setFooter(FOOTER)
        .setTimestamp()],
    });
  },
};
