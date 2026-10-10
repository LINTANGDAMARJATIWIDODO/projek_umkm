const express = require("express");
const router = express.Router();
const TableController = require("../controllers/table.controller");
const { requireAdmin } = require("../middleware/auth");

router.get("/", TableController.getAll);
router.get("/validate", TableController.validateTable);
router.get("/:id/qr", TableController.getQrImage);
router.post("/", requireAdmin, TableController.create);
router.put("/:id", requireAdmin, TableController.update);

module.exports = router;
