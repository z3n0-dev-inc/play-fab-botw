const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }           = require('./db');
const { getUserInventory, getUserData } = require('./playfab');
const { errorEmbed }        = require('./embeds');
const { requirePermission } = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription("View a player's ZTD inventory and coins")
    .addUserOption(o => o.setName('user').setDescription('Discord user (blank = yourself)').setRequired(false))
    .addStringOption(o => o.setName('playfab_id').setDescription('Or by PlayFab ID [MOD]').setRequired(false)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');

    if (directId) requirePermission(interaction, 'MOD');
    if (targetUser && targetUser.id !== interaction.user.id) requirePermission(interaction, 'MOD');

    await interaction.deferReply({ ephemeral: true });

    let playfabId, ownerName;
    if (directId) {
      playfabId = directId.trim().toUpperCase();
      ownerName = `\`${playfabId}\``;
    } else {
      const who  = targetUser || interaction.user;
      const link = getLink(who.id);
      if (!link) return interaction.editReply({ embeds: [errorEmbed(targetUser ? `${targetUser.username} hasn't linked their account.` : `You haven't linked yet — use **/link** first!`)] });
      playfabId = link.playfabId;
      ownerName = who.username;
    }

    const [invRes, dataRes] = await Promise.allSettled([
      getUserInventory(playfabId),
      getUserData(playfabId),
    ]);

    const items  = invRes.status  === 'fulfilled' ? (invRes.value?.Inventory ?? [])  : [];
    const data   = dataRes.status === 'fulfilled' ? dataRes.value?.Data              : null;
    const coins  = data?.Coins?.Value ? parseInt(data.Coins.Value) : 0;

    const embed = new EmbedBuilder()
      .setColor(0x00B4D8)
      .setTitle(`🎒  ${ownerName}'s Inventory`)
      .setFooter({ text: `PlayFab ID: ${playfabId}` })
      .setTimestamp();

    embed.addFields({ name: '💰 Coins (GD)', value: coins.toLocaleString(), inline: false });

    if (!items.length) {
      embed.addFields({ name: '🎨 Cosmetics', value: 'No items in inventory.', inline: false });
    } else {
      const lines = items.map(i => `• **${i.DisplayName || i.ItemId}** \`${i.ItemId}\``).join('\n');
      embed.addFields({ name: `🎨 Cosmetics (${items.length})`, value: lines, inline: false });
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
