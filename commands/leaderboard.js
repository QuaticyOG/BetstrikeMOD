const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserLevel = require('../models/UserLevel');

module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('Show the XP leaderboard.'),
  async execute(client, interaction) {
    const top = await UserLevel.find({ guildId: interaction.guild.id }).sort({ xp: -1 }).limit(10);
    const lines = await Promise.all(top.map(async (entry, index) => {
      const user = await client.users.fetch(entry.userId).catch(() => null);
      return `**${index + 1}.** ${user ? user.tag : entry.userId} — Level **${entry.level}** (**${entry.xp} XP**)`;
    }));

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('XP Leaderboard')
      .setDescription(lines.join('\n') || 'No leaderboard data yet.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
