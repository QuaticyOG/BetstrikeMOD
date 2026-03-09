const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Warn = require("../../models/Warn");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Clear all warnings from a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("User to clear warnings from")
        .setRequired(true)
    ),

  async execute(interaction) {

    const user = interaction.options.getUser("user");

    const warnings = await Warn.find({
      guildId: interaction.guild.id,
      userId: user.id
    });

    if (!warnings.length) {
      return interaction.reply({
        content: "❌ This user has no warnings.",
        ephemeral: true
      });
    }

    await Warn.deleteMany({
      guildId: interaction.guild.id,
      userId: user.id
    });

    interaction.reply(`✅ Cleared **${warnings.length} warnings** from **${user.tag}**.`);
  }
};
