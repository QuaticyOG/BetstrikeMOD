const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Warning = require('../models/Warning');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user', true);
    const warnings = await Warning.find({ guildId: interaction.guild.id, userId: user.id }).sort({ createdAt: -1 }).limit(10);

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle(`Warnings | ${user.tag}`)
      .setDescription(warnings.length
        ? warnings.map((warn, index) => `**${index + 1}.** ${warn.reason}\nBy: <@${warn.moderatorId}> • <t:${Math.floor(warn.createdAt.getTime() / 1000)}:R>`).join('\n\n')
        : 'No warnings found.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
