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
    const embed = new EmbedBuilder()
      .setTitle("Ticket System")
      .setDescription("To create a ticket use one of the buttons below depending on your needs.")
      .setColor(0x2b2d31);

    const row = new ActionRowBuilder();

    for (const [key, cat] of Object.entries(ticketConfig.categories)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_open_${key}`)
          .setLabel(cat.label)
          .setEmoji(cat.emoji)
          .setStyle(cat.style || ButtonStyle.Primary)
      );
    }

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
