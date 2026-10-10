import React, { useState, useEffect } from "react";
import { QrCode, Plus, Printer, Check, X, Coffee } from "lucide-react";
import { api } from "../../services/api";

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [qrModalTable, setQrModalTable] = useState(null);
  const [qrImageData, setQrImageData] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    try {
      const res = await api.getTables();
      if (res.success) setTables(res.data);
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenQr = async (tbl) => {
    setQrModalTable(tbl);
    setQrImageData(null);
    try {
      const res = await api.getTableQr(tbl.id);
      if (res.success) {
        setQrImageData(res.qrDataUrl);
      }
    } catch (err) {
      alert("Gagal membuat QR meja: " + err.message);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    try {
      await api.createTable({ table_number: newTableNumber, capacity: newCapacity });
      alert("Meja berhasil ditambahkan.");
      setCreateModalOpen(false);
      setNewTableNumber("");
      loadTables();
    } catch (err) {
      alert("Gagal menambahkan meja: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
            Manajemen Meja & QR Code
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Kelola nomor meja fisik dan unduh QR Code akrilik untuk scan pemesanan mandiri pelanggan.
          </p>
        </div>
        <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Tambah Meja Baru
        </button>
      </div>

      {/* Tables Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1.25rem"
      }}>
        {tables.map((tbl) => (
          <div key={tbl.id} className="card" style={{ padding: "1.5rem", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto"
              }}>
                <Coffee size={28} />
              </div>

              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--primary)", marginBottom: "0.25rem" }}>
                {tbl.table_number}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Kapasitas: <strong>{tbl.capacity} Orang</strong>
              </p>
            </div>

            <button
              onClick={() => handleOpenQr(tbl)}
              className="btn btn-outline"
              style={{ width: "100%", gap: "0.5rem" }}
            >
              <QrCode size={16} /> Buka / Cetak QR Akrilik
            </button>
          </div>
        ))}
      </div>

      {/* QR Code Stand Card Modal */}
      {qrModalTable && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "2rem", maxWidth: "420px", textAlign: "center" }}>
            {/* Printable Acrylic Stand Card */}
            <div id="printable-receipt" style={{
              backgroundColor: "#FFFFFF",
              border: "2px solid var(--primary)",
              borderRadius: "var(--radius-md)",
              padding: "2rem 1.5rem",
              marginBottom: "1.5rem",
              color: "var(--primary)"
            }}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>
                CAFE RUANG NAMU
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 700, margin: "0.25rem 0 1rem 0" }}>
                PESAN DARI MEJA • SCAN & BAYAR
              </p>

              {/* QR Code Image */}
              <div style={{ padding: "0.75rem", display: "inline-block", backgroundColor: "var(--bg-cream)", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                {qrImageData ? (
                  <img src={qrImageData} alt="Table QR" style={{ width: "220px", height: "220px" }} />
                ) : (
                  <div style={{ width: "220px", height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode size={64} className="animate-spin" />
                  </div>
                )}
              </div>

              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-serif)" }}>
                {qrModalTable.table_number}
              </div>

              <p style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.5rem", lineHeight: 1.4 }}>
                Arahkan kamera HP Anda ke QR Code di atas. Pilih menu, bayar praktis via QRIS, dan pesanan akan diantar ke meja Anda.
              </p>
            </div>

            {/* Modal Controls */}
            <div className="no-print" style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1 }}>
                <Printer size={16} /> Cetak Stiker Meja
              </button>
              <button onClick={() => setQrModalTable(null)} className="btn btn-outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "2rem", maxWidth: "400px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "1rem" }}>
              Tambah Meja Baru
            </h3>
            <form onSubmit={handleCreateTable}>
              <div className="form-group">
                <label className="form-label">Nomor / Nama Meja</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Meja 13 atau Outdoor 01"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kapasitas Tempat Duduk (Orang)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Simpan Meja
                </button>
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-outline">
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
