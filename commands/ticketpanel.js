const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const { createTicketPanel } = require('../systems/tickets');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Create the ticket panel in the current channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption((option) => option.setName('staffrole').setDescription('Staff role with ticket access').setRequired(true)),
  async execute(client, interaction) {
    const staffRole = interaction.options.getRole('staffrole', true);
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      {
        $set: {
          ticketPanelChannelId: interaction.channel.id
        },
        $addToSet: {
          ticketStaffRoleIds: staffRole.id
        }
      },
      { upsert: true, new: true }
    );

    await createTicketPanel(client, interaction.channel);
    await interaction.reply({ content: 'Ticket panel created.', ephemeral: true });
  }
};
