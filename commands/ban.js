const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createModLog } = require('../systems/moderation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    await interaction.guild.members.ban(user.id, { reason });
    await createModLog(interaction.guild, {
      action: 'BAN',
      targetId: user.id,
      moderatorId: interaction.user.id,
      reason
    });

    await interaction.reply({ content: `🔨 Banned **${user.tag}**.` });
  }
};
