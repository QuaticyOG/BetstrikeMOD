const mongoose = require("mongoose");

const ticketConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  ticketCategoryId: String,
  logChannelId: String,
  transcriptChannelId: String,
  panelChannelId: String,

  staffRoleIds: [String]
});

module.exports = mongoose.model("TicketConfig", ticketConfigSchema);
