import React from "react";
import { Link } from "react-router-dom";
import { Coffee, Heart, Target, Compass, Award, Users, ArrowRight } from "lucide-react";
import { useCafe } from "../../context/CafeContext";

export default function ProfilePage() {
  const { profile } = useCafe();

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header Breadcrumb & Title */}
        <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 3.5rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            TENTANG USAHA UMKM KAMI
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", color: "var(--primary)", marginTop: "0.4rem" }}>
            Cerita & Dedikasi Cafe Ruang Namu
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.5rem" }}>
            "{profile?.tagline || "Tempat Singgah, Merajut Asa & Menikmati Waktu"}"
          </p>
        </div>

        {/* Hero Image */}
        <div style={{ marginBottom: "4rem", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop&q=80"
            alt="Interior Cafe Ruang Namu"
            style={{ width: "100%", maxHeight: "460px", objectFit: "cover" }}
          />
        </div>

        {/* Story & Philosophy Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3.5rem",
          marginBottom: "4.5rem",
          alignItems: "start"
        }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
              Awal Mula Berdiri
            </h2>
            <p style={{ lineHeight: 1.8, color: "var(--text-main)", marginBottom: "1.25rem", fontSize: "1rem" }}>
              {profile?.story || "Didirikan dari kecintaan mendalam akan budaya ngopi Indonesia, Ruang Namu hadir sebagai rumah kedua bagi para penikmat kopi, pekerja kreatif, komunitas, dan mahasiswa. Setiap cangkir diseduh dari biji kopi lokal pilihan yang dibeli langsung dari petani binaan nusantara."}
            </p>
            <p style={{ lineHeight: 1.8, color: "var(--text-main)", fontSize: "1rem" }}>
              Kami percaya bahwa sebuah cafe bukan sekadar tempat menukar cangkir kopi dengan rupiah, melainkan ruang temu dialog, tempat ide-ide segar dilahirkan, dan wadah bertukar cerita antar insan.
            </p>
          </div>

          <div style={{
            backgroundColor: "var(--bg-sand)",
            padding: "2rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)"
          }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Compass size={22} color="var(--accent)" /> Konsep & Keunggulan
            </h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {profile?.concepts || "Slow Living Cafe • Creative Workspace • Specialty Indonesian Beans"}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Award size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <strong style={{ display: "block", fontSize: "0.95rem" }}>Direct-Trade Indonesian Coffee</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Biji kopi Arabica & Robusta kualitas terbaik dari Gayo, Temanggung, Ijen, dan Bajawa.</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Users size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <strong style={{ display: "block", fontSize: "0.95rem" }}>Ruang Kolaborasi Komunitas</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Terbuka untuk diskusi UMKM, sesi belajar bersama, dan ruang kerja remote yang kondusif.</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Coffee size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: "0.2rem" }} />
                <div>
                  <strong style={{ display: "block", fontSize: "0.95rem" }}>Teknologi Pemesanan Cerdas</strong>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Sistem scan QR meja otomatis dengan integrasi pembayaran QRIS dinamis nir-sentuh.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          marginBottom: "4rem"
        }}>
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "0.75rem" }}>
              Visi Kami
            </h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              {profile?.vision || "Menjadi ruang bertumbuh bagi komunitas lokal dan menghadirkan pengalaman kopi spesialti nusantara yang ramah, hangat, dan inklusif bagi semua kalangan."}
            </p>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-light)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}>
              <Heart size={24} />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "0.75rem" }}>
              Nilai yang Kami Junjung
            </h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              Keramahan tulus dalam setiap pelayanan, integritas kualitas cita rasa seduhan, dan kepedulian nyata terhadap kemajuan petani kopi tanah air.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center" }}>
          <Link to="/order" className="btn btn-accent btn-lg">
            Kunjungi Kami & Coba Menu Pilihan <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
