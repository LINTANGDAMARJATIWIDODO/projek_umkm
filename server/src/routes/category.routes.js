const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/category.controller");
const { requireAdmin } = require("../middleware/auth");

router.get("/", CategoryController.getAll);
router.post("/", requireAdmin, CategoryController.create);
router.put("/:id", requireAdmin, CategoryController.update);
router.delete("/:id", requireAdmin, CategoryController.delete);

module.exports = router;
