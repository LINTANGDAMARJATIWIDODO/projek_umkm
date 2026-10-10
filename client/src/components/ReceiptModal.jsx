import React from "react";
import { CheckCircle, Printer, X, Download, Coffee, Share2 } from "lucide-react";

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at || Date.now()).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const isPaid = order.payment_status === "PAID";

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: "1.75rem", maxWidth: "460px" }}>
        {/* Header Actions */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-success">
              <CheckCircle size={14} /> Terverifikasi
            </span>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" style={{
          backgroundColor: "#FFFFFF",
          padding: "1.5rem",
          borderRadius: "var(--radius-sm)",
          border: "1px dashed var(--border-color)",
          fontFamily: "'Courier New', Courier, monospace",
          color: "#1F1612"
        }}>
          {/* Cafe Header */}
          <div style={{ textAlign: "center", marginBottom: "1.25rem", borderBottom: "1px dashed #A3968B", paddingBottom: "1rem" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "var(--primary)" }}>
              CAFE RUANG NAMU
            </h2>
            <p style={{ fontSize: "0.75rem", color: "#666", margin: "0.2rem 0" }}>
              Jl. Margonda Raya No. 418, Depok
            </p>
            <p style={{ fontSize: "0.75rem", color: "#666" }}>
              WhatsApp: +62 812-3456-7890
            </p>
          </div>

          {/* Transaction Metadata */}
          <div style={{ fontSize: "0.8rem", marginBottom: "1rem", lineHeight: 1.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>No. Pesanan:</span>
              <strong>{order.order_number || order.orderNumber}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tanggal:</span>
              <span>{formattedDate}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Pelanggan:</span>
              <strong>{order.customer_name || order.customerName}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Meja:</span>
              <strong>{order.table_number || order.tableNumber}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Metode:</span>
              <span>{order.payment_method === "CASH" ? "Tunai (Kasir)" : "QRIS Dinamis"}</span>
            </div>
            {order.payment?.transaction_id && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Ref Provider:</span>
                <span style={{ fontSize: "0.72rem" }}>{order.payment.transaction_id}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div style={{ borderTop: "1px dashed #A3968B", borderBottom: "1px dashed #A3968B", padding: "0.75rem 0", marginBottom: "1rem" }}>
            <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: "0.75rem", color: "#666" }}>
                  <th style={{ paddingBottom: "0.35rem" }}>Menu</th>
                  <th style={{ textAlign: "center", paddingBottom: "0.35rem" }}>Qty</th>
                  <th style={{ textAlign: "right", paddingBottom: "0.35rem" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((it, idx) => (
                  <tr key={idx} style={{ verticalAlign: "top" }}>
                    <td style={{ padding: "0.25rem 0" }}>
                      <div>{it.product_name || it.productName || it.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#666" }}>
                        @Rp {(it.price).toLocaleString("id-ID")}
                        {it.notes ? ` (${it.notes})` : ""}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "0.25rem 0" }}>{it.quantity}</td>
                    <td style={{ textAlign: "right", padding: "0.25rem 0" }}>
                      Rp {(it.subtotal || it.price * it.quantity).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div style={{ fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal:</span>
              <span>Rp {(order.subtotal || 0).toLocaleString("id-ID")}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--danger)" }}>
                <span>Diskon:</span>
                <span>-Rp {(order.discount).toLocaleString("id-ID")}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Pajak Restoran (PB1 10%):</span>
                <span>Rp {(order.tax).toLocaleString("id-ID")}</span>
              </div>
            )}
            {order.service_charge > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Biaya Layanan:</span>
                <span>Rp {(order.service_charge).toLocaleString("id-ID")}</span>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1rem",
              fontWeight: 700,
              borderTop: "1px solid #1F1612",
              paddingTop: "0.5rem",
              marginTop: "0.5rem"
            }}>
              <span>TOTAL:</span>
              <span>Rp {(order.total || 0).toLocaleString("id-ID")}</span>
            </div>
            {order.payment?.cash_received && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                  <span>Tunai Diterima:</span>
                  <span>Rp {order.payment.cash_received.toLocaleString("id-ID")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Kembalian:</span>
                  <span>Rp {order.payment.cash_change.toLocaleString("id-ID")}</span>
                </div>
              </>
            )}
          </div>

          {/* Payment Status Stamp */}
          <div style={{
            textAlign: "center",
            padding: "0.6rem",
            backgroundColor: isPaid ? "#DCFCE7" : "#FEF3C7",
            color: isPaid ? "#166534" : "#92400E",
            fontWeight: 800,
            fontSize: "0.95rem",
            letterSpacing: "0.08em",
            borderRadius: "4px",
            marginBottom: "1rem"
          }}>
            {isPaid ? "STATUS: LUNAS (PAID)" : "STATUS: MENUNGGU PEMBAYARAN"}
          </div>

          {/* Order Status */}
          <div style={{ textAlign: "center", fontSize: "0.78rem", color: "#555" }}>
            Status Pesanan Saat Ini: <strong style={{ color: "var(--primary)" }}>{order.status}</strong>
            <br />
            Terima kasih telah berkunjung ke Ruang Namu!
            <br />
            Simpan struk ini sebagai bukti pesanan Anda.
          </div>
        </div>

        {/* Action Buttons (Excluded from print) */}
        <div className="no-print" style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1 }}>
            <Printer size={18} /> Cetak Struk
          </button>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
