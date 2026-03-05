const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('./playfab');
const { getLinkByPlayfabId } = require('./db');
const { errorEmbed, C, FOOTER } = require('./embeds');

const MEDALS = ['🥇','🥈','🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View a stat leaderboard')
    .addStringOption(o =>
      o.setName('stat').setDescription('Stat name — HighScore, BestWave, TotalKills').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('count').setDescription('Players to show (1–20, default 10)').setRequired(false).setMinValue(1).setMaxValue(20)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const stat  = interaction.options.getString('stat');
    const count = interaction.options.getInteger('count') || 10;

    let data;
    try { data = await getLeaderboard(stat, count); }
    catch (e) {
      return interaction.editReply({ embeds: [errorEmbed(
        `no leaderboard for **${stat}**\n*${e.message}*\n\nstat names are case-sensitive: \`HighScore\` · \`BestWave\` · \`TotalKills\``
      )] });
    }

    const entries = data?.Leaderboard ?? [];
    if (!entries.length) return interaction.editReply({ embeds: [errorEmbed(`no data for **${stat}** yet`)] });

    const rows = entries.map((e, i) => {
      const medal  = MEDALS[i] ?? `**${i+1}.**`;
      const name   = e.DisplayName || `\`${e.PlayFabId}\``;
      const linked = getLinkByPlayfabId(e.PlayFabId);
      const dc     = linked ? ` (<@${linked.discordId}>)` : '';
      return `${medal} **${name}**${dc} — ${e.StatValue.toLocaleString()}`;
    });

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(C.gold)
        .setTitle(`${stat}`)
        .setDescription(rows.join('\n'))
        .setFooter({ text: `top ${entries.length} · ZTD` })
        .setTimestamp()],
    });
  },
};
