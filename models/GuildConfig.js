const { Schema, model } = require('mongoose');

const guildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  modLogChannelId: { type: String, default: null },
  logChannelId: { type: String, default: null },
  welcomeChannelId: { type: String, default: null },
  leaveChannelId: { type: String, default: null },
  autoRoleId: { type: String, default: null },
  welcomeMessage: { type: String, default: 'Welcome {user} to **{server}**!' },
  leaveMessage: { type: String, default: '{userTag} has left **{server}**.' },
  welcomeEmbedEnabled: { type: Boolean, default: true },
  leaveEmbedEnabled: { type: Boolean, default: true },
  ticketPanelChannelId: { type: String, default: null },
  ticketCategoryId: { type: String, default: null },
  ticketTranscriptChannelId: { type: String, default: null },
  ticketStaffRoleIds: { type: [String], default: [] },
  suspiciousRoleId: { type: String, default: null },
  suspiciousAlertChannelId: { type: String, default: null },
  levelRewards: {
    type: [
      {
        level: Number,
        roleId: String
      }
    ],
    default: []
  },
  reactionRolePanels: {
    type: [
      {
        messageId: String,
        channelId: String,
        roles: [
          {
            emoji: String,
            roleId: String
          }
        ]
      }
    ],
    default: []
  }
}, { timestamps: true });

module.exports = model('GuildConfig', guildConfigSchema);
