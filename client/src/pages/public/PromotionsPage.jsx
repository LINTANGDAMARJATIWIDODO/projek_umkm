import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, Tag, ArrowRight, Coffee, ShieldCheck } from "lucide-react";
import { useCafe } from "../../context/CafeContext";

export default function PromotionsPage() {
  const { promotions } = useCafe();

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            PENAWARAN KHUSUS
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", color: "var(--primary)", marginTop: "0.35rem" }}>
            Promo & Bundling Spesial
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Dapatkan penawaran terbaik untuk seduhan kopi dan hidangan pilihan Anda di Cafe Ruang Namu.
          </p>
        </div>

        {/* Promotions List */}
        {(!promotions || promotions.length === 0) ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Belum ada promo aktif saat ini</p>
            <p style={{ fontSize: "0.85rem" }}>Silakan cek kembali secara berkala atau ikuti media sosial kami.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "2rem"
          }}>
            {promotions.map((promo) => (
              <div key={promo.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {promo.banner_image && (
                  <div style={{ height: "200px" }}>
                    <img
                      src={promo.banner_image}
                      alt={promo.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ padding: "1.75rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span className="badge badge-warning">
                      <Tag size={13} /> {promo.discount_type === "PERCENT" ? `Diskon ${promo.discount_value}%` : `Hemat Rp ${promo.discount_value.toLocaleString("id-ID")}`}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", color: "var(--primary)", marginBottom: "0.6rem" }}>
                    {promo.title}
                  </h3>

                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", flex: 1, marginBottom: "1.25rem", lineHeight: 1.6 }}>
                    {promo.description}
                  </p>

                  <div style={{
                    backgroundColor: "var(--bg-sand)",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.82rem",
                    color: "var(--text-main)",
                    marginBottom: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar size={14} color="var(--primary)" />
                      <span>Berlaku: {promo.valid_from} s.d. {promo.valid_until}</span>
                    </div>
                    {promo.min_spend > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <ShieldCheck size={14} color="var(--primary)" />
                        <span>Min. Belanja: Rp {promo.min_spend.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>

                  <Link to="/order" className="btn btn-primary" style={{ width: "100%" }}>
                    Pesan dengan Promo Ini <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
