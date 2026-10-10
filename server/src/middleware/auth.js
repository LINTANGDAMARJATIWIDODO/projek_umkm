const { verifyToken } = require("../utils/jwt");
const db = require("../db/database");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Akses ditolak. Token autentikasi tidak ditemukan." });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: "Token tidak valid atau telah kedaluwarsa." });
  }

  const user = db.prepare("SELECT id, username, role, name, is_active FROM users WHERE id = ?").get(decoded.id);
  if (!user || !user.is_active) {
    return res.status(403).json({ success: false, message: "Akun pengguna tidak aktif atau tidak ditemukan." });
  }

  req.user = user;
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Autentikasi diperlukan." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Akses ditolak. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.` 
      });
    }
    next();
  };
}

const requireAdmin = [authenticateToken, requireRole(["admin"])];
const requireCashier = [authenticateToken, requireRole(["admin", "cashier"])];

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireCashier
};
