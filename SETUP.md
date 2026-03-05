# ZTD Bot — Setup Guide

## What you need first
- Node.js 18+ installed (`node -v` to check)
- Your Discord bot token (discord.com/developers → your app → Bot → Token)
- Your Discord Application Client ID (discord.com/developers → your app → General → Application ID)
- Your PlayFab Secret Key (developer.playfab.com → your title → Settings → Secret Keys)
- PlayFab Title ID: `100286`

---

## Step 1 — Install & configure

```bash
# Go into the bot folder
cd ZTD_bot_v3

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Now open `.env` in any text editor and fill in your 4 values:
```
DISCORD_TOKEN=        <-- from discord.com/developers
CLIENT_ID=            <-- Application ID from discord.com/developers
PLAYFAB_TITLE_ID=     100286
PLAYFAB_SECRET_KEY=   <-- from PlayFab Dashboard > Settings > Secret Keys
```

---

## Step 2 — Register slash commands with Discord

This only needs to run ONCE (or whenever you add new commands).

```bash
node deploy.js
```

You should see output like:
```
  + grant
  + catalog
  + give-mod-panel
  + give-dev-panel
  + ban
  + unban
  + profile
  + leaderboard
  + link
  + unlink
  + help
  + config
📡 Registering 12 slash commands...
✅ Done! Commands registered globally.
```

> Commands can take up to 1 hour to appear in Discord after first registration.

---

## Step 3 — Start the bot

```bash
node index.js
```

Or to keep it running in the background:
```bash
# Using pm2 (install once with: npm install -g pm2)
pm2 start index.js --name ztd-bot
pm2 save

# To see logs:
pm2 logs ztd-bot

# To restart:
pm2 restart ztd-bot
```

---

## Step 4 — Set up roles in Discord

In your Discord server, run these bot commands (you must be server Administrator):

```
/config set-admin-role @YourAdminRole
/config set-mod-role @YourModRole
```

---

## Granting panels

| What you want | Command |
|---|---|
| Give someone the Owner Panel | `/grant item:owner_panel playfab_id:THEIRID` |
| Give someone the Mod Panel | `/grant item:mod_panel playfab_id:THEIRID` or `/give-mod-panel` |
| Give someone the Dev Panel | `/grant item:dev_panel playfab_id:THEIRID` or `/give-dev-panel` |
| Remove a panel | `/grant item:mod_panel playfab_id:THEIRID revoke:true` |
| Give any cosmetic | `/grant item:cosmetic_gold_badge playfab_id:THEIRID` |
| See all item IDs | `/catalog` |

You can also use `user:@Discord` instead of `playfab_id:` if the player has linked their account with `/link`.

---

## PlayFab Catalog — IMPORTANT

Upload the included `ZTD_Cosmetics_v1_with_dev_panel.json` to your PlayFab dashboard:

1. Go to developer.playfab.com → Title 100286
2. Economy → Catalogs → ZTD_Cosmetics_v1
3. Upload / replace with the provided JSON

This adds the `dev_panel` item so the bot can grant it.

---

## Troubleshooting

**"item not found in catalog"** — Upload the catalog JSON to PlayFab (see above)

**"grant failed: Not Authorized"** — Your `PLAYFAB_SECRET_KEY` is wrong or missing in `.env`

**Commands not showing in Discord** — Run `node deploy.js` again, wait up to 1 hour

**Bot not responding** — Check `node index.js` is still running, look for errors in the terminal
