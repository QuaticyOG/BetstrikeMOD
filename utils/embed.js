const { EmbedBuilder } = require('discord.js');

function createEmbed(client, data = {}) {
  return new EmbedBuilder()
    .setColor(data.color || client.config.embedColor)
    .setTitle(data.title || null)
    .setDescription(data.description || null)
    .setFooter(data.footer ? { text: data.footer } : null)
    .setTimestamp(data.timestamp === false ? null : new Date());
}

module.exports = { createEmbed };
