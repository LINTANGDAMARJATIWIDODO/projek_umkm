const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth");

router.post("/login", AuthController.login);
router.get("/me", authenticateToken, AuthController.getMe);

module.exports = router;
