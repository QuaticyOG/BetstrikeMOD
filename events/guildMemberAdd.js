const { handleJoin } = require('../systems/welcome');
const { runAltDetection } = require('../systems/altDetector');
const { sendLog } = require('../systems/logging');

module.exports = {
  name: 'guildMemberAdd',
  async execute(client, member) {
    await handleJoin(member);
    await runAltDetection(client, member);
    await sendLog(member.guild, 'Member Joined', `${member.user.tag} joined the server.`, '#57F287');
  }
};
