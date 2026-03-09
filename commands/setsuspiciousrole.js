const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setsuspiciousrole')
    .setDescription('Set the role assigned to suspicious accounts.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) => option.setName('role').setDescription('Suspicious role').setRequired(true)),
  async execute(client, interaction) {
    const role = interaction.options.getRole('role', true);
    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { suspiciousRoleId: role.id },
      { upsert: true }
    );
    await interaction.reply({ content: `Suspicious account role set to ${role}.`, ephemeral: true });
  }
};
