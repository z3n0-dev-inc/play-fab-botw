const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLink }            = require('./db');
const { getUserInventory }   = require('./playfab');
const { errorEmbed }         = require('./embeds');
const { requirePermission }  = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription("View a player's PlayFab inventory and currency")
    .addUserOption(o => o.setName('user').setDescription('Discord user (blank = yourself)').setRequired(false))
    .addStringOption(o => o.setName('playfab_id').setDescription('Or look up by PlayFab ID [MOD only]').setRequired(false)),

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
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(targetUser ? `${targetUser.username} hasn't linked their PlayFab account.` : `You haven't linked your account yet. Use **/link** first!`)],
        });
      }
      playfabId = link.playfabId;
      ownerName = who.username;
    }

    let data;
    try {
      data = await getUserInventory(playfabId);
    } catch (err) {
      return interaction.editReply({ embeds: [errorEmbed(`Failed to fetch inventory: ${err.message}`)] });
    }

    const items = data?.Inventory        ?? [];
    const vc    = data?.VirtualCurrency  ?? {};

    const embed = new EmbedBuilder()
      .setColor(0x00B4D8)
      .setTitle(`🎒  ${ownerName}'s Inventory`)
      .setFooter({ text: `PlayFab ID: ${playfabId}` })
      .setTimestamp();

    embed.addFields({
      name: '💰 Virtual Currency',
      value: Object.keys(vc).length
        ? Object.entries(vc).map(([k, v]) => `**${k}:** ${v.toLocaleString()}`).join('\n')
        : 'None',
      inline: false,
    });

    if (!items.length) {
      embed.addFields({ name: '📦 Items', value: 'Inventory is empty.', inline: false });
    } else {
      const shown = items.slice(0, 30);
      for (let i = 0; i < shown.length; i += 10) {
        const chunk = shown.slice(i, i + 10)
          .map(item => `• **${item.DisplayName || item.ItemId}**${item.RemainingUses != null ? ` (×${item.RemainingUses})` : ''}\n  \`${item.ItemInstanceId}\``)
          .join('\n');
        embed.addFields({ name: i === 0 ? `📦 Items (${items.length} total)` : '\u200B', value: chunk, inline: false });
      }
      if (items.length > 30) embed.addFields({ name: '\u200B', value: `*…and ${items.length - 30} more items*`, inline: false });
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
