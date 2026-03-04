const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cosmetics')
    .setDescription('View all available cosmetics in Zombie Tower Defence'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🎨  ZTD Cosmetics Catalog')
      .setDescription('All cosmetics available in **Zombie Tower Defence**.\nAdmins can grant these using `/grant cosmetic`.')
      .addFields(
        {
          name: '👑 Owner Exclusives',
          value: [
            '🦇 **SHADOW COMMANDER** — Owner character. Grants the Shadow Commander tower.',
            '🌟 **NEON WARDEN** — Owner character. Grants the Neon Warden tower.',
            '🕳️ **VOID HUNTER** — Owner character. Grants the Void Hunter tower.',
            '👑 **OWNER PANEL** — Unlocks the in-game Owner control panel.',
            '🏰 **OWNER TOWERS** — Bundle of all 3 owner characters.',
          ].join('\n'),
          inline: false,
        },
        {
          name: '🏅 Badges',
          value: [
            '🥇 **GOLD SURVIVOR BADGE** *(Rare)* — Survive wave 15 on any map.',
            '🎖️ **VETERAN BADGE** *(Legendary)* — Beat all 5 maps.',
          ].join('\n'),
          inline: false,
        },
        {
          name: '🖼️ Profile Frames',
          value: [
            '💀 **SKULL FRAME** *(Uncommon)* — Skull-themed profile border.',
            '🔥 **FIRE FRAME** *(Rare)* — Flames around your profile.',
          ].join('\n'),
          inline: false,
        },
        {
          name: '🐾 Pets',
          value: '🧟 **ZOMBIE PET** *(Rare)* — A tiny zombie follows your cursor in-game.',
          inline: false,
        },
        {
          name: '✨ Effects',
          value: [
            '🩸 **BLOOD TRAIL** *(Uncommon)* — Blood splatter effects on towers.',
            '✨ **NEON TRAIL** *(Rare)* — Neon light effects on all projectiles.',
          ].join('\n'),
          inline: false,
        },
      )
      .setFooter({ text: 'Admins: use /grant cosmetic to award these to players' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
