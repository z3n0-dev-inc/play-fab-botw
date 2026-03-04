const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard }     = require('./playfab');
const { getLinkByPlayfabId } = require('./db');
const { errorEmbed }         = require('./embeds');

const BOARDS = {
  wave:   { stat: 'BestWave',   label: 'Best Wave',   icon: '🌊' },
  kills:  { stat: 'TotalKills', label: 'Total Kills', icon: '💀' },
  score:  { stat: 'HighScore',  label: 'High Score',  icon: '🏆' },
};

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('View the ZTD leaderboard')
    .addStringOption(o =>
      o.setName('board')
        .setDescription('Which leaderboard to show')
        .setRequired(true)
        .addChoices(
          { name: '🌊 Best Wave',   value: 'wave'  },
          { name: '💀 Total Kills', value: 'kills' },
          { name: '🏆 High Score',  value: 'score' },
        )
    )
    .addIntegerOption(o =>
      o.setName('count').setDescription('How many players to show (default 10, max 20)').setRequired(false).setMinValue(1).setMaxValue(20)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const boardKey = interaction.options.getString('board');
    const count    = interaction.options.getInteger('count') || 10;
    const board    = BOARDS[boardKey];

    let data;
    try {
      data = await getLeaderboard(board.stat, count);
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed(`Couldn't load leaderboard.\n*${err.message}*\n\nMake sure the **${board.stat}** statistic exists in PlayFab.`)],
      });
    }

    const entries = data?.Leaderboard ?? [];
    if (!entries.length) {
      return interaction.editReply({ embeds: [errorEmbed(`No data found for **${board.label}** yet — play some games first!`)] });
    }

    const rows = entries.map((e, i) => {
      const medal      = MEDALS[i] ?? `**${i + 1}.**`;
      const name       = e.DisplayName || `Player ${e.PlayFabId.slice(0, 6)}`;
      const linked     = getLinkByPlayfabId(e.PlayFabId);
      const discordTag = linked ? ` (<@${linked.discordId}>)` : '';
      return `${medal} **${name}**${discordTag} — ${e.StatValue.toLocaleString()}`;
    });

    return interaction.editReply({
      embeds: [new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${board.icon}  ZTD Leaderboard — ${board.label}`)
        .setDescription(rows.join('\n'))
        .setFooter({ text: `Top ${entries.length} players • Zombie Tower Defence` })
        .setTimestamp()],
    });
  },
};
