const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Get information about this server.'),
  async execute(client, interaction) {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle(`Server Info | ${guild.name}`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Guild ID', value: guild.id, inline: true },
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Channels', value: String(guild.channels.cache.size), inline: true },
        { name: 'Roles', value: String(guild.roles.cache.size), inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
