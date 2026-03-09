const UserLevel = require('../models/UserLevel');
const GuildConfig = require('../models/GuildConfig');
const { logger } = require('../utils/logger');

function getLevelFromXp(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

async function awardXp(client, message) {
  if (!message.guild || message.author.bot) return;

  const now = new Date();
  const min = client.config.minMessageXp;
  const max = client.config.maxMessageXp;
  const gainedXp = Math.floor(Math.random() * (max - min + 1)) + min;

  let userLevel = await UserLevel.findOne({ guildId: message.guild.id, userId: message.author.id });
  if (!userLevel) {
    userLevel = await UserLevel.create({ guildId: message.guild.id, userId: message.author.id });
  }

  if (now - userLevel.lastXpAt < client.config.xpCooldownMs) return;

  userLevel.xp += gainedXp;
  userLevel.lastXpAt = now;

  const newLevel = getLevelFromXp(userLevel.xp);
  const leveledUp = newLevel > userLevel.level;
  userLevel.level = newLevel;
  await userLevel.save();

  if (!leveledUp) return;

  await message.channel.send({ content: `🎉 ${message.author}, you reached **level ${newLevel}**!` }).catch(() => null);

  const config = await GuildConfig.findOne({ guildId: message.guild.id });
  const rewards = config?.levelRewards || [];
  const reward = rewards.find((entry) => entry.level === newLevel);

  if (reward) {
    const role = message.guild.roles.cache.get(reward.roleId);
    if (role) {
      await message.member.roles.add(role).catch((error) => logger.warn(`Failed to add level reward role: ${error.message}`));
    }
  }
}

module.exports = { awardXp, getLevelFromXp };
