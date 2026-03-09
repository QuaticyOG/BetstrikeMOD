const { handleLeave } = require('../systems/welcome');
const { sendLog } = require('../systems/logging');

module.exports = {
  name: 'guildMemberRemove',
  async execute(client, member) {
    await handleLeave(member);
    await sendLog(member.guild, 'Member Left', `${member.user.tag} left the server.`, '#ED4245');
  }
};
