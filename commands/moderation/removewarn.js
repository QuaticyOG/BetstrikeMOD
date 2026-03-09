const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Warn = require("../../models/Warn");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removewarn")
    .setDescription("Remove a warning from a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User whose warning you want to remove")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("id")
        .setDescription("Warning ID from /warnings list")
        .setRequired(true)),

  async execute(interaction) {

    const user = interaction.options.getUser("user");
    const id = interaction.options.getInteger("id");

    const warnings = await Warn.find({
      guildId: interaction.guild.id,
      userId: user.id
    });

    if (!warnings.length)
      return interaction.reply({ content: "❌ This user has no warnings.", ephemeral: true });

    if (id < 1 || id > warnings.length)
      return interaction.reply({ content: "❌ Invalid warning ID.", ephemeral: true });

    const warn = warnings[id - 1];

    await Warn.deleteOne({ _id: warn._id });

    return interaction.reply(
      `✅ Removed warning **#${id}** from **${user.tag}**`
    );
  }
};
