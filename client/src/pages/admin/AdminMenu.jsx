import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Coffee, Check, X } from "lucide-react";
import { api } from "../../services/api";

export default function AdminMenu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    stock: "",
    description: "",
    image_url: "",
    is_featured: false,
    is_popular: false,
    is_promo: false
  });

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts("activeOnly=0"),
        api.getCategories()
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      category_id: categories[0]?.id || "",
      price: "",
      stock: "50",
      description: "",
      image_url: "",
      is_featured: false,
      is_popular: false,
      is_promo: false
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category_id: prod.category_id,
      price: String(prod.price),
      stock: String(prod.stock),
      description: prod.description || "",
      image_url: prod.image_url || "",
      is_featured: Boolean(prod.is_featured),
      is_popular: Boolean(prod.is_popular),
      is_promo: Boolean(prod.is_promo)
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        alert("Produk berhasil diperbarui.");
      } else {
        await api.createProduct(formData);
        alert("Produk baru berhasil ditambahkan.");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert("Gagal menyimpan produk: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menonaktifkan produk ini?")) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err) {
      alert("Gagal menonaktifkan produk: " + err.message);
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCat === "all" || String(p.category_id) === String(selectedCat);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
            Manajemen Menu & Katalog
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Kelola daftar minuman, hidangan, harga satuan, dan foto menu Cafe Ruang Namu.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Tambah Menu Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: "1rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "180px", padding: "0.5rem 0.75rem", fontSize: "0.88rem" }}
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px", paddingRight: "12px", fontSize: "0.88rem" }}
            placeholder="Cari nama menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-cream)", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.85rem 1rem" }}>Menu</th>
                <th style={{ padding: "0.85rem 1rem" }}>Kategori</th>
                <th style={{ padding: "0.85rem 1rem" }}>Harga</th>
                <th style={{ padding: "0.85rem 1rem" }}>Stok</th>
                <th style={{ padding: "0.85rem 1rem" }}>Badge</th>
                <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          style={{ width: "42px", height: "42px", borderRadius: "6px", objectFit: "cover" }}
                        />
                      )}
                      <div>
                        <strong style={{ color: "var(--primary)" }}>{p.name}</strong>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>{p.category_name}</td>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--accent)" }}>
                    Rp {p.price.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className={`badge ${p.stock < 10 ? "badge-danger" : "badge-success"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                      {p.is_popular ? <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Populer</span> : null}
                      {p.is_featured ? <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>Unggulan</span> : null}
                      {p.is_promo ? <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>Promo</span> : null}
                    </div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className={`badge ${p.is_active ? "badge-success" : "badge-danger"}`}>
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                      <button onClick={() => handleOpenEdit(p)} className="btn btn-sm btn-outline" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-outline" style={{ color: "var(--danger)" }} title="Nonaktifkan">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "2rem", maxWidth: "540px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
              {editingProduct ? "Edit Menu" : "Tambah Menu Baru"}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Nama Menu</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              {!editingProduct && (
                <div className="form-group">
                  <label className="form-label">Stok Awal</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">URL Foto Menu</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi & Racikan Menu</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  Unggulan (Beranda)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  />
                  Populer / Favorit
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_promo}
                    onChange={(e) => setFormData({ ...formData, is_promo: e.target.checked })}
                  />
                  Badge Promo
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Simpan Menu
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
