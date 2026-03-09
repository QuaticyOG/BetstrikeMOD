const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const ticketConfig = require("../../config/tickets");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Send the ticket panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    try {

      const embed = new EmbedBuilder()
        .setTitle("Ticket System")
        .setDescription("To create a ticket use one of the buttons below depending on your needs.")
        .setColor(0x2b2d31);

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let count = 0;

      for (const [key, cat] of Object.entries(ticketConfig.categories)) {

        if (count === 5) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
          count = 0;
        }

        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`ticket_open_${key}`)
            .setLabel(cat.label)
            .setEmoji(cat.emoji)
            .setStyle(cat.style || ButtonStyle.Primary)
        );

        count++;
      }

      rows.push(currentRow);

      await interaction.reply({
        embeds: [embed],
        components: rows
      });

    } catch (error) {

      console.error("Ticket panel error:", error);

      await interaction.reply({
        content: "Failed to send ticket panel.",
        ephemeral: true
      });

    }

  }
};
