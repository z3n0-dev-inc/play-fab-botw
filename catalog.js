/**
 * catalog.js — /catalog command
 *
 * Lists all items in ZTD_Cosmetics_v1 so admins know what IDs to use with /grant.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCatalogItems } = require('./playfab');
const { requirePermission } = require('./permissions');

const CATALOG_VERSION = 'ZTD_Cosmetics_v1';

const CLASS_ICONS = {
  OwnerCharacter : '👑',
  OwnerTool      : '👑',
  ModeratorTool  : '🛡',
  Badge          : '🏅',
  ProfileFrame   : '🖼',
  Pet            : '🐾',
  Effect         : '✨',
  towers         : '🗼',
};

function parseCustomData(raw) {
  if (!raw) return {};
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return {}; }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catalog')
    .setDescription('View all items in the ZTD cosmetics catalog (use IDs with /grant)'),

  async execute(interaction) {
    requirePermission(interaction, 'MOD');
    await interaction.deferReply({ ephemeral: true });

    let items;
    try {
      const result = await getCatalogItems(CATALOG_VERSION);
      items = result.Catalog || [];
    } catch (err) {
      return interaction.editReply({ embeds: [{
        color: 0xED4245,
        title: '❌  Catalog Error',
        description: `Could not fetch catalog.\n**Error:** ${err.message}`,
      }]});
    }

    if (!items.length) {
      return interaction.editReply({ embeds: [{
        color: 0xFEE75C,
        title: '⚠️  Empty Catalog',
        description: `No items found in **${CATALOG_VERSION}**.`,
      }]});
    }

    // Group by class
    const groups = {};
    for (const item of items) {
      const cls = item.ItemClass || 'Other';
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(item);
    }

    const embed = new EmbedBuilder()
      .setColor(0xF5B215)
      .setTitle(`📦  ZTD Cosmetics Catalog`)
      .setDescription(`**${items.length} items** in \`${CATALOG_VERSION}\`\nUse item IDs with \`/grant item:<id>\``)
      .setTimestamp()
      .setFooter({ text: `Catalog: ${CATALOG_VERSION}` });

    for (const [cls, clsItems] of Object.entries(groups)) {
      const icon = CLASS_ICONS[cls] || '📦';
      const lines = clsItems.map(item => {
        const custom = parseCustomData(item.CustomData);
        const itemIcon = custom.icon || '';
        return `${itemIcon} **${item.DisplayName}**\n\`${item.ItemId}\``;
      });
      embed.addFields({
        name  : `${icon}  ${cls}`,
        value : lines.join('\n\n'),
        inline: false,
      });
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
