const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildConfig, setGuildConfig, resetGuildConfig }       = require('./db');
const { successEmbed, errorEmbed }                               = require('./embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure PlayFab Bot for this server [Server Admin only]')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s.setName('view').setDescription('View current bot configuration'))
    .addSubcommand(s =>
      s.setName('set-admin-role')
        .setDescription('Add an Admin role (full access: ban, moderate players)')
        .addRoleOption(o => o.setName('role').setDescription('Role to make Admin').setRequired(true))
    )
    .addSubcommand(s =>
      s.setName('set-mod-role')
        .setDescription('Add a Mod role (can ban/unban and view any profile)')
        .addRoleOption(o => o.setName('role').setDescription('Role to make Mod').setRequired(true))
    )
    .addSubcommand(s =>
      s.setName('remove-admin-role')
        .setDescription('Remove Admin access from a role')
        .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
    )
    .addSubcommand(s =>
      s.setName('remove-mod-role')
        .setDescription('Remove Mod access from a role')
        .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true))
    )
    .addSubcommand(s =>
      s.setName('set-catalog')
        .setDescription('Set the default PlayFab catalog version')
        .addStringOption(o => o.setName('version').setDescription('Catalog version name').setRequired(true))
    )
    .addSubcommand(s => s.setName('reset').setDescription('Reset all bot config for this server')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ embeds: [errorEmbed('Only Discord server **Administrators** can change bot config.')], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const sub     = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const config  = getGuildConfig(guildId);

    if (sub === 'view') {
      const adminRoles = (config.adminRoles || []).map(id => `<@&${id}>`).join(', ') || '*None set*';
      const modRoles   = (config.modRoles   || []).map(id => `<@&${id}>`).join(', ') || '*None set*';
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('⚙️  PlayFab Bot Config')
          .addFields(
            { name: '🔐 Admin Roles',     value: adminRoles,                                          inline: false },
            { name: '🛡️ Mod Roles',       value: modRoles,                                            inline: false },
            { name: '📦 Default Catalog', value: config.catalog || process.env.PLAYFAB_CATALOG || 'main', inline: true },
          )
          .setFooter({ text: interaction.guild.name })
          .setTimestamp()],
      });
    }

    if (sub === 'set-admin-role') {
      const role = interaction.options.getRole('role');
      const curr = config.adminRoles || [];
      if (curr.includes(role.id)) return interaction.editReply({ embeds: [errorEmbed(`${role} is already an Admin role.`)] });
      setGuildConfig(guildId, { adminRoles: [...curr, role.id] });
      return interaction.editReply({ embeds: [successEmbed('Admin Role Added', `${role} now has **Admin** access.`)] });
    }

    if (sub === 'set-mod-role') {
      const role = interaction.options.getRole('role');
      const curr = config.modRoles || [];
      if (curr.includes(role.id)) return interaction.editReply({ embeds: [errorEmbed(`${role} is already a Mod role.`)] });
      setGuildConfig(guildId, { modRoles: [...curr, role.id] });
      return interaction.editReply({ embeds: [successEmbed('Mod Role Added', `${role} now has **Mod** access.`)] });
    }

    if (sub === 'remove-admin-role') {
      const role = interaction.options.getRole('role');
      setGuildConfig(guildId, { adminRoles: (config.adminRoles || []).filter(id => id !== role.id) });
      return interaction.editReply({ embeds: [successEmbed('Admin Role Removed', `${role} no longer has Admin access.`)] });
    }

    if (sub === 'remove-mod-role') {
      const role = interaction.options.getRole('role');
      setGuildConfig(guildId, { modRoles: (config.modRoles || []).filter(id => id !== role.id) });
      return interaction.editReply({ embeds: [successEmbed('Mod Role Removed', `${role} no longer has Mod access.`)] });
    }

    if (sub === 'set-catalog') {
      const version = interaction.options.getString('version');
      setGuildConfig(guildId, { catalog: version });
      return interaction.editReply({ embeds: [successEmbed('Catalog Set', `Default catalog is now **${version}**.`)] });
    }

    if (sub === 'reset') {
      resetGuildConfig(guildId);
      return interaction.editReply({ embeds: [successEmbed('Config Reset', 'All bot configuration cleared.')] });
    }
  },
};
