const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const { requireAdmin } = require("../middleware/auth");

router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);
router.post("/", requireAdmin, ProductController.create);
router.put("/:id", requireAdmin, ProductController.update);
router.post("/:id/adjust-stock", requireAdmin, ProductController.adjustStock);
router.delete("/:id", requireAdmin, ProductController.delete);

module.exports = router;
