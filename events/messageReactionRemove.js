const { syncReactionRole } = require('../systems/reactionRoles');

module.exports = {
  name: 'messageReactionRemove',
  async execute(client, reaction, user) {
    if (reaction.partial) await reaction.fetch().catch(() => null);
    await syncReactionRole(reaction, user, false);
  }
};
