const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, unique: true },
    ticketNumber: { type: Number, required: true },
    categoryKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "closed", "deleted"],
      default: "open"
    },
    claimedBy: { type: String, default: null },
    answers: [
      {
        questionId: String,
        label: String,
        answer: String
      }
    ],
    closedBy: { type: String, default: null },
    closedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);;
