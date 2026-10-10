const crypto = require("crypto");
const db = require("../db/database");
const { logger } = require("../utils/logger");

class OrderService {
  /**
   * Generate sequential unique order number
   * Format: RN-YYYYMMDD-XXXX
   */
  static generateOrderNumber() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}${mm}${dd}`;

    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `RN-${dateStr}-${randomSuffix}`;
  }

  /**
   * Validate table against DB
   */
  static validateTable(tableIdOrNumber) {
    if (!tableIdOrNumber) return null;

    let table = db.prepare("SELECT * FROM tables WHERE id = ? AND is_active = 1").get(tableIdOrNumber);
    if (!table) {
      table = db.prepare("SELECT * FROM tables WHERE (table_number = ? OR table_number = ?) AND is_active = 1")
        .get(tableIdOrNumber, `Meja ${tableIdOrNumber}`);
    }
    return table;
  }

  /**
   * Get active tax and fee settings
   */
  static getTaxAndFeeSettings() {
    try {
      const row = db.prepare("SELECT value FROM cafe_settings WHERE key = 'tax_and_fees'").get();
      if (row && row.value) {
        return JSON.parse(row.value);
      }
    } catch (e) {
      logger.error("Error reading tax settings", e);
    }
    return { enable_tax: true, tax_percent: 10, enable_service: false, service_percent: 0 };
  }

  /**
   * Create an order with strict transactional checks
   */
  static createOrder({ customerName, tableIdOrNumber, items, notes = "", paymentMethod = "QRIS" }) {
    if (!customerName || !customerName.trim()) {
      throw new Error("Nama pelanggan wajib diisi.");
    }

    const table = this.validateTable(tableIdOrNumber);
    if (!table) {
      throw new Error("Nomor meja tidak valid atau meja sedang tidak aktif.");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Keranjang pesanan tidak boleh kosong.");
    }

    // Run order creation inside an atomic SQLite transaction
    const createTx = db.transaction(() => {
      let subtotal = 0;
      const verifiedItems = [];

      // Check stock and calculate price strictly from database
      for (const item of items) {
        const productId = item.productId || item.id;
        const qty = parseInt(item.quantity, 10);

        if (!productId || isNaN(qty) || qty <= 0) {
          throw new Error("Item pesanan tidak valid.");
        }

        const product = db.prepare("SELECT * FROM products WHERE id = ? AND is_active = 1").get(productId);
        if (!product) {
          throw new Error(`Produk dengan ID ${productId} tidak ditemukan atau tidak aktif.`);
        }

        if (product.stock < qty) {
          throw new Error(`Stok untuk '${product.name}' tidak mencukupi (Tersedia: ${product.stock}, Diminta: ${qty}).`);
        }

        const itemSubtotal = product.price * qty;
        subtotal += itemSubtotal;

        verifiedItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: qty,
          subtotal: itemSubtotal,
          notes: item.notes || ""
        });
      }

      // Read tax and service settings
      const taxSettings = this.getTaxAndFeeSettings();
      let tax = 0;
      let serviceCharge = 0;

      if (taxSettings.enable_tax && taxSettings.tax_percent > 0) {
        tax = Math.round((subtotal * taxSettings.tax_percent) / 100);
      }
      if (taxSettings.enable_service && taxSettings.service_percent > 0) {
        serviceCharge = Math.round((subtotal * taxSettings.service_percent) / 100);
      }

      const discount = 0; // Can be enhanced with promo codes
      const grandTotal = subtotal - discount + tax + serviceCharge;

      if (grandTotal <= 0) {
        throw new Error("Total pembayaran tidak valid.");
      }

      const orderNumber = this.generateOrderNumber();
      const customerToken = crypto.randomBytes(24).toString("hex");

      // Insert Order
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          order_number, table_id, customer_name, status, payment_status,
          payment_method, subtotal, discount, tax, service_charge, total,
          notes, customer_token
        ) VALUES (?, ?, ?, 'WAITING_PAYMENT', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const orderResult = insertOrder.run(
        orderNumber,
        table.id,
        customerName.trim(),
        paymentMethod,
        subtotal,
        discount,
        tax,
        serviceCharge,
        grandTotal,
        notes.trim(),
        customerToken
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert Order Items and temporarily hold stock
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const deductStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
      const recordMovement = db.prepare(`
        INSERT INTO stock_movements (product_id, change_qty, previous_stock, new_stock, reason, reference_id)
        VALUES (?, ?, ?, ?, 'ORDER_PLACED', ?)
      `);

      for (const vi of verifiedItems) {
        insertItem.run(
          orderId,
          vi.productId,
          vi.productName,
          vi.price,
          vi.quantity,
          vi.subtotal,
          vi.notes
        );

        // Deduct stock
        const currentProd = db.prepare("SELECT stock FROM products WHERE id = ?").get(vi.productId);
        deductStock.run(vi.quantity, vi.productId);
        recordMovement.run(
          vi.productId,
          -vi.quantity,
          currentProd.stock,
          currentProd.stock - vi.quantity,
          orderNumber
        );
      }

      // Record Order Status History
      db.prepare(`
        INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
        VALUES (?, NULL, 'WAITING_PAYMENT', 'CUSTOMER', 'Pesanan dibuat oleh pelanggan')
      `).run(orderId);

      return {
        id: orderId,
        orderNumber,
        tableNumber: table.table_number,
        customerName: customerName.trim(),
        subtotal,
        discount,
        tax,
        serviceCharge,
        total: grandTotal,
        customerToken,
        items: verifiedItems,
        status: "WAITING_PAYMENT",
        paymentStatus: "PENDING",
        paymentMethod
      };
    });

    return createTx();
  }

  /**
   * Get complete order details with security check
   */
  static getOrder(orderIdOrNumber, customerToken = null) {
    let order;
    if (isNaN(orderIdOrNumber)) {
      order = db.prepare(`
        SELECT o.*, t.table_number, t.capacity as table_capacity
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        WHERE o.order_number = ?
      `).get(orderIdOrNumber);
    } else {
      order = db.prepare(`
        SELECT o.*, t.table_number, t.capacity as table_capacity
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        WHERE o.id = ?
      `).get(orderIdOrNumber);
    }

    if (!order) return null;

    // Security check: if customerToken is supplied or required, ensure matching
    if (customerToken && order.customer_token !== customerToken) {
      throw new Error("Akses tidak diizinkan. Token pesanan tidak cocok.");
    }

    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
    const payments = db.prepare("SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC").all(order.id);
    const history = db.prepare("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id ASC").all(order.id);

    return {
      ...order,
      items,
      payment: payments[0] || null,
      history
    };
  }

  /**
   * Transition order status safely
   */
  static updateOrderStatus(orderId, newStatus, changedBy = "SYSTEM", notes = "") {
    const validStatuses = ["WAITING_PAYMENT", "PAID", "PREPARING", "READY_TO_SERVE", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Status tidak valid: ${newStatus}`);
    }

    const updateTx = db.transaction(() => {
      const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
      if (!order) throw new Error("Pesanan tidak ditemukan.");

      // If cancelling, restore stock
      if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
        const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
        const restoreStock = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
        const recordMovement = db.prepare(`
          INSERT INTO stock_movements (product_id, change_qty, previous_stock, new_stock, reason, reference_id)
          VALUES (?, ?, ?, ?, 'ORDER_CANCELLED', ?)
        `);

        for (const it of items) {
          const currentProd = db.prepare("SELECT stock FROM products WHERE id = ?").get(it.product_id);
          restoreStock.run(it.quantity, it.product_id);
          recordMovement.run(
            it.product_id,
            it.quantity,
            currentProd.stock,
            currentProd.stock + it.quantity,
            order.order_number
          );
        }
      }

      db.prepare(`
        UPDATE orders 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(newStatus, orderId);

      db.prepare(`
        INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(orderId, order.status, newStatus, changedBy, notes);

      return true;
    });

    return updateTx();
  }
}

module.exports = OrderService;
