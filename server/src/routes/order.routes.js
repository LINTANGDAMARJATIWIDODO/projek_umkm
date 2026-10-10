const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const { authenticateToken, requireCashier } = require("../middleware/auth");

// Public Customer Ordering
router.post("/", OrderController.create);
router.get("/queue", requireCashier, OrderController.getCashierQueue);
router.get("/:id", OrderController.getByIdOrNumber);

// Cashier & Admin management
router.get("/", requireCashier, OrderController.listOrders);
router.put("/:id/status", requireCashier, OrderController.updateStatus);

module.exports = router;
