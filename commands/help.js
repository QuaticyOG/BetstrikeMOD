const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Show all commands.'),
  async execute(client, interaction) {
    const grouped = [...client.commands.values()].map((c) => `</${c.data.name}:${interaction.commandId || '0'}> - ${c.data.description}`).join('\n');
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('Help')
      .setDescription([...client.commands.values()].map((c) => `**/${c.data.name}** - ${c.data.description}`).join('\n'))
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
