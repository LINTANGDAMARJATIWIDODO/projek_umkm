const test = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");
const db = require("../src/db/database");
const OrderService = require("../src/services/order.service");
const PaymentService = require("../src/services/payment.service");
const { MidtransPaymentAdapter } = require("../src/adapters");

test.before(() => {
  db.prepare("UPDATE products SET stock = 100 WHERE is_active = 1").run();
});

test("Webhook: Valid mock webhook signature marks payment and order as PAID", async () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const order = OrderService.createOrder({
    customerName: "Maya",
    tableIdOrNumber: "06",
    items: [{ productId: product.id, quantity: 1 }]
  });

  const payment = await PaymentService.createPayment({ orderId: order.id, provider: "MOCK_SANDBOX" });
  assert.strictEqual(payment.status, "PENDING");

  // Create valid mock signature
  const mockSecret = "mock_sandbox_secret_key_testing_only";
  const signature = crypto
    .createHash("sha256")
    .update(`${order.orderNumber}${order.total}settlement${mockSecret}`)
    .digest("hex");

  const req = {
    originalUrl: "/api/webhooks/payments/mock_sandbox",
    ip: "127.0.0.1",
    headers: {},
    body: {
      order_id: order.orderNumber,
      transaction_id: `MOCK-TX-${order.orderNumber}`,
      gross_amount: order.total,
      transaction_status: "settlement",
      signature
    }
  };

  const result = await PaymentService.handleWebhook("MOCK_SANDBOX", req);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.status, "PAID");

  const updatedOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(order.id);
  assert.strictEqual(updatedOrder.payment_status, "PAID");
  assert.strictEqual(updatedOrder.status, "PAID");

  const updatedPayment = db.prepare("SELECT * FROM payments WHERE id = ?").get(payment.paymentId ? undefined : payment.id || 1);
  const latestPayment = db.prepare("SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1").get(order.id);
  assert.strictEqual(latestPayment.status, "PAID");
  assert.ok(latestPayment.paid_at, "paid_at must be populated");
});

test("Webhook: Rejects notification with invalid signature", async () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const order = OrderService.createOrder({
    customerName: "Hendra",
    tableIdOrNumber: "07",
    items: [{ productId: product.id, quantity: 1 }]
  });

  await PaymentService.createPayment({ orderId: order.id, provider: "MOCK_SANDBOX" });

  const req = {
    originalUrl: "/api/webhooks/payments/mock_sandbox",
    ip: "127.0.0.1",
    headers: {},
    body: {
      order_id: order.orderNumber,
      transaction_id: "FAKE-TX",
      gross_amount: order.total,
      transaction_status: "settlement",
      signature: "tampered_fake_signature_12345"
    }
  };

  await assert.rejects(async () => {
    await PaymentService.handleWebhook("MOCK_SANDBOX", req);
  }, /Signature verification failed/);

  // Order must remain PENDING
  const orderCheck = db.prepare("SELECT payment_status FROM orders WHERE id = ?").get(order.id);
  assert.strictEqual(orderCheck.payment_status, "PENDING");
});

test("Webhook: Idempotency prevents double processing of duplicate notifications", async () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const order = OrderService.createOrder({
    customerName: "Tia",
    tableIdOrNumber: "08",
    items: [{ productId: product.id, quantity: 1 }]
  });

  await PaymentService.createPayment({ orderId: order.id, provider: "MOCK_SANDBOX" });

  const mockSecret = "mock_sandbox_secret_key_testing_only";
  const signature = crypto
    .createHash("sha256")
    .update(`${order.orderNumber}${order.total}settlement${mockSecret}`)
    .digest("hex");

  const req = {
    originalUrl: "/api/webhooks/payments/mock_sandbox",
    ip: "127.0.0.1",
    headers: {},
    body: {
      order_id: order.orderNumber,
      transaction_id: `MOCK-TX-IDEMP-${order.orderNumber}`,
      gross_amount: order.total,
      transaction_status: "settlement",
      signature
    }
  };

  // First webhook execution
  const first = await PaymentService.handleWebhook("MOCK_SANDBOX", req);
  assert.strictEqual(first.success, true);

  // Second duplicate webhook call
  const duplicate = await PaymentService.handleWebhook("MOCK_SANDBOX", req);
  assert.strictEqual(duplicate.success, true);
  assert.strictEqual(duplicate.idempotent, true);
});

test("Webhook: Rejects notification when amount is mismatched", async () => {
  const product = db.prepare("SELECT * FROM products WHERE is_active = 1 LIMIT 1").get();
  const order = OrderService.createOrder({
    customerName: "Rudi",
    tableIdOrNumber: "09",
    items: [{ productId: product.id, quantity: 1 }]
  });

  await PaymentService.createPayment({ orderId: order.id, provider: "MOCK_SANDBOX" });

  const mockSecret = "mock_sandbox_secret_key_testing_only";
  const wrongAmount = order.total + 50000;
  const signature = crypto
    .createHash("sha256")
    .update(`${order.orderNumber}${wrongAmount}settlement${mockSecret}`)
    .digest("hex");

  const req = {
    originalUrl: "/api/webhooks/payments/mock_sandbox",
    ip: "127.0.0.1",
    headers: {},
    body: {
      order_id: order.orderNumber,
      transaction_id: `MOCK-TX-MISMATCH-${order.orderNumber}`,
      gross_amount: wrongAmount,
      transaction_status: "settlement",
      signature
    }
  };

  await assert.rejects(async () => {
    await PaymentService.handleWebhook("MOCK_SANDBOX", req);
  }, /Nominal transaksi tidak cocok/);
});

test("MidtransAdapter: Validates SHA512 signature per official documentation", () => {
  const adapter = new MidtransPaymentAdapter({
    serverKey: "Mid-server-TEST-KEY-123",
    isProduction: false
  });

  const orderId = "RN-20261010-ABCD";
  const statusCode = "200";
  const grossAmount = "55000.00";
  const serverKey = "Mid-server-TEST-KEY-123";

  const expectedSig = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  // Test valid signature
  const validCheck = adapter.verifyWebhookSignature({
    body: {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: expectedSig
    }
  });
  assert.strictEqual(validCheck.isValid, true);

  // Test forged signature
  const forgedCheck = adapter.verifyWebhookSignature({
    body: {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: "forged_sha512_hash_value"
    }
  });
  assert.strictEqual(forgedCheck.isValid, false);
});
