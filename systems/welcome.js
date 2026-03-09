const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

function renderTemplate(template, member) {
  return template
    .replaceAll('{user}', `<@${member.id}>`)
    .replaceAll('{userTag}', member.user.tag)
    .replaceAll('{server}', member.guild.name);
}

async function handleJoin(member) {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  if (!config) return;

  if (config.autoRoleId) {
    const role = member.guild.roles.cache.get(config.autoRoleId);
    if (role) await member.roles.add(role).catch(() => null);
  }

  if (config.welcomeChannelId) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (channel) {
      const content = renderTemplate(config.welcomeMessage, member);
      if (config.welcomeEmbedEnabled) {
        const embed = new EmbedBuilder().setColor('#57F287').setTitle('Welcome!').setDescription(content).setTimestamp();
        await channel.send({ embeds: [embed] }).catch(() => null);
      } else {
        await channel.send({ content }).catch(() => null);
      }
    }
  }
}

async function handleLeave(member) {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  if (!config?.leaveChannelId) return;

  const channel = member.guild.channels.cache.get(config.leaveChannelId);
  if (!channel) return;

  const content = renderTemplate(config.leaveMessage, member);
  if (config.leaveEmbedEnabled) {
    const embed = new EmbedBuilder().setColor('#ED4245').setTitle('Member Left').setDescription(content).setTimestamp();
    await channel.send({ embeds: [embed] }).catch(() => null);
  } else {
    await channel.send({ content }).catch(() => null);
  }
}

module.exports = { handleJoin, handleLeave };
