const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const TicketConfig = require("../../models/TicketConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketconfig")
    .setDescription("Configure the ticket system")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand(sub =>
      sub
        .setName("category")
        .setDescription("Set the ticket category")
        .addChannelOption(option =>
          option.setName("category")
            .setDescription("Ticket category")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("logchannel")
        .setDescription("Set ticket log channel")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("Log channel")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("transcripts")
        .setDescription("Set transcript channel")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("Transcript channel")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("staffrole")
        .setDescription("Add a staff role")
        .addRoleOption(option =>
          option.setName("role")
            .setDescription("Staff role")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("panelchannel")
        .setDescription("Set the panel channel")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("Ticket panel channel")
            .setRequired(true)
        )
    ),

  async execute(interaction) {

    const sub = interaction.options.getSubcommand();

    let config = await TicketConfig.findOne({
      guildId: interaction.guild.id
    });

    if (!config) {
      config = await TicketConfig.create({
        guildId: interaction.guild.id
      });
    }

    if (sub === "category") {

      const category = interaction.options.getChannel("category");

      config.ticketCategoryId = category.id;
      await config.save();

      return interaction.reply(`✅ Ticket category set to ${category}`);
    }

    if (sub === "logchannel") {

      const channel = interaction.options.getChannel("channel");

      config.logChannelId = channel.id;
      await config.save();

      return interaction.reply(`✅ Log channel set to ${channel}`);
    }

    if (sub === "transcripts") {

      const channel = interaction.options.getChannel("channel");

      config.transcriptChannelId = channel.id;
      await config.reply(`✅ Transcript channel set to ${channel}`);
    }

    if (sub === "staffrole") {

      const role = interaction.options.getRole("role");

      if (!config.staffRoleIds.includes(role.id)) {
        config.staffRoleIds.push(role.id);
      }

      await config.save();

      return interaction.reply(`✅ Staff role added: ${role}`);
    }

    if (sub === "panelchannel") {

      const channel = interaction.options.getChannel("channel");

      config.panelChannelId = channel.id;
      await config.save();

      return interaction.reply(`✅ Panel channel set to ${channel}`);
    }

  }
};
