const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }          = require('./db');
const { getUserData, getUserInventory, getPlayerStatistics, getPlayerProfile } = require('./playfab');
const { errorEmbed }       = require('./embeds');
const { requirePermission } = require('./permissions');

const RARITY_COLORS = { owner: 0xFFD700, legendary: 0xE74C3C, rare: 0x3498DB, uncommon: 0x2ECC71 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playerinfo')
    .setDescription('View full ZTD player info — coins, towers, maps, cosmetics')
    .addUserOption(o => o.setName('user').setDescription('Discord user (blank = yourself)').setRequired(false))
    .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID [MOD]').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');

    if (directId) requirePermission(interaction, 'MOD');
    if (targetUser && targetUser.id !== interaction.user.id) requirePermission(interaction, 'MOD');

    await interaction.deferReply({ ephemeral: true });

    let playfabId, ownerLabel;
    if (directId) {
      playfabId  = directId.trim().toUpperCase();
      ownerLabel = `\`${playfabId}\``;
    } else {
      const who  = targetUser || interaction.user;
      const link = getLink(who.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(targetUser
            ? `${targetUser.username} hasn't linked their account.`
            : `You haven't linked yet — use **/link** first!`)],
        });
      }
      playfabId  = link.playfabId;
      ownerLabel = who.username;
    }

    const [profileRes, dataRes, inventoryRes, statsRes] = await Promise.allSettled([
      getPlayerProfile(playfabId),
      getUserData(playfabId),
      getUserInventory(playfabId),
      getPlayerStatistics(playfabId),
    ]);

    if (profileRes.status === 'rejected' && dataRes.status === 'rejected') {
      return interaction.editReply({ embeds: [errorEmbed(`Couldn't fetch player data: ${profileRes.reason.message}`)] });
    }

    const profile   = profileRes.status  === 'fulfilled' ? profileRes.value?.PlayerProfile  : null;
    const data      = dataRes.status     === 'fulfilled' ? dataRes.value?.Data               : null;
    const inventory = inventoryRes.status === 'fulfilled' ? inventoryRes.value?.Inventory    : [];
    const stats     = statsRes.status    === 'fulfilled' ? (statsRes.value?.Statistics ?? []) : [];

    const displayName = profile?.DisplayName || ownerLabel;
    const lastLogin   = profile?.LastLogin ? `<t:${Math.floor(new Date(profile.LastLogin).getTime()/1000)}:R>` : 'Unknown';
    const created     = profile?.Created    ? `<t:${Math.floor(new Date(profile.Created).getTime()/1000)}:D>`  : 'Unknown';
    const bannedUntil = profile?.BannedUntil ? new Date(profile.BannedUntil) : null;
    const isBanned    = bannedUntil && bannedUntil > new Date();

    // Parse UserData
    const coins       = data?.Coins?.Value        ? parseInt(data.Coins.Value)              : 0;
    const bestWave    = data?.BestWave?.Value      ? parseInt(data.BestWave.Value)           : 0;
    const totalKills  = data?.TotalKills?.Value    ? parseInt(data.TotalKills.Value)         : 0;
    const isOwner     = data?.IsOwner?.Value       === 'true';
    const ownedTowers = data?.OwnedTowers?.Value   ? JSON.parse(data.OwnedTowers.Value)     : ['gunner','archer'];
    const unlockedMaps = data?.UnlockedMaps?.Value ? JSON.parse(data.UnlockedMaps.Value)    : ['graveyard'];

    // Cosmetics from inventory
    const cosmeticNames = (inventory || []).map(i => i.DisplayName || i.ItemId).filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(isOwner ? 0xFFD700 : isBanned ? 0xFF4500 : 0x00B4D8)
      .setTitle(`${isOwner ? '👑' : '🧟'} ${displayName}`)
      .setFooter({ text: `PlayFab ID: ${playfabId}` })
      .setTimestamp();

    embed.addFields(
      { name: '📅 Joined',    value: created,   inline: true },
      { name: '🕐 Last Seen', value: lastLogin,  inline: true },
      { name: '⚡ Status',    value: isOwner ? '👑 Owner' : isBanned ? `⛔ Banned until <t:${Math.floor(bannedUntil.getTime()/1000)}:F>` : '✅ Active', inline: true },
    );

    embed.addFields(
      { name: '💰 Coins',      value: coins.toLocaleString(),      inline: true },
      { name: '🌊 Best Wave',  value: String(bestWave),            inline: true },
      { name: '💀 Total Kills',value: totalKills.toLocaleString(), inline: true },
    );

    embed.addFields(
      { name: `🏰 Towers (${ownedTowers.length})`,        value: ownedTowers.join(', ') || 'None',                             inline: false },
      { name: `🗺️ Maps (${unlockedMaps.length})`,         value: unlockedMaps.join(', ') || 'None',                            inline: false },
      { name: `🎨 Cosmetics (${cosmeticNames.length})`,   value: cosmeticNames.length ? cosmeticNames.join(', ') : 'None',    inline: false },
    );

    if (stats.length) {
      embed.addFields({
        name: '📊 Statistics',
        value: stats.map(s => `\`${s.StatisticName}\` → **${s.Value.toLocaleString()}**`).join('\n'),
        inline: false,
      });
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
