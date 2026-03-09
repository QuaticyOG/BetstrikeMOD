const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const GuildConfig = require("../models/GuildConfig");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("ticketpanel")
    .setDescription("Create the ticket panel in the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(option =>
      option
        .setName("staffrole")
        .setDescription("Role that can see and manage tickets")
        .setRequired(true)
    ),

  async execute(interaction) {

    const staffRole = interaction.options.getRole("staffrole");

    // Save config to database
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        $set: {
          ticketPanelChannelId: interaction.channel.id
        },
        $addToSet: {
          ticketStaffRoleIds: staffRole.id
        }
      },
      { upsert: true }
    );


    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Tickets")
      .setDescription(
        "To create a ticket choose the category below.\n\n" +
        "Our support team will respond as soon as possible."
      )
      .setColor(0x2b2d31);


    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId("ticket_open_support")
        .setLabel("Support")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("ticket_open_report")
        .setLabel("Report User")
        .setEmoji("🚨")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("ticket_open_partnership")
        .setLabel("Partnership")
        .setEmoji("🤝")
        .setStyle(ButtonStyle.Success)

    );


    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });


    await interaction.reply({
      content: "✅ Ticket panel created successfully.",
      ephemeral: true
    });

  }

};
