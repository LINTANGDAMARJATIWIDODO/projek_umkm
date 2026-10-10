const db = require("../db/database");
const { logger } = require("../utils/logger");

class ProductController {
  static getAll(req, res) {
    try {
      const { category, featured, popular, promo, search, activeOnly = "1" } = req.query;

      let query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (activeOnly === "1") {
        query += " AND p.is_active = 1 AND c.is_active = 1";
      }

      if (category) {
        query += " AND (c.slug = ? OR c.id = ?)";
        params.push(category, category);
      }

      if (featured === "1") {
        query += " AND p.is_featured = 1";
      }

      if (popular === "1") {
        query += " AND p.is_popular = 1";
      }

      if (promo === "1") {
        query += " AND p.is_promo = 1";
      }

      if (search) {
        query += " AND (p.name LIKE ? OR p.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      query += " ORDER BY c.sort_order ASC, p.id ASC";

      const products = db.prepare(query).all(...params);
      return res.json({ success: true, data: products });
    } catch (err) {
      logger.error("Error fetching products", err);
      return res.status(500).json({ success: false, message: "Gagal mengambil data produk." });
    }
  }

  static getById(req, res) {
    try {
      const { id } = req.params;
      const product = db.prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).get(id);

      if (!product) {
        return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
      }

      return res.json({ success: true, data: product });
    } catch (err) {
      logger.error("Error fetching product detail", err);
      return res.status(500).json({ success: false, message: "Gagal mengambil detail produk." });
    }
  }

  static create(req, res) {
    try {
      const { category_id, name, description, price, stock, image_url, is_featured, is_popular, is_promo } = req.body;

      if (!category_id || !name || price === undefined) {
        return res.status(400).json({ success: false, message: "Kategori, nama, dan harga wajib diisi." });
      }

      const parsedPrice = parseInt(price, 10);
      const parsedStock = parseInt(stock || 0, 10);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, message: "Harga harus berupa angka positif." });
      }

      const insert = db.prepare(`
        INSERT INTO products (
          category_id, name, description, price, stock, image_url,
          is_featured, is_popular, is_promo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insert.run(
        category_id,
        name.trim(),
        description || "",
        parsedPrice,
        parsedStock,
        image_url || "",
        is_featured ? 1 : 0,
        is_popular ? 1 : 0,
        is_promo ? 1 : 0
      );

      // Record initial stock movement if stock > 0
      if (parsedStock > 0) {
        db.prepare(`
          INSERT INTO stock_movements (product_id, change_qty, previous_stock, new_stock, reason, created_by)
          VALUES (?, ?, 0, ?, 'RESTOCK', ?)
        `).run(result.lastInsertRowid, parsedStock, parsedStock, req.user.id);
      }

      const created = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid);
      return res.status(201).json({ success: true, message: "Produk berhasil ditambahkan.", data: created });
    } catch (err) {
      logger.error("Error creating product", err);
      return res.status(500).json({ success: false, message: "Gagal membuat produk: " + err.message });
    }
  }

  static update(req, res) {
    try {
      const { id } = req.params;
      const { category_id, name, description, price, image_url, is_featured, is_popular, is_promo, is_active } = req.body;

      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
      }

      const update = db.prepare(`
        UPDATE products SET
          category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          image_url = COALESCE(?, image_url),
          is_featured = COALESCE(?, is_featured),
          is_popular = COALESCE(?, is_popular),
          is_promo = COALESCE(?, is_promo),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      update.run(
        category_id || null,
        name ? name.trim() : null,
        description !== undefined ? description : null,
        price !== undefined ? parseInt(price, 10) : null,
        image_url !== undefined ? image_url : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        is_popular !== undefined ? (is_popular ? 1 : 0) : null,
        is_promo !== undefined ? (is_promo ? 1 : 0) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      );

      const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
      return res.json({ success: true, message: "Produk berhasil diperbarui.", data: updated });
    } catch (err) {
      logger.error("Error updating product", err);
      return res.status(500).json({ success: false, message: "Gagal memperbarui produk: " + err.message });
    }
  }

  static adjustStock(req, res) {
    try {
      const { id } = req.params;
      const { change_qty, reason, notes } = req.body;

      const qty = parseInt(change_qty, 10);
      if (isNaN(qty) || qty === 0) {
        return res.status(400).json({ success: false, message: "Perubahan kuantitas stok harus berupa angka bukan nol." });
      }

      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
      }

      const newStock = product.stock + qty;
      if (newStock < 0) {
        return res.status(400).json({ success: false, message: `Stok tidak boleh bernilai negatif (Stok saat ini: ${product.stock}).` });
      }

      const tx = db.transaction(() => {
        db.prepare("UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(newStock, id);

        db.prepare(`
          INSERT INTO stock_movements (product_id, change_qty, previous_stock, new_stock, reason, reference_id, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          qty,
          product.stock,
          newStock,
          reason || "MANUAL_ADJUST",
          notes || "Penyesuaian manual oleh staf",
          req.user.id
        );
      });

      tx();

      return res.json({
        success: true,
        message: "Stok berhasil disesuaikan.",
        data: { productId: id, previousStock: product.stock, newStock }
      });
    } catch (err) {
      logger.error("Error adjusting stock", err);
      return res.status(500).json({ success: false, message: "Gagal menyesuaikan stok: " + err.message });
    }
  }

  static delete(req, res) {
    try {
      const { id } = req.params;
      // Soft-delete by setting is_active = 0 to prevent breaking past order references
      db.prepare("UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      return res.json({ success: true, message: "Produk berhasil dinonaktifkan." });
    } catch (err) {
      logger.error("Error deleting product", err);
      return res.status(500).json({ success: false, message: "Gagal menonaktifkan produk: " + err.message });
    }
  }
}

module.exports = ProductController;
