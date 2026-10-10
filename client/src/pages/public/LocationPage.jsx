import React from "react";
import { MapPin, Clock, Navigation, Phone, MessageCircle, Car, Train } from "lucide-react";
import { useCafe } from "../../context/CafeContext";

export default function LocationPage() {
  const { profile, operatingHours, isOpen, todaySchedule } = useCafe();

  const gmapsUrl = profile?.coordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.coordinates)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile?.address || "Cafe Ruang Namu")}`;

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            LOKASI & JADWAL
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", color: "var(--primary)", marginTop: "0.35rem" }}>
            Kunjungi Cafe Ruang Namu
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Mudah diakses di kawasan strategis, ramah pejalan kaki, dan dekat dengan transportasi umum.
          </p>
        </div>

        {/* Content Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem",
          marginBottom: "3.5rem"
        }}>
          {/* Left Info: Address & Hours */}
          <div>
            {/* Status Card */}
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1.75rem", backgroundColor: isOpen ? "var(--success-bg)" : "var(--danger-bg)", borderColor: isOpen ? "var(--success)" : "var(--danger)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Clock size={24} color={isOpen ? "var(--success)" : "var(--danger)"} />
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: isOpen ? "var(--success)" : "var(--danger)", margin: 0 }}>
                    {isOpen ? "Cafe Sedang Buka" : "Cafe Sedang Tutup"}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-main)", margin: 0 }}>
                    Jadwal hari ini: <strong>{todaySchedule}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={20} color="var(--accent)" /> Alamat Lengkap
              </h3>
              <p style={{ fontSize: "0.95rem", color: "var(--text-main)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                {profile?.address || "Jl. Margonda Raya No. 418, Pondok Cina, Beji, Kota Depok, Jawa Barat 16424"}
              </p>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                <Navigation size={18} /> Buka Petunjuk Arah Google Maps
              </a>
            </div>

            {/* Hours Table */}
            <div className="card" style={{ padding: "1.75rem" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={20} color="var(--accent)" /> Jam Operasional Mingguan
              </h3>
              <table style={{ width: "100%", fontSize: "0.9rem", borderCollapse: "collapse" }}>
                <tbody>
                  {operatingHours?.map((h) => (
                    <tr key={h.day} style={{ borderBottom: "1px dashed var(--border-light)" }}>
                      <td style={{ padding: "0.5rem 0", fontWeight: 600 }}>{h.day}</td>
                      <td style={{ padding: "0.5rem 0", textAlign: "right", color: h.is_closed ? "var(--danger)" : "var(--primary)" }}>
                        {h.is_closed ? "Tutup" : `${h.open} - ${h.close} WIB`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Embedded Google Maps */}
          <div>
            <div className="card" style={{ padding: "0.5rem", height: "100%", minHeight: "450px", display: "flex", flexDirection: "column" }}>
              <iframe
                title="Peta Lokasi Cafe Ruang Namu"
                src={profile?.gmaps_embed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.2341421458045!2d106.8315264!3d-6.3637213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ec0691535491%3A0x6b490799ea4ea778!2sDepok!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "var(--radius-sm)", flex: 1, minHeight: "380px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ padding: "1rem", display: "flex", gap: "1.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Train size={15} color="var(--primary)" /> 3 Menit dari Stasiun Pondok Cina
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Car size={15} color="var(--primary)" /> Parkir Mobil & Motor Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
