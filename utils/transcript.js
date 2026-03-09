function buildTranscript(channel, messages) {
  const header = [
    `Transcript for #${channel.name}`,
    `Channel ID: ${channel.id}`,
    `Generated At: ${new Date().toISOString()}`,
    '----------------------------------------'
  ].join('\n');

  const body = messages
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map((message) => {
      const attachments = message.attachments.map((a) => a.url).join(', ');
      return `[${new Date(message.createdTimestamp).toISOString()}] ${message.author?.tag || 'Unknown'}: ${message.content || '[no content]'}${attachments ? ` | attachments: ${attachments}` : ''}`;
    })
    .join('\n');

  return `${header}\n${body || 'No messages found.'}`;
}

module.exports = { buildTranscript };
