const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCatalogItems } = require('./playfab');
const { requirePermission } = require('./permissions');
const { errorEmbed, C, FOOTER } = require('./embeds');

const CATALOG = 'ZTD_Cosmetics_v1';

const CLASS_ICONS = {
  OwnerCharacter: '👑', OwnerTool: '👑', ModeratorTool: '🛡',
  DevTool: '⚙️', Badge: '🏅', ProfileFrame: '🖼', Pet: '🐾', Effect: '✨', towers: '🗼',
};

function parseCustom(raw) {
  if (!raw) return {};
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return {}; }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catalog')
    .setDescription('List all item IDs (use with /grant)'),

  async execute(interaction) {
    requirePermission(interaction, 'MOD');
    await interaction.deferReply({ ephemeral: true });

    let items;
    try {
      const r = await getCatalogItems(CATALOG);
      items   = r.Catalog || [];
    } catch (e) {
      return interaction.editReply({ embeds: [errorEmbed(`couldn't load catalog: ${e.message}`)] });
    }

    if (!items.length) return interaction.editReply({ embeds: [errorEmbed(`catalog **${CATALOG}** is empty`)] });

    const groups = {};
    for (const item of items) {
      const cls = item.ItemClass || 'Other';
      (groups[cls] = groups[cls] || []).push(item);
    }

    const embed = new EmbedBuilder()
      .setColor(C.gold)
      .setTitle(`catalog · ${CATALOG}`)
      .setDescription(`**${items.length} items** — use IDs with \`/grant item:<id>\``)
      .setFooter(FOOTER)
      .setTimestamp();

    for (const [cls, list] of Object.entries(groups)) {
      const icon  = CLASS_ICONS[cls] || '📦';
      const lines = list.map(i => {
        const c = parseCustom(i.CustomData);
        return `${c.icon||''} **${i.DisplayName}** · \`${i.ItemId}\``;
      });
      embed.addFields({ name: `${icon} ${cls}`, value: lines.join('\n'), inline: false });
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
