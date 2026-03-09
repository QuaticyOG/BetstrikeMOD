const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { logger } = require('../utils/logger');

async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  const slashPayload = [];

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || !command.execute) {
      logger.warn(`Skipping invalid command file: ${file}`);
      continue;
    }
    client.commands.set(command.data.name, command);
    slashPayload.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  if (process.env.DEVELOPMENT_GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEVELOPMENT_GUILD_ID),
      { body: slashPayload }
    );
    logger.info(`Registered ${slashPayload.length} guild commands`);
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: slashPayload });
    logger.info(`Registered ${slashPayload.length} global commands`);
  }
}

module.exports = { loadCommands };
