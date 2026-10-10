const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/auth");

router.use(requireAdmin);

router.get("/dashboard", AdminController.getDashboard);
router.get("/stock-movements", AdminController.getStockMovements);
router.get("/audit-logs", AdminController.getAuditLogs);
router.get("/users", AdminController.getUsers);
router.post("/users", AdminController.createUser);
router.put("/users/:id", AdminController.updateUser);
router.get("/settings/payment", AdminController.getPaymentConfig);
router.put("/settings/payment", AdminController.updatePaymentConfig);
router.get("/orders/export-csv", AdminController.exportOrdersCsv);

module.exports = router;
