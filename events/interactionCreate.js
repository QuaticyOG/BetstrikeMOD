const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require("discord.js");

const ticketConfig = require("../config/tickets");
const Ticket = require("../models/Ticket");
const TicketCounter = require("../models/TicketCounter");
const { buildTranscript } = require("../utils/transcript");

function sanitizeChannelPart(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 20);
}

async function getNextTicketNumber(guildId) {
  const counter = await TicketCounter.findOneAndUpdate(
    { guildId },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );
  return counter.count;
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("ticket_open_")) {
        const categoryKey = interaction.customId.replace("ticket_open_", "");
        const config = ticketConfig.categories[categoryKey];
        if (!config) {
          return interaction.reply({ content: "Invalid ticket category.", ephemeral: true });
        }

        const existing = await Ticket.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          categoryKey,
          status: "open"
        });

        if (existing) {
          const existingChannel = interaction.guild.channels.cache.get(existing.channelId);
          return interaction.reply({
            content: existingChannel
              ? `You already have an open ${categoryKey} ticket: ${existingChannel}`
              : `You already have an open ${categoryKey} ticket.`,
            ephemeral: true
          });
        }

        const modal = new ModalBuilder()
          .setCustomId(`ticket_modal_${categoryKey}`)
          .setTitle(config.modalTitle);

        const rows = config.questions.slice(0, 5).map(question => {
          const input = new TextInputBuilder()
            .setCustomId(question.id)
            .setLabel(question.label)
            .setStyle(question.style === 2 ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(Boolean(question.required));

          if (question.maxLength) input.setMaxLength(question.maxLength);

          return new ActionRowBuilder().addComponents(input);
        });

        modal.addComponents(...rows);
        return interaction.showModal(modal);
      }

      if (interaction.customId === "ticket_close") {
        const ticket = await Ticket.findOne({
          guildId: interaction.guild.id,
          channelId: interaction.channel.id,
          status: "open"
        });

        if (!ticket) {
          return interaction.reply({ content: "This is not an open ticket.", ephemeral: true });
        }

        const canClose =
          interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
          interaction.user.id === ticket.userId ||
          ticketConfig.staffRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));

        if (!canClose) {
          return interaction.reply({ content: "You do not have permission to close this ticket.", ephemeral: true });
        }

        ticket.status = "closed";
        ticket.closedBy = interaction.user.id;
        ticket.closedAt = new Date();
        await ticket.save();

        await interaction.channel.permissionOverwrites.edit(ticket.userId, {
          ViewChannel: false,
          SendMessages: false
        });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_delete")
            .setLabel("Delete")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
          content: `Ticket closed by <@${interaction.user.id}>. Staff can now delete it.`,
          components: [row]
        });

        const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
        if (logChannel) {
          await logChannel.send(`🔒 Ticket closed: <#${ticket.channelId}> by <@${interaction.user.id}>`);
        }

        return;
      }

      if (interaction.customId === "ticket_delete") {
        const ticket = await Ticket.findOne({
          guildId: interaction.guild.id,
          channelId: interaction.channel.id
        });

        if (!ticket) {
          return interaction.reply({ content: "This is not a ticket channel.", ephemeral: true });
        }

        const canDelete =
          interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
          ticketConfig.staffRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));

        if (!canDelete) {
          return interaction.reply({ content: "You do not have permission to delete this ticket.", ephemeral: true });
        }

        await interaction.reply({ content: "Deleting ticket in 5 seconds..." });

        const transcriptPath = await buildTranscript(interaction.channel);

        const transcriptFile = new AttachmentBuilder(transcriptPath);
        const transcriptChannel =
          interaction.guild.channels.cache.get(ticketConfig.transcriptChannelId) ||
          interaction.guild.channels.cache.get(ticketConfig.logChannelId);

        if (transcriptChannel) {
          await transcriptChannel.send({
            content: `🧾 Transcript for ticket #${ticket.ticketNumber} (${ticket.categoryKey}) | User: <@${ticket.userId}> | Closed by: ${ticket.closedBy ? `<@${ticket.closedBy}>` : "Unknown"}`,
            files: [transcriptFile]
          });
        }

        const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
        if (logChannel) {
          await logChannel.send(`🗑️ Ticket deleted: #${ticket.ticketNumber} (${ticket.categoryKey}) by <@${interaction.user.id}>`);
        }

        ticket.status = "deleted";
        await ticket.save();

        setTimeout(async () => {
          try {
            await interaction.channel.delete();
          } catch (err) {
            console.error("Failed to delete ticket channel:", err);
          }
        }, 5000);

        return;
      }
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("ticket_modal_")) {
      const categoryKey = interaction.customId.replace("ticket_modal_", "");
      const config = ticketConfig.categories[categoryKey];
      if (!config) {
        return interaction.reply({ content: "Invalid ticket category.", ephemeral: true });
      }

      const existing = await Ticket.findOne({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        categoryKey,
        status: "open"
      });

      if (existing) {
        const existingChannel = interaction.guild.channels.cache.get(existing.channelId);
        return interaction.reply({
          content: existingChannel
            ? `You already have an open ${categoryKey} ticket: ${existingChannel}`
            : `You already have an open ${categoryKey} ticket.`,
          ephemeral: true
        });
      }

      const answers = config.questions.map(question => ({
        questionId: question.id,
        label: question.label,
        answer: interaction.fields.getTextInputValue(question.id)
      }));

      const ticketNumber = await getNextTicketNumber(interaction.guild.id);
      const username = sanitizeChannelPart(interaction.user.username);
      const categoryName = sanitizeChannelPart(categoryKey);
      const channelName = `${username}-${ticketNumber}-${categoryName}`;

      const permissionOverwrites = [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        }
      ];

      for (const roleId of ticketConfig.staffRoleIds) {
        permissionOverwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ManageMessages
          ]
        });
      }

      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketConfig.parentCategoryId,
        permissionOverwrites
      });

      const ticket = await Ticket.create({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        channelId: channel.id,
        ticketNumber,
        categoryKey,
        answers
      });

      const embed = new EmbedBuilder()
        .setTitle(`${config.modalTitle}`)
        .setDescription("Support will be with you shortly.\nTo close this ticket press the close button.")
        .addFields(
          answers.map(a => ({
            name: a.label,
            value: a.answer.length > 1024 ? `${a.answer.slice(0, 1020)}...` : a.answer
          }))
        )
        .setColor(0x2b2d31)
        .setFooter({ text: `Ticket #${ticket.ticketNumber}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Close")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Secondary)
      );

      const staffMentions = ticketConfig.staffRoleIds.map(id => `<@&${id}>`).join(" ");

      await channel.send({
        content: `${interaction.user} ${staffMentions}`.trim(),
        embeds: [embed],
        components: [row]
      });

      const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);
      if (logChannel) {
        await logChannel.send(`📩 Ticket opened: ${channel} | User: <@${interaction.user.id}> | Category: ${categoryKey} | Ticket #${ticket.ticketNumber}`);
      }

      await interaction.reply({
        content: `Your ticket has been created: ${channel}`,
        ephemeral: true
      });
    }
  }
};
