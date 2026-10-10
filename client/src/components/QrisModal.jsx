import React, { useState, useEffect } from "react";
import { QrCode, RefreshCw, AlertCircle, Clock, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { api } from "../services/api";
import HolographicQris3D from "./HolographicQris3D";

export default function QrisModal({ paymentData, orderData, onPaymentSuccess, onClose }) {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

  const paymentId = paymentData?.paymentId;

  // Countdown timer
  useEffect(() => {
    if (!timeLeft) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Polling every 4 seconds to check payment status automatically
  useEffect(() => {
    if (!paymentId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await api.getPaymentStatus(paymentId);
        if (res.success && res.data?.status === "PAID") {
          clearInterval(pollInterval);
          onPaymentSuccess();
        }
      } catch (err) {
        // Silent error on polling
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [paymentId, onPaymentSuccess]);

  const handleManualCheck = async () => {
    if (!paymentId) return;
    setChecking(true);
    setStatusMessage("");
    try {
      const res = await api.getPaymentStatus(paymentId);
      if (res.success && res.data?.status === "PAID") {
        onPaymentSuccess();
      } else {
        setStatusMessage("Pembayaran belum terdeteksi. Silakan selesaikan transaksi pada aplikasi m-Banking/e-Wallet Anda.");
      }
    } catch (err) {
      setStatusMessage("Gagal memeriksa status: " + err.message);
    } finally {
      setChecking(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: "1.75rem", maxWidth: "440px", textAlign: "center" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-warning">
              <Clock size={13} /> {timeFormatted}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              No: {orderData?.orderNumber || orderData?.order_number}
            </span>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "4px" }} title="Tutup">
            <X size={20} />
          </button>
        </div>

        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--primary)", marginBottom: "0.2rem" }}>
          Pembayaran QRIS Dinamis
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Arahkan kursor atau sentuh kartu untuk melihat refleksi 3D holografik
        </p>

        {/* 3D Holographic QRIS Card */}
        <HolographicQris3D
          qrUrl={paymentData?.qrUrl}
          amount={paymentData?.amount || orderData?.total}
          orderNumber={orderData?.orderNumber || orderData?.order_number}
        />

        {/* Security & Supported Wallets */}
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", color: "var(--primary)", fontWeight: 600, marginBottom: "0.25rem" }}>
            <ShieldCheck size={16} /> QRIS Nasional Resmi
          </div>
          <p>Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay & semua bank nasional.</p>
        </div>

        {statusMessage && (
          <div style={{
            padding: "0.6rem 0.8rem",
            backgroundColor: "var(--warning-bg)",
            color: "var(--warning)",
            fontSize: "0.82rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1rem"
          }}>
            {statusMessage}
          </div>
        )}

        {/* Check Status Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
            {checking ? "Memeriksa Status Pembayaran..." : "Periksa Status Pembayaran"}
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ width: "100%", color: "var(--text-muted)" }}
          >
            Tutup Halaman QR
          </button>
        </div>
      </div>
    </div>
  );
}
