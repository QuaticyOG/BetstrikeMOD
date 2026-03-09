const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check the bot latency.'),
  async execute(client, interaction) {
    await interaction.reply({ content: `🏓 Pong! API latency: **${client.ws.ping}ms**` });
  }
};
