const { AltDetector } = require('discord-alt-detector');
const GuildConfig = require('../models/GuildConfig');
const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('./logging');

function initAltDetector() {
  return new AltDetector({
    ageWeight: 1,
    statusWeight: 1,
    activityWeight: 1,
    usernameWordsWeight: 1,
    usernameSymbolsWeight: 1,
    displaynameWordsWeight: 1,
    displaynameCapsWeight: 1,
    displaynameSymbolsWeight: 1,
    flagsWeight: 1,
    boosterWeight: 1,
    pfpWeight: 1,
    bannerWeight: 1,
    customWeight: 1
  }, (member) => {
    if (member.user.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24 * 7) return 2;
    return 0;
  });
}

async function runAltDetection(client, member) {
  const config = await GuildConfig.findOne({ guildId: member.guild.id });
  const result = await client.altDetector.check(member);
  const category = client.altDetector.getCategory(result);

  if (!client.config.altDetectionThresholds.includes(category)) return { result, category, suspicious: false };

  const alertChannelId = config?.suspiciousAlertChannelId || config?.modLogChannelId;
  const alertChannel = alertChannelId ? member.guild.channels.cache.get(alertChannelId) : null;

  if (config?.suspiciousRoleId) {
    const role = member.guild.roles.cache.get(config.suspiciousRoleId);
    if (role) await member.roles.add(role).catch(() => null);
  }

  const embed = new EmbedBuilder()
    .setColor('#FAA61A')
    .setTitle('Suspicious account detected')
    .setDescription(`${member} triggered the alt detection system.`)
    .addFields(
      { name: 'Trust category', value: category, inline: true },
      { name: 'Trust score', value: String(result.total), inline: true },
      { name: 'Account age', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setTimestamp();

  if (alertChannel) await alertChannel.send({ embeds: [embed] }).catch(() => null);
  await sendLog(member.guild, 'ALT Detector', `${member.user.tag} flagged as **${category}** with a score of **${result.total}**.`, '#FAA61A');

  return { result, category, suspicious: true };
}

module.exports = { initAltDetector, runAltDetection };
