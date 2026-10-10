const db = require("../db/database");
const { logger } = require("../utils/logger");

class CategoryController {
  static getAll(req, res) {
    try {
      const categories = db.prepare("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC").all();
      return res.json({ success: true, data: categories });
    } catch (err) {
      logger.error("Error fetching categories", err);
      return res.status(500).json({ success: false, message: "Gagal mengambil kategori." });
    }
  }

  static create(req, res) {
    try {
      const { name, slug, icon, sort_order } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: "Nama kategori wajib diisi." });
      }

      const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const insert = db.prepare("INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)");
      const result = insert.run(name.trim(), generatedSlug, icon || "Coffee", parseInt(sort_order || 0, 10));

      const created = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid);
      return res.status(201).json({ success: true, message: "Kategori berhasil dibuat.", data: created });
    } catch (err) {
      logger.error("Error creating category", err);
      return res.status(500).json({ success: false, message: "Gagal membuat kategori: " + err.message });
    }
  }

  static update(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, icon, sort_order, is_active } = req.body;

      db.prepare(`
        UPDATE categories SET
          name = COALESCE(?, name),
          slug = COALESCE(?, slug),
          icon = COALESCE(?, icon),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(
        name ? name.trim() : null,
        slug || null,
        icon || null,
        sort_order !== undefined ? parseInt(sort_order, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      );

      const updated = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
      return res.json({ success: true, message: "Kategori berhasil diperbarui.", data: updated });
    } catch (err) {
      logger.error("Error updating category", err);
      return res.status(500).json({ success: false, message: "Gagal memperbarui kategori: " + err.message });
    }
  }

  static delete(req, res) {
    try {
      const { id } = req.params;
      // Check if products are using this category
      const count = db.prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1").get(id).count;
      if (count > 0) {
        return res.status(400).json({ success: false, message: `Tidak dapat menghapus kategori. Masih terdapat ${count} produk aktif dalam kategori ini.` });
      }

      db.prepare("UPDATE categories SET is_active = 0 WHERE id = ?").run(id);
      return res.json({ success: true, message: "Kategori dinonaktifkan." });
    } catch (err) {
      logger.error("Error deleting category", err);
      return res.status(500).json({ success: false, message: "Gagal menghapus kategori: " + err.message });
    }
  }
}

module.exports = CategoryController;
