const crypto = require("crypto");
const QRCode = require("qrcode");
const db = require("../db/database");
const { logger } = require("../utils/logger");

class TableController {
  static getAll(req, res) {
    try {
      const tables = db.prepare("SELECT * FROM tables WHERE is_active = 1 ORDER BY table_number ASC").all();
      return res.json({ success: true, data: tables });
    } catch (err) {
      logger.error("Error fetching tables", err);
      return res.status(500).json({ success: false, message: "Gagal mengambil data meja." });
    }
  }

  static validateTable(req, res) {
    try {
      const { table, token } = req.query;
      if (!table) {
        return res.status(400).json({ success: false, message: "Parameter meja tidak ditemukan." });
      }

      // Query policy
      let policy = { allow_table_change: true, require_table_qr: false };
      try {
        const policyRow = db.prepare("SELECT value FROM cafe_settings WHERE key = 'ordering_policy'").get();
        if (policyRow) policy = JSON.parse(policyRow.value);
      } catch (e) {}

      let row = db.prepare("SELECT * FROM tables WHERE (table_number = ? OR table_number = ?) AND is_active = 1")
        .get(table, `Meja ${table}`);

      if (!row) {
        return res.status(404).json({
          success: false,
          isValid: false,
          message: "Nomor meja tidak ditemukan dalam sistem Cafe Ruang Namu."
        });
      }

      const isTokenValid = Boolean(token && row.token === token);

      if (policy.require_table_qr && !isTokenValid) {
        return res.status(403).json({
          success: false,
          isValid: false,
          requiresQr: true,
          message: "Pemesanan wajib menggunakan scan QR resmi yang ada di meja."
        });
      }

      return res.json({
        success: true,
        isValid: true,
        table: {
          id: row.id,
          table_number: row.table_number,
          capacity: row.capacity
        },
        tokenValid: isTokenValid,
        allowChange: policy.allow_table_change
      });
    } catch (err) {
      logger.error("Error validating table", err);
      return res.status(500).json({ success: false, message: "Gagal memvalidasi meja: " + err.message });
    }
  }

  static create(req, res) {
    try {
      const { table_number, capacity = 4 } = req.body;
      if (!table_number) {
        return res.status(400).json({ success: false, message: "Nomor meja wajib diisi." });
      }

      const token = crypto.randomBytes(8).toString("hex");
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const qrData = `${clientUrl}/order?table=${encodeURIComponent(table_number)}&token=${token}`;

      const insert = db.prepare("INSERT INTO tables (table_number, token, qr_code_data, capacity) VALUES (?, ?, ?, ?)");
      const result = insert.run(table_number.trim(), token, qrData, parseInt(capacity, 10));

      const created = db.prepare("SELECT * FROM tables WHERE id = ?").get(result.lastInsertRowid);
      return res.status(201).json({ success: true, message: "Meja berhasil ditambahkan.", data: created });
    } catch (err) {
      logger.error("Error creating table", err);
      return res.status(500).json({ success: false, message: "Gagal menambahkan meja: " + err.message });
    }
  }

  static update(req, res) {
    try {
      const { id } = req.params;
      const { table_number, capacity, is_active } = req.body;

      db.prepare(`
        UPDATE tables SET
          table_number = COALESCE(?, table_number),
          capacity = COALESCE(?, capacity),
          is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(
        table_number ? table_number.trim() : null,
        capacity !== undefined ? parseInt(capacity, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      );

      const updated = db.prepare("SELECT * FROM tables WHERE id = ?").get(id);
      return res.json({ success: true, message: "Data meja berhasil diperbarui.", data: updated });
    } catch (err) {
      logger.error("Error updating table", err);
      return res.status(500).json({ success: false, message: "Gagal memperbarui meja: " + err.message });
    }
  }

  static async getQrImage(req, res) {
    try {
      const { id } = req.params;
      const table = db.prepare("SELECT * FROM tables WHERE id = ?").get(id);
      if (!table) return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const qrTarget = `${clientUrl}/order?table=${encodeURIComponent(table.table_number)}&token=${table.token}`;

      const dataUrl = await QRCode.toDataURL(qrTarget, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 400,
        color: {
          dark: "#2C1810",
          light: "#FDFBF7"
        }
      });

      return res.json({
        success: true,
        tableNumber: table.table_number,
        qrTarget,
        qrDataUrl: dataUrl
      });
    } catch (err) {
      logger.error("Error generating table QR", err);
      return res.status(500).json({ success: false, message: "Gagal membuat gambar QR meja." });
    }
  }
}

module.exports = TableController;
