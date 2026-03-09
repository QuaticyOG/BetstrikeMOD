const { sendLog } = require('../systems/logging');

module.exports = {
  name: 'messageUpdate',
  async execute(client, oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot || oldMessage.content === newMessage.content) return;
    await sendLog(newMessage.guild, 'Message Edited', `**Author:** ${newMessage.author?.tag || 'Unknown'}\n**Channel:** ${newMessage.channel}\n**Before:** ${oldMessage.content || '[no content]'}\n**After:** ${newMessage.content || '[no content]'}`, '#FEE75C');
  }
};
