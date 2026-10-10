const db = require("../db/database");
const MidtransPaymentAdapter = require("./midtrans.adapter");
const MockPaymentAdapter = require("./mock.adapter");

function getPaymentAdapter(overrideProvider = null) {
  let provider = overrideProvider;
  let midtransConfig = {
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true"
  };

  try {
    const settingRow = db.prepare("SELECT value FROM cafe_settings WHERE key = 'payment_config'").get();
    if (settingRow && settingRow.value) {
      const cfg = JSON.parse(settingRow.value);
      if (!provider) {
        provider = cfg.active_provider;
      }
      if (cfg.midtrans) {
        if (cfg.midtrans.server_key) midtransConfig.serverKey = cfg.midtrans.server_key;
        if (cfg.midtrans.client_key) midtransConfig.clientKey = cfg.midtrans.client_key;
        if (cfg.midtrans.is_production !== undefined) midtransConfig.isProduction = cfg.midtrans.is_production;
      }
    }
  } catch (err) {
    console.error("Error reading payment config from database:", err.message);
  }

  // Fallback if not configured
  provider = provider || process.env.PAYMENT_PROVIDER || "MOCK_SANDBOX";

  if (provider === "MIDTRANS") {
    return new MidtransPaymentAdapter(midtransConfig);
  }

  // Default to Mock Sandbox Adapter for test & dry-run safety
  return new MockPaymentAdapter();
}

module.exports = {
  getPaymentAdapter,
  MidtransPaymentAdapter,
  MockPaymentAdapter
};
