const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard }     = require('./playfab');
const { getLinkByPlayfabId } = require('./db');
const { errorEmbed }         = require('./embeds');

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View a PlayFab stat leaderboard')
    .addStringOption(o => o.setName('stat').setDescription('Statistic name to rank by (e.g. Kills, Score, Level)').setRequired(true))
    .addIntegerOption(o => o.setName('count').setDescription('How many players to show (1–20, default 10)').setRequired(false).setMinValue(1).setMaxValue(20)),

  async execute(interaction) {
    await interaction.deferReply();

    const stat  = interaction.options.getString('stat');
    const count = interaction.options.getInteger('count') || 10;

    let data;
    try {
      data = await getLeaderboard(stat, count);
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed(`Couldn't fetch leaderboard for **${stat}**.\n*${err.message}*\n\nMake sure the stat name matches exactly (case-sensitive).`)],
      });
    }

    const entries = data?.Leaderboard ?? [];
    if (!entries.length) {
      return interaction.editReply({ embeds: [errorEmbed(`No data found for stat: **${stat}**`)] });
    }

    const rows = entries.map((e, i) => {
      const medal      = MEDALS[i] ?? `**${i + 1}.**`;
      const name       = e.DisplayName || `\`${e.PlayFabId}\``;
      const linked     = getLinkByPlayfabId(e.PlayFabId);
      const discordTag = linked ? ` (<@${linked.discordId}>)` : '';
      return `${medal} **${name}**${discordTag} — ${e.StatValue.toLocaleString()}`;
    });

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`🏆  Leaderboard — ${stat}`)
        .setDescription(rows.join('\n'))
        .setFooter({ text: `Top ${entries.length} players` })
        .setTimestamp()],
    });
  },
};
