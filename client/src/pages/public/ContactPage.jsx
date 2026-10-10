import React, { useState } from "react";
import { MessageCircle, Phone, Instagram, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useCafe } from "../../context/CafeContext";

export default function ContactPage() {
  const { profile } = useCafe();
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const waLink = profile?.whatsapp 
    ? `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Halo Ruang Namu, saya ingin bertanya.")}` 
    : "#";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setFormSent(true);
    // In a real cafe this could post to backend or open WhatsApp
  };

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            HUBUNGI KAMI
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", color: "var(--primary)", marginTop: "0.35rem" }}>
            Kontak & Layanan Informasi
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Punya pertanyaan mengenai reservasi meja, pemesanan katering, atau kerjasama komunitas? Tim kami siap menyapa Anda.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem"
        }}>
          {/* Contact Direct Channels */}
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
              Saluran Komunikasi Langsung
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* WhatsApp Card */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="card"
                style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", borderColor: "#86EFAC" }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#DCFCE7",
                  color: "#166534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                    Chat WhatsApp Resmi
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                    Respon cepat untuk reservasi & pertanyaan menu: {profile?.phone || "+62 812-3456-7890"}
                  </p>
                </div>
              </a>

              {/* Instagram Card */}
              {profile?.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card"
                  style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#FCE7F3",
                    color: "#BE185D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Instagram size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                      Instagram
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                      Ikuti kegiatan harian & promo kami di {profile.instagram}
                    </p>
                  </div>
                </a>
              )}

              {/* Email Card */}
              {profile?.email && (
                <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#DBEAFE",
                    color: "#1D4ED8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                      Surat Elektronik
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                      {profile.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry / Feedback Form */}
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--primary)", marginBottom: "0.5rem" }}>
              Kirim Pesan atau Masukan
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Kami sangat mengapresiasi masukan Anda untuk kemajuan Cafe Ruang Namu.
            </p>

            {formSent ? (
              <div style={{ padding: "2rem", textAlign: "center", backgroundColor: "var(--success-bg)", borderRadius: "var(--radius-sm)" }}>
                <CheckCircle2 size={40} color="var(--success)" style={{ margin: "0 auto 0.5rem auto" }} />
                <h4 style={{ color: "var(--success)", fontWeight: 700 }}>Pesan Berhasil Terkirim!</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.25rem" }}>
                  Terima kasih banyak atas perhatian Anda. Tim kami akan segera menindaklanjutinya.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nama Anda</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email atau WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Kontak yang dapat dihubungi"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pesan / Pertanyaan</label>
                  <textarea
                    rows={4}
                    required
                    className="form-textarea"
                    placeholder="Tulis pesan Anda di sini..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  <Send size={16} /> Kirimkan Pesan
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
