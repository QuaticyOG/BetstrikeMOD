const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserLevel = require('../models/UserLevel');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Show your rank or another user rank.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(false)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const level = await UserLevel.findOne({ guildId: interaction.guild.id, userId: user.id });

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle(`Rank | ${user.tag}`)
      .setDescription(level ? `Level: **${level.level}**\nXP: **${level.xp}**` : 'No data yet. Start chatting to earn XP!')
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
