const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }               = require('./db');
const { grantCosmeticItem, grantCoins, unlockAllMaps, grantOwnerStatus } = require('./playfab');
const { successEmbed, errorEmbed } = require('./embeds');
const { requirePermission }        = require('./permissions');

// All valid cosmetic item IDs from ZTD_Cosmetics_v1
const COSMETICS = {
  // Characters (Owner)
  'cosmetic_shadow_commander': { name: 'SHADOW COMMANDER', icon: '🦇', rarity: 'Owner' },
  'cosmetic_neon_warden':      { name: 'NEON WARDEN',      icon: '🌟', rarity: 'Owner' },
  'cosmetic_void_hunter':      { name: 'VOID HUNTER',      icon: '🕳️', rarity: 'Owner' },
  // Badges
  'cosmetic_gold_badge':    { name: 'GOLD SURVIVOR BADGE', icon: '🥇', rarity: 'Rare' },
  'cosmetic_veteran_badge': { name: 'VETERAN BADGE',       icon: '🎖️', rarity: 'Legendary' },
  // Frames
  'cosmetic_skull_frame': { name: 'SKULL FRAME', icon: '💀', rarity: 'Uncommon' },
  'cosmetic_fire_frame':  { name: 'FIRE FRAME',  icon: '🔥', rarity: 'Rare' },
  // Pets
  'cosmetic_zombie_pet': { name: 'ZOMBIE PET', icon: '🧟', rarity: 'Rare' },
  // Effects
  'cosmetic_blood_trail': { name: 'BLOOD TRAIL', icon: '🩸', rarity: 'Uncommon' },
  'cosmetic_neon_trail':  { name: 'NEON TRAIL',  icon: '✨', rarity: 'Rare' },
  // Owner tools
  'owner_panel':  { name: 'OWNER PANEL',  icon: '👑', rarity: 'Owner' },
  'Owner_towers': { name: 'OWNER TOWERS', icon: '🏰', rarity: 'Owner' },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('grant')
    .setDescription('Grant items or currency to a player [ADMIN]')
    .addSubcommand(s =>
      s.setName('cosmetic')
        .setDescription('Grant a cosmetic item to a player')
        .addStringOption(o =>
          o.setName('item')
            .setDescription('Choose a cosmetic to grant')
            .setRequired(true)
            .addChoices(
              { name: '🦇 Shadow Commander (Owner Character)', value: 'cosmetic_shadow_commander' },
              { name: '🌟 Neon Warden (Owner Character)',      value: 'cosmetic_neon_warden' },
              { name: '🕳️ Void Hunter (Owner Character)',      value: 'cosmetic_void_hunter' },
              { name: '🥇 Gold Survivor Badge',               value: 'cosmetic_gold_badge' },
              { name: '🎖️ Veteran Badge',                     value: 'cosmetic_veteran_badge' },
              { name: '💀 Skull Frame',                       value: 'cosmetic_skull_frame' },
              { name: '🔥 Fire Frame',                        value: 'cosmetic_fire_frame' },
              { name: '🧟 Zombie Pet',                        value: 'cosmetic_zombie_pet' },
              { name: '🩸 Blood Trail Effect',                value: 'cosmetic_blood_trail' },
              { name: '✨ Neon Trail Effect',                 value: 'cosmetic_neon_trail' },
              { name: '👑 Owner Panel',                       value: 'owner_panel' },
              { name: '🏰 Owner Towers Bundle',               value: 'Owner_towers' },
            )
        )
        .addUserOption(o => o.setName('user').setDescription('Discord user to grant to').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or grant by PlayFab ID directly').setRequired(false))
    )
    .addSubcommand(s =>
      s.setName('coins')
        .setDescription('Grant in-game coins (GD) to a player')
        .addIntegerOption(o => o.setName('amount').setDescription('Amount of coins to add').setRequired(true).setMinValue(1).setMaxValue(999999))
        .addUserOption(o => o.setName('user').setDescription('Discord user to grant to').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or grant by PlayFab ID directly').setRequired(false))
    )
    .addSubcommand(s =>
      s.setName('maps')
        .setDescription('Unlock ALL maps for a player')
        .addUserOption(o => o.setName('user').setDescription('Discord user').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID').setRequired(false))
    )
    .addSubcommand(s =>
      s.setName('owner')
        .setDescription('Grant Owner status + panel to a player [ADMIN only]')
        .addUserOption(o => o.setName('user').setDescription('Discord user').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID').setRequired(false))
    ),

  async execute(interaction) {
    requirePermission(interaction, 'ADMIN');
    await interaction.deferReply();

    const sub        = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');

    // Resolve PlayFab ID
    let playfabId, targetLabel;
    if (directId) {
      playfabId   = directId.trim().toUpperCase();
      targetLabel = `\`${playfabId}\``;
    } else if (targetUser) {
      const link = getLink(targetUser.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(`${targetUser.username} hasn't linked their PlayFab account.\nThey need to use **/link** first, or provide a PlayFab ID directly.`)],
        });
      }
      playfabId   = link.playfabId;
      targetLabel = `**${targetUser.username}**`;
    } else {
      return interaction.editReply({ embeds: [errorEmbed('Provide a **Discord user** or a **PlayFab ID**.')] });
    }

    // ── Grant Cosmetic ─────────────────────────────────────────
    if (sub === 'cosmetic') {
      const itemId  = interaction.options.getString('item');
      const cosmetic = COSMETICS[itemId];

      let result;
      try {
        result = await grantCosmeticItem(playfabId, itemId);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Grant failed: ${err.message}`)] });
      }

      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle(`${cosmetic.icon}  Cosmetic Granted!`)
          .setDescription(`Successfully granted **${cosmetic.name}** to ${targetLabel}.\nThey'll see it next time they load the game.`)
          .addFields(
            { name: '🎁 Item',      value: cosmetic.name,      inline: true },
            { name: '⭐ Rarity',    value: cosmetic.rarity,    inline: true },
            { name: '🆔 Item ID',   value: `\`${itemId}\``,    inline: true },
            { name: '👤 Granted by', value: interaction.user.username, inline: true },
          )
          .setTimestamp()],
      });
    }

    // ── Grant Coins ────────────────────────────────────────────
    if (sub === 'coins') {
      const amount = interaction.options.getInteger('amount');

      let result;
      try {
        result = await grantCoins(playfabId, amount);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Coin grant failed: ${err.message}`)] });
      }

      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xF1C40F)
          .setTitle('💰  Coins Granted!')
          .setDescription(`Added **${amount.toLocaleString()} coins** to ${targetLabel}'s account.`)
          .addFields(
            { name: '💵 Previous Balance', value: result.previous.toLocaleString(), inline: true },
            { name: '➕ Added',            value: `+${amount.toLocaleString()}`,    inline: true },
            { name: '🏦 New Balance',      value: result.newTotal.toLocaleString(), inline: true },
            { name: '👤 Granted by', value: interaction.user.username, inline: true },
          )
          .setTimestamp()],
      });
    }

    // ── Unlock All Maps ────────────────────────────────────────
    if (sub === 'maps') {
      let maps;
      try {
        maps = await unlockAllMaps(playfabId);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Failed to unlock maps: ${err.message}`)] });
      }

      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0x9B59B6)
          .setTitle('🗺️  All Maps Unlocked!')
          .setDescription(`Unlocked **${maps.length} maps** and all perks for ${targetLabel}.\nThey'll see the changes next time they load the game.`)
          .addFields(
            { name: '🗺️ Maps Unlocked', value: maps.map(m => `\`${m}\``).join(', '), inline: false },
            { name: '👤 Granted by', value: interaction.user.username, inline: true },
          )
          .setTimestamp()],
      });
    }

    // ── Grant Owner ────────────────────────────────────────────
    if (sub === 'owner') {
      try {
        await grantOwnerStatus(playfabId);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Failed to grant owner status: ${err.message}`)] });
      }

      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('👑  Owner Status Granted!')
          .setDescription(`${targetLabel} is now an **Owner** in Zombie Tower Defence.\nThey'll have access to the Owner Panel in-game on next load.`)
          .addFields({ name: '👤 Granted by', value: interaction.user.username, inline: true })
          .setTimestamp()],
      });
    }
  },
};
