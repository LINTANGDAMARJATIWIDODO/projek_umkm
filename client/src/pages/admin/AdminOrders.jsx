import React, { useState, useEffect } from "react";
import { Download, Search, Printer, Eye, Filter, RefreshCw, Coffee } from "lucide-react";
import { api } from "../../services/api";
import ReceiptModal from "../../components/ReceiptModal";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let params = "limit=200";
      if (statusFilter !== "all") params += `&status=${statusFilter}`;
      const res = await api.getOrders(params);
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.table_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
            Riwayat Seluruh Pesanan
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Rekap transaksi pesanan, status pembayaran QRIS & tunai, dan detail pemesanan.
          </p>
        </div>

        {/* CSV Export Button */}
        <a
          href={api.getExportCsvUrl()}
          download
          className="btn btn-outline"
          style={{ gap: "0.5rem" }}
        >
          <Download size={16} /> Ekspor Laporan CSV
        </a>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: "1rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="form-select"
            style={{ width: "auto", minWidth: "180px", padding: "0.5rem 0.75rem", fontSize: "0.88rem" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status Pesanan</option>
            <option value="PAID">PAID (Lunas Menunggu Antrean)</option>
            <option value="PREPARING">PREPARING (Sedang Dimasak)</option>
            <option value="READY_TO_SERVE">READY_TO_SERVE (Siap Diantar)</option>
            <option value="DELIVERED">DELIVERED (Selesai Diantar)</option>
            <option value="WAITING_PAYMENT">WAITING_PAYMENT (Belum Bayar)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
          </select>

          <button onClick={loadOrders} className="btn btn-sm btn-outline" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "36px", paddingRight: "12px", fontSize: "0.88rem" }}
            placeholder="Cari order ID, pelanggan, meja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-cream)", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.85rem 1rem" }}>No. Order</th>
                <th style={{ padding: "0.85rem 1rem" }}>Waktu</th>
                <th style={{ padding: "0.85rem 1rem" }}>Pelanggan & Meja</th>
                <th style={{ padding: "0.85rem 1rem" }}>Status Bayar</th>
                <th style={{ padding: "0.85rem 1rem" }}>Status Pesanan</th>
                <th style={{ padding: "0.85rem 1rem" }}>Metode</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Total</th>
                <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--primary)" }}>
                    {ord.order_number}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    {new Date(ord.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <strong>{ord.customer_name}</strong>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {ord.table_number}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className={`badge ${ord.payment_status === "PAID" ? "badge-success" : "badge-warning"}`}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className="badge badge-info">{ord.status}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem" }}>
                    {ord.payment_method === "CASH" ? "Tunai Kasir" : "QRIS Dinamis"}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>
                    Rp {ord.total.toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="btn btn-sm btn-outline"
                      title="Lihat & Cetak Struk"
                    >
                      <Printer size={14} /> Struk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
