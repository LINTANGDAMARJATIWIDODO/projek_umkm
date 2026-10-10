const bcrypt = require("bcryptjs");
const db = require("../db/database");
const { logger } = require("../utils/logger");

class AdminController {
  /**
   * GET /api/admin/dashboard
   */
  static getDashboard(req, res) {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const monthStr = todayStr.substring(0, 7);

      // Revenue and order counts
      const todayStats = db.prepare(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0) as revenue,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END), 0) as paid_orders
        FROM orders 
        WHERE date(created_at) = ?
      `).get(todayStr);

      const monthStats = db.prepare(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0) as revenue,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END), 0) as paid_orders
        FROM orders 
        WHERE strftime('%Y-%m', created_at) = ?
      `).get(monthStr);

      // Status queues count
      const queueCounts = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM orders 
        GROUP BY status
      `).all();

      const queueMap = Object.fromEntries(queueCounts.map(q => [q.status, q.count]));

      // Top 5 selling products
      const topProducts = db.prepare(`
        SELECT oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.subtotal) as total_sales
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.payment_status = 'PAID'
        GROUP BY oi.product_id, oi.product_name
        ORDER BY total_qty DESC LIMIT 5
      `).all();

      // Recent 10 orders
      const recentOrders = db.prepare(`
        SELECT o.*, t.table_number 
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        ORDER BY o.id DESC LIMIT 10
      `).all();

      // Low stock warning (< 10)
      const lowStockProducts = db.prepare(`
        SELECT id, name, stock, price 
        FROM products 
        WHERE is_active = 1 AND stock < 10
        ORDER BY stock ASC
      `).all();

      return res.json({
        success: true,
        data: {
          today: todayStats,
          month: monthStats,
          queues: queueMap,
          topProducts,
          recentOrders,
          lowStockProducts
        }
      });
    } catch (err) {
      logger.error("Admin dashboard fetch error", err);
      return res.status(500).json({ success: false, message: "Gagal memuat statistik dashboard." });
    }
  }

  /**
   * GET /api/admin/stock-movements
   */
  static getStockMovements(req, res) {
    try {
      const movements = db.prepare(`
        SELECT sm.*, p.name as product_name, u.name as staff_name
        FROM stock_movements sm
        JOIN products p ON sm.product_id = p.id
        LEFT JOIN users u ON sm.created_by = u.id
        ORDER BY sm.id DESC LIMIT 100
      `).all();

      return res.json({ success: true, data: movements });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memuat log mutasi stok." });
    }
  }

  /**
   * GET /api/admin/audit-logs
   */
  static getAuditLogs(req, res) {
    try {
      const logs = db.prepare(`
        SELECT a.*, u.name as user_name, u.username
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.id DESC LIMIT 100
      `).all();

      return res.json({ success: true, data: logs });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memuat audit log." });
    }
  }

  /**
   * GET /api/admin/users
   */
  static getUsers(req, res) {
    try {
      const users = db.prepare("SELECT id, username, role, name, is_active, created_at FROM users ORDER BY id ASC").all();
      return res.json({ success: true, data: users });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memuat daftar pengguna." });
    }
  }

  /**
   * POST /api/admin/users
   */
  static createUser(req, res) {
    try {
      const { username, password, role, name } = req.body;
      if (!username || !password || !role || !name) {
        return res.status(400).json({ success: false, message: "Semua kolom wajib diisi." });
      }

      const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
      if (existing) {
        return res.status(400).json({ success: false, message: "Username sudah terdaftar." });
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const result = db.prepare("INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)").run(
        username.trim(),
        hash,
        role,
        name.trim()
      );

      return res.status(201).json({
        success: true,
        message: "Pengguna staf berhasil dibuat.",
        data: { id: result.lastInsertRowid, username, role, name }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal membuat pengguna: " + err.message });
    }
  }

  /**
   * PUT /api/admin/users/:id
   */
  static updateUser(req, res) {
    try {
      const { id } = req.params;
      const { password, role, name, is_active } = req.body;

      let passwordHash = null;
      if (password && password.trim().length >= 6) {
        passwordHash = bcrypt.hashSync(password.trim(), 10);
      }

      db.prepare(`
        UPDATE users SET
          role = COALESCE(?, role),
          name = COALESCE(?, name),
          is_active = COALESCE(?, is_active),
          password_hash = COALESCE(?, password_hash),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        role || null,
        name ? name.trim() : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        passwordHash,
        id
      );

      const updated = db.prepare("SELECT id, username, role, name, is_active FROM users WHERE id = ?").get(id);
      return res.json({ success: true, message: "Data pengguna berhasil diperbarui.", data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memperbarui pengguna: " + err.message });
    }
  }

  /**
   * GET /api/admin/settings/payment
   * Read config with masked secret keys for security
   */
  static getPaymentConfig(req, res) {
    try {
      const row = db.prepare("SELECT value FROM cafe_settings WHERE key = 'payment_config'").get();
      const config = row && row.value ? JSON.parse(row.value) : {
        active_provider: "MOCK_SANDBOX",
        midtrans: { is_production: false, merchant_id: "", client_key: "", server_key: "" }
      };

      // Mask server_key for security so full secrets are not exposed to client
      const masked = JSON.parse(JSON.stringify(config));
      if (masked.midtrans && masked.midtrans.server_key) {
        const key = masked.midtrans.server_key;
        masked.midtrans.server_key = key.length > 8 
          ? key.substring(0, 7) + "..." + key.substring(key.length - 4) 
          : "********";
        masked.midtrans.has_server_key = true;
      } else {
        if (masked.midtrans) masked.midtrans.has_server_key = false;
      }

      return res.json({ success: true, data: masked });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memuat konfigurasi pembayaran." });
    }
  }

  /**
   * PUT /api/admin/settings/payment
   */
  static updatePaymentConfig(req, res) {
    try {
      const { active_provider, midtrans } = req.body;

      const currentRow = db.prepare("SELECT value FROM cafe_settings WHERE key = 'payment_config'").get();
      const current = currentRow && currentRow.value ? JSON.parse(currentRow.value) : {};

      const newConfig = {
        active_provider: active_provider || current.active_provider || "MOCK_SANDBOX",
        midtrans: {
          is_production: midtrans?.is_production !== undefined ? Boolean(midtrans.is_production) : (current.midtrans?.is_production || false),
          merchant_id: midtrans?.merchant_id !== undefined ? midtrans.merchant_id : (current.midtrans?.merchant_id || ""),
          client_key: midtrans?.client_key !== undefined ? midtrans.client_key : (current.midtrans?.client_key || ""),
          // Only update server_key if user provided a new unmasked string (not containing '...')
          server_key: (midtrans?.server_key && !midtrans.server_key.includes("..."))
            ? midtrans.server_key.trim()
            : (current.midtrans?.server_key || "")
        }
      };

      db.prepare(`
        INSERT INTO cafe_settings (key, value, updated_at) 
        VALUES ('payment_config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(JSON.stringify(newConfig));

      db.prepare(`
        INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
        VALUES (?, 'UPDATE_PAYMENT_CONFIG', 'cafe_settings', 'payment_config', ?)
      `).run(req.user.id, `Provider set to ${newConfig.active_provider}`);

      logger.info(`Payment configuration updated to provider: ${newConfig.active_provider}`);

      return res.json({ success: true, message: "Konfigurasi payment gateway berhasil disimpan." });
    } catch (err) {
      logger.error("Failed to update payment config", err);
      return res.status(500).json({ success: false, message: "Gagal memperbarui konfigurasi pembayaran: " + err.message });
    }
  }

  /**
   * GET /api/admin/orders/export-csv
   */
  static exportOrdersCsv(req, res) {
    try {
      const orders = db.prepare(`
        SELECT 
          o.order_number, o.created_at, o.customer_name, t.table_number,
          o.status, o.payment_status, o.payment_method, o.subtotal, o.tax, o.service_charge, o.total
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        ORDER BY o.id DESC
      `).all();

      const headers = ["Nomor Pesanan", "Tanggal & Waktu", "Nama Pelanggan", "Meja", "Status Pesanan", "Status Bayar", "Metode", "Subtotal", "Pajak", "Service", "Total"];
      const rows = orders.map(o => [
        `"${o.order_number}"`,
        `"${o.created_at}"`,
        `"${o.customer_name.replace(/"/g, '""')}"`,
        `"${o.table_number}"`,
        `"${o.status}"`,
        `"${o.payment_status}"`,
        `"${o.payment_method}"`,
        o.subtotal,
        o.tax,
        o.service_charge,
        o.total
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="ruang_namu_orders_${Date.now()}.csv"`);
      return res.send(csvContent);
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal mengekspor data CSV." });
    }
  }
}

module.exports = AdminController;
