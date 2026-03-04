const { SlashCommandBuilder }                    = require('discord.js');
const { getLink }                                = require('./db');
const { grantItems, addVirtualCurrency }         = require('./playfab');
const { successEmbed, errorEmbed }               = require('./embeds');
const { requirePermission }                      = require('./permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('grant')
    .setDescription('Grant items or currency to a player [ADMIN]')
    .addSubcommand(s =>
      s.setName('item')
        .setDescription('Grant a catalog item or cosmetic')
        .addStringOption(o => o.setName('item_id').setDescription('PlayFab Item ID').setRequired(true))
        .addUserOption(o => o.setName('user').setDescription('Target Discord user').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or target by PlayFab ID').setRequired(false))
        .addStringOption(o => o.setName('catalog').setDescription('Catalog version (default: main)').setRequired(false))
    )
    .addSubcommand(s =>
      s.setName('currency')
        .setDescription('Grant virtual currency')
        .addStringOption(o => o.setName('code').setDescription('Currency code, e.g. GD').setRequired(true).setMinLength(2).setMaxLength(2))
        .addIntegerOption(o => o.setName('amount').setDescription('Amount to grant').setRequired(true).setMinValue(1).setMaxValue(1000000))
        .addUserOption(o => o.setName('user').setDescription('Target Discord user').setRequired(false))
        .addStringOption(o => o.setName('playfab_id').setDescription('Or target by PlayFab ID').setRequired(false))
    ),

  async execute(interaction) {
    requirePermission(interaction, 'ADMIN');
    await interaction.deferReply();

    const sub        = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const directId   = interaction.options.getString('playfab_id');
    let playfabId, targetLabel;

    if (directId) {
      playfabId    = directId.trim().toUpperCase();
      targetLabel  = `\`${playfabId}\``;
    } else if (targetUser) {
      const link = getLink(targetUser.id);
      if (!link) {
        return interaction.editReply({
          embeds: [errorEmbed(`${targetUser.username} hasn't linked their PlayFab account. They need to use **/link** first, or provide a PlayFab ID directly.`)],
        });
      }
      playfabId   = link.playfabId;
      targetLabel = `${targetUser.username} (\`${playfabId}\`)`;
    } else {
      return interaction.editReply({ embeds: [errorEmbed('Provide a **Discord user** or a **PlayFab ID**.')] });
    }

    if (sub === 'item') {
      const itemId  = interaction.options.getString('item_id').trim();
      const catalog = interaction.options.getString('catalog') || process.env.PLAYFAB_CATALOG || 'main';
      let result;
      try {
        result = await grantItems(playfabId, [itemId], catalog);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Grant failed: ${err.message}`)] });
      }
      const granted = result?.ItemGrantResults?.[0];
      return interaction.editReply({
        embeds: [successEmbed(
          'Item Granted',
          `Granted item to ${targetLabel}.\n\n` +
          `**Item ID:** \`${itemId}\`\n` +
          `**Catalog:** ${catalog}\n` +
          `**Instance ID:** \`${granted?.ItemInstanceId || 'N/A'}\`\n\n` +
          `**Granted by:** ${interaction.user.username}`
        )],
      });
    }

    if (sub === 'currency') {
      const code   = interaction.options.getString('code').toUpperCase();
      const amount = interaction.options.getInteger('amount');
      let result;
      try {
        result = await addVirtualCurrency(playfabId, code, amount);
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Currency grant failed: ${err.message}`)] });
      }
      return interaction.editReply({
        embeds: [successEmbed(
          'Currency Granted',
          `Granted currency to ${targetLabel}.\n\n` +
          `**Currency:** ${code}\n` +
          `**Amount Added:** +${amount.toLocaleString()}\n` +
          `**New Balance:** ${result?.Balance?.toLocaleString() ?? 'check in-game'}\n\n` +
          `**Granted by:** ${interaction.user.username}`
        )],
      });
    }
  },
};
