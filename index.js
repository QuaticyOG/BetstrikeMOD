require('dotenv').config();

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const mongoose = require('mongoose');

const { loadCommands } = require('./systems/commandHandler');
const { loadEvents } = require('./systems/eventHandler');
const { initAltDetector } = require('./systems/altDetector');
const { logger } = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.config = require('./config/config');
client.altDetector = initAltDetector();

(async () => {
  try {
    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.MONGO_URI) {
      throw new Error('Missing required environment variables: DISCORD_TOKEN, CLIENT_ID, or MONGO_URI.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');

    await loadCommands(client);
    await loadEvents(client);

    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    logger.error(`Startup failure: ${error.stack || error.message}`);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (error) => logger.error(`Unhandled rejection: ${error.stack || error}`));
process.on('uncaughtException', (error) => logger.error(`Uncaught exception: ${error.stack || error}`));
