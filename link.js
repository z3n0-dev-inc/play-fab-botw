const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
} = require('discord.js');

const { getLink, linkAccount }                   = require('./db');
const { searchPlayersByDisplayName }             = require('./playfab');
const { successEmbed, errorEmbed, infoEmbed }    = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your in-game PlayFab account')
    .addStringOption(o =>
      o.setName('username')
        .setDescription('Your in-game display name')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const discordId   = interaction.user.id;
    const displayName = interaction.options.getString('username').trim();

    // Already linked?
    const existing = getLink(discordId);
    if (existing) {
      return interaction.editReply({
        embeds: [infoEmbed(
          'Already Linked',
          `Your Discord is already linked to **${existing.displayName}**.\n\n` +
          `Use **/unlink** first if you want to switch accounts.`
        )],
      });
    }

    // Search PlayFab for this display name
    let matches;
    try {
      matches = await searchPlayersByDisplayName(displayName);
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed(
          `Failed to search PlayFab: ${err.message}\n\n` +
          `Make sure your PlayFab secret key has Admin API access.`
        )],
      });
    }

    // No results
    if (!matches || matches.length === 0) {
      return interaction.editReply({
        embeds: [errorEmbed(
          `No player found with the name **${displayName}**.\n\n` +
          `Make sure you're typing your **exact in-game display name** — it's case-sensitive.\n` +
          `If you've never set a display name in the game, try your PlayFab username instead.`
        )],
      });
    }

    // Exactly one match — link immediately
    if (matches.length === 1) {
      const match = matches[0];
      linkAccount(discordId, match.playfabId, match.displayName);
      return interaction.editReply({
        embeds: [successEmbed(
          'Account Linked!',
          `Your Discord is now linked to your in-game account!\n\n` +
          `**Name:** ${match.displayName}\n` +
          `**PlayFab ID:** \`${match.playfabId}\`\n\n` +
          `You can now use **/profile**, **/inventory**, **/stats** and more!`
        )],
      });
    }

    // Multiple matches — show a dropdown menu
    // Cap at 25 (Discord select menu limit)
    const shown = matches.slice(0, 25);

    const options = shown.map((m, i) => {
      const lastSeen = m.lastLogin
        ? `Last seen: ${new Date(m.lastLogin).toLocaleDateString()}`
        : 'Never logged in';
      const created = m.created
        ? `Joined: ${new Date(m.created).toLocaleDateString()}`
        : '';

      return {
        label: m.displayName.slice(0, 100),
        description: `ID: ${m.playfabId}  •  ${lastSeen}`.slice(0, 100),
        value: m.playfabId,
      };
    });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('link_select')
        .setPlaceholder('Select your account from the list...')
        .addOptions(options)
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🔍  Multiple accounts found for "${displayName}"`)
      .setDescription(
        `**${matches.length} account${matches.length > 1 ? 's' : ''} found** with that name.\n\n` +
        `Each entry below shows the **PlayFab ID** under the name so you can identify yours.\n` +
        `Select your account from the dropdown — your PlayFab ID is shown in the description of each option.\n\n` +
        `> 💡 You can find your PlayFab ID in-game in your profile or settings screen.`
      )
      .addFields(
        shown.map((m, i) => ({
          name: `${i + 1}. ${m.displayName}`,
          value: `PlayFab ID: \`${m.playfabId}\`${m.lastLogin ? `\nLast seen: ${new Date(m.lastLogin).toLocaleDateString()}` : ''}\n${m.created ? `Joined: ${new Date(m.created).toLocaleDateString()}` : ''}`,
          inline: true,
        }))
      )
      .setFooter({ text: 'This menu expires in 60 seconds' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [row] });

    // Wait for the player to pick from the dropdown
    let selection;
    try {
      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: i => i.customId === 'link_select' && i.user.id === discordId,
        time: 60_000,
        max: 1,
      });

      selection = await new Promise((resolve, reject) => {
        collector.on('collect', i => resolve(i));
        collector.on('end', collected => {
          if (collected.size === 0) reject(new Error('timeout'));
        });
      });
    } catch {
      return interaction.editReply({
        embeds: [errorEmbed(`Menu expired — run **/link ${displayName}** again to try again.`)],
        components: [],
      });
    }

    const chosenId = selection.values[0];
    const chosen   = shown.find(m => m.playfabId === chosenId);

    await selection.deferUpdate();

    linkAccount(discordId, chosen.playfabId, chosen.displayName);

    return interaction.editReply({
      embeds: [successEmbed(
        'Account Linked!',
        `Your Discord is now linked to your in-game account!\n\n` +
        `**Name:** ${chosen.displayName}\n` +
        `**PlayFab ID:** \`${chosen.playfabId}\`\n\n` +
        `You can now use **/profile**, **/inventory**, **/stats** and more!`
      )],
      components: [],
    });
  },
};
