const test = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const db = require("../src/db/database");
const { generateToken, verifyToken } = require("../src/utils/jwt");

test("Auth: Admin and Cashier accounts exist and authenticate", () => {
  const admin = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  assert.ok(admin, "Admin user must exist");
  assert.strictEqual(admin.role, "admin");
  assert.strictEqual(bcrypt.compareSync("admin123", admin.password_hash), true);

  const cashier = db.prepare("SELECT * FROM users WHERE username = 'kasir'").get();
  assert.ok(cashier, "Cashier user must exist");
  assert.strictEqual(cashier.role, "cashier");
  assert.strictEqual(bcrypt.compareSync("kasir123", cashier.password_hash), true);
});

test("Auth: Generates and verifies valid JWT token with user role", () => {
  const token = generateToken({ id: 1, username: "admin", role: "admin", name: "Admin" });
  assert.ok(token, "Token should be generated");

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.username, "admin");
  assert.strictEqual(decoded.role, "admin");
});

test("Auth: Rejects invalid or tempered JWT token", () => {
  const invalid = verifyToken("invalid.token.payload");
  assert.strictEqual(invalid, null);
});
