const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }          = require('./db');
const { getPlayerProfile, getUserData, getUserInventory } = require('./playfab');
const { errorEmbed }       = require('./embeds');
const { requirePermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your ZTD profile')
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

    const [profileRes, dataRes, inventoryRes] = await Promise.allSettled([
      getPlayerProfile(playfabId),
      getUserData(playfabId),
      getUserInventory(playfabId),
    ]);

    if (profileRes.status === 'rejected') {
      return interaction.editReply({ embeds: [errorEmbed(`Couldn't fetch profile: ${profileRes.reason.message}`)] });
    }

    const profile   = profileRes.value?.PlayerProfile;
    const data      = dataRes.status     === 'fulfilled' ? dataRes.value?.Data        : null;
    const inventory = inventoryRes.status === 'fulfilled' ? inventoryRes.value?.Inventory : [];

    const displayName  = profile?.DisplayName || ownerLabel;
    const lastLogin    = profile?.LastLogin ? `<t:${Math.floor(new Date(profile.LastLogin).getTime()/1000)}:R>` : 'Unknown';
    const bannedUntil  = profile?.BannedUntil ? new Date(profile.BannedUntil) : null;
    const isBanned     = bannedUntil && bannedUntil > new Date();
    const isOwner      = data?.IsOwner?.Value === 'true';
    const coins        = data?.Coins?.Value     ? parseInt(data.Coins.Value)    : 0;
    const bestWave     = data?.BestWave?.Value  ? parseInt(data.BestWave.Value) : 0;
    const totalKills   = data?.TotalKills?.Value? parseInt(data.TotalKills.Value): 0;
    const ownedTowers  = data?.OwnedTowers?.Value  ? JSON.parse(data.OwnedTowers.Value)  : ['gunner','archer'];
    const unlockedMaps = data?.UnlockedMaps?.Value ? JSON.parse(data.UnlockedMaps.Value) : ['graveyard'];
    const cosmetics    = (inventory || []).map(i => i.DisplayName || i.ItemId).filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(isOwner ? 0xFFD700 : isBanned ? 0xFF4500 : 0x00B4D8)
      .setTitle(`${isOwner ? '👑' : '🧟'} ${displayName}`)
      .setFooter({ text: `PlayFab ID: ${playfabId}` })
      .setTimestamp();

    embed.addFields(
      { name: '🕐 Last Seen', value: lastLogin, inline: true },
      { name: '⚡ Status', value: isOwner ? '👑 Owner' : isBanned ? `⛔ Banned` : '✅ Active', inline: true },
    );
    embed.addFields(
      { name: '💰 Coins',      value: coins.toLocaleString(),      inline: true },
      { name: '🌊 Best Wave',  value: String(bestWave),            inline: true },
      { name: '💀 Total Kills',value: totalKills.toLocaleString(), inline: true },
    );
    embed.addFields(
      { name: `🏰 Towers (${ownedTowers.length})`,     value: ownedTowers.join(', ')  || 'None', inline: false },
      { name: `🗺️ Maps (${unlockedMaps.length})`,      value: unlockedMaps.join(', ') || 'None', inline: false },
      { name: `🎨 Cosmetics (${cosmetics.length})`,    value: cosmetics.length ? cosmetics.join(', ') : 'None', inline: false },
    );

    return interaction.editReply({ embeds: [embed] });
  },
};
