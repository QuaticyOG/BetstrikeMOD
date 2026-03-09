const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const Ticket = require('../models/Ticket');
const GuildConfig = require('../models/GuildConfig');
const { buildTranscript } = require('../utils/transcript');

async function createTicketPanel(client, channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:create').setLabel('Create Ticket').setStyle(ButtonStyle.Primary)
  );

  const embed = new EmbedBuilder()
    .setColor(client.config.embedColor)
    .setTitle('Support Tickets')
    .setDescription('Press the button below to open a private support ticket.')
    .setTimestamp();

  return channel.send({ embeds: [embed], components: [row] });
}

async function openTicket(client, interaction) {
  const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
  const existing = await Ticket.findOne({ guildId: interaction.guild.id, ownerId: interaction.user.id, status: 'open' });
  if (existing) {
    return interaction.reply({ content: `You already have an open ticket: <#${existing.channelId}>`, ephemeral: true });
  }

  const staffRoleIds = config?.ticketStaffRoleIds || [];
  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}`.slice(0, 100),
    type: ChannelType.GuildText,
    parent: config?.ticketCategoryId || null,
    permissionOverwrites: [
      { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      ...staffRoleIds.map((roleId) => ({
        id: roleId,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels]
      }))
    ]
  });

  await Ticket.create({ guildId: interaction.guild.id, channelId: channel.id, ownerId: interaction.user.id });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket:close').setLabel('Close').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('ticket:delete').setLabel('Delete').setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    content: `${interaction.user} your ticket has been created. Staff will be with you shortly.`,
    components: [row]
  });

  return interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
}

async function closeTicket(interaction) {
  const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: 'open' });
  if (!ticket) return interaction.reply({ content: 'This channel is not an open ticket.', ephemeral: true });

  ticket.status = 'closed';
  await ticket.save();
  await interaction.channel.setName(`closed-${interaction.channel.name}`.slice(0, 100)).catch(() => null);
  await interaction.reply({ content: 'Ticket closed. You can now delete it if needed.' });
}

async function deleteTicket(interaction) {
  const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
  if (!ticket) return interaction.reply({ content: 'This channel is not a ticket.', ephemeral: true });

  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const transcriptContent = buildTranscript(interaction.channel, [...messages.values()]);
  const attachment = new AttachmentBuilder(Buffer.from(transcriptContent, 'utf8'), { name: `transcript-${interaction.channel.id}.txt` });

  const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
  const transcriptChannelId = config?.ticketTranscriptChannelId;
  const transcriptChannel = transcriptChannelId ? interaction.guild.channels.cache.get(transcriptChannelId) : null;

  if (transcriptChannel) {
    await transcriptChannel.send({
      content: `Transcript for ticket owned by <@${ticket.ownerId}>`,
      files: [attachment]
    }).catch(() => null);
  }

  await Ticket.deleteOne({ _id: ticket._id });
  await interaction.reply({ content: 'Deleting ticket channel...' });
  setTimeout(() => interaction.channel.delete().catch(() => null), 1500);
}

module.exports = { createTicketPanel, openTicket, closeTicket, deleteTicket };
