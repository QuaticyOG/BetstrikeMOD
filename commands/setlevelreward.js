const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevelreward')
    .setDescription('Set a role reward for a level.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addIntegerOption((option) => option.setName('level').setDescription('Level').setRequired(true).setMinValue(1))
    .addRoleOption((option) => option.setName('role').setDescription('Role').setRequired(true)),
  async execute(client, interaction) {
    const level = interaction.options.getInteger('level', true);
    const role = interaction.options.getRole('role', true);
    const config = await GuildConfig.findOneAndUpdate({ guildId: interaction.guild.id }, {}, { upsert: true, new: true });
    config.levelRewards = config.levelRewards.filter((reward) => reward.level !== level);
    config.levelRewards.push({ level, roleId: role.id });
    await config.save();

    await interaction.reply({ content: `Level reward set: level **${level}** => ${role}.`, ephemeral: true });
  }
};
