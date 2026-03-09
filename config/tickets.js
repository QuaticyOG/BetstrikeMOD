module.exports = {
  parentCategoryId: "PUT_TICKET_CATEGORY_ID_HERE",
  logChannelId: "PUT_TICKET_LOG_CHANNEL_ID_HERE",
  transcriptChannelId: "PUT_TRANSCRIPT_CHANNEL_ID_HERE", // optional, can be same as log channel
  staffRoleIds: [
    "PUT_SUPPORT_ROLE_ID_HERE",
    "PUT_MOD_ROLE_ID_HERE"
  ],
  panelChannelId: "PUT_PANEL_CHANNEL_ID_HERE", // optional
  categories: {
    support: {
      label: "Create ticket",
      emoji: "📩",
      style: 1,
      modalTitle: "Support Ticket",
      questions: [
        {
          id: "issue",
          label: "How can we help? (Only Discord support)",
          style: 2,
          required: true,
          maxLength: 1000
        },
        {
          id: "betstrike",
          label: "We cannot help with BetStrike.com Support",
          style: 1,
          required: true,
          maxLength: 100
        }
      ]
    },
    report: {
      label: "Report a user",
      emoji: "⚠️",
      style: 4,
      modalTitle: "User Report",
      questions: [
        {
          id: "reported_user",
          label: "Who are you reporting?",
          style: 1,
          required: true,
          maxLength: 100
        },
        {
          id: "reason",
          label: "What happened?",
          style: 2,
          required: true,
          maxLength: 1000
        }
      ]
    },
    partnership: {
      label: "Partnership / Collab",
      emoji: "🤝",
      style: 2,
      modalTitle: "Partnership / Collab",
      questions: [
        {
          id: "server_name",
          label: "Server / Brand name",
          style: 1,
          required: true,
          maxLength: 100
        },
        {
          id: "details",
          label: "Tell us about the partnership",
          style: 2,
          required: true,
          maxLength: 1000
        }
      ]
    }
  }
};
