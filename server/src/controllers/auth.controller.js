const bcrypt = require("bcryptjs");
const db = require("../db/database");
const { generateToken } = require("../utils/jwt");
const { logger } = require("../utils/logger");

class AuthController {
  static login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
      }

      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user || !user.is_active) {
        return res.status(401).json({ success: false, message: "Username atau password salah." });
      }

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Username atau password salah." });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      });

      // Audit log
      db.prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, details) VALUES (?, 'LOGIN', 'users', ?, 'User logged in successfully')")
        .run(user.id, String(user.id));

      logger.info(`User ${user.username} (${user.role}) logged in`);

      return res.json({
        success: true,
        message: "Login berhasil.",
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (err) {
      logger.error("Login error", err);
      return res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }
  }

  static getMe(req, res) {
    return res.json({
      success: true,
      user: req.user
    });
  }
}

module.exports = AuthController;
