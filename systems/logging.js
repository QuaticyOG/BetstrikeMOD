const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

async function sendLog(guild, title, description, color = '#5865F2') {
  const config = await GuildConfig.findOne({ guildId: guild.id });
  const channelId = config?.logChannelId || config?.modLogChannelId;
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = { sendLog };
