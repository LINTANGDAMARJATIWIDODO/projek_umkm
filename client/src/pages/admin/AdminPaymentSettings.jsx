import React, { useState, useEffect } from "react";
import { CreditCard, ShieldCheck, AlertCircle, Save, Info, RefreshCw, Key, ExternalLink } from "lucide-react";
import { api } from "../../services/api";

export default function AdminPaymentSettings() {
  const [config, setConfig] = useState({
    active_provider: "MOCK_SANDBOX",
    midtrans: {
      is_production: false,
      merchant_id: "",
      client_key: "",
      server_key: "",
      has_server_key: false
    }
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [serverKeyInput, setServerKeyInput] = useState("");

  const loadConfig = async () => {
    try {
      const res = await api.getPaymentConfig();
      if (res.success && res.data) {
        setConfig(res.data);
        if (res.data.midtrans?.has_server_key) {
          setServerKeyInput("••••••••••••••••••••");
        }
      }
    } catch (err) {
      console.error("Failed to load payment config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    const payload = {
      active_provider: config.active_provider,
      midtrans: {
        is_production: config.midtrans.is_production,
        merchant_id: config.midtrans.merchant_id,
        client_key: config.midtrans.client_key,
        server_key: serverKeyInput.includes("•") ? undefined : serverKeyInput
      }
    };

    try {
      const res = await api.updatePaymentConfig(payload);
      if (res.success) {
        setSuccessMsg("Konfigurasi payment gateway berhasil disimpan!");
        loadConfig();
      }
    } catch (err) {
      alert("Gagal menyimpan konfigurasi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "4rem 0" }}>Memuat konfigurasi pembayaran...</div>;
  }

  const webhookUrl = `${window.location.origin}/api/webhooks/payments/midtrans`;

  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
          Pengaturan Integrasi Payment Gateway & QRIS
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
          Konfigurasi penyedia pembayaran QRIS dinamis resmi (Midtrans Core API) dan pengujian sandbox.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: "0.85rem 1.25rem", backgroundColor: "var(--success-bg)", color: "var(--success)", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
          {successMsg}
        </div>
      )}

      {/* KRITIKAL: EDUKASI GOPAY MERCHANT VS PAYMENT GATEWAY API */}
      <div style={{
        backgroundColor: "#FEF3C7",
        border: "1.5px solid #F59E0B",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.75rem",
        color: "#92400E"
      }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <AlertCircle size={22} style={{ flexShrink: 0, marginTop: "0.2rem", color: "#D97706" }} />
          <div style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
            <strong style={{ fontSize: "0.95rem", display: "block", marginBottom: "0.35rem", color: "#B45309" }}>
              PENTING: Perbedaan Akun GoPay Merchant vs API QRIS Otomatis Website
            </strong>
            <p style={{ marginBottom: "0.5rem" }}>
              Aplikasi <strong>GoPay Merchant Indonesia</strong> menyediakan fitur manual <em>"Tagih via QRIS"</em> di HP kasir. Namun, aplikasi tersebut <strong>tidak memberikan akses API publik</strong> untuk pembuatan QRIS otomatis langsung dari website atau pengiriman webhook status lunas ke server.
            </p>
            <p style={{ marginBottom: "0.5rem" }}>
              Untuk mengaktifkan pembayaran QRIS dinamis yang terhubung otomatis ke sistem Cafe Ruang Namu (pembayaran diverifikasi real-time tanpa input manual kasir), gunakan akun resmi <strong>Midtrans Payment Gateway</strong> (bagian dari ekosistem GoTo) yang mendukung Core API QRIS.
            </p>
            <div style={{ fontSize: "0.82rem", backgroundColor: "rgba(255,255,255,0.7)", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
              Selama kredensial resmi Midtrans belum Anda masukkan, sistem secara aman menggunakan mode <strong>MOCK_SANDBOX</strong> agar seluruh alur pemesanan dan simulasi sistem dapat diuji tanpa memalsukan uang nyata.
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Pilih Provider Aktif */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1rem" }}>
            Pilih Provider Pembayaran Aktif
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label style={{
              border: `2px solid ${config.active_provider === "MOCK_SANDBOX" ? "var(--accent)" : "var(--border-color)"}`,
              padding: "1.25rem",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              backgroundColor: config.active_provider === "MOCK_SANDBOX" ? "var(--accent-light)" : "#FFFFFF"
            }}>
              <input
                type="radio"
                name="provider"
                value="MOCK_SANDBOX"
                checked={config.active_provider === "MOCK_SANDBOX"}
                onChange={(e) => setConfig({ ...config, active_provider: e.target.value })}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>MOCK_SANDBOX (Pengujian)</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                Mode aman untuk uji coba tanpa koneksi server eksternal. Menghasilkan QR code simulasi dan tombol periksa status.
              </p>
            </label>

            <label style={{
              border: `2px solid ${config.active_provider === "MIDTRANS" ? "var(--accent)" : "var(--border-color)"}`,
              padding: "1.25rem",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              backgroundColor: config.active_provider === "MIDTRANS" ? "var(--accent-light)" : "#FFFFFF"
            }}>
              <input
                type="radio"
                name="provider"
                value="MIDTRANS"
                checked={config.active_provider === "MIDTRANS"}
                onChange={(e) => setConfig({ ...config, active_provider: e.target.value })}
                style={{ marginRight: "0.5rem" }}
              />
              <strong>MIDTRANS CORE API (QRIS Resmi)</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                Integrasi produksi resmi dengan verifikasi tanda tangan SHA-512 dan penerimaan webhook real-time.
              </p>
            </label>
          </div>
        </div>

        {/* Konfigurasi Kredensial Midtrans */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1rem" }}>
            Kredensial Midtrans Core API
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", padding: "0.75rem 1rem", backgroundColor: "var(--bg-sand)", borderRadius: "var(--radius-sm)" }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Lingkungan (Environment):</span>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="env"
                checked={!config.midtrans.is_production}
                onChange={() => setConfig({ ...config, midtrans: { ...config.midtrans, is_production: false } })}
              />
              Sandbox (Uji Coba Pengembang)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="env"
                checked={config.midtrans.is_production}
                onChange={() => setConfig({ ...config, midtrans: { ...config.midtrans, is_production: true } })}
              />
              Produksi (Live Transaksi Nyata)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Merchant ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: G123456789"
              value={config.midtrans.merchant_id || ""}
              onChange={(e) => setConfig({ ...config, midtrans: { ...config.midtrans, merchant_id: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client Key</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: SB-Mid-client-xxxxxxxxxxxx"
              value={config.midtrans.client_key || ""}
              onChange={(e) => setConfig({ ...config, midtrans: { ...config.midtrans, client_key: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Server Key (Tersimpan Aman di Backend)</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan Server Key dari portal Midtrans..."
              value={serverKeyInput}
              onChange={(e) => setServerKeyInput(e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-light)", marginTop: "0.2rem", display: "block" }}>
              Secret Key tidak akan pernah dikirimkan ke frontend customer demi keamanan sistem perbankan.
            </span>
          </div>

          {/* Webhook URL Guide */}
          <div style={{ marginTop: "1.25rem", padding: "1rem", backgroundColor: "var(--bg-cream)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border-color)" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary)", display: "block", marginBottom: "0.25rem" }}>
              URL Notifikasi Pembayaran (Webhook Callback URL):
            </span>
            <code style={{ fontSize: "0.85rem", color: "var(--accent)", backgroundColor: "#FFFFFF", padding: "0.3rem 0.6rem", borderRadius: "4px", display: "block", wordBreak: "break-all" }}>
              {webhookUrl}
            </code>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Salin URL ini ke menu <em>Settings → Configuration → Payment Notification URL</em> di dashboard Midtrans merchant Anda.
            </p>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ width: "100%", gap: "0.5rem" }}>
          <Save size={18} />
          {saving ? "Menyimpan Konfigurasi..." : "Simpan Konfigurasi Payment Gateway"}
        </button>
      </form>
    </div>
  );
}
