const { Schema, model } = require('mongoose');

const reactionRoleSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  title: { type: String, default: 'Reaction Roles' },
  description: { type: String, default: 'React below to get your roles.' },
  roles: [
    {
      emoji: { type: String, required: true },
      roleId: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = model('ReactionRole', reactionRoleSchema);
