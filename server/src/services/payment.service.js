const crypto = require("crypto");
const db = require("../db/database");
const { getPaymentAdapter } = require("../adapters");
const { logger } = require("../utils/logger");

class PaymentService {
  /**
   * Create dynamic QRIS payment transaction for an order
   */
  static async createPayment({ orderId, providerName = null }) {
    const order = db.prepare(`
      SELECT o.*, t.table_number 
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE o.id = ?
    `).get(orderId);

    if (!order) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    if (order.payment_status === "PAID") {
      throw new Error("Pesanan ini sudah dibayar.");
    }

    // Check if there is already an active pending payment
    const existingPayment = db.prepare(`
      SELECT * FROM payments 
      WHERE order_id = ? AND status = 'PENDING'
      ORDER BY id DESC LIMIT 1
    `).get(orderId);

    if (existingPayment && existingPayment.qr_string) {
      const now = new Date();
      const expiry = new Date(existingPayment.expired_at);
      if (expiry > now) {
        return existingPayment;
      }
    }

    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
    const adapter = getPaymentAdapter(providerName);

    logger.info(`Creating QRIS payment with adapter: ${adapter.name}`, { orderId: order.order_number, amount: order.total });

    const qrisResult = await adapter.createQrisTransaction({
      orderId: order.order_number,
      amount: order.total,
      customerName: order.customer_name,
      items: items.map(i => ({
        id: i.product_id,
        name: i.product_name,
        price: i.price,
        quantity: i.quantity
      })),
      expiryMinutes: 15
    });

    const paymentId = `PAY-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    const insertPayment = db.prepare(`
      INSERT INTO payments (
        payment_id, order_id, provider, payment_type, transaction_id,
        provider_reference, amount, currency, status, qr_string, qr_url,
        expired_at, raw_response
      ) VALUES (?, ?, ?, 'qris', ?, ?, ?, 'IDR', 'PENDING', ?, ?, ?, ?)
    `);

    insertPayment.run(
      paymentId,
      order.id,
      adapter.name,
      qrisResult.transactionId,
      qrisResult.providerReference || order.order_number,
      order.total,
      qrisResult.qrString,
      qrisResult.qrUrl,
      qrisResult.expiredAt,
      JSON.stringify(qrisResult.rawResponse || {})
    );

    return {
      paymentId,
      orderId: order.id,
      orderNumber: order.order_number,
      amount: order.total,
      provider: adapter.name,
      qrString: qrisResult.qrString,
      qrUrl: qrisResult.qrUrl,
      expiredAt: qrisResult.expiredAt,
      status: "PENDING"
    };
  }

  /**
   * Check official payment status from provider
   */
  static async checkPaymentStatus(paymentIdOrOrderId) {
    let payment = db.prepare("SELECT * FROM payments WHERE payment_id = ?").get(paymentIdOrOrderId);
    if (!payment) {
      payment = db.prepare("SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1").get(paymentIdOrOrderId);
    }

    if (!payment) {
      throw new Error("Data pembayaran tidak ditemukan.");
    }

    if (payment.status === "PAID") {
      return {
        paymentId: payment.payment_id,
        orderId: payment.order_id,
        status: "PAID",
        paidAt: payment.paid_at,
        amount: payment.amount,
        provider: payment.provider
      };
    }

    // Query status from provider API
    const adapter = getPaymentAdapter(payment.provider);
    try {
      const providerStatus = await adapter.checkTransactionStatus(payment.provider_reference || payment.transaction_id);

      if (providerStatus.status === "PAID" && payment.status !== "PAID") {
        this._markPaymentPaidTransactional(payment.id, providerStatus.transactionId, providerStatus.paidAt);
      } else if (providerStatus.status === "EXPIRED" && payment.status !== "EXPIRED") {
        this._markPaymentExpiredTransactional(payment.id);
      }

      const updated = db.prepare("SELECT * FROM payments WHERE id = ?").get(payment.id);
      return {
        paymentId: updated.payment_id,
        orderId: updated.order_id,
        status: updated.status,
        paidAt: updated.paid_at,
        amount: updated.amount,
        provider: updated.provider
      };
    } catch (err) {
      logger.error(`Error checking provider status for payment ${payment.payment_id}`, err.message);
      return {
        paymentId: payment.payment_id,
        orderId: payment.order_id,
        status: payment.status,
        paidAt: payment.paid_at,
        amount: payment.amount,
        provider: payment.provider,
        warning: "Gagal menyinkronkan dengan provider saat ini: " + err.message
      };
    }
  }

  /**
   * Handle Webhook from payment provider
   */
  static async handleWebhook(providerName, req) {
    const adapter = getPaymentAdapter(providerName.toUpperCase());

    logger.info(`Received webhook for provider: ${providerName}`, {
      path: req.originalUrl,
      ip: req.ip
    });

    // 1. Verify Signature
    const sigCheck = adapter.verifyWebhookSignature({
      headers: req.headers,
      body: req.body
    });

    const parsed = adapter.parseWebhookPayload(req.body);

    if (!sigCheck.isValid) {
      logger.error(`Invalid webhook signature for ${providerName}: ${sigCheck.error}`, { payload: req.body });
      db.prepare(`
        INSERT INTO payment_events (payment_id, provider, event_type, transaction_id, payload, signature, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, 'INVALID', ?)
      `).run(
        parsed.orderId || "UNKNOWN",
        providerName,
        parsed.eventType || "UNKNOWN",
        parsed.transactionId || null,
        JSON.stringify(req.body),
        req.body.signature_key || req.body.signature || "",
        sigCheck.error
      );
      throw new Error(`Signature verification failed: ${sigCheck.error}`);
    }

    // 2. Idempotency Check: Have we already processed this exact event?
    const existingEvent = db.prepare(`
      SELECT * FROM payment_events 
      WHERE transaction_id = ? AND event_type = ? AND status = 'PROCESSED'
    `).get(parsed.transactionId, parsed.eventType);

    if (existingEvent) {
      logger.info(`Webhook event already processed (idempotent skip)`, { tx: parsed.transactionId });
      db.prepare(`
        INSERT INTO payment_events (payment_id, provider, event_type, transaction_id, payload, signature, status)
        VALUES (?, ?, ?, ?, ?, ?, 'IGNORED')
      `).run(
        parsed.orderId,
        providerName,
        parsed.eventType,
        parsed.transactionId,
        JSON.stringify(req.body),
        req.body.signature_key || req.body.signature || ""
      );
      return { success: true, idempotent: true, message: "Notification already processed." };
    }

    // 3. Find corresponding order & payment
    const order = db.prepare("SELECT * FROM orders WHERE order_number = ?").get(parsed.orderId);
    if (!order) {
      logger.error(`Webhook received for unknown order: ${parsed.orderId}`);
      throw new Error(`Pesanan dengan ID ${parsed.orderId} tidak ditemukan.`);
    }

    const payment = db.prepare(`
      SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1
    `).get(order.id);

    // 4. Verify amount
    if (parsed.amount && Math.round(parsed.amount) !== Math.round(order.total)) {
      logger.error(`Webhook amount mismatch! Expected: ${order.total}, Received: ${parsed.amount}`);
      throw new Error(`Nominal transaksi tidak cocok. Diharapkan: ${order.total}, Diterima: ${parsed.amount}`);
    }

    // 5. Atomic state update
    const webhookTx = db.transaction(() => {
      const paymentId = payment ? payment.id : 0;

      if (parsed.status === "PAID") {
        this._markPaymentPaidTransactional(paymentId, parsed.transactionId, parsed.paidAt, order.id);
      } else if (parsed.status === "EXPIRED") {
        this._markPaymentExpiredTransactional(paymentId, order.id);
      } else if (parsed.status === "CANCELLED" || parsed.status === "FAILED") {
        db.prepare("UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(parsed.status, paymentId);
        db.prepare("UPDATE orders SET payment_status = ?, status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(parsed.status, order.id);
      }

      // Record successful event
      db.prepare(`
        INSERT INTO payment_events (payment_id, provider, event_type, transaction_id, payload, signature, status)
        VALUES (?, ?, ?, ?, ?, ?, 'PROCESSED')
      `).run(
        parsed.orderId,
        providerName,
        parsed.eventType,
        parsed.transactionId,
        JSON.stringify(req.body),
        req.body.signature_key || req.body.signature || ""
      );
    });

    webhookTx();
    return { success: true, orderId: order.order_number, status: parsed.status };
  }

  /**
   * Cash payment handled directly at cashier
   */
  static processCashPayment({ orderId, cashReceived, cashierId }) {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!order) throw new Error("Pesanan tidak ditemukan.");

    if (order.payment_status === "PAID") {
      throw new Error("Pesanan ini sudah dibayar.");
    }

    const cashAmount = parseInt(cashReceived, 10);
    if (isNaN(cashAmount) || cashAmount < order.total) {
      throw new Error(`Nominal tunai tidak cukup. Total: Rp ${order.total.toLocaleString("id-ID")}, Diterima: Rp ${cashAmount.toLocaleString("id-ID")}`);
    }

    const change = cashAmount - order.total;
    const paymentId = `PAY-CASH-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const cashTx = db.transaction(() => {
      // Insert Cash Payment
      db.prepare(`
        INSERT INTO payments (
          payment_id, order_id, provider, payment_type, transaction_id,
          provider_reference, amount, currency, status, cash_received,
          cash_change, paid_at
        ) VALUES (?, ?, 'CASH', 'cash', ?, ?, ?, 'IDR', 'PAID', ?, ?, CURRENT_TIMESTAMP)
      `).run(
        paymentId,
        order.id,
        paymentId,
        order.order_number,
        order.total,
        cashAmount,
        change
      );

      // Update Order
      db.prepare(`
        UPDATE orders 
        SET payment_status = 'PAID', status = 'PAID', payment_method = 'CASH',
            cashier_id = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(cashierId, order.id);

      // Record history
      db.prepare(`
        INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
        VALUES (?, ?, 'PAID', 'CASHIER', ?)
      `).run(order.id, order.status, `Pembayaran tunai diterima kasir: Rp ${cashAmount}, Kembalian: Rp ${change}`);

      // Record audit log
      db.prepare(`
        INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
        VALUES (?, 'PROCESS_CASH_PAYMENT', 'orders', ?, ?)
      `).run(cashierId, String(order.id), `Cash: ${cashAmount}, Change: ${change}, Total: ${order.total}`);

      return {
        paymentId,
        orderId: order.id,
        orderNumber: order.order_number,
        amount: order.total,
        cashReceived: cashAmount,
        change,
        status: "PAID"
      };
    });

    return cashTx();
  }

  // Internal helper to atomically mark payment as PAID
  static _markPaymentPaidTransactional(paymentDbId, transactionId, paidAt, explicitOrderId = null) {
    const payment = db.prepare("SELECT * FROM payments WHERE id = ?").get(paymentDbId);
    const orderId = explicitOrderId || (payment ? payment.order_id : null);
    if (!orderId) return;

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!order) return;

    if (payment) {
      db.prepare(`
        UPDATE payments 
        SET status = 'PAID', transaction_id = COALESCE(?, transaction_id),
            paid_at = COALESCE(?, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(transactionId, paidAt, payment.id);
    }

    db.prepare(`
      UPDATE orders 
      SET payment_status = 'PAID', status = 'PAID', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(order.id);

    db.prepare(`
      INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
      VALUES (?, ?, 'PAID', 'PAYMENT_GATEWAY', 'Pembayaran QRIS berhasil diverifikasi sistem')
    `).run(order.id, order.status);
  }

  // Internal helper to mark payment as EXPIRED
  static _markPaymentExpiredTransactional(paymentDbId, explicitOrderId = null) {
    const payment = db.prepare("SELECT * FROM payments WHERE id = ?").get(paymentDbId);
    const orderId = explicitOrderId || (payment ? payment.order_id : null);
    if (!orderId) return;

    if (payment) {
      db.prepare("UPDATE payments SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(payment.id);
    }

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (order && order.payment_status === "PENDING") {
      db.prepare("UPDATE orders SET payment_status = 'EXPIRED', status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(order.id);
      
      // Restore stock
      const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
      const restore = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
      for (const it of items) {
        restore.run(it.quantity, it.product_id);
      }

      db.prepare(`
        INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
        VALUES (?, ?, 'CANCELLED', 'SYSTEM', 'Batas waktu pembayaran kedaluwarsa')
      `).run(order.id, order.status);
    }
  }
}

module.exports = PaymentService;
