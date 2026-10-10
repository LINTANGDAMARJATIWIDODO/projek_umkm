const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/payment.controller");
const { requireCashier, requireAdmin } = require("../middleware/auth");

// Core Payment Endpoints as explicitly specified
router.post("/create", PaymentController.createPayment);
router.get("/:paymentId/status", PaymentController.getPaymentStatus);
router.post("/:paymentId/cancel", requireCashier, PaymentController.cancelPayment);
router.post("/:paymentId/refund", requireAdmin, PaymentController.refundPayment);

// Cash handling by cashier
router.post("/cash", requireCashier, PaymentController.processCash);

// Transaction Reconciliation
router.get("/reconcile", requireCashier, PaymentController.reconcile);

module.exports = router;
