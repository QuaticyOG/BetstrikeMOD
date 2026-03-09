const { logger } = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Managing your server');
  }
};
