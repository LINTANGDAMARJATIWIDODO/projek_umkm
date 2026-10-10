const crypto = require("crypto");
const QRCode = require("qrcode");
const PaymentProviderInterface = require("./payment-provider.interface");

/**
 * Mock Payment Adapter - STRICTLY FOR AUTOMATED TESTING & SANDBOX DEMO
 * Explicitly transparent: Does NOT claim to process real money.
 */
class MockPaymentAdapter extends PaymentProviderInterface {
  constructor(config = {}) {
    super("MOCK_SANDBOX");
    this.mockSecret = config.mockSecret || "mock_sandbox_secret_key_testing_only";
    this.isProduction = false;
  }

  async createQrisTransaction({ orderId, amount, customerName, expiryMinutes = 15 }) {
    const transactionId = `MOCK-TX-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const expiredAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
    
    // Generate simulated EMVCo QRIS test payload
    const qrString = `00020101021226610014ID.LINKAJA.WWW01189360000201100000000215000000000000000520458125303360540${amount}.005802ID5915CAFE RUANG NAMU6005DEPOK62210117${orderId}6304MOCK`;
    
    // Generate QR Code Data URL for immediate rendering
    const qrUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: {
        dark: "#2C1810",
        light: "#FFFFFF"
      }
    });

    return {
      transactionId,
      providerReference: orderId,
      qrString,
      qrUrl,
      expiredAt,
      isMock: true,
      rawResponse: {
        mode: "MOCK_SANDBOX_TESTING",
        notice: "Ini adalah adapter pengujian sandbox otomatis. Tidak memproses uang nyata.",
        transaction_id: transactionId,
        order_id: orderId,
        gross_amount: amount,
        transaction_status: "pending"
      }
    };
  }

  async checkTransactionStatus(orderId) {
    // By default pending in mock unless explicitly triggered
    return {
      status: "PENDING",
      rawStatus: "pending",
      transactionId: `MOCK-${orderId}`,
      paidAt: null,
      amount: null,
      isMock: true
    };
  }

  /**
   * Verify signature for mock webhook
   * Formula: SHA256(order_id + amount + status + mockSecret)
   */
  verifyWebhookSignature({ headers, body }) {
    const { order_id, gross_amount, transaction_status, signature } = body || {};

    if (!signature || !order_id) {
      return { isValid: false, error: "Missing mock signature or order_id" };
    }

    const expected = crypto
      .createHash("sha256")
      .update(`${order_id}${gross_amount}${transaction_status}${this.mockSecret}`)
      .digest("hex");

    if (signature !== expected) {
      return { isValid: false, error: "Mock signature mismatch" };
    }

    return { isValid: true };
  }

  parseWebhookPayload(body) {
    const { order_id, transaction_id, gross_amount, transaction_status, settlement_time } = body;
    
    let normalizedStatus = "PENDING";
    if (transaction_status === "settlement" || transaction_status === "success") {
      normalizedStatus = "PAID";
    } else if (transaction_status === "expire") {
      normalizedStatus = "EXPIRED";
    } else if (transaction_status === "cancel") {
      normalizedStatus = "CANCELLED";
    } else if (transaction_status === "deny") {
      normalizedStatus = "FAILED";
    }

    return {
      orderId: order_id,
      transactionId: transaction_id || `MOCK-TX-${order_id}`,
      amount: Math.round(parseFloat(gross_amount)),
      status: normalizedStatus,
      eventType: transaction_status,
      paidAt: settlement_time || (normalizedStatus === "PAID" ? new Date().toISOString() : null),
      isMock: true,
      raw: body
    };
  }

  async cancelTransaction(orderId, reason = "") {
    return {
      success: true,
      message: `Mock transaction ${orderId} cancelled`
    };
  }

  async refundTransaction(orderId, amount, reason = "") {
    return {
      success: true,
      message: `Mock refund ${amount} for ${orderId} completed`
    };
  }

  // Utility to generate valid signature for automated tests
  generateTestSignature(orderId, amount, status) {
    return crypto
      .createHash("sha256")
      .update(`${orderId}${amount}${status}${this.mockSecret}`)
      .digest("hex");
  }
}

module.exports = MockPaymentAdapter;
