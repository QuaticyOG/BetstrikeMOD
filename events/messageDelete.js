const { sendLog } = require('../systems/logging');

module.exports = {
  name: 'messageDelete',
  async execute(client, message) {
    if (!message.guild || message.author?.bot) return;
    await sendLog(message.guild, 'Message Deleted', `**Author:** ${message.author?.tag || 'Unknown'}\n**Channel:** ${message.channel}\n**Content:** ${message.content || '[no content]'}`, '#ED4245');
  }
};
