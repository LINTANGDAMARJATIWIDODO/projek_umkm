import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  Coffee, RefreshCw, Search, Volume2, VolumeX, CheckCircle, Clock, 
  ChefHat, Bell, ThumbsUp, DollarSign, Printer, AlertTriangle, Shield,
  ArrowRight, Sparkles, Filter
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ReceiptModal from "../../components/ReceiptModal";
import TiltCard from "../../components/TiltCard";

export default function CashierPage() {
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL_ACTIVE");
  const [search, setSearch] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString("id-ID"));

  // Cash Modal State
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashOrder, setCashOrder] = useState(null);
  const [cashReceived, setCashReceived] = useState("");
  const [cashLoading, setCashLoading] = useState(false);
  const [cashError, setCashError] = useState("");

  const prevOrdersCountRef = useRef(0);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio chime for new incoming orders
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders("limit=120");
      if (res.success) {
        const newOrders = res.data;
        const newPaidCount = newOrders.filter(o => o.status === "PAID").length;
        if (newPaidCount > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
          playChime();
        }
        prevOrdersCountRef.current = newPaidCount;
        setOrders(newOrders);
      }
    } catch (err) {
      console.error("Failed to poll cashier orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3500);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, { status: newStatus });
      if (res.success) fetchOrders();
    } catch (err) {
      alert("Gagal memperbarui status: " + err.message);
    }
  };

  const handleOpenCashModal = (order) => {
    setCashOrder(order);
    setCashReceived(String(order.total));
    setCashError("");
    setCashModalOpen(true);
  };

  const handleSubmitCash = async () => {
    if (!cashOrder) return;
    const amount = parseInt(cashReceived, 10);
    if (isNaN(amount) || amount < cashOrder.total) {
      setCashError(`Uang tunai kurang dari total tagihan (Rp ${cashOrder.total.toLocaleString("id-ID")})`);
      return;
    }

    setCashLoading(true);
    setCashError("");
    try {
      const res = await api.processCashPayment({
        order_id: cashOrder.id,
        cash_received: amount
      });
      if (res.success) {
        setCashModalOpen(false);
        fetchOrders();
        const updated = await api.getOrder(cashOrder.id);
        setSelectedReceiptOrder(updated.data);
      }
    } catch (err) {
      setCashError(err.message);
    } finally {
      setCashLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.table_number.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (activeTab === "ALL_ACTIVE") {
      return ["WAITING_PAYMENT", "PAID", "PREPARING", "READY_TO_SERVE"].includes(o.status);
    }
    if (activeTab === "PAID") return o.status === "PAID";
    if (activeTab === "PREPARING") return o.status === "PREPARING";
    if (activeTab === "READY_TO_SERVE") return o.status === "READY_TO_SERVE";
    if (activeTab === "WAITING_PAYMENT") return o.status === "WAITING_PAYMENT";
    if (activeTab === "DELIVERED") return o.status === "DELIVERED";
    return true;
  });

  const countBy = (st) => orders.filter((o) => o.status === st).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", display: "flex", flexDirection: "column" }}>
      {/* POS SPECIALIZED OPERATIONAL TOP BAR */}
      <header style={{
        backgroundColor: "var(--bg-coffee)",
        color: "#FFFFFF",
        padding: "0.85rem 1.75rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        borderBottom: "3px solid var(--accent)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
      }}>
        {/* Brand & Ticker */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            backgroundColor: "var(--accent)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(200, 109, 59, 0.4)"
          }}>
            <Coffee size={24} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                KASIR OPERASIONAL & DAPUR
              </span>
              <span style={{
                backgroundColor: "rgba(200, 109, 59, 0.25)",
                color: "#FDBA74",
                border: "1px solid rgba(200, 109, 59, 0.5)",
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.15rem 0.5rem",
                borderRadius: "4px"
              }}>
                POS DESK
              </span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#D1C7BD" }}>
              Ruang Namu • Waktu: <strong>{currentTime} WIB</strong> • Petugas: <strong>{user?.name || "Kasir"}</strong>
            </span>
          </div>
        </div>

        {/* Quick Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="btn btn-sm btn-outline"
            style={{
              color: "#FFFFFF",
              borderColor: "rgba(255,255,255,0.25)",
              backgroundColor: soundEnabled ? "rgba(30, 126, 52, 0.25)" : "rgba(255,255,255,0.06)"
            }}
            title="Toggle notifikasi suara"
          >
            {soundEnabled ? <Volume2 size={16} color="#86EFAC" /> : <VolumeX size={16} color="#D1C7BD" />}
            <span style={{ fontSize: "0.78rem" }}>{soundEnabled ? "Bel Aktif" : "Hening"}</span>
          </button>

          <button
            onClick={fetchOrders}
            className="btn btn-sm btn-outline"
            style={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.06)" }}
            title="Segarkan antrean sekarang"
          >
            <RefreshCw size={15} />
          </button>

          {user?.role === "admin" && (
            <Link to="/admin" className="btn btn-sm btn-outline" style={{ color: "#FDE047", borderColor: "rgba(253, 224, 71, 0.4)", backgroundColor: "rgba(253, 224, 71, 0.1)" }}>
              <Shield size={14} /> Panel Owner
            </Link>
          )}

          <button onClick={logout} className="btn btn-sm btn-danger" style={{ fontSize: "0.78rem" }}>
            Logout
          </button>
        </div>
      </header>

      {/* POS STATUS RIBBON */}
      <div style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-color)",
        padding: "0.75rem 1.75rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--accent)" }} />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Pesanan Aktif</span>
            <strong style={{ fontSize: "1.15rem", color: "var(--primary)" }}>
              {orders.filter(o => ["WAITING_PAYMENT", "PAID", "PREPARING", "READY_TO_SERVE"].includes(o.status)).length} Meja
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--success)" }} />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Perlu Dimasak Segera</span>
            <strong style={{ fontSize: "1.15rem", color: "var(--success)" }}>
              {countBy("PAID")} Pesanan
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--warning)" }} />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Sedang Dibuat di Dapur</span>
            <strong style={{ fontSize: "1.15rem", color: "var(--warning)" }}>
              {countBy("PREPARING")} Pesanan
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--info)" }} />
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Siap Diantar ke Meja</span>
            <strong style={{ fontSize: "1.15rem", color: "var(--info)" }}>
              {countBy("READY_TO_SERVE")} Pesanan
            </strong>
          </div>
        </div>
      </div>

      {/* OPERATIONAL QUEUE BOARD */}
      <div style={{ flex: 1, padding: "1.5rem 1.75rem" }}>
        {/* Filter Navigation & Search Bar */}
        <div style={{ marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("ALL_ACTIVE")}
              className={`btn btn-sm ${activeTab === "ALL_ACTIVE" ? "btn-primary" : "btn-outline"}`}
            >
              Semua Antrean Aktif
            </button>
            <button
              onClick={() => setActiveTab("PAID")}
              className={`btn btn-sm ${activeTab === "PAID" ? "btn-accent" : "btn-outline"}`}
              style={{
                backgroundColor: activeTab === "PAID" ? "var(--success)" : "transparent",
                color: activeTab === "PAID" ? "#FFFFFF" : "inherit"
              }}
            >
              ⭐ Baru Lunas ({countBy("PAID")})
            </button>
            <button
              onClick={() => setActiveTab("PREPARING")}
              className={`btn btn-sm ${activeTab === "PREPARING" ? "btn-primary" : "btn-outline"}`}
            >
              🍳 Sedang Dimasak ({countBy("PREPARING")})
            </button>
            <button
              onClick={() => setActiveTab("READY_TO_SERVE")}
              className={`btn btn-sm ${activeTab === "READY_TO_SERVE" ? "btn-primary" : "btn-outline"}`}
            >
              🔔 Siap Diantar ({countBy("READY_TO_SERVE")})
            </button>
            <button
              onClick={() => setActiveTab("WAITING_PAYMENT")}
              className={`btn btn-sm ${activeTab === "WAITING_PAYMENT" ? "btn-primary" : "btn-outline"}`}
            >
              ⏳ Menunggu Kasir ({countBy("WAITING_PAYMENT")})
            </button>
            <button
              onClick={() => setActiveTab("DELIVERED")}
              className={`btn btn-sm ${activeTab === "DELIVERED" ? "btn-primary" : "btn-outline"}`}
            >
              ✅ Selesai ({countBy("DELIVERED")})
            </button>
          </div>

          <div style={{ position: "relative", minWidth: "280px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "38px", fontSize: "0.88rem" }}
              placeholder="Cari Meja, Nama, No Order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Card Grid with 3D Tilt */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--text-muted)" }}>
            <Coffee size={40} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
            <p>Memuat antrean operasional...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
            <CheckCircle size={48} style={{ opacity: 0.25, margin: "0 auto 1rem auto" }} />
            <h3 style={{ fontFamily: "var(--font-serif)" }}>Antrean Selesai</h3>
            <p style={{ fontSize: "0.88rem" }}>Tidak ada pesanan aktif pada kategori ini saat ini.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
            gap: "1.25rem"
          }}>
            {filteredOrders.map((ord) => {
              const isPaid = ord.payment_status === "PAID";
              const timeStr = new Date(ord.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

              return (
                <TiltCard key={ord.id} maxTilt={6} glare={false}>
                  <div className="card" style={{
                    padding: "1.25rem",
                    borderLeft: `5px solid ${
                      ord.status === "PAID" ? "var(--success)" :
                      ord.status === "PREPARING" ? "var(--warning)" :
                      ord.status === "READY_TO_SERVE" ? "var(--info)" :
                      ord.status === "DELIVERED" ? "#9CA3AF" : "var(--accent)"
                    }`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      {/* Card Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                        <div>
                          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                            {ord.table_number}
                          </span>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block" }}>
                            {ord.order_number} • {timeStr} WIB
                          </span>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span className={`badge ${isPaid ? "badge-success" : "badge-warning"}`}>
                            {isPaid ? "LUNAS" : "BELUM BAYAR"}
                          </span>
                          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            {ord.payment_method === "CASH" ? "Tunai" : "QRIS Dinamis"}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                        Pelanggan: <strong>{ord.customer_name}</strong>
                      </div>

                      {/* Items Box */}
                      <div style={{
                        backgroundColor: "var(--bg-main)",
                        padding: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-light)",
                        marginBottom: "1rem",
                        maxHeight: "170px",
                        overflowY: "auto"
                      }}>
                        {(ord.items || []).map((it) => (
                          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                            <div>
                              <span style={{ fontWeight: 700 }}>{it.quantity}x</span> {it.product_name}
                              {it.notes && <span style={{ display: "block", fontSize: "0.74rem", color: "var(--danger)", fontStyle: "italic" }}>• {it.notes}</span>}
                            </div>
                            <span>Rp {it.subtotal.toLocaleString("id-ID")}</span>
                          </div>
                        ))}

                        {ord.notes && (
                          <div style={{ marginTop: "0.4rem", paddingTop: "0.4rem", borderTop: "1px dashed var(--border-color)", fontSize: "0.76rem", color: "var(--accent)", fontWeight: 600 }}>
                            Catatan: {ord.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer & Actions */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Total:</span>
                        <strong style={{ fontSize: "1.15rem", color: "var(--primary)" }}>
                          Rp {ord.total.toLocaleString("id-ID")}
                        </strong>
                      </div>

                      <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                        {ord.status === "WAITING_PAYMENT" && (
                          <button
                            onClick={() => handleOpenCashModal(ord)}
                            className="btn btn-sm btn-accent"
                            style={{ flex: 1 }}
                          >
                            <DollarSign size={14} /> Bayar Tunai
                          </button>
                        )}

                        {ord.status === "PAID" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "PREPARING")}
                            className="btn btn-sm btn-primary"
                            style={{ flex: 1 }}
                          >
                            <ChefHat size={14} /> Mulai Masak
                          </button>
                        )}

                        {ord.status === "PREPARING" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "READY_TO_SERVE")}
                            className="btn btn-sm btn-accent"
                            style={{ flex: 1 }}
                          >
                            <Bell size={14} /> Siap Diantar
                          </button>
                        )}

                        {ord.status === "READY_TO_SERVE" && (
                          <button
                            onClick={() => handleUpdateStatus(ord.id, "DELIVERED")}
                            className="btn btn-sm btn-success"
                            style={{ flex: 1 }}
                          >
                            <ThumbsUp size={14} /> Selesai Diantar
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="btn btn-sm btn-outline"
                          title="Cetak Struk Kasir / Dapur"
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Cash Payment Drawer / Modal */}
      {cashModalOpen && cashOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "1.75rem", maxWidth: "420px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "0.2rem" }}>
              Penerimaan Uang Tunai
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              {cashOrder.table_number} • {cashOrder.order_number}
            </p>

            <div style={{ backgroundColor: "var(--bg-main)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.25rem", border: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Tagihan:</span>
              <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--primary)" }}>
                Rp {cashOrder.total.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nominal Uang Diterima (Rp)</label>
              <input
                type="number"
                className="form-input"
                style={{ fontSize: "1.1rem", fontWeight: 700 }}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />
            </div>

            {/* Quick cash denomination buttons */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {[cashOrder.total, 50000, 100000, 200000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashReceived(String(amt))}
                  className="btn btn-sm btn-outline"
                  style={{ fontSize: "0.78rem" }}
                >
                  Rp {amt.toLocaleString("id-ID")}
                </button>
              ))}
            </div>

            {parseInt(cashReceived, 10) >= cashOrder.total && (
              <div style={{ backgroundColor: "var(--success-bg)", padding: "0.75rem", borderRadius: "var(--radius-sm)", color: "var(--success)", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.8rem", display: "block" }}>Kembalian Kasir:</span>
                <strong style={{ fontSize: "1.35rem" }}>
                  Rp {(parseInt(cashReceived, 10) - cashOrder.total).toLocaleString("id-ID")}
                </strong>
              </div>
            )}

            {cashError && (
              <div style={{ padding: "0.6rem", backgroundColor: "var(--danger-bg)", color: "var(--danger)", fontSize: "0.82rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
                {cashError}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button
                onClick={handleSubmitCash}
                disabled={cashLoading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {cashLoading ? "Menyimpan..." : "Lunas & Cetak Struk"}
              </button>
              <button onClick={() => setCashModalOpen(false)} className="btn btn-outline">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </div>
  );
}
