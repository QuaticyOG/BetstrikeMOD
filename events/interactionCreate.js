const { openTicket, closeTicket, deleteTicket } = require('../systems/tickets');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(client, interaction);
      } catch (error) {
        console.error(error);
        const payload = { content: 'There was an error while executing this command.', ephemeral: true };
        if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => null);
        else await interaction.reply(payload).catch(() => null);
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'ticket:create') return openTicket(client, interaction);
      if (interaction.customId === 'ticket:close') return closeTicket(interaction);
      if (interaction.customId === 'ticket:delete') return deleteTicket(interaction);
    }
  }
};
