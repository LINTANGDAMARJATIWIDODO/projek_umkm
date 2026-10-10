import React from "react";
import { Link } from "react-router-dom";
import { Coffee, MapPin, Clock, ArrowRight, Sparkles, Wifi, Wind, Zap, Heart, CheckCircle2 } from "lucide-react";
import { useCafe } from "../../context/CafeContext";
import { useCart } from "../../context/CartContext";
import CoffeeHero3D from "../../components/CoffeeHero3D";
import TiltCard from "../../components/TiltCard";

export default function HomePage() {
  const { profile, facilities, operatingHours, isOpen, todaySchedule, promotions, featuredProducts } = useCafe();
  const { addItem } = useCart();

  return (
    <div>
      {/* 3D INTERACTIVE HERO SECTION */}
      <section style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--bg-dark)",
        color: "#FFFFFF",
        backgroundImage: `radial-gradient(circle at 80% 50%, rgba(200, 109, 59, 0.22) 0%, transparent 60%), linear-gradient(rgba(31, 22, 18, 0.88), rgba(44, 24, 16, 0.95)), url(${profile?.cover_image || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop&q=80"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "4rem 0",
        overflow: "hidden"
      }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "3rem",
            alignItems: "center"
          }}>
            {/* Left Content */}
            <div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "rgba(200, 109, 59, 0.22)",
                border: "1px solid rgba(200, 109, 59, 0.5)",
                padding: "0.45rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                color: "#FDBA74",
                marginBottom: "1.25rem",
                backdropFilter: "blur(8px)"
              }}>
                <Sparkles size={15} />
                <span>{profile?.concepts || "Specialty Coffee • Creative Workspace • Nusantara Beans"}</span>
              </div>

              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "1.25rem",
                color: "#FFFFFF",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }}>
                {profile?.name || "Cafe Ruang Namu"}
              </h1>

              <p style={{
                fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                color: "#F3EDE2",
                fontStyle: "italic",
                marginBottom: "1.25rem",
                fontFamily: "var(--font-serif)"
              }}>
                "{profile?.tagline || "Tempat Singgah, Merajut Asa & Menikmati Waktu"}"
              </p>

              <p style={{
                fontSize: "1rem",
                color: "#D1C7BD",
                lineHeight: 1.7,
                marginBottom: "2.25rem",
                maxWidth: "540px"
              }}>
                {profile?.description || "Ruang kreatif yang memadukan kehangatan seduhan kopi lokal pilihan dengan kenyamanan bekerja, berdiskusi, dan melepas penat di tengah kota."}
              </p>

              {/* CTA Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <Link to="/order" className="btn btn-accent btn-lg" style={{ boxShadow: "0 10px 25px rgba(200, 109, 59, 0.45)" }}>
                  <Coffee size={20} /> Pesan Sekarang (QR Meja)
                </Link>
                <Link to="/menu" className="btn btn-outline btn-lg" style={{ borderColor: "#FFFFFF", color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.08)" }}>
                  Katalog Menu
                </Link>
                <Link to="/location" className="btn btn-outline btn-lg" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#FFFFFF" }}>
                  <MapPin size={18} /> Lokasi
                </Link>
              </div>
            </div>

            {/* Right: Interactive 3D Coffee Cup Scene */}
            <div style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at center, rgba(200, 109, 59, 0.14) 0%, rgba(212, 175, 55, 0.05) 45%, transparent 70%)",
              borderRadius: "28px",
              padding: "0.5rem"
            }}>
              <div style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                zIndex: 10,
                backgroundColor: "rgba(41, 24, 17, 0.72)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                padding: "0.35rem 0.85rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                color: "#FDE047",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
              }}>
                <Sparkles size={13} /> Model 3D Interaktif • Gerakkan Kursor
              </div>

              <CoffeeHero3D />
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATUS BAR */}
      <section style={{
        backgroundColor: "var(--bg-sand)",
        borderBottom: "1px solid var(--border-color)",
        padding: "1.25rem 0",
        position: "relative",
        zIndex: 5
      }}>
        <div className="container" style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              backgroundColor: isOpen ? "var(--success-bg)" : "var(--danger-bg)",
              color: isOpen ? "var(--success)" : "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                Status Cafe: {isOpen ? "Sedang Buka" : "Sedang Tutup"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                Jadwal Hari Ini: {todaySchedule}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Wifi size={16} color="var(--primary)" /> 100 Mbps Wi-Fi
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Zap size={16} color="var(--primary)" /> Stopkontak di Tiap Meja
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Wind size={16} color="var(--primary)" /> Indoor AC & Outdoor Asri
            </span>
          </div>
        </div>
      </section>

      {/* PROMOTIONS BANNER IF ANY */}
      {promotions && promotions.length > 0 && (
        <section style={{ padding: "3rem 0 0 0" }}>
          <div className="container">
            <TiltCard maxTilt={6}>
              <div style={{
                backgroundColor: "var(--accent-light)",
                border: "1.5px dashed var(--accent)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem 2.25rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1.5rem",
                boxShadow: "var(--shadow-md)"
              }}>
                <div>
                  <span className="badge badge-warning" style={{ marginBottom: "0.5rem" }}>
                    🎁 PROMO SPESIAL AKTIF
                  </span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "var(--primary)", margin: "0.25rem 0" }}>
                    {promotions[0].title}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    {promotions[0].description} (Berlaku hingga {promotions[0].valid_until})
                  </p>
                </div>
                <Link to="/order" className="btn btn-accent btn-lg">
                  Klaim Promo di Meja <ArrowRight size={18} />
                </Link>
              </div>
            </TiltCard>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS (WITH 3D TILT CARDS) */}
      <section style={{ padding: "5rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem auto" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
              PILIHAN TERBAIK BARISTA
            </span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--primary)", marginTop: "0.35rem" }}>
              Menu Unggulan Ruang Namu
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
              Arahkan kursor untuk merasakan efek interaktif 3D. Sajian kopi spesialti nusantara dan hidangan terfavorit.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem"
          }}>
            {(featuredProducts || []).map((product) => (
              <TiltCard key={product.id} maxTilt={14} glare={true} style={{ height: "100%" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ position: "relative", height: "205px", overflow: "hidden" }}>
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80"}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                    />
                    {product.is_popular ? (
                      <span className="badge badge-warning" style={{ position: "absolute", top: "12px", right: "12px", transform: "translateZ(30px)" }}>
                        ⭐ Favorit
                      </span>
                    ) : null}
                    <span style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "12px",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      backdropFilter: "blur(4px)",
                      color: "#FFFFFF",
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "6px",
                      transform: "translateZ(25px)"
                    }}>
                      {product.category_name}
                    </span>
                  </div>

                  <div style={{ padding: "1.35rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.4rem", transform: "translateZ(20px)" }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1, marginBottom: "1rem", lineHeight: 1.5 }}>
                      {product.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "0.85rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-light)", display: "block" }}>Harga</span>
                        <strong style={{ fontSize: "1.2rem", color: "var(--accent)" }}>
                          Rp {product.price.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      <button
                        onClick={() => {
                          addItem(product);
                          alert(`'${product.name}' ditambahkan ke keranjang.`);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ transform: "translateZ(25px)" }}
                      >
                        + Pesan
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link to="/menu" className="btn btn-outline btn-lg">
              Lihat Seluruh Menu (Katalog Lengkap) <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* STORY & CONCEPT SNIPPET */}
      <section style={{ backgroundColor: "var(--bg-sand)", padding: "5rem 0", borderTop: "1px solid var(--border-color)" }}>
        <div className="container" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "3.5rem",
          alignItems: "center"
        }}>
          <div>
            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
              TENTANG KAMI
            </span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", color: "var(--primary)", margin: "0.5rem 0 1.25rem 0" }}>
              Rumah Kedua untuk Merajut Cerita dan Karsa
            </h2>
            <p style={{ color: "var(--text-main)", lineHeight: 1.8, marginBottom: "1.25rem", fontSize: "0.98rem" }}>
              {profile?.story || "Didirikan dari kecintaan mendalam akan budaya ngopi Indonesia, Ruang Namu hadir sebagai rumah kedua bagi para penikmat kopi, pekerja kreatif, komunitas, dan mahasiswa. Setiap cangkir diseduh dari biji kopi lokal pilihan yang dibeli langsung dari petani binaan nusantara."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>100% Biji Kopi Spesialti Petani Lokal Indonesia</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Ruang Tenang Ber-AC & Stopkontak Setiap Meja</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} color="var(--success)" />
                <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Pesan Praktis via QRIS Tanpa Antre di Meja Kasir</span>
              </div>
            </div>
            <Link to="/profile" className="btn btn-primary">
              Baca Cerita Lengkap <ArrowRight size={16} />
            </Link>
          </div>

          <div>
            <TiltCard maxTilt={10}>
              <div style={{ position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"
                  alt="Suasana Cafe Ruang Namu"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-3d)",
                    width: "100%",
                    height: "420px",
                    objectFit: "cover"
                  }}
                />
                <div style={{
                  position: "absolute",
                  bottom: "-15px",
                  right: "15px",
                  backgroundColor: "var(--bg-coffee)",
                  color: "#FFFFFF",
                  padding: "1rem 1.5rem",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  maxWidth: "240px",
                  transform: "translateZ(30px)"
                }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent)" }}>
                    {profile?.established_year || "2023"}
                  </span>
                  <span style={{ display: "block", fontSize: "0.82rem", color: "#D1C7BD" }}>
                    Hadir melayani para penikmat kopi spesialti nusantara.
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>
    </div>
  );
}
