import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, ChefHat, Bell, ThumbsUp, Printer, AlertCircle, Coffee, ArrowLeft } from "lucide-react";
import { api } from "../../services/api";
import ReceiptModal from "../../components/ReceiptModal";

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.getOrder(orderId, token);
        if (res.success) {
          setOrder(res.data);
          setError("");
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || "Gagal memuat status pesanan.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderId, token]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem 0", color: "var(--text-muted)" }}>
        <Coffee size={40} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
        <p>Memuat status pesanan Anda...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ maxWidth: "600px", padding: "4rem 1rem", textAlign: "center" }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: "0 auto 1rem auto" }} />
        <h2 style={{ fontFamily: "var(--font-serif)", color: "var(--primary)" }}>Pesanan Tidak Ditemukan</h2>
        <p style={{ color: "var(--text-muted)", margin: "0.5rem 0 1.5rem 0" }}>{error}</p>
        <Link to="/order" className="btn btn-primary">
          <ArrowLeft size={16} /> Kembali ke Menu Pemesanan
        </Link>
      </div>
    );
  }

  const steps = [
    { key: "PAID", label: "Pembayaran Terverifikasi", icon: <CheckCircle2 size={18} />, desc: "Pembayaran QRIS lunas diterima sistem." },
    { key: "PREPARING", label: "Sedang Dipersiapkan", icon: <ChefHat size={18} />, desc: "Barista & dapur sedang meracik pesanan Anda." },
    { key: "READY_TO_SERVE", label: "Siap Disajikan", icon: <Bell size={18} />, desc: "Pesanan siap diantar ke meja Anda." },
    { key: "DELIVERED", label: "Pesanan Selesai", icon: <ThumbsUp size={18} />, desc: "Selamat menikmati sajian Cafe Ruang Namu." }
  ];

  const getStepStatus = (stepKey) => {
    const orderStatus = order.status;
    const hierarchy = ["WAITING_PAYMENT", "PAID", "PREPARING", "READY_TO_SERVE", "DELIVERED"];
    const currentIndex = hierarchy.indexOf(orderStatus);
    const stepIndex = hierarchy.indexOf(stepKey);

    if (orderStatus === "CANCELLED") return "cancelled";
    if (currentIndex >= stepIndex) return "completed";
    return "pending";
  };

  return (
    <div style={{ padding: "2.5rem 0 5rem 0" }}>
      <div className="container" style={{ maxWidth: "650px" }}>
        {/* Status Card */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: order.payment_status === "PAID" ? "var(--success-bg)" : "var(--warning-bg)",
            color: order.payment_status === "PAID" ? "var(--success)" : "var(--warning)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto"
          }}>
            {order.status === "DELIVERED" ? <ThumbsUp size={30} /> : <Coffee size={30} />}
          </div>

          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--primary)", marginBottom: "0.25rem" }}>
            {order.status === "DELIVERED" ? "Pesanan Sudah Diantar" :
             order.status === "READY_TO_SERVE" ? "Pesanan Siap Diantar" :
             order.status === "PREPARING" ? "Sedang Diracik di Dapur" :
             order.status === "PAID" ? "Pembayaran Terverifikasi" : "Menunggu Pembayaran"}
          </h2>

          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Nomor Pesanan: <strong>{order.order_number}</strong> • <strong>{order.table_number}</strong>
          </p>

          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setReceiptOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Printer size={15} /> Buka / Cetak Struk Digital
            </button>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--primary)", marginBottom: "1.5rem" }}>
            Progres Pesanan Anda
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {steps.map((st, idx) => {
              const status = getStepStatus(st.key);
              const isCompleted = status === "completed";
              return (
                <div key={st.key} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", opacity: isCompleted ? 1 : 0.45 }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: isCompleted ? "var(--primary)" : "var(--bg-sand)",
                    color: isCompleted ? "#FFFFFF" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {st.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                      {st.label}
                    </h4>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--primary)", marginBottom: "1rem" }}>
            Rincian Menu ({order.items?.length || 0})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
            {(order.items || []).map((it) => (
              <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{it.quantity}x {it.product_name}</span>
                  {it.notes && <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>Catatan: {it.notes}</span>}
                </div>
                <span>Rp {it.subtotal.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "var(--primary)" }}>
            <span>Total:</span>
            <span style={{ color: "var(--accent)" }}>Rp {order.total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link to="/order" className="btn btn-outline btn-sm">
            + Pesan Menu Tambahan
          </Link>
        </div>
      </div>

      {receiptOpen && (
        <ReceiptModal order={order} onClose={() => setReceiptOpen(false)} />
      )}
    </div>
  );
}
