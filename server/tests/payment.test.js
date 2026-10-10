const test = require("node:test");
const assert = require("node:assert");
const db = require("../src/db/database");
const OrderService = require("../src/services/order.service");
const PaymentService = require("../src/services/payment.service");

test.before(() => {
  db.prepare("UPDATE products SET stock = 100 WHERE is_active = 1").run();
});

test("PaymentService: Generates dynamic QRIS transaction with exact amount and order reference", async () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const order = OrderService.createOrder({
    customerName: "Rian",
    tableIdOrNumber: "03",
    items: [{ productId: product.id, quantity: 1 }]
  });

  const payment = await PaymentService.createPayment({ orderId: order.id });

  assert.ok(payment.paymentId.startsWith("PAY-"), "Payment ID should start with PAY-");
  assert.strictEqual(payment.amount, order.total);
  assert.strictEqual(payment.status, "PENDING");
  assert.ok(payment.qrString, "QR string must be present");
  assert.ok(payment.qrUrl, "QR data URL must be present");
  assert.ok(payment.expiredAt, "Expiration timestamp must be present");
});

test("PaymentService: Processes Cash payment by cashier with exact change calculation", () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const cashier = db.prepare("SELECT * FROM users WHERE role = 'cashier' LIMIT 1").get();

  const order = OrderService.createOrder({
    customerName: "Gita",
    tableIdOrNumber: "04",
    items: [{ productId: product.id, quantity: 1 }],
    paymentMethod: "CASH"
  });

  const cashGiven = order.total + 20000;
  const result = PaymentService.processCashPayment({
    orderId: order.id,
    cashReceived: cashGiven,
    cashierId: cashier.id
  });

  assert.strictEqual(result.status, "PAID");
  assert.strictEqual(result.cashReceived, cashGiven);
  assert.strictEqual(result.change, 20000);

  const updatedOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id);
  assert.strictEqual(updatedOrder.payment_status, "PAID");
  assert.strictEqual(updatedOrder.status, "PAID");
  assert.strictEqual(updatedOrder.cashier_id, cashier.id);
});

test("PaymentService: Rejects Cash payment when cash received is insufficient", () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const cashier = db.prepare("SELECT * FROM users WHERE role = 'cashier' LIMIT 1").get();

  const order = OrderService.createOrder({
    customerName: "Fajar",
    tableIdOrNumber: "05",
    items: [{ productId: product.id, quantity: 2 }],
    paymentMethod: "CASH"
  });

  assert.throws(() => {
    PaymentService.processCashPayment({
      orderId: order.id,
      cashReceived: order.total - 1000,
      cashierId: cashier.id
    });
  }, /Nominal tunai tidak cukup/);
});
