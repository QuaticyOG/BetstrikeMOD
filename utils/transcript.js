const fs = require("fs");
const path = require("path");

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function buildTranscript(channel) {
  const messages = [];
  let lastId;

  while (true) {
    const fetched = await channel.messages.fetch({ limit: 100, before: lastId });
    if (!fetched.size) break;

    messages.push(...fetched.values());
    lastId = fetched.last().id;

    if (fetched.size < 100) break;
  }

  messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Transcript - ${channel.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #36393f;
      color: #dcddde;
      padding: 20px;
    }
    .header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #4f545c;
    }
    .message {
      margin-bottom: 16px;
      padding: 10px;
      background: #2f3136;
      border-radius: 8px;
    }
    .author {
      font-weight: bold;
      color: #ffffff;
    }
    .timestamp {
      color: #b9bbbe;
      font-size: 12px;
      margin-left: 8px;
    }
    .content {
      margin-top: 6px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .attachment {
      margin-top: 8px;
    }
    a {
      color: #00b0f4;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>Transcript for #${escapeHtml(channel.name)}</h2>
    <p>Generated at ${new Date().toISOString()}</p>
  </div>

  ${messages.map(msg => {
    const attachments = [...msg.attachments.values()]
      .map(att => `<div class="attachment">Attachment: <a href="${att.url}">${escapeHtml(att.name || "file")}</a></div>`)
      .join("");

    return `
      <div class="message">
        <div>
          <span class="author">${escapeHtml(msg.author.tag)}</span>
          <span class="timestamp">${new Date(msg.createdTimestamp).toLocaleString()}</span>
        </div>
        <div class="content">${escapeHtml(msg.content || "[No text content]")}</div>
        ${attachments}
      </div>
    `;
  }).join("")}
</body>
</html>`;

  const dir = path.join(process.cwd(), "transcripts");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${channel.id}.html`);
  fs.writeFileSync(filePath, html, "utf8");

  return filePath;
}

module.exports = { buildTranscript };
