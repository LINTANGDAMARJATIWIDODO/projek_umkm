import React from "react";
import { Link } from "react-router-dom";
import { Coffee, MapPin, Phone, MessageCircle, Instagram, Mail, Clock } from "lucide-react";
import { useCafe } from "../context/CafeContext";

export default function Footer() {
  const { profile, operatingHours } = useCafe();

  const waLink = profile?.whatsapp 
    ? `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Halo Cafe Ruang Namu, saya ingin bertanya tentang menu dan reservasi.")}` 
    : "#";

  return (
    <footer style={{
      backgroundColor: "var(--bg-coffee)",
      color: "#F5EFE6",
      padding: "4rem 0 2rem 0",
      marginTop: "5rem",
      borderTop: "3px solid var(--accent)"
    }}>
      <div className="container" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "2.5rem",
        marginBottom: "3rem"
      }}>
        {/* Col 1: About */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Coffee size={20} />
            </div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 700, color: "#FFFFFF" }}>
              {profile?.name || "Cafe Ruang Namu"}
            </span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "#D1C7BD", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            {profile?.description || "Tempat singgah, merajut asa, dan menikmati seduhan kopi terbaik nusantara dalam ruang kerja kreatif yang tenang dan inklusif."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {profile?.whatsapp && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#86EFAC"
              }} title="WhatsApp">
                <MessageCircle size={18} />
              </a>
            )}
            {profile?.instagram && (
              <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F472B6"
              }} title="Instagram">
                <Instagram size={18} />
              </a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`} style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60A5FA"
              }} title="Email">
                <Mail size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Col 2: Operating Hours */}
        <div>
          <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Clock size={16} color="var(--accent)" /> Jam Operasional
          </h4>
          <ul style={{ listStyle: "none", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "0.4rem", color: "#D1C7BD" }}>
            {operatingHours?.map((item) => (
              <li key={item.day} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(255,255,255,0.1)", paddingBottom: "0.25rem" }}>
                <span>{item.day}</span>
                <span style={{ fontWeight: 600, color: item.is_closed ? "#FCA5A5" : "#FFFFFF" }}>
                  {item.is_closed ? "Tutup" : `${item.open} - ${item.close}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Location & Contacts */}
        <div>
          <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <MapPin size={16} color="var(--accent)" /> Lokasi & Kontak
          </h4>
          <p style={{ fontSize: "0.88rem", color: "#D1C7BD", marginBottom: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <MapPin size={16} style={{ flexShrink: 0, marginTop: "0.2rem", color: "var(--accent)" }} />
            <span>{profile?.address || "Jl. Margonda Raya No. 418, Pondok Cina, Beji, Depok"}</span>
          </p>
          {profile?.phone && (
            <p style={{ fontSize: "0.88rem", color: "#D1C7BD", marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
              <Phone size={16} style={{ flexShrink: 0, color: "var(--accent)" }} />
              <span>{profile.phone}</span>
            </p>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Link to="/location" className="btn btn-outline btn-sm" style={{ borderColor: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
              Lihat di Google Maps
            </Link>
          </div>
        </div>

        {/* Col 4: Quick Links */}
        <div>
          <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#FFFFFF", marginBottom: "1rem" }}>
            Navigasi Cepat
          </h4>
          <ul style={{ listStyle: "none", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "#D1C7BD" }}>
            <li><Link to="/order" style={{ color: "#FDE047", fontWeight: 600 }}>☕ Pesan Mandiri di Meja</Link></li>
            <li><Link to="/menu">📖 Katalog Menu Lengkap</Link></li>
            <li><Link to="/facilities">🏢 Fasilitas & Ruang Kerja</Link></li>
            <li><Link to="/promotions">🎁 Promo Aktif</Link></li>
            <li><Link to="/cashier" style={{ opacity: 0.7 }}>🔒 Panel Kasir POS</Link></li>
            <li><Link to="/admin" style={{ opacity: 0.7 }}>🔒 Administrator Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="container" style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "0.8rem",
        color: "#9C938B"
      }}>
        <span>© {new Date().getFullYear()} {profile?.name || "Cafe Ruang Namu"}. Seluruh hak cipta dilindungi.</span>
        <span>Sistem Pemesanan Mandiri & Pembayaran QRIS Dinamis Terintegrasi</span>
      </div>
    </footer>
  );
}
