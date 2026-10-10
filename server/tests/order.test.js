const test = require("node:test");
const assert = require("node:assert");
const db = require("../src/db/database");
const { initializeSchema } = require("../src/db/schema");
const { seedDatabase } = require("../src/db/seed");
const OrderService = require("../src/services/order.service");

test.before(() => {
  initializeSchema();
  seedDatabase();
  db.prepare("UPDATE products SET stock = 100 WHERE is_active = 1").run();
});

test("OrderService: Calculates prices, tax, and creates order accurately from DB", () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  assert.ok(product, "Product should exist in DB");

  const order = OrderService.createOrder({
    customerName: "Budi Santoso",
    tableIdOrNumber: "01",
    items: [{ productId: product.id, quantity: 2 }],
    notes: "Kurang manis"
  });

  assert.ok(order.orderNumber.startsWith("RN-"), "Order number format should be RN-YYYYMMDD-XXXX");
  assert.strictEqual(order.customerName, "Budi Santoso");
  assert.strictEqual(order.items.length, 1);
  assert.strictEqual(order.subtotal, product.price * 2);

  // PB1 Tax is 10%
  const expectedTax = Math.round(order.subtotal * 0.1);
  assert.strictEqual(order.tax, expectedTax);
  assert.strictEqual(order.total, order.subtotal + expectedTax);
  assert.strictEqual(order.status, "WAITING_PAYMENT");
  assert.strictEqual(order.paymentStatus, "PENDING");
  assert.ok(order.customerToken, "Customer token must be generated");
});

test("OrderService: Rejects order when stock is insufficient", () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  
  assert.throws(() => {
    OrderService.createOrder({
      customerName: "Siti",
      tableIdOrNumber: "01",
      items: [{ productId: product.id, quantity: product.stock + 999 }]
    });
  }, /Stok untuk.*tidak mencukupi/);
});

test("OrderService: Rejects order with invalid table number", () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();

  assert.throws(() => {
    OrderService.createOrder({
      customerName: "Anton",
      tableIdOrNumber: "9999", // Non-existent table
      items: [{ productId: product.id, quantity: 1 }]
    });
  }, /Nomor meja tidak valid/);
});

test("OrderService: Isolates order access using customer token", () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const order = OrderService.createOrder({
    customerName: "Dewi",
    tableIdOrNumber: "02",
    items: [{ productId: product.id, quantity: 1 }]
  });

  // Access with correct token succeeds
  const retrieved = OrderService.getOrder(order.orderNumber, order.customerToken);
  assert.strictEqual(retrieved.order_number, order.orderNumber);

  // Access with incorrect token throws error
  assert.throws(() => {
    OrderService.getOrder(order.orderNumber, "invalid_wrong_token_123");
  }, /Akses tidak diizinkan/);
});
