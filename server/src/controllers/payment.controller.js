const PaymentService = require("../services/payment.service");
const { getPaymentAdapter } = require("../adapters");
const db = require("../db/database");
const { logger } = require("../utils/logger");

class PaymentController {
  /**
   * POST /api/payments/create
   */
  static async createPayment(req, res) {
    try {
      const { order_id, provider } = req.body;
      if (!order_id) {
        return res.status(400).json({ success: false, message: "order_id wajib disertakan." });
      }

      const payment = await PaymentService.createPayment({
        orderId: order_id,
        providerName: provider || null
      });

      return res.status(201).json({
        success: true,
        message: "Transaksi pembayaran QRIS berhasil dibuat.",
        data: payment
      });
    } catch (err) {
      logger.error("Failed to create payment", err);
      return res.status(400).json({ success: false, message: err.message || "Gagal membuat pembayaran." });
    }
  }

  /**
   * GET /api/payments/:paymentId/status
   */
  static async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const statusData = await PaymentService.checkPaymentStatus(paymentId);
      return res.json({ success: true, data: statusData });
    } catch (err) {
      logger.error("Failed to check payment status", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/webhooks/payments/:provider
   */
  static async handleWebhook(req, res) {
    const { provider } = req.params;
    try {
      const result = await PaymentService.handleWebhook(provider, req);
      return res.status(200).json(result);
    } catch (err) {
      logger.error(`Webhook processing failed for ${provider}`, err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/payments/:paymentId/cancel
   */
  static async cancelPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { reason = "Dibatalkan oleh staf" } = req.body;

      const payment = db.prepare("SELECT * FROM payments WHERE payment_id = ?").get(paymentId);
      if (!payment) return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan." });

      const adapter = getPaymentAdapter(payment.provider);
      const cancelResult = await adapter.cancelTransaction(payment.provider_reference || payment.transaction_id, reason);

      if (cancelResult.success) {
        db.prepare("UPDATE payments SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(payment.id);
        db.prepare("UPDATE orders SET payment_status = 'CANCELLED', status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(payment.order_id);
      }

      return res.json({ success: cancelResult.success, message: cancelResult.message });
    } catch (err) {
      logger.error("Failed to cancel payment", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/payments/:paymentId/refund
   */
  static async refundPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount, reason = "Pengembalian dana" } = req.body;

      const payment = db.prepare("SELECT * FROM payments WHERE payment_id = ?").get(paymentId);
      if (!payment) return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan." });

      if (payment.status !== "PAID") {
        return res.status(400).json({ success: false, message: "Hanya pembayaran berstatus PAID yang dapat direfund." });
      }

      const refundAmount = amount ? parseInt(amount, 10) : payment.amount;
      const adapter = getPaymentAdapter(payment.provider);
      const refundResult = await adapter.refundTransaction(payment.provider_reference || payment.transaction_id, refundAmount, reason);

      if (refundResult.success) {
        db.prepare("UPDATE payments SET status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(payment.id);
        db.prepare("UPDATE orders SET payment_status = 'REFUNDED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(payment.order_id);

        db.prepare(`
          INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
          VALUES (?, 'REFUND_PAYMENT', 'payments', ?, ?)
        `).run(req.user ? req.user.id : null, paymentId, `Refund: ${refundAmount}, Reason: ${reason}`);
      }

      return res.json({ success: refundResult.success, message: refundResult.message });
    } catch (err) {
      logger.error("Failed to refund payment", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/payments/cash
   * Process cash payment by cashier
   */
  static async processCash(req, res) {
    try {
      const { order_id, cash_received } = req.body;
      if (!order_id || !cash_received) {
        return res.status(400).json({ success: false, message: "order_id dan cash_received wajib diisi." });
      }

      const result = PaymentService.processCashPayment({
        orderId: order_id,
        cashReceived: cash_received,
        cashierId: req.user.id
      });

      return res.json({
        success: true,
        message: "Pembayaran tunai berhasil diproses.",
        data: result
      });
    } catch (err) {
      logger.error("Failed to process cash payment", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/payments/reconcile
   * Reconcile local transactions with provider status
   */
  static async reconcile(req, res) {
    try {
      const pendingPayments = db.prepare(`
        SELECT p.*, o.order_number 
        FROM payments p
        JOIN orders o ON p.order_id = o.id
        WHERE p.status = 'PENDING' AND p.provider != 'CASH'
        ORDER BY p.id DESC LIMIT 50
      `).all();

      const results = [];
      for (const p of pendingPayments) {
        try {
          const status = await PaymentService.checkPaymentStatus(p.payment_id);
          results.push({ paymentId: p.payment_id, orderNumber: p.order_number, oldStatus: p.status, newStatus: status.status });
        } catch (e) {
          results.push({ paymentId: p.payment_id, orderNumber: p.order_number, error: e.message });
        }
      }

      return res.json({
        success: true,
        message: `Rekonsiliasi selesai untuk ${results.length} transaksi pending.`,
        data: results
      });
    } catch (err) {
      logger.error("Reconciliation error", err);
      return res.status(500).json({ success: false, message: "Gagal menjalankan rekonsiliasi: " + err.message });
    }
  }
}

module.exports = PaymentController;
