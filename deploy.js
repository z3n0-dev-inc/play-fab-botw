require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ DISCORD_TOKEN and CLIENT_ID must be set.');
  process.exit(1);
}

const commands = [];

const commandFiles = fs.readdirSync(__dirname).filter(f =>
  f.endsWith('.js') && !['index.js', 'deploy.js', 'playfab.js', 'db.js', 'permissions.js', 'embeds.js'].includes(f)
);

for (const file of commandFiles) {
  const cmd = require(path.join(__dirname, file));
  if (cmd.data) {
    commands.push(cmd.data.toJSON());
    console.log(`  + ${cmd.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n📡 Registering ${commands.length} slash commands...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ Done! Commands registered globally. May take up to 1 hour to show in Discord.');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
})();
