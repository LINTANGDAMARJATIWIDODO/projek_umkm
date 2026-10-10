import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, Calendar, ShieldCheck } from "lucide-react";
import { api } from "../../services/api";

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner_image: "",
    discount_type: "PERCENT",
    discount_value: "10",
    min_spend: "50000",
    valid_from: new Date().toISOString().split("T")[0],
    valid_until: "2026-12-31",
    is_active: true
  });

  const loadPromos = async () => {
    try {
      const res = await api.getPromotions();
      if (res.success) setPromotions(res.data);
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      title: "",
      description: "",
      banner_image: "",
      discount_type: "PERCENT",
      discount_value: "10",
      min_spend: "50000",
      valid_from: new Date().toISOString().split("T")[0],
      valid_until: "2026-12-31",
      is_active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPromo(p);
    setFormData({
      title: p.title,
      description: p.description || "",
      banner_image: p.banner_image || "",
      discount_type: p.discount_type,
      discount_value: String(p.discount_value),
      min_spend: String(p.min_spend || 0),
      valid_from: p.valid_from,
      valid_until: p.valid_until,
      is_active: Boolean(p.is_active)
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await api.updatePromotion(editingPromo.id, formData);
        alert("Promo berhasil diperbarui.");
      } else {
        await api.createPromotion(formData);
        alert("Promo baru berhasil ditambahkan.");
      }
      setModalOpen(false);
      loadPromos();
    } catch (err) {
      alert("Gagal menyimpan promo: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus promo ini?")) return;
    try {
      await api.deletePromotion(id);
      loadPromos();
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
            Manajemen Promosi & Diskon
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Kelola banner diskon, syarat minimum belanja, dan masa berlaku promo cafe.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Tambah Promosi Baru
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {promotions.map((p) => (
          <div key={p.id} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span className="badge badge-warning">
                  <Tag size={13} /> {p.discount_type === "PERCENT" ? `Diskon ${p.discount_value}%` : `Potongan Rp ${p.discount_value.toLocaleString("id-ID")}`}
                </span>
                <span className={`badge ${p.is_active ? "badge-success" : "badge-danger"}`}>
                  {p.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.4rem" }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
                {p.description}
              </p>

              <div style={{ fontSize: "0.8rem", color: "var(--text-main)", backgroundColor: "var(--bg-sand)", padding: "0.6rem 0.8rem", borderRadius: "6px", marginBottom: "1rem" }}>
                <div>Periode: <strong>{p.valid_from} s.d. {p.valid_until}</strong></div>
                {p.min_spend > 0 && <div>Min. Belanja: Rp {p.min_spend.toLocaleString("id-ID")}</div>}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
              <button onClick={() => handleOpenEdit(p)} className="btn btn-sm btn-outline" style={{ flex: 1 }}>
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-outline" style={{ color: "var(--danger)" }}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "2rem", maxWidth: "500px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
              {editingPromo ? "Edit Promosi" : "Tambah Promosi Baru"}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Judul Promosi</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Promo</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Tipe Diskon</label>
                  <select
                    className="form-select"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  >
                    <option value="PERCENT">Persentase (%)</option>
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nilai Diskon</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Belanja (Rp)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.min_spend}
                  onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Berakhir</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Promosi Aktif & Ditampilkan ke Publik
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Simpan Promosi
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
