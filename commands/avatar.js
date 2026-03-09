const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Show a user avatar.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(false)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle(`${user.tag}'s avatar`)
      .setImage(user.displayAvatarURL({ size: 4096 }))
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
