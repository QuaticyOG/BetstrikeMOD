module.exports = {
  embedColor: process.env.DEFAULT_EMBED_COLOR || '#5865F2',
  prefix: process.env.DEFAULT_PREFIX || '/',
  suspiciousRoleName: 'Suspicious Account',
  ticketCategoryName: 'Tickets',
  ticketTranscriptChannelFallbackName: 'ticket-transcripts',
  modLogFallbackName: 'mod-logs',
  maxMessageXp: 20,
  minMessageXp: 10,
  xpCooldownMs: 60_000,
  altDetectionThresholds: ['suspicious', 'highly-suspicious', 'mega-suspicious']
};
