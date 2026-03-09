const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createModLog } = require('../systems/moderation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) => option.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption((option) => option.setName('minutes').setDescription('Timeout duration in minutes').setRequired(true).setMinValue(1).setMaxValue(40320))
    .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(client, interaction) {
    const member = interaction.options.getMember('user');
    const minutes = interaction.options.getInteger('minutes', true);
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    if (!member) return interaction.reply({ content: 'Member not found in this guild.', ephemeral: true });

    await member.timeout(minutes * 60 * 1000, reason);
    await createModLog(interaction.guild, {
      action: 'TIMEOUT',
      targetId: member.id,
      moderatorId: interaction.user.id,
      reason,
      metadata: { minutes }
    });

    await interaction.reply({ content: `⏳ Timed out **${member.user.tag}** for **${minutes}** minute(s).` });
  }
};
