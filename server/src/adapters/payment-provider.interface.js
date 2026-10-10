/**
 * Payment Provider Interface
 * All payment adapters (Midtrans, Mock, etc.) must implement this contract.
 */
class PaymentProviderInterface {
  constructor(name) {
    this.name = name;
  }

  /**
   * Create dynamic QRIS payment transaction
   * @param {Object} params { orderId, amount, customerName, items, expiryMinutes }
   * @returns {Promise<{ transactionId, providerReference, qrString, qrUrl, expiredAt, rawResponse }>}
   */
  async createQrisTransaction(params) {
    throw new Error("Method createQrisTransaction() must be implemented.");
  }

  /**
   * Check official transaction status from provider API
   * @param {string} providerReference Or orderId
   * @returns {Promise<{ status: 'PENDING'|'PAID'|'EXPIRED'|'FAILED'|'CANCELLED'|'REFUNDED', rawStatus, transactionId, paidAt }>}
   */
  async checkTransactionStatus(providerReference) {
    throw new Error("Method checkTransactionStatus() must be implemented.");
  }

  /**
   * Verify authenticity of webhook notification
   * @param {Object} req { headers, body }
   * @returns {{ isValid: boolean, error?: string }}
   */
  verifyWebhookSignature(req) {
    throw new Error("Method verifyWebhookSignature() must be implemented.");
  }

  /**
   * Parse webhook payload into standardized format
   * @param {Object} body
   * @returns {{ orderId, transactionId, amount, status, eventType, raw }}
   */
  parseWebhookPayload(body) {
    throw new Error("Method parseWebhookPayload() must be implemented.");
  }

  /**
   * Cancel transaction at provider
   * @param {string} providerReference
   * @param {string} reason
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async cancelTransaction(providerReference, reason) {
    throw new Error("Method cancelTransaction() must be implemented.");
  }

  /**
   * Refund transaction at provider
   * @param {string} providerReference
   * @param {number} amount
   * @param {string} reason
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async refundTransaction(providerReference, amount, reason) {
    throw new Error("Method refundTransaction() must be implemented.");
  }
}

module.exports = PaymentProviderInterface;
