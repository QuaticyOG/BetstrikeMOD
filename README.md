# Modular Discord Bot

A production-ready Discord bot template built with **Node.js**, **discord.js v14**, **MongoDB/Mongoose**, and a modular handler architecture.

## Features

- Moderation system
  - `/ban`
  - `/kick`
  - `/timeout`
  - `/warn`
  - `/warnings`
  - `/clear`
  - MongoDB moderation logs
- Leveling system
  - XP per message
  - Level calculation
  - `/rank`
  - `/leaderboard`
  - Level role rewards
- Reaction roles
  - `/reactionpanel`
  - automatic add/remove on reaction
- Ticket system
  - `/ticketpanel`
  - private ticket channels
  - close/delete buttons
  - transcript export to `.txt`
  - configurable staff roles
- Welcome system
  - `/setwelcome`
  - welcome/leave messages
  - auto role
  - embed-based messages
- Logging system
  - message delete/edit
  - member join/leave
  - role changes
  - moderation actions
- Utilities
  - `/ping`
  - `/userinfo`
  - `/serverinfo`
  - `/avatar`
  - `/help`
- ALT account detection
  - uses `discord-alt-detector`
  - runs on member join
  - calculates trust score
  - alerts mod log channel
  - can assign suspicious role

## Project Structure

```txt
.
├── commands/
│   ├── avatar.js
│   ├── ban.js
│   ├── clear.js
│   ├── help.js
│   ├── kick.js
│   ├── leaderboard.js
│   ├── ping.js
│   ├── rank.js
│   ├── reactionpanel.js
│   ├── serverinfo.js
│   ├── setlevelreward.js
│   ├── setlogs.js
│   ├── setsuspiciousrole.js
│   ├── setwelcome.js
│   ├── ticketpanel.js
│   ├── timeout.js
│   ├── userinfo.js
│   ├── warn.js
│   └── warnings.js
├── config/
│   └── config.js
├── events/
│   ├── guildMemberAdd.js
│   ├── guildMemberRemove.js
│   ├── guildMemberUpdate.js
│   ├── interactionCreate.js
│   ├── messageCreate.js
│   ├── messageDelete.js
│   ├── messageReactionAdd.js
│   ├── messageReactionRemove.js
│   ├── messageUpdate.js
│   └── ready.js
├── models/
│   ├── GuildConfig.js
│   ├── ModLog.js
│   ├── ReactionRole.js
│   ├── Ticket.js
│   ├── UserLevel.js
│   └── Warning.js
├── systems/
│   ├── altDetector.js
│   ├── commandHandler.js
│   ├── eventHandler.js
│   ├── leveling.js
│   ├── logging.js
│   ├── moderation.js
│   ├── reactionRoles.js
│   ├── tickets.js
│   └── welcome.js
├── utils/
│   ├── embed.js
│   ├── helpers.js
│   ├── logger.js
│   ├── permissions.js
│   └── transcript.js
├── .env.example
├── index.js
├── package.json
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

```env
DISCORD_TOKEN=
CLIENT_ID=
MONGO_URI=
DEVELOPMENT_GUILD_ID=
DEFAULT_PREFIX=/
DEFAULT_EMBED_COLOR=#5865F2
```

## Install

```bash
npm install
node index.js
```

Or:

```bash
npm start
```

## Discord Developer Portal Setup

Enable these gateway intents:

- Server Members Intent
- Message Content Intent
- Presence Intent

Invite the bot with scopes:

- `bot`
- `applications.commands`

Recommended permissions:

- Manage Roles
- Manage Channels
- Manage Messages
- Kick Members
- Ban Members
- Moderate Members
- View Audit Log
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions

## Railway Deployment

### 1. Push to GitHub

Create a GitHub repository and push this project.

### 2. Create a Railway project

In Railway:

1. Create a new project
2. Choose **Deploy from GitHub repo**
3. Select your repository

### 3. Add environment variables

Add these variables in Railway:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `MONGO_URI`
- `DEVELOPMENT_GUILD_ID` (optional for faster testing)
- `DEFAULT_PREFIX` (optional)
- `DEFAULT_EMBED_COLOR` (optional)

### 4. Start command

Railway will use:

```bash
npm start
```

### 5. Node version

This project uses the `engines.node` field in `package.json`. Railway/Nixpacks will install a compatible Node version automatically.

## First-Time Setup Commands

After inviting the bot and starting it:

1. Run `/setlogs`
2. Run `/setwelcome`
3. Run `/setsuspiciousrole` if you want automatic suspicious-role tagging
4. Run `/ticketpanel` to create ticket buttons
5. Run `/reactionpanel` to create reaction-role panels
6. Run `/setlevelreward` to add level role rewards

## Notes

- Global slash commands can take time to update. Use `DEVELOPMENT_GUILD_ID` during development for instant-ish guild command registration.
- Ticket transcripts are stored as text file attachments in the configured transcript channel.
- Reaction role panels in this template support up to 3 roles per slash command execution, but the data model supports expansion.
- The ALT detector can produce false positives. Review the generated alert before taking action.

## Production Hardening Ideas

- Add audit-log correlation for more precise moderation event logging
- Add per-guild toggles for each subsystem
- Add dashboard/API for panel generation
- Add transcript HTML export
- Add sharding for very large bots
- Add i18n/localization
