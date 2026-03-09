const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatDuration } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(false)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle(`User Info | ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: 'Roles', value: member.roles.cache.filter((r) => r.id !== interaction.guild.id).map((r) => r.toString()).join(', ') || 'None' },
        { name: 'Presence', value: member.presence?.status || 'offline', inline: true },
        { name: 'Age', value: formatDuration(Date.now() - user.createdTimestamp), inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
