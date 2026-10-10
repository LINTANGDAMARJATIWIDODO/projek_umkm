import React from "react";
import { Link } from "react-router-dom";
import { Wifi, Wind, Zap, Heart, Car, TreePine, Coffee, Check, ArrowRight } from "lucide-react";
import { useCafe } from "../../context/CafeContext";

export default function FacilitiesPage() {
  const { facilities } = useCafe();

  const getFacilityIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case "wifi": return <Wifi size={24} />;
      case "wind": return <Wind size={24} />;
      case "treepine": return <TreePine size={24} />;
      case "zap": return <Zap size={24} />;
      case "heart": return <Heart size={24} />;
      case "car": return <Car size={24} />;
      default: return <Coffee size={24} />;
    }
  };

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            KENYAMANAN PENGUNJUNG
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", color: "var(--primary)", marginTop: "0.35rem" }}>
            Fasilitas Cafe Ruang Namu
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Dirancang khusus untuk menghadirkan kenyamanan optimal bagi Anda yang ingin bekerja (WFC), berdiskusi santai, maupun menikmati waktu senggang.
          </p>
        </div>

        {/* Facilities Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "4rem"
        }}>
          {facilities?.map((f) => (
            <div key={f.id} className="card" style={{ padding: "1.75rem", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {getFacilityIcon(f.icon)}
              </div>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.35rem" }}>
                  {f.name}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
                <div style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--success)", fontWeight: 600 }}>
                  <Check size={14} /> Tersedia & Siap Digunakan
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Showcase */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          marginBottom: "3rem"
        }}>
          <img
            src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80"
            alt="Area Indoor WFC"
            style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
          />
          <img
            src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&auto=format&fit=crop&q=80"
            alt="Outdoor Seating"
            style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
          />
          <img
            src="https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&auto=format&fit=crop&q=80"
            alt="Coffee Bar Barista"
            style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "var(--radius-md)" }}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <Link to="/order" className="btn btn-accent btn-lg">
            Datang & Nikmati Suasana Sekarang <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
