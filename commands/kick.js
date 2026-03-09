const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createModLog } = require('../systems/moderation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) => option.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(client, interaction) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    if (!member) return interaction.reply({ content: 'Member not found in this guild.', ephemeral: true });

    await member.kick(reason);
    await createModLog(interaction.guild, {
      action: 'KICK',
      targetId: member.id,
      moderatorId: interaction.user.id,
      reason
    });

    await interaction.reply({ content: `👢 Kicked **${member.user.tag}**.` });
  }
};
