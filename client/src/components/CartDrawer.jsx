import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Coffee, ArrowRight, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useCafe } from "../context/CafeContext";

export default function CartDrawer({ isOpen, onClose, onCheckout, loadingCheckout }) {
  const {
    items,
    tableInfo,
    setTableInfo,
    customerName,
    setCustomerName,
    updateQuantity,
    updateNotes,
    removeItem,
    clearCart,
    cartSubtotal
  } = useCart();

  const { taxAndFees } = useCafe();

  const [notesOpen, setNotesOpen] = useState({});

  if (!isOpen) return null;

  const taxAmount = (taxAndFees?.enable_tax && taxAndFees?.tax_percent > 0)
    ? Math.round((cartSubtotal * taxAndFees.tax_percent) / 100)
    : 0;

  const grandTotal = cartSubtotal + taxAmount;

  const toggleNote = (id) => {
    setNotesOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartCheckout = () => {
    if (!customerName.trim()) {
      alert("Silakan masukkan nama Anda untuk pemesanan.");
      return;
    }
    if (!tableInfo.tableNumber) {
      alert("Silakan tentukan nomor meja Anda.");
      return;
    }
    onCheckout({ customerName, tableNumber: tableInfo.tableNumber, items });
  };

  return (
    <div className="modal-overlay" style={{ justifyContent: "flex-end", padding: 0 }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        width: "100%",
        maxWidth: "460px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "var(--shadow-lg)",
        animation: "slideInRight 0.25s ease-out"
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: "1.25rem",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--bg-cream)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Coffee size={20} color="var(--primary)" />
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", margin: 0, color: "var(--primary)" }}>
              Keranjang Pesanan ({items.length})
            </h3>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)", padding: "0.25rem" }}>
            <X size={22} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {/* Customer & Table Info Box */}
          <div style={{
            backgroundColor: "var(--bg-sand)",
            padding: "1rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            marginBottom: "1.25rem"
          }}>
            <div className="form-group" style={{ marginBottom: "0.75rem" }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>
                Nama Pelanggan <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem" }}
                placeholder="Contoh: Rian / Meja 3"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>
                Nomor Meja <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem" }}
                placeholder="Contoh: 01 atau Meja 05"
                value={tableInfo.tableNumber}
                onChange={(e) => setTableInfo({ ...tableInfo, tableNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Items List */}
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <Coffee size={48} style={{ opacity: 0.3, margin: "0 auto 1rem auto" }} />
              <p style={{ fontWeight: 600 }}>Keranjang masih kosong</p>
              <p style={{ fontSize: "0.85rem" }}>Pilih menu kopi atau hidangan favorit Anda dari katalog.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((it) => (
                <div key={it.productId} style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  backgroundColor: "#FFFFFF"
                }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {it.image_url && (
                      <img
                        src={it.image_url}
                        alt={it.name}
                        style={{ width: "54px", height: "54px", borderRadius: "6px", objectFit: "cover" }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--primary)" }}>
                        {it.name}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}>
                        Rp {it.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(it.productId)}
                      style={{ color: "var(--text-light)", padding: "0.2rem" }}
                      title="Hapus menu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Quantity & Notes toggle */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.35rem", borderTop: "1px dashed var(--border-light)" }}>
                    <button
                      onClick={() => toggleNote(it.productId)}
                      style={{ fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "underline" }}
                    >
                      {it.notes ? `Catatan: "${it.notes}"` : "+ Catatan (misal: less ice)"}
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => updateQuantity(it.productId, it.quantity - 1)}
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "4px",
                          backgroundColor: "var(--bg-sand)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: "20px", textAlign: "center" }}>
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "4px",
                          backgroundColor: "var(--primary)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Note input field if expanded */}
                  {notesOpen[it.productId] && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem", marginTop: "0.25rem" }}
                      placeholder="Tulis catatan menu..."
                      value={it.notes || ""}
                      onChange={(e) => updateNotes(it.productId, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer with Totals & Checkout */}
        {items.length > 0 && (
          <div style={{
            padding: "1.25rem",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-cream)"
          }}>
            <div style={{ fontSize: "0.88rem", marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                <span>Subtotal:</span>
                <span>Rp {cartSubtotal.toLocaleString("id-ID")}</span>
              </div>
              {taxAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
                  <span>Pajak Restoran (PB1 10%):</span>
                  <span>Rp {taxAmount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--primary)",
                borderTop: "1px dashed var(--border-color)",
                paddingTop: "0.5rem",
                marginTop: "0.25rem"
              }}>
                <span>Total Pembayaran:</span>
                <span style={{ color: "var(--accent)" }}>Rp {grandTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              onClick={handleStartCheckout}
              disabled={loadingCheckout}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", gap: "0.5rem" }}
            >
              {loadingCheckout ? "Memproses Pesanan..." : (
                <>Lanjut Bayar QRIS <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
