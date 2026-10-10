import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Coffee, ArrowRight } from "lucide-react";
import { api } from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboard();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
        <Coffee size={40} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
        <p>Memuat analitik bisnis...</p>
      </div>
    );
  }

  const today = stats?.today || {};
  const month = stats?.month || {};
  const topProducts = stats?.topProducts || [];
  const lowStock = stats?.lowStockProducts || [];
  const recentOrders = stats?.recentOrders || [];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--primary)", margin: 0 }}>
          Ringkasan Bisnis & Penjualan
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginTop: "0.25rem" }}>
          Pantau performa penjualan, pergerakan antrean, dan ketersediaan stok Cafe Ruang Namu secara real-time.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Pendapatan Hari Ini</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)" }}>
            Rp {(today.revenue || 0).toLocaleString("id-ID")}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {today.paid_orders || 0} transaksi lunas terverifikasi
          </span>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Total Pesanan Hari Ini</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)" }}>
            {today.total_orders || 0}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Dari antrean QR meja dan kasir
          </span>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Pendapatan Bulan Ini</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)" }}>
            Rp {(month.revenue || 0).toLocaleString("id-ID")}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {month.paid_orders || 0} transaksi lunas bulan ini
          </span>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Peringatan Stok Rendah</span>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: lowStock.length > 0 ? "var(--danger-bg)" : "var(--success-bg)", color: lowStock.length > 0 ? "var(--danger)" : "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: lowStock.length > 0 ? "var(--danger)" : "var(--success)" }}>
            {lowStock.length} Menu
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Stok kurang dari 10 porsi
          </span>
        </div>
      </div>

      {/* Two Column Section: Top Selling & Low Stock */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Top 5 Products */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--primary)", marginBottom: "1rem" }}>
            ⭐ 5 Menu Paling Laris
          </h3>
          {topProducts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Belum ada data penjualan tercatat.</p>
          ) : (
            <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ paddingBottom: "0.5rem" }}>Nama Menu</th>
                  <th style={{ paddingBottom: "0.5rem", textAlign: "center" }}>Terjual</th>
                  <th style={{ paddingBottom: "0.5rem", textAlign: "right" }}>Total Omzet</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px dashed var(--border-light)" }}>
                    <td style={{ padding: "0.6rem 0", fontWeight: 600 }}>{p.product_name}</td>
                    <td style={{ padding: "0.6rem 0", textAlign: "center" }}>{p.total_qty} porsi</td>
                    <td style={{ padding: "0.6rem 0", textAlign: "right", color: "var(--accent)", fontWeight: 700 }}>
                      Rp {p.total_sales.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low Stock Warning */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--primary)", margin: 0 }}>
              ⚠️ Perlu Restock Segera
            </h3>
            <Link to="/admin/stock" style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.2rem" }}>
              Kelola Stok <ArrowRight size={13} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p style={{ color: "var(--success)", fontSize: "0.88rem" }}>Semua stok menu dalam kondisi aman.</p>
          ) : (
            <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ paddingBottom: "0.5rem" }}>Menu</th>
                  <th style={{ paddingBottom: "0.5rem", textAlign: "right" }}>Sisa Stok</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((ls) => (
                  <tr key={ls.id} style={{ borderBottom: "1px dashed var(--border-light)" }}>
                    <td style={{ padding: "0.6rem 0", fontWeight: 600 }}>{ls.name}</td>
                    <td style={{ padding: "0.6rem 0", textAlign: "right" }}>
                      <span className="badge badge-danger">{ls.stock} porsi</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", margin: 0 }}>
            Transaksi Terbaru
          </h3>
          <Link to="/admin/orders" className="btn btn-sm btn-outline">
            Lihat Semua Pesanan
          </Link>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.5rem 0.5rem" }}>No. Order</th>
                <th style={{ padding: "0.5rem 0.5rem" }}>Pelanggan</th>
                <th style={{ padding: "0.5rem 0.5rem" }}>Meja</th>
                <th style={{ padding: "0.5rem 0.5rem" }}>Status Bayar</th>
                <th style={{ padding: "0.5rem 0.5rem" }}>Status Pesanan</th>
                <th style={{ padding: "0.5rem 0.5rem", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: "1px dashed var(--border-light)" }}>
                  <td style={{ padding: "0.6rem 0.5rem", fontWeight: 700 }}>{ord.order_number}</td>
                  <td style={{ padding: "0.6rem 0.5rem" }}>{ord.customer_name}</td>
                  <td style={{ padding: "0.6rem 0.5rem" }}>{ord.table_number}</td>
                  <td style={{ padding: "0.6rem 0.5rem" }}>
                    <span className={`badge ${ord.payment_status === "PAID" ? "badge-success" : "badge-warning"}`}>
                      {ord.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.5rem" }}>
                    <span className="badge badge-info">{ord.status}</span>
                  </td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 700, color: "var(--primary)" }}>
                    Rp {ord.total.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
