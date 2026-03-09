const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createModLog } = require('../systems/moderation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of recent messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) => option.setName('amount').setDescription('Amount to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)),
  async execute(client, interaction) {
    const amount = interaction.options.getInteger('amount', true);
    await interaction.channel.bulkDelete(amount, true);
    await createModLog(interaction.guild, {
      action: 'CLEAR',
      targetId: interaction.channel.id,
      moderatorId: interaction.user.id,
      reason: `Cleared ${amount} messages`,
      metadata: { amount, channelId: interaction.channel.id }
    });
    await interaction.reply({ content: `🧹 Deleted **${amount}** messages.`, ephemeral: true });
  }
};
