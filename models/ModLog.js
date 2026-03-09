const { Schema, model } = require('mongoose');

const modLogSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  targetId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, default: 'No reason provided.' },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('ModLog', modLogSchema);
