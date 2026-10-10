const SENSITIVE_KEYS = [
  "password",
  "password_hash",
  "server_key",
  "serverKey",
  "client_key",
  "clientKey",
  "authorization",
  "secret",
  "token",
  "signature_key",
  "signature",
  "pin",
  "card_number"
];

function redactSensitiveData(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveData);

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()));
    if (isSensitive) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = redactSensitiveData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

const logger = {
  info: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] [INFO] ${msg}`, JSON.stringify(redactSensitiveData(data)));
    } else {
      console.log(`[${timestamp}] [INFO] ${msg}`);
    }
  },
  warn: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.warn(`[${timestamp}] [WARN] ${msg}`, JSON.stringify(redactSensitiveData(data)));
    } else {
      console.warn(`[${timestamp}] [WARN] ${msg}`);
    }
  },
  error: (msg, data = null) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.error(`[${timestamp}] [ERROR] ${msg}`, JSON.stringify(redactSensitiveData(data)));
    } else {
      console.error(`[${timestamp}] [ERROR] ${msg}`);
    }
  }
};

module.exports = {
  logger,
  redactSensitiveData
};
