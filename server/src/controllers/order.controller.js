const OrderService = require("../services/order.service");
const db = require("../db/database");
const { logger } = require("../utils/logger");

class OrderController {
  static create(req, res) {
    try {
      const { customer_name, table_id, items, notes, payment_method } = req.body;

      const newOrder = OrderService.createOrder({
        customerName: customer_name,
        tableIdOrNumber: table_id,
        items,
        notes,
        paymentMethod: payment_method || "QRIS"
      });

      logger.info(`New order created: ${newOrder.orderNumber}`, {
        table: newOrder.tableNumber,
        total: newOrder.total
      });

      return res.status(201).json({
        success: true,
        message: "Pesanan berhasil dibuat.",
        data: newOrder
      });
    } catch (err) {
      logger.error("Order creation failed", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Gagal membuat pesanan."
      });
    }
  }

  static getByIdOrNumber(req, res) {
    try {
      const { id } = req.params;
      const { token } = req.query;

      // If user is not authenticated staff, require valid customer token
      const isStaff = Boolean(req.user && (req.user.role === "admin" || req.user.role === "cashier"));
      
      const order = OrderService.getOrder(id, isStaff ? null : token);
      if (!order) {
        return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
      }

      return res.json({ success: true, data: order });
    } catch (err) {
      logger.error("Order retrieval failed", err);
      return res.status(403).json({ success: false, message: err.message });
    }
  }

  static listOrders(req, res) {
    try {
      const { status, payment_status, search, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT o.*, t.table_number, u.name as cashier_name
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        LEFT JOIN users u ON o.cashier_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += " AND o.status = ?";
        params.push(status);
      }

      if (payment_status) {
        query += " AND o.payment_status = ?";
        params.push(payment_status);
      }

      if (search) {
        query += " AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR t.table_number LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += " ORDER BY o.id DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const orders = db.prepare(query).all(...params);

      // Attach items for each order
      const getItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      for (const ord of orders) {
        ord.items = getItems.all(ord.id);
      }

      return res.json({ success: true, data: orders });
    } catch (err) {
      logger.error("Failed to list orders", err);
      return res.status(500).json({ success: false, message: "Gagal mengambil daftar pesanan." });
    }
  }

  static updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: "Status baru wajib diisi." });
      }

      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
      if (!order) {
        return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
      }

      // Security rule: Cashier cannot mark WAITING_PAYMENT to PAID directly here without verification
      if (status === "PAID" && order.payment_status !== "PAID") {
        return res.status(400).json({
          success: false,
          message: "Tidak dapat mengubah pesanan menjadi PAID tanpa verifikasi pembayaran resmi (QRIS) atau transaksi tunai kasir."
        });
      }

      const changedBy = req.user ? `${req.user.name} (${req.user.role})` : "STAFF";
      OrderService.updateOrderStatus(order.id, status, changedBy, notes || "");

      logger.info(`Order ${order.order_number} status updated to ${status} by ${changedBy}`);

      const updated = OrderService.getOrder(order.id);
      return res.json({
        success: true,
        message: `Status pesanan berhasil diubah menjadi ${status}.`,
        data: updated
      });
    } catch (err) {
      logger.error("Failed to update order status", err);
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Cashier live queue feed
   */
  static getCashierQueue(req, res) {
    try {
      const activeOrders = db.prepare(`
        SELECT o.*, t.table_number 
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        WHERE o.status IN ('WAITING_PAYMENT', 'PAID', 'PREPARING', 'READY_TO_SERVE')
        ORDER BY 
          CASE o.status
            WHEN 'PAID' THEN 1
            WHEN 'PREPARING' THEN 2
            WHEN 'READY_TO_SERVE' THEN 3
            WHEN 'WAITING_PAYMENT' THEN 4
            ELSE 5
          END,
          o.created_at ASC
      `).all();

      const getItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      for (const ord of activeOrders) {
        ord.items = getItems.all(ord.id);
      }

      return res.json({ success: true, data: activeOrders });
    } catch (err) {
      logger.error("Failed to get cashier queue", err);
      return res.status(500).json({ success: false, message: "Gagal memuat antrean kasir." });
    }
  }
}

module.exports = OrderController;
