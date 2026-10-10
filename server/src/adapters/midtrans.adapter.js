const crypto = require("crypto");
const PaymentProviderInterface = require("./payment-provider.interface");

class MidtransPaymentAdapter extends PaymentProviderInterface {
  constructor(config = {}) {
    super("MIDTRANS");
    this.serverKey = config.serverKey || process.env.MIDTRANS_SERVER_KEY || "";
    this.clientKey = config.clientKey || process.env.MIDTRANS_CLIENT_KEY || "";
    this.isProduction = config.isProduction !== undefined 
      ? config.isProduction 
      : (process.env.MIDTRANS_IS_PRODUCTION === "true");
    
    this.baseUrl = this.isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com";
  }

  _getAuthHeader() {
    if (!this.serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not configured.");
    }
    const token = Buffer.from(`${this.serverKey}:`).toString("base64");
    return `Basic ${token}`;
  }

  /**
   * Create dynamic QRIS transaction via Midtrans Core API
   */
  async createQrisTransaction({ orderId, amount, customerName, items = [], expiryMinutes = 15 }) {
    if (!this.serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not configured on server.");
    }

    const payload = {
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(amount)
      },
      qris: {
        acquirer: "gopay"
      },
      customer_details: {
        first_name: customerName || "Pelanggan Ruang Namu"
      },
      item_details: items.map(item => ({
        id: String(item.productId || item.id),
        price: Math.round(item.price),
        quantity: item.quantity,
        name: (item.productName || item.name || "Menu").substring(0, 50)
      })),
      custom_expiry: {
        expiry_duration: expiryMinutes,
        unit: "minute"
      }
    };

    const response = await fetch(`${this.baseUrl}/v2/charge`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": this._getAuthHeader()
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || (data.status_code && data.status_code !== "201" && data.status_code !== "200")) {
      const msg = data.status_message || data.message || "Failed to create Midtrans QRIS charge";
      throw new Error(`Midtrans API Error (${data.status_code || response.status}): ${msg}`);
    }

    // Extract dynamic QR string and image URL from Midtrans actions
    let qrString = data.qr_string || "";
    let qrUrl = "";
    if (data.actions && Array.isArray(data.actions)) {
      const qrAction = data.actions.find(a => a.name === "generate-qr-code");
      if (qrAction) {
        qrUrl = qrAction.url;
      }
    }

    const expiredAt = data.expiry_time 
      ? new Date(data.expiry_time).toISOString() 
      : new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    return {
      transactionId: data.transaction_id,
      providerReference: data.order_id,
      qrString,
      qrUrl,
      expiredAt,
      rawResponse: data
    };
  }

  /**
   * Check official transaction status directly from Midtrans API
   */
  async checkTransactionStatus(orderId) {
    if (!this.serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY is not configured.");
    }

    const response = await fetch(`${this.baseUrl}/v2/${encodeURIComponent(orderId)}/status`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": this._getAuthHeader()
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Midtrans status error: ${data.status_message || response.statusText}`);
    }

    const midtransStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    let normalizedStatus = "PENDING";
    if (midtransStatus === "settlement" || (midtransStatus === "capture" && fraudStatus === "accept")) {
      normalizedStatus = "PAID";
    } else if (midtransStatus === "expire") {
      normalizedStatus = "EXPIRED";
    } else if (midtransStatus === "cancel") {
      normalizedStatus = "CANCELLED";
    } else if (midtransStatus === "deny") {
      normalizedStatus = "FAILED";
    } else if (midtransStatus === "refund" || midtransStatus === "partial_refund") {
      normalizedStatus = "REFUNDED";
    } else if (midtransStatus === "pending") {
      normalizedStatus = "PENDING";
    }

    return {
      status: normalizedStatus,
      rawStatus: midtransStatus,
      transactionId: data.transaction_id,
      paidAt: (normalizedStatus === "PAID" && data.settlement_time) ? data.settlement_time : null,
      amount: parseInt(data.gross_amount, 10),
      rawResponse: data
    };
  }

  /**
   * Verify authenticity of Midtrans Webhook Notification
   * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
   */
  verifyWebhookSignature({ headers, body }) {
    if (!this.serverKey) {
      return { isValid: false, error: "Server key not configured on server" };
    }

    const { order_id, status_code, gross_amount, signature_key } = body || {};

    if (!signature_key || !order_id || !status_code || !gross_amount) {
      return { isValid: false, error: "Missing required signature fields in webhook payload" };
    }

    const rawInput = `${order_id}${status_code}${gross_amount}${this.serverKey}`;
    const calculatedSignature = crypto.createHash("sha512").update(rawInput).digest("hex");

    if (calculatedSignature.toLowerCase() !== signature_key.toLowerCase()) {
      return { 
        isValid: false, 
        error: "Signature mismatch. Webhook notification rejected as untrusted." 
      };
    }

    return { isValid: true };
  }

  /**
   * Parse Midtrans notification payload
   */
  parseWebhookPayload(body) {
    const { order_id, transaction_id, gross_amount, transaction_status, fraud_status, settlement_time } = body;

    let normalizedStatus = "PENDING";
    if (transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept")) {
      normalizedStatus = "PAID";
    } else if (transaction_status === "expire") {
      normalizedStatus = "EXPIRED";
    } else if (transaction_status === "cancel") {
      normalizedStatus = "CANCELLED";
    } else if (transaction_status === "deny") {
      normalizedStatus = "FAILED";
    } else if (transaction_status === "refund" || transaction_status === "partial_refund") {
      normalizedStatus = "REFUNDED";
    }

    return {
      orderId: order_id,
      transactionId: transaction_id,
      amount: Math.round(parseFloat(gross_amount)),
      status: normalizedStatus,
      eventType: transaction_status,
      paidAt: settlement_time || (normalizedStatus === "PAID" ? new Date().toISOString() : null),
      raw: body
    };
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(orderId, reason = "") {
    const response = await fetch(`${this.baseUrl}/v2/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": this._getAuthHeader()
      }
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.status_message || (response.ok ? "Transaction cancelled" : "Failed to cancel")
    };
  }

  /**
   * Refund transaction
   */
  async refundTransaction(orderId, amount, reason = "Customer request") {
    const response = await fetch(`${this.baseUrl}/v2/${encodeURIComponent(orderId)}/refund`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": this._getAuthHeader()
      },
      body: JSON.stringify({
        refund_key: `ref_${Date.now()}`,
        amount: Math.round(amount),
        reason
      })
    });

    const data = await response.json();
    return {
      success: response.ok,
      message: data.status_message || (response.ok ? "Refund processed" : "Failed to refund")
    };
  }
}

module.exports = MidtransPaymentAdapter;
