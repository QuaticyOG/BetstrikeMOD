const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Configure welcome and leave settings.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) => option.setName('welcomechannel').setDescription('Welcome channel').setRequired(true))
    .addChannelOption((option) => option.setName('leavechannel').setDescription('Leave channel').setRequired(true))
    .addRoleOption((option) => option.setName('autorole').setDescription('Auto role on join').setRequired(false))
    .addStringOption((option) => option.setName('welcomemessage').setDescription('Use {user}, {userTag}, {server}').setRequired(false))
    .addStringOption((option) => option.setName('leavemessage').setDescription('Use {user}, {userTag}, {server}').setRequired(false)),
  async execute(client, interaction) {
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        welcomeChannelId: interaction.options.getChannel('welcomechannel', true).id,
        leaveChannelId: interaction.options.getChannel('leavechannel', true).id,
        autoRoleId: interaction.options.getRole('autorole')?.id || null,
        ...(interaction.options.getString('welcomemessage') ? { welcomeMessage: interaction.options.getString('welcomemessage') } : {}),
        ...(interaction.options.getString('leavemessage') ? { leaveMessage: interaction.options.getString('leavemessage') } : {})
      },
      { upsert: true }
    );

    await interaction.reply({ content: 'Welcome system configured.', ephemeral: true });
  }
};
