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

  // ---- Slash Commands ----
  if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("Slash command error:", error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Error executing command.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Error executing command.", ephemeral: true });
      }
    }

    return;
  }


    // -------------------------
    // BUTTONS
    // -------------------------
    if (interaction.type === 3) {

      // OPEN TICKET
      if (interaction.customId.startsWith("ticket_open_")) {

        const categoryKey = interaction.customId.replace("ticket_open_", "");
        const config = ticketConfig.categories[categoryKey];

        const existing = await Ticket.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          categoryKey,
          status: "open"
        });

        if (existing) {
          const channel = interaction.guild.channels.cache.get(existing.channelId);

          return interaction.reply({
            content: `You already have an open ticket: ${channel}`,
            ephemeral: true
          });
        }

        const modal = new ModalBuilder()
          .setCustomId(`ticket_modal_${categoryKey}`)
          .setTitle(config.modalTitle);

        const rows = config.questions.slice(0, 5).map(q => {

          const input = new TextInputBuilder()
            .setCustomId(q.id)
            .setLabel(q.label)
            .setStyle(q.style === 2 ? TextInputStyle.Paragraph : TextInputStyle.Short)
            .setRequired(Boolean(q.required));

          return new ActionRowBuilder().addComponents(input);

        });

        modal.addComponents(...rows);

        return interaction.showModal(modal);
      }


      // CLOSE BUTTON
      if (interaction.customId === "ticket_close") {

        const row = new ActionRowBuilder().addComponents(

          new ButtonBuilder()
            .setCustomId("ticket_close_confirm")
            .setLabel("Close")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("ticket_close_cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary)

        );

        return interaction.reply({
          content: "Are you sure you would like to close this ticket?",
          components: [row],
          ephemeral: true
        });
      }


      // CANCEL CLOSE
      if (interaction.customId === "ticket_close_cancel") {

        return interaction.update({
          content: "Ticket close cancelled.",
          components: []
        });
      }


      // CONFIRM CLOSE
      if (interaction.customId === "ticket_close_confirm") {

        const ticket = await Ticket.findOne({
          guildId: interaction.guild.id,
          channelId: interaction.channel.id
        });

        if (!ticket) {
          return interaction.reply({
            content: "This is not a ticket.",
            ephemeral: true
          });
        }

        ticket.status = "closed";
        ticket.closedBy = interaction.user.id;
        ticket.closedAt = new Date();
        await ticket.save();


        const closedEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setDescription(`Ticket Closed by ${interaction.user}`);

        await interaction.channel.send({
          embeds: [closedEmbed]
        });


        const transcriptPath = await buildTranscript(interaction.channel);

        const transcriptFile = new AttachmentBuilder(transcriptPath);

        const transcriptChannel =
          interaction.guild.channels.cache.get(ticketConfig.transcriptChannelId) ||
          interaction.guild.channels.cache.get(ticketConfig.logChannelId);

        if (transcriptChannel) {
          await transcriptChannel.send({
            content: `Transcript saved from ${interaction.channel.name}`,
            files: [transcriptFile]
          });
        }


        const controlPanel = new ActionRowBuilder().addComponents(

          new ButtonBuilder()
            .setCustomId("ticket_reopen")
            .setLabel("Open")
            .setEmoji("🔓")
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId("ticket_delete")
            .setLabel("Delete")
            .setEmoji("⛔")
            .setStyle(ButtonStyle.Danger)

        );

        await interaction.channel.send({
          content: "Support team ticket controls",
          components: [controlPanel]
        });

        return interaction.update({
          content: "Ticket closed.",
          components: []
        });
      }


      // REOPEN TICKET
      if (interaction.customId === "ticket_reopen") {

        const ticket = await Ticket.findOne({
          guildId: interaction.guild.id,
          channelId: interaction.channel.id
        });

        if (!ticket) return;

        ticket.status = "open";
        await ticket.save();

        return interaction.reply("🔓 Ticket reopened.");
      }


      // DELETE TICKET
      if (interaction.customId === "ticket_delete") {

        const ticket = await Ticket.findOne({
          guildId: interaction.guild.id,
          channelId: interaction.channel.id
        });

        if (!ticket) {
          return interaction.reply({
            content: "This is not a ticket.",
            ephemeral: true
          });
        }

        await interaction.reply("Deleting ticket in 5 seconds...");

        const transcriptPath = await buildTranscript(interaction.channel);

        const transcriptFile = new AttachmentBuilder(transcriptPath);

        const transcriptChannel =
          interaction.guild.channels.cache.get(ticketConfig.transcriptChannelId) ||
          interaction.guild.channels.cache.get(ticketConfig.logChannelId);

        if (transcriptChannel) {
          await transcriptChannel.send({
            content: `Transcript for ticket #${ticket.ticketNumber}`,
            files: [transcriptFile]
          });
        }

        ticket.status = "deleted";
        await ticket.save();

        setTimeout(() => {
          interaction.channel.delete();
        }, 5000);
      }
    }


    // -------------------------
    // MODAL SUBMIT
    // -------------------------
    if (interaction.type === 5 && interaction.customId.startsWith("ticket_modal_")) {

      const categoryKey = interaction.customId.replace("ticket_modal_", "");
      const config = ticketConfig.categories[categoryKey];

      const existing = await Ticket.findOne({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        categoryKey,
        status: "open"
      });

      if (existing) {
        const channel = interaction.guild.channels.cache.get(existing.channelId);

        return interaction.reply({
          content: `You already have an open ticket: ${channel}`,
          ephemeral: true
        });
      }

      const answers = config.questions.map(q => ({
        label: q.label,
        answer: interaction.fields.getTextInputValue(q.id)
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
            PermissionFlagsBits.SendMessages
          ]
        }

      ];


      for (const roleId of ticketConfig.staffRoleIds) {

        permissionOverwrites.push({
          id: roleId,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages
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
        categoryKey
      });


      const embed = new EmbedBuilder()
        .setTitle(config.modalTitle)
        .setDescription("Support will be with you shortly.")
        .addFields(
          answers.map(a => ({
            name: a.label,
            value: a.answer
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


      const staffMentions = ticketConfig.staffRoleIds.map(r => `<@&${r}>`).join(" ");


      await channel.send({
        content: `${interaction.user} ${staffMentions}`,
        embeds: [embed],
        components: [row]
      });


      const logChannel = interaction.guild.channels.cache.get(ticketConfig.logChannelId);

      if (logChannel) {

        await logChannel.send(
          `📩 Ticket opened: ${channel} | User: ${interaction.user.tag} | Ticket #${ticket.ticketNumber}`
        );

      }


      return interaction.reply({
        content: `Your ticket has been created: ${channel}`,
        ephemeral: true
      });
    }
  }
};
