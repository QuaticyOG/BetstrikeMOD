const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('Configure log channels.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) => option.setName('logchannel').setDescription('General log channel').setRequired(true))
    .addChannelOption((option) => option.setName('modlogchannel').setDescription('Moderation log channel').setRequired(true))
    .addChannelOption((option) => option.setName('suspiciouschannel').setDescription('ALT detector alert channel').setRequired(false))
    .addChannelOption((option) => option.setName('transcriptchannel').setDescription('Ticket transcript channel').setRequired(false)),
  async execute(client, interaction) {
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        logChannelId: interaction.options.getChannel('logchannel', true).id,
        modLogChannelId: interaction.options.getChannel('modlogchannel', true).id,
        suspiciousAlertChannelId: interaction.options.getChannel('suspiciouschannel')?.id || null,
        ticketTranscriptChannelId: interaction.options.getChannel('transcriptchannel')?.id || null
      },
      { upsert: true }
    );

    await interaction.reply({ content: 'Log channels configured.', ephemeral: true });
  }
};
