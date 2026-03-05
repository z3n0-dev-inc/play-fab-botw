/**
 * grant.js — /grant command
 *
 * Grant any item from the ZTD_Cosmetics_v1 catalog to a player.
 * Includes the mod_panel item — granting it gives that player the
 * Moderator Console button in-game.
 *
 * Usage (Admin only):
 *   /grant playfab_id:<ID> item:<item_id>
 *   /grant user:@Discord   item:<item_id>
 *
 * Item choices are fetched live from the PlayFab catalog so the list
 * always stays in sync with whatever you add there.
 */

const { SlashCommandBuilder } = require('discord.js');
const { getLink }             = require('./db');
const {
  grantItems,
  getUserInventory,
  revokeInventoryItem,
  getPlayerProfile,
  getCatalogItems,
} = require('./playfab');
const { requirePermission } = require('./permissions');

const CATALOG_VERSION = 'ZTD_Cosmetics_v1';

// Rarity color map for embed sidebar
const RARITY_COLORS = {
  owner:     0xFFD152,
  legendary: 0xFFD152,
  rare:      0x3DD6F5,
  uncommon:  0x50D880,
  common:    0x546A80,
};

function parseCustomData(raw) {
  if (!raw) return {};
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return {}; }
}

function rarityLabel(custom, itemClass) {
  if (custom.rarity) return custom.rarity.toUpperCase();
  if (itemClass === 'OwnerTool' || itemClass === 'ModeratorTool') return 'OWNER';
  if (itemClass === 'OwnerCharacter') return 'OWNER';
  return 'COSMETIC';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('grant')
    .setDescription('Grant a catalog cosmetic (or the Moderator Panel) to a player')
    .addStringOption(o =>
      o.setName('item')
        .setDescription('Item ID to grant — use /catalog to see all items')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('playfab_id')
        .setDescription('Target player\'s PlayFab ID')
        .setRequired(false)
    )
    .addUserOption(o =>
      o.setName('user')
        .setDescription('Target Discord user (must have linked their account with /link)')
        .setRequired(false)
    )
    .addBooleanOption(o =>
      o.setName('revoke')
        .setDescription('Revoke (remove) this item instead of granting it')
        .setRequired(false)
    ),

  async execute(interaction) {
    requirePermission(interaction, 'ADMIN');

    await interaction.deferReply({ ephemeral: true });

    const itemId      = interaction.options.getString('item').trim().toLowerCase();
    const directId    = interaction.options.getString('playfab_id');
    const targetUser  = interaction.options.getUser('user');
    const shouldRevoke = interaction.options.getBoolean('revoke') ?? false;

    // ── Resolve PlayFab ID ───────────────────────────────────────────
    let playfabId;
    if (directId) {
      playfabId = directId.trim().toUpperCase();
    } else if (targetUser) {
      const link = getLink(targetUser.id);
      if (!link) {
        return interaction.editReply({ embeds: [{
          color: 0xED4245,
          title: '❌  Not Linked',
          description: `**${targetUser.username}** hasn't linked their PlayFab account.\nAsk them to use **/link**, or provide a \`playfab_id\` directly.`,
        }]});
      }
      playfabId = link.playfabId;
    } else {
      return interaction.editReply({ embeds: [{
        color: 0xED4245,
        title: '❌  No Target',
        description: 'You must provide either a `playfab_id` or a `user`.',
      }]});
    }

    // ── Validate item exists in catalog ────────────────────────────
    let catalogItem = null;
    try {
      const catalog = await getCatalogItems(CATALOG_VERSION);
      const items   = catalog.Catalog || [];
      catalogItem   = items.find(i => i.ItemId.toLowerCase() === itemId);
    } catch (err) {
      return interaction.editReply({ embeds: [{
        color: 0xED4245,
        title: '❌  Catalog Error',
        description: `Could not fetch catalog from PlayFab.\n**Error:** ${err.message}`,
      }]});
    }

    if (!catalogItem) {
      return interaction.editReply({ embeds: [{
        color: 0xED4245,
        title: '❌  Item Not Found',
        description: `\`${itemId}\` does not exist in the **${CATALOG_VERSION}** catalog.\n\nUse **/catalog** to see all available items.`,
      }]});
    }

    const custom     = parseCustomData(catalogItem.CustomData);
    const icon       = custom.icon || '📦';
    const rarity     = rarityLabel(custom, catalogItem.ItemClass);
    const embedColor = RARITY_COLORS[rarity.toLowerCase()] || RARITY_COLORS.common;

    // ── Get player display name ──────────────────────────────────
    let resolvedName = playfabId;
    try {
      const prof = await getPlayerProfile(playfabId);
      resolvedName = prof?.PlayerProfile?.DisplayName || playfabId;
    } catch { /* non-fatal */ }

    // ── Grant or Revoke ──────────────────────────────────────────
    if (!shouldRevoke) {

      // Check for duplicate
      try {
        const inv      = await getUserInventory(playfabId);
        const existing = (inv.Inventory || []).find(i => i.ItemId.toLowerCase() === itemId);
        if (existing && !catalogItem.IsStackable) {
          return interaction.editReply({ embeds: [{
            color: 0xFEE75C,
            title: `⚠️  Already Owned`,
            description: `**${resolvedName}** already has **${icon} ${catalogItem.DisplayName}** in their inventory.`,
            fields: [{ name: 'Item ID', value: `\`${catalogItem.ItemId}\``, inline: true }],
          }]});
        }
      } catch { /* non-fatal — proceed with grant */ }

      // Grant
      try {
        await grantItems(playfabId, [catalogItem.ItemId], CATALOG_VERSION);

        const isModPanel   = catalogItem.ItemId === 'mod_panel';
        const isOwnerPanel = catalogItem.ItemId === 'owner_panel';

        const extraNote = isModPanel
          ? '\n\n🛡 **This player now has the Moderator Panel** — they\'ll see the MOD button in-game after their next login.'
          : isOwnerPanel
          ? '\n\n👑 **This player now has the Owner Panel** — full owner console access after next login.'
          : '';

        return interaction.editReply({ embeds: [{
          color: embedColor,
          title: `${icon}  Item Granted`,
          description: `**${icon} ${catalogItem.DisplayName}** → **${resolvedName}** (\`${playfabId}\`)${extraNote}`,
          fields: [
            { name: 'Item ID',    value: `\`${catalogItem.ItemId}\``,  inline: true  },
            { name: 'Class',      value: catalogItem.ItemClass,         inline: true  },
            { name: 'Rarity',     value: rarity,                        inline: true  },
            { name: 'Granted by', value: interaction.user.tag,          inline: false },
          ],
          footer: { text: `Catalog: ${CATALOG_VERSION}` },
          timestamp: new Date().toISOString(),
        }]});

      } catch (err) {
        return interaction.editReply({ embeds: [{
          color: 0xED4245,
          title: '❌  Grant Failed',
          description: `Could not grant **${catalogItem.DisplayName}** to **${resolvedName}**.\n\n**Error:** ${err.message}`,
        }]});
      }

    } else {

      // Revoke
      try {
        const inv      = await getUserInventory(playfabId);
        const existing = (inv.Inventory || []).find(i => i.ItemId.toLowerCase() === itemId);

        if (!existing) {
          return interaction.editReply({ embeds: [{
            color: 0xFEE75C,
            title: '⚠️  Not In Inventory',
            description: `**${resolvedName}** doesn't have **${icon} ${catalogItem.DisplayName}**.`,
          }]});
        }

        await revokeInventoryItem(playfabId, existing.ItemInstanceId);

        return interaction.editReply({ embeds: [{
          color: 0xED4245,
          title: `${icon}  Item Revoked`,
          description: `Removed **${icon} ${catalogItem.DisplayName}** from **${resolvedName}** (\`${playfabId}\`).`,
          fields: [
            { name: 'Item ID',   value: `\`${catalogItem.ItemId}\``, inline: true },
            { name: 'Revoked by', value: interaction.user.tag,        inline: true },
          ],
          footer: { text: `Catalog: ${CATALOG_VERSION}` },
          timestamp: new Date().toISOString(),
        }]});

      } catch (err) {
        return interaction.editReply({ embeds: [{
          color: 0xED4245,
          title: '❌  Revoke Failed',
          description: `Could not revoke **${catalogItem.DisplayName}** from **${resolvedName}**.\n\n**Error:** ${err.message}`,
        }]});
      }
    }
  },
};
