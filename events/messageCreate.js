const { awardXp } = require('../systems/leveling');

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    await awardXp(client, message);
  }
};
