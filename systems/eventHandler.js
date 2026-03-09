const fs = require("fs");
const path = require("path");
const { logger } = require("../utils/logger");

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, "..", "events");
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

  for (const file of eventFiles) {

    const event = require(path.join(eventsPath, file));

    if (!event.name || !event.execute) {
      logger.warn(`Skipping invalid event file: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }

  }

  logger.info(`Loaded ${eventFiles.length} events`);
}

module.exports = { loadEvents };
