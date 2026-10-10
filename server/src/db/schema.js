const db = require("./database");

function initializeSchema() {
  db.exec(`
    -- USERS & ROLES
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')),
      name TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- CATEGORIES
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      image_url TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_popular INTEGER NOT NULL DEFAULT 0,
      is_promo INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- TABLES
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number TEXT UNIQUE NOT NULL,
      token TEXT UNIQUE NOT NULL,
      qr_code_data TEXT,
      capacity INTEGER DEFAULT 4,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ORDERS
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      table_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'WAITING_PAYMENT' 
        CHECK(status IN ('WAITING_PAYMENT', 'PAID', 'PREPARING', 'READY_TO_SERVE', 'DELIVERED', 'CANCELLED')),
      payment_status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK(payment_status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED')),
      payment_method TEXT NOT NULL DEFAULT 'QRIS'
        CHECK(payment_method IN ('QRIS', 'CASH')),
      subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
      discount INTEGER NOT NULL DEFAULT 0 CHECK(discount >= 0),
      tax INTEGER NOT NULL DEFAULT 0 CHECK(tax >= 0),
      service_charge INTEGER NOT NULL DEFAULT 0 CHECK(service_charge >= 0),
      total INTEGER NOT NULL CHECK(total >= 0),
      notes TEXT,
      customer_token TEXT UNIQUE NOT NULL,
      cashier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT,
      FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- ORDER ITEMS
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK(price >= 0),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    -- PAYMENTS
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id TEXT UNIQUE NOT NULL,
      order_id INTEGER NOT NULL,
      provider TEXT NOT NULL CHECK(provider IN ('MIDTRANS', 'MOCK_SANDBOX', 'CASH')),
      payment_type TEXT NOT NULL DEFAULT 'qris' CHECK(payment_type IN ('qris', 'cash')),
      transaction_id TEXT,
      provider_reference TEXT,
      amount INTEGER NOT NULL CHECK(amount > 0),
      currency TEXT NOT NULL DEFAULT 'IDR',
      status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK(status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'REFUNDED', 'CANCELLED')),
      qr_string TEXT,
      qr_url TEXT,
      expired_at DATETIME,
      paid_at DATETIME,
      cash_received INTEGER,
      cash_change INTEGER,
      raw_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- PAYMENT EVENTS (Audit Trail & Idempotency)
    CREATE TABLE IF NOT EXISTS payment_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      event_type TEXT NOT NULL,
      transaction_id TEXT,
      payload TEXT NOT NULL,
      signature TEXT,
      status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK(status IN ('PROCESSED', 'IGNORED', 'INVALID')),
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- STOCK MOVEMENTS
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      change_qty INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT NOT NULL CHECK(reason IN ('ORDER_PLACED', 'ORDER_CANCELLED', 'MANUAL_ADJUST', 'RESTOCK')),
      reference_id TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    -- ORDER STATUS HISTORY
    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      changed_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- PROMOTIONS
    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      banner_image TEXT,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('PERCENT', 'FIXED')),
      discount_value INTEGER NOT NULL CHECK(discount_value > 0),
      min_spend INTEGER NOT NULL DEFAULT 0,
      valid_from DATE NOT NULL,
      valid_until DATE NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- CAFE SETTINGS
    CREATE TABLE IF NOT EXISTS cafe_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AUDIT LOGS
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- INDEXES
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_customer_token ON orders(customer_token);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
    CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_payment_events_tx_id ON payment_events(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON stock_movements(product_id);
  `);
}

module.exports = { initializeSchema };
