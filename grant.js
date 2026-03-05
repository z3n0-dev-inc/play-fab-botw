/**
 * grant.js — /grant
 *
 * Grants or revokes any item from ZTD_Cosmetics_v1.
 * The 'item' option uses Discord autocomplete — all catalog items
 * (including owner_panel, mod_panel, dev_panel) show up as you type.
 *
 * /grant item:<id> playfab_id:<id>        — grant by PlayFab ID
 * /grant item:<id> user:@Discord          — grant by Discord mention
 * /grant item:<id> playfab_id:<id> revoke:true  — remove item
 */

const { SlashCommandBuilder } = require('discord.js');
const { getLink } = require('./db');
const {
  grantItems,
  getUserInventory,
  revokeInventoryItem,
  getPlayerProfile,
  getCatalogItems,
} = require('./playfab');
const { requirePermission } = require('./permissions');
const { errorEmbed, warnEmbed, grantEmbed, revokeEmbed } = require('./embeds');

const CATALOG = 'ZTD_Cosmetics_v1';

// Cache catalog so autocomplete doesn't hammer PlayFab
let _catalogCache   = null;
let _catalogCacheAt = 0;
const CACHE_TTL     = 5 * 60 * 1000; // 5 min

async function getCatalogCached() {
  if (_catalogCache && (Date.now() - _catalogCacheAt) < CACHE_TTL) return _catalogCache;
  const r   = await getCatalogItems(CATALOG);
  _catalogCache   = r.Catalog || [];
  _catalogCacheAt = Date.now();
  return _catalogCache;
}

function parseCustom(raw) {
  if (!raw) return {};
  try { return typeof raw === 'string' ? JSON.parse(raw) : raw; }
  catch { return {}; }
}

function rarityOf(custom, itemClass) {
  if (custom.rarity) return custom.rarity;
  if (['OwnerTool','OwnerCharacter'].includes(itemClass)) return 'owner';
  if (itemClass === 'ModeratorTool') return 'owner';
  if (itemClass === 'DevTool') return 'dev';
  return 'common';
}

