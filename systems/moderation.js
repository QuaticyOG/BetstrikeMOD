const ModLog = require('../models/ModLog');
const GuildConfig = require('../models/GuildConfig');
const { EmbedBuilder } = require('discord.js');

async function createModLog(guild, data) {
  await ModLog.create({ guildId: guild.id, ...data });

  const config = await GuildConfig.findOne({ guildId: guild.id });
  if (!config?.modLogChannelId) return;

  const channel = guild.channels.cache.get(config.modLogChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle(`Moderation | ${data.action}`)
    .addFields(
      { name: 'Target', value: `<@${data.targetId}> (${data.targetId})`, inline: false },
      { name: 'Moderator', value: `<@${data.moderatorId}>`, inline: true },
      { name: 'Reason', value: data.reason || 'No reason provided.', inline: true }
    )
    .setTimestamp();

  if (data.metadata && Object.keys(data.metadata).length) {
    embed.addFields({ name: 'Metadata', value: `\`${JSON.stringify(data.metadata)}\``.slice(0, 1024), inline: false });
  }

  await channel.send({ embeds: [embed] }).catch(() => null);
}

module.exports = { createModLog };
