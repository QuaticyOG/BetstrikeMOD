const { sendLog } = require('../systems/logging');

module.exports = {
  name: 'guildMemberUpdate',
  async execute(client, oldMember, newMember) {
    const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));

    if (addedRoles.size) {
      await sendLog(newMember.guild, 'Roles Added', `${newMember.user.tag} received: ${addedRoles.map((r) => r.toString()).join(', ')}`, '#57F287');
    }

    if (removedRoles.size) {
      await sendLog(newMember.guild, 'Roles Removed', `${newMember.user.tag} lost: ${removedRoles.map((r) => r.toString()).join(', ')}`, '#ED4245');
    }
  }
};
