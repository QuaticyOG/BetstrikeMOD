const { EmbedBuilder } = require('discord.js');
const ReactionRole = require('../models/ReactionRole');

async function createReactionRolePanel(client, channel, title, description, mappings) {
  const embed = new EmbedBuilder()
    .setColor(client.config.embedColor)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  for (const map of mappings) {
    embed.addFields({ name: map.emoji, value: `<@&${map.roleId}>`, inline: true });
  }

  const message = await channel.send({ embeds: [embed] });
  for (const map of mappings) {
    await message.react(map.emoji).catch(() => null);
  }

  await ReactionRole.create({
    guildId: channel.guild.id,
    channelId: channel.id,
    messageId: message.id,
    title,
    description,
    roles: mappings
  });

  return message;
}

async function syncReactionRole(reaction, user, shouldAdd) {
  const panel = await ReactionRole.findOne({ messageId: reaction.message.id });
  if (!panel || user.bot) return;

  const roleMap = panel.roles.find((r) => r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.name);
  if (!roleMap) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id).catch(() => null);
  const role = guild.roles.cache.get(roleMap.roleId);
  if (!member || !role) return;

  if (shouldAdd) await member.roles.add(role).catch(() => null);
  else await member.roles.remove(role).catch(() => null);
}

module.exports = { createReactionRolePanel, syncReactionRole };
