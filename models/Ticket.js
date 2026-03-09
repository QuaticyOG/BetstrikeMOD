const { Schema, model } = require('mongoose');

const ticketSchema = new Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  staffClaimedBy: { type: String, default: null },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  reason: { type: String, default: 'No reason supplied' }
}, { timestamps: true });

module.exports = model('Ticket', ticketSchema);
