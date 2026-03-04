require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const http = require('http');

// Check all required env vars are set
const REQUIRED = ['DISCORD_TOKEN', 'CLIENT_ID', 'PLAYFAB_TITLE_ID', 'PLAYFAB_SECRET_KEY'];
for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`❌ Missing env var: ${key} — check your environment variables on Render.`);
    process.exit(1);
  }
}

// ─── Tiny web server so Render free tier doesn't complain about no port ───────
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('PlayFab Bot is running!');
}).listen(PORT, () => {
  console.log(`🌐 Web server listening on port ${PORT}`);
});

// ─── Discord Bot ───────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load all command files — all in the same folder
const commandFiles = fs.readdirSync(__dirname).filter(f =>
  f.endsWith('.js') && !['index.js', 'deploy.js', 'playfab.js', 'db.js', 'permissions.js', 'embeds.js'].includes(f)
);

for (const file of commandFiles) {
  const cmd = require(path.join(__dirname, file));
  if (!cmd.data || !cmd.execute) continue;
  client.commands.set(cmd.data.name, cmd);
  console.log(`  ✔ Loaded: /${cmd.data.name}`);
}

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`[ERROR] /${interaction.commandName}:`, err.message);

    const reply = {
      embeds: [{
        color: 0xED4245,
        title: '❌  Error',
        description: err.message || 'Something went wrong.',
        timestamp: new Date().toISOString(),
      }],
      ephemeral: true,
    };

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch { /* interaction expired */ }
  }
});

client.once('ready', () => {
  console.log(`\n✅ Logged in as ${client.user.tag}`);
  console.log(`   Servers: ${client.guilds.cache.size}`);
  console.log(`   PlayFab Title: ${process.env.PLAYFAB_TITLE_ID}\n`);
  client.user.setActivity('PlayFab | /help', { type: 3 });
});

client.login(process.env.DISCORD_TOKEN);
