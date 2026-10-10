const express = require("express");
const router = express.Router();
const ProfileController = require("../controllers/profile.controller");
const { requireAdmin } = require("../middleware/auth");

// Public Profile & Promos
router.get("/", ProfileController.getPublicProfile);
router.put("/", requireAdmin, ProfileController.updateSettings);

// Promotions CRUD
router.get("/promotions", ProfileController.getPromotions);
router.post("/promotions", requireAdmin, ProfileController.createPromotion);
router.put("/promotions/:id", requireAdmin, ProfileController.updatePromotion);
router.delete("/promotions/:id", requireAdmin, ProfileController.deletePromotion);

module.exports = router;