// Notes shown when granting special panel items
const PANEL_NOTES = {
  owner_panel: '👑 player now has the **owner panel** — full console access after next login',
  mod_panel:   '🛡 player is now a **moderator** — MOD button appears after next login',
  dev_panel:   '⚙️ player now has the **dev panel** — chaos tools available after next login',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('grant')
    .setDescription('Grant or revoke any catalog item (cosmetics, panels, badges, etc.)')
    .addStringOption(o =>
      o.setName('item')
        .setDescription('Item to grant — type to search, all items show automatically')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(o =>
      o.setName('playfab_id')
        .setDescription("Target player's PlayFab ID")
        .setRequired(false)
    )
    .addUserOption(o =>
      o.setName('user')
        .setDescription('Target Discord user (must have linked with /link)')
        .setRequired(false)
    )
    .addBooleanOption(o =>
      o.setName('revoke')
        .setDescription('Remove this item instead of granting it')
        .setRequired(false)
    ),

  // ── Autocomplete handler ──────────────────────────────────────
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();
    let items = [];
    try { items = await getCatalogCached(); } catch { return; }

    const choices = items
      .filter(i =>
        i.ItemId.toLowerCase().includes(focused) ||
        i.DisplayName.toLowerCase().includes(focused)
      )
      .slice(0, 25) // Discord max
      .map(i => {
        const c    = parseCustom(i.CustomData);
        const icon = c.icon || '📦';
        return { name: `${icon} ${i.DisplayName}  ·  ${i.ItemId}`, value: i.ItemId };
      });

    await interaction.respond(choices);
  },

  // ── Execute ───────────────────────────────────────────────────
  async execute(interaction) {
    requirePermission(interaction, 'ADMIN');
    await interaction.deferReply({ ephemeral: true });

    const rawItem    = interaction.options.getString('item').trim().toLowerCase();
    const directId   = interaction.options.getString('playfab_id');
    const targetUser = interaction.options.getUser('user');
    const doRevoke   = interaction.options.getBoolean('revoke') ?? false;

    // ── Resolve target ──────────────────────────────────────────
    let playfabId;
    if (directId) {
      playfabId = directId.trim().toUpperCase();
    } else if (targetUser) {
      const link = getLink(targetUser.id);
      if (!link) {
        return interaction.editReply({ embeds: [errorEmbed(
          `**${targetUser.username}** hasn't linked their account yet — ask them to run **/link** or provide a \`playfab_id\` directly`
        )] });
      }
      playfabId = link.playfabId;
    } else {
      return interaction.editReply({ embeds: [errorEmbed('you need to provide a `playfab_id` or mention a `user`')] });
    }

    // ── Validate item ────────────────────────────────────────────
    let catalogItem;
    try {
      const all  = await getCatalogCached();
      catalogItem = all.find(i => i.ItemId.toLowerCase() === rawItem);
      if (!catalogItem) {
        const ids = all.map(i => `\`${i.ItemId}\``).join(', ');
        return interaction.editReply({ embeds: [errorEmbed(
          `no item \`${rawItem}\` exists in **${CATALOG}**\n\nrun \`/catalog\` to see all items\nvalid IDs: ${ids}`
        )] });
      }
    } catch (e) {
      return interaction.editReply({ embeds: [errorEmbed(`couldn't load catalog from PlayFab: ${e.message}`)] });
    }

    const custom    = parseCustom(catalogItem.CustomData);
    const icon      = custom.icon || '📦';
    const rarity    = rarityOf(custom, catalogItem.ItemClass);
    const extraNote = PANEL_NOTES[catalogItem.ItemId] || null;

    // ── Get player display name ──────────────────────────────────
    let targetName = playfabId;
    try {
      const prof = await getPlayerProfile(playfabId);
      targetName = prof?.PlayerProfile?.DisplayName || playfabId;
    } catch { /* non-fatal */ }

    // ── GRANT ─────────────────────────────────────────────────────
    if (!doRevoke) {
      // Dupe check
      try {
        const inv = await getUserInventory(playfabId);
        const dupe = (inv.Inventory || []).find(i => i.ItemId.toLowerCase() === rawItem);
        if (dupe && !catalogItem.IsStackable) {
          return interaction.editReply({ embeds: [warnEmbed(
            'already owned',
            `**${targetName}** already has **${icon} ${catalogItem.DisplayName}**`
          )] });
        }
      } catch { /* non-fatal */ }

      try {
        await grantItems(playfabId, [catalogItem.ItemId], CATALOG);
        return interaction.editReply({ embeds: [grantEmbed({
          icon,
          displayName:   catalogItem.DisplayName,
          itemId:        catalogItem.ItemId,
          itemClass:     catalogItem.ItemClass,
          rarity,
          targetName,
          playfabId,
          grantedBy:     interaction.user.tag,
          catalogVersion: CATALOG,
          extraNote,
        })] });
      } catch (e) {
        return interaction.editReply({ embeds: [errorEmbed(`grant failed: ${e.message}`)] });
      }

    // ── REVOKE ────────────────────────────────────────────────────
    } else {
      try {
        const inv  = await getUserInventory(playfabId);
        const item = (inv.Inventory || []).find(i => i.ItemId.toLowerCase() === rawItem);
        if (!item) {
          return interaction.editReply({ embeds: [warnEmbed(
            'not in inventory',
            `**${targetName}** doesn't have **${icon} ${catalogItem.DisplayName}**`
          )] });
        }
        await revokeInventoryItem(playfabId, item.ItemInstanceId);
        return interaction.editReply({ embeds: [revokeEmbed({
          icon,
          displayName:    catalogItem.DisplayName,
          itemId:         catalogItem.ItemId,
          targetName,
          playfabId,
          revokedBy:      interaction.user.tag,
          catalogVersion: CATALOG,
        })] });
      } catch (e) {
        return interaction.editReply({ embeds: [errorEmbed(`revoke failed: ${e.message}`)] });
      }
    }
  },
};
