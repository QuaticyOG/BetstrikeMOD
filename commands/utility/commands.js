const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Show all loaded bot commands"),

  async execute(interaction) {

    const commands = interaction.client.commands.map(cmd => `• /${cmd.data.name}`);

    const list = commands.join("\n");

    await interaction.reply({
      content: `📜 **Loaded Commands (${commands.length})**\n\n${list}`,
      ephemeral: true
    });

  }
};
