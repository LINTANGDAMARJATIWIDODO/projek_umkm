import React, { useState, useEffect } from "react";
import { Archive, Plus, Minus, Search, History, ArrowDown, ArrowUp } from "lucide-react";
import { api } from "../../services/api";

export default function AdminStock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("CURRENT"); // CURRENT or HISTORY
  const [search, setSearch] = useState("");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [changeQty, setChangeQty] = useState("");
  const [reason, setReason] = useState("RESTOCK");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [prodRes, movRes] = await Promise.all([
        api.getProducts("activeOnly=0"),
        api.getStockMovements()
      ]);
      if (prodRes.success) setProducts(prodRes.data);
      if (movRes.success) setMovements(movRes.data);
    } catch (err) {
      console.error("Failed to load stock data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdjust = (prod) => {
    setSelectedProduct(prod);
    setChangeQty("");
    setReason("RESTOCK");
    setNotes("");
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qty = parseInt(changeQty, 10);
    if (isNaN(qty) || qty === 0) {
      alert("Masukkan jumlah perubahan stok yang valid (bukan 0).");
      return;
    }

    try {
      await api.adjustStock(selectedProduct.id, {
        change_qty: qty,
        reason,
        notes
      });
      alert("Stok berhasil diperbarui.");
      setAdjustModalOpen(false);
      loadData();
    } catch (err) {
      alert("Gagal menyesuaikan stok: " + err.message);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
          Manajemen Stok & Mutasi
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
          Pantau stok bahan/menu Cafe Ruang Namu dan riwayat perubahan stok secara transparan.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveSubTab("CURRENT")}
          className={`btn btn-sm ${activeSubTab === "CURRENT" ? "btn-primary" : "btn-outline"}`}
        >
          <Archive size={15} /> Stok Saat Ini
        </button>
        <button
          onClick={() => setActiveSubTab("HISTORY")}
          className={`btn btn-sm ${activeSubTab === "HISTORY" ? "btn-primary" : "btn-outline"}`}
        >
          <History size={15} /> Riwayat Mutasi Stok ({movements.length})
        </button>
      </div>

      {activeSubTab === "CURRENT" ? (
        <div>
          {/* Search */}
          <div className="card" style={{ padding: "0.75rem 1rem", marginBottom: "1.25rem", maxWidth: "400px" }}>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "34px", paddingRight: "10px", fontSize: "0.85rem" }}
                placeholder="Cari menu untuk cek stok..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-cream)", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.85rem 1rem" }}>Menu</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Kategori</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Harga</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Stok Tersedia</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>{p.category_name}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>Rp {p.price.toLocaleString("id-ID")}</td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span className={`badge ${p.stock < 10 ? "badge-danger" : "badge-success"}`}>
                        {p.stock} porsi
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="btn btn-sm btn-outline"
                      >
                        Penyesuaian Stok
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* History Movements */
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-cream)", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.85rem 1rem" }}>Waktu</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Menu</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Perubahan</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Sebelum</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Sesudah</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Alasan</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Referensi</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                      {new Date(m.created_at).toLocaleString("id-ID")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{m.product_name}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        color: m.change_qty > 0 ? "var(--success)" : "var(--danger)",
                        fontWeight: 700
                      }}>
                        {m.change_qty > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {m.change_qty > 0 ? `+${m.change_qty}` : m.change_qty}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{m.previous_stock}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>{m.new_stock}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span className="badge badge-info">{m.reason}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                      {m.reference_id || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "2rem", maxWidth: "440px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "0.5rem" }}>
              Penyesuaian Stok
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Menu: <strong>{selectedProduct.name}</strong> • Stok Saat Ini: <strong>{selectedProduct.stock}</strong>
            </p>

            <form onSubmit={handleSaveAdjust}>
              <div className="form-group">
                <label className="form-label">
                  Perubahan Kuantitas (Gunakan tanda minus untuk mengurangi)
                </label>
                <input
                  type="number"
                  required
                  className="form-input"
                  placeholder="Contoh: +20 untuk restock, atau -5 untuk rusak"
                  value={changeQty}
                  onChange={(e) => setChangeQty(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alasan Perubahan</label>
                <select
                  className="form-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="RESTOCK">Restock / Belanja Bahan Baru</option>
                  <option value="MANUAL_ADJUST">Penyesuaian Fisik / Audit Opname</option>
                  <option value="ORDER_CANCELLED">Pembatalan Pesanan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Tambahan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Catatan penyesuaian..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setAdjustModalOpen(false)} className="btn btn-outline">
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
