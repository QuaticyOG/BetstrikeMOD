const timestamp = () => new Date().toISOString();

const logger = {
  info: (message) => console.log(`[INFO] ${timestamp()} ${message}`),
  warn: (message) => console.warn(`[WARN] ${timestamp()} ${message}`),
  error: (message) => console.error(`[ERROR] ${timestamp()} ${message}`)
};

module.exports = { logger };
