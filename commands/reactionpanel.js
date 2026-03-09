const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createReactionRolePanel } = require('../systems/reactionRoles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionpanel')
    .setDescription('Create a reaction role panel with up to 3 roles.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption((option) => option.setName('title').setDescription('Panel title').setRequired(true))
    .addStringOption((option) => option.setName('description').setDescription('Panel description').setRequired(true))
    .addStringOption((option) => option.setName('emoji1').setDescription('Emoji 1').setRequired(true))
    .addRoleOption((option) => option.setName('role1').setDescription('Role 1').setRequired(true))
    .addStringOption((option) => option.setName('emoji2').setDescription('Emoji 2').setRequired(false))
    .addRoleOption((option) => option.setName('role2').setDescription('Role 2').setRequired(false))
    .addStringOption((option) => option.setName('emoji3').setDescription('Emoji 3').setRequired(false))
    .addRoleOption((option) => option.setName('role3').setDescription('Role 3').setRequired(false)),
  async execute(client, interaction) {
    const mappings = [1, 2, 3]
      .map((index) => ({
        emoji: interaction.options.getString(`emoji${index}`),
        roleId: interaction.options.getRole(`role${index}`)?.id
      }))
      .filter((entry) => entry.emoji && entry.roleId);

    await createReactionRolePanel(
      client,
      interaction.channel,
      interaction.options.getString('title', true),
      interaction.options.getString('description', true),
      mappings
    );

    await interaction.reply({ content: 'Reaction role panel created.', ephemeral: true });
  }
};
