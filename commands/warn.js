const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../models/Warning');
const { createModLog } = require('../systems/moderation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) => option.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    await Warning.create({ guildId: interaction.guild.id, userId: user.id, moderatorId: interaction.user.id, reason });
    await createModLog(interaction.guild, {
      action: 'WARN',
      targetId: user.id,
      moderatorId: interaction.user.id,
      reason
    });

    await interaction.reply({ content: `⚠️ Warned **${user.tag}**.` });
  }
};
