const db = require("../db/database");
const { logger } = require("../utils/logger");

class ProfileController {
  /**
   * GET /api/profile
   * Public cafe details with real-time open/closed calculation
   */
  static getPublicProfile(req, res) {
    try {
      const getSetting = (key) => {
        const row = db.prepare("SELECT value FROM cafe_settings WHERE key = ?").get(key);
        return row && row.value ? JSON.parse(row.value) : null;
      };

      const profile = getSetting("profile") || {};
      const facilities = getSetting("facilities") || [];
      const operatingHours = getSetting("operating_hours") || [];
      const taxAndFees = getSetting("tax_and_fees") || {};
      const orderingPolicy = getSetting("ordering_policy") || {};

      // Active promotions
      const todayStr = new Date().toISOString().split("T")[0];
      const promotions = db.prepare(`
        SELECT * FROM promotions 
        WHERE is_active = 1 AND valid_from <= ? AND valid_until >= ?
        ORDER BY id DESC
      `).all(todayStr, todayStr);

      // Featured products
      const featuredProducts = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1 AND p.is_featured = 1
        ORDER BY p.id ASC LIMIT 6
      `).all();

      // Real-time open/closed status calculation
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const now = new Date();
      const currentDayName = days[now.getDay()];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let isOpen = false;
      let todaySchedule = null;

      const schedule = operatingHours.find(h => h.day.toLowerCase() === currentDayName.toLowerCase());
      if (schedule && !schedule.is_closed) {
        todaySchedule = `${schedule.open} - ${schedule.close}`;
        const [openH, openM] = schedule.open.split(":").map(Number);
        const [closeH, closeM] = schedule.close.split(":").map(Number);
        const openTotal = openH * 60 + openM;
        const closeTotal = closeH * 60 + closeM;

        if (currentMinutes >= openTotal && currentMinutes < closeTotal) {
          isOpen = true;
        }
      } else {
        todaySchedule = "Tutup";
      }

      return res.json({
        success: true,
        data: {
          profile,
          facilities,
          operatingHours,
          isOpen,
          todaySchedule,
          promotions,
          featuredProducts,
          taxAndFees,
          orderingPolicy
        }
      });
    } catch (err) {
      logger.error("Failed to get public profile", err);
      return res.status(500).json({ success: false, message: "Gagal memuat profil cafe." });
    }
  }

  /**
   * PUT /api/profile
   * Admin updates cafe settings
   */
  static updateSettings(req, res) {
    try {
      const { profile, facilities, operating_hours, tax_and_fees, ordering_policy } = req.body;

      const updateSetting = db.prepare(`
        INSERT INTO cafe_settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `);

      const tx = db.transaction(() => {
        if (profile) updateSetting.run("profile", JSON.stringify(profile));
        if (facilities) updateSetting.run("facilities", JSON.stringify(facilities));
        if (operating_hours) updateSetting.run("operating_hours", JSON.stringify(operating_hours));
        if (tax_and_fees) updateSetting.run("tax_and_fees", JSON.stringify(tax_and_fees));
        if (ordering_policy) updateSetting.run("ordering_policy", JSON.stringify(ordering_policy));

        db.prepare(`
          INSERT INTO audit_logs (user_id, action, entity, entity_id, details)
          VALUES (?, 'UPDATE_PROFILE_SETTINGS', 'cafe_settings', 'all', 'Updated cafe profile and settings')
        `).run(req.user.id);
      });

      tx();

      return res.json({ success: true, message: "Pengaturan profil cafe berhasil diperbarui." });
    } catch (err) {
      logger.error("Failed to update profile settings", err);
      return res.status(500).json({ success: false, message: "Gagal menyimpan pengaturan: " + err.message });
    }
  }

  // Promotion Management
  static getPromotions(req, res) {
    try {
      const promos = db.prepare("SELECT * FROM promotions ORDER BY is_active DESC, valid_until DESC").all();
      return res.json({ success: true, data: promos });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data promo." });
    }
  }

  static createPromotion(req, res) {
    try {
      const { title, description, banner_image, discount_type, discount_value, min_spend, valid_from, valid_until, is_active } = req.body;
      if (!title || !discount_value || !valid_from || !valid_until) {
        return res.status(400).json({ success: false, message: "Judul, nilai diskon, dan periode promosi wajib diisi." });
      }

      const insert = db.prepare(`
        INSERT INTO promotions (title, description, banner_image, discount_type, discount_value, min_spend, valid_from, valid_until, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insert.run(
        title.trim(),
        description || "",
        banner_image || "",
        discount_type || "PERCENT",
        parseInt(discount_value, 10),
        parseInt(min_spend || 0, 10),
        valid_from,
        valid_until,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      );

      const created = db.prepare("SELECT * FROM promotions WHERE id = ?").get(result.lastInsertRowid);
      return res.status(201).json({ success: true, message: "Promosi berhasil dibuat.", data: created });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal membuat promosi: " + err.message });
    }
  }

  static updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const { title, description, banner_image, discount_type, discount_value, min_spend, valid_from, valid_until, is_active } = req.body;

      db.prepare(`
        UPDATE promotions SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          banner_image = COALESCE(?, banner_image),
          discount_type = COALESCE(?, discount_type),
          discount_value = COALESCE(?, discount_value),
          min_spend = COALESCE(?, min_spend),
          valid_from = COALESCE(?, valid_from),
          valid_until = COALESCE(?, valid_until),
          is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(
        title ? title.trim() : null,
        description !== undefined ? description : null,
        banner_image !== undefined ? banner_image : null,
        discount_type || null,
        discount_value !== undefined ? parseInt(discount_value, 10) : null,
        min_spend !== undefined ? parseInt(min_spend, 10) : null,
        valid_from || null,
        valid_until || null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      );

      const updated = db.prepare("SELECT * FROM promotions WHERE id = ?").get(id);
      return res.json({ success: true, message: "Promosi berhasil diperbarui.", data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal memperbarui promosi: " + err.message });
    }
  }

  static deletePromotion(req, res) {
    try {
      const { id } = req.params;
      db.prepare("DELETE FROM promotions WHERE id = ?").run(id);
      return res.json({ success: true, message: "Promosi berhasil dihapus." });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Gagal menghapus promosi." });
    }
  }
}

module.exports = ProfileController;
