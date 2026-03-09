const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const GuildConfig = require("../models/GuildConfig");

module.exports = {

  data: new SlashCommandBuilder()
    .setName("ticketcategory")
    .setDescription("Set the category where tickets will be created")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option
        .setName("category")
        .setDescription("The category for ticket channels")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    ),

  async execute(interaction) {

    const category = interaction.options.getChannel("category");

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        $set: {
          ticketCategoryId: category.id
        }
      },
      { upsert: true }
    );

    await interaction.reply({
      content: `✅ Ticket category set to **${category.name}**`,
      ephemeral: true
    });

  }

};
