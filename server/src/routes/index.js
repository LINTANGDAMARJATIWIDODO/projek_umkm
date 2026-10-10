const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const tableRoutes = require("./table.routes");
const orderRoutes = require("./order.routes");
const paymentRoutes = require("./payment.routes");
const profileRoutes = require("./profile.routes");
const adminRoutes = require("./admin.routes");
const PaymentController = require("../controllers/payment.controller");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/tables", tableRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/profile", profileRoutes);
router.use("/admin", adminRoutes);

// Official webhook route explicitly defined: POST /api/webhooks/payments/:provider
router.post("/webhooks/payments/:provider", PaymentController.handleWebhook);

module.exports = router;
