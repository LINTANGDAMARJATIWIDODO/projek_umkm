import React, { useState, useEffect } from "react";
import { Save, Coffee, Eye, MapPin, Clock, Share2, Globe, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";
import { useCafe } from "../../context/CafeContext";

export default function AdminProfileSettings() {
  const { refreshProfile } = useCafe();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const [profile, setProfile] = useState({
    name: "Cafe Ruang Namu",
    tagline: "",
    description: "",
    story: "",
    vision: "",
    concepts: "",
    established_year: "2023",
    phone: "",
    whatsapp: "",
    instagram: "",
    email: "",
    address: "",
    coordinates: "",
    gmaps_embed: "",
    cover_image: "",
    logo_image: "",
    seo_title: "",
    seo_description: "",
    social_share_image: ""
  });

  const [operatingHours, setOperatingHours] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getPublicProfile();
        if (res.success && res.data) {
          if (res.data.profile) setProfile(res.data.profile);
          if (res.data.operatingHours) setOperatingHours(res.data.operatingHours);
          if (res.data.facilities) setFacilities(res.data.facilities);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleHourChange = (index, field, value) => {
    const updated = [...operatingHours];
    updated[index][field] = value;
    setOperatingHours(updated);
  };

  const handleFacilityToggle = (index) => {
    const updated = [...facilities];
    updated[index].available = !updated[index].available;
    setFacilities(updated);
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await api.updateProfileSettings({
        profile,
        operating_hours: operatingHours,
        facilities
      });
      if (res.success) {
        setSuccessMsg("Seluruh data profil cafe berhasil disimpan ke database!");
        refreshProfile();
      }
    } catch (err) {
      alert("Gagal menyimpan profil: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "4rem 0" }}>Memuat pengaturan profil...</div>;
  }

  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
            Pengaturan Profil Usaha UMKM & SEO
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Kelola identitas Cafe Ruang Namu, jam operasional, kontak, peta, dan meta tag pencarian publik.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="btn btn-outline"
            style={{ gap: "0.4rem" }}
          >
            <Eye size={16} /> {previewMode ? "Mode Edit" : "Pratinjau Publik"}
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: "0.85rem 1.25rem", backgroundColor: "var(--success-bg)", color: "var(--success)", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Preview Container */}
      {previewMode ? (
        <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--primary)", marginBottom: "1rem" }}>
            Pratinjau Tampilan Profil Publik
          </h3>
          <div style={{ border: "1px dashed var(--border-color)", padding: "1.5rem", borderRadius: "8px", backgroundColor: "var(--bg-cream)" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--primary)" }}>{profile.name}</h2>
            <p style={{ fontStyle: "italic", color: "var(--accent)", margin: "0.25rem 0 1rem 0" }}>"{profile.tagline}"</p>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1rem" }}>{profile.story}</p>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              📍 {profile.address} • 📞 {profile.phone} • WA: {profile.whatsapp} • IG: {profile.instagram}
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSaveAll}>
        {/* 1. Identitas Usaha */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            1. Identitas Usaha & Narasi Brand
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Nama Cafe</label>
              <input
                type="text"
                required
                className="form-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tahun Berdiri</label>
              <input
                type="text"
                className="form-input"
                value={profile.established_year}
                onChange={(e) => setProfile({ ...profile, established_year: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tagline Cafe</label>
            <input
              type="text"
              className="form-input"
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Konsep & Keunggulan</label>
            <input
              type="text"
              className="form-input"
              value={profile.concepts}
              onChange={(e) => setProfile({ ...profile, concepts: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Singkat Usaha</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cerita Berdirinya Cafe (Filosofi & Kisah)</label>
            <textarea
              rows={4}
              className="form-textarea"
              value={profile.story}
              onChange={(e) => setProfile({ ...profile, story: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Visi & Nilai Usaha</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={profile.vision}
              onChange={(e) => setProfile({ ...profile, vision: e.target.value })}
            />
          </div>
        </div>

        {/* 2. Media & Foto Sampul */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            2. Foto Sampul & Logo
          </h3>

          <div className="form-group">
            <label className="form-label">URL Foto Sampul Utama (Hero Banner)</label>
            <input
              type="text"
              className="form-input"
              value={profile.cover_image}
              onChange={(e) => setProfile({ ...profile, cover_image: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL Logo Usaha</label>
            <input
              type="text"
              className="form-input"
              value={profile.logo_image}
              onChange={(e) => setProfile({ ...profile, logo_image: e.target.value })}
            />
          </div>
        </div>

        {/* 3. Kontak & Media Sosial */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            3. Kontak Resmi & Media Sosial
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Nomor Telepon</label>
              <input
                type="text"
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nomor WhatsApp (Contoh: 6281234567890)</label>
              <input
                type="text"
                className="form-input"
                value={profile.whatsapp}
                onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Akun Instagram (Contoh: @ruangnamu.cafe)</label>
              <input
                type="text"
                className="form-input"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Usaha</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 4. Lokasi & Peta */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            4. Lokasi & Koordinat Peta
          </h3>

          <div className="form-group">
            <label className="form-label">Alamat Lengkap Cafe</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Koordinat Google Maps (Latitude, Longitude)</label>
              <input
                type="text"
                className="form-input"
                placeholder="-6.3688, 106.8335"
                value={profile.coordinates}
                onChange={(e) => setProfile({ ...profile, coordinates: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Google Maps Iframe Embed URL</label>
              <input
                type="text"
                className="form-input"
                value={profile.gmaps_embed}
                onChange={(e) => setProfile({ ...profile, gmaps_embed: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 5. Jam Operasional */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            5. Jadwal Operasional Per Hari
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {operatingHours.map((item, idx) => (
              <div key={item.day} style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px dashed var(--border-light)", paddingBottom: "0.5rem" }}>
                <span style={{ width: "90px", fontWeight: 600 }}>{item.day}</span>
                <input
                  type="time"
                  disabled={item.is_closed}
                  className="form-input"
                  style={{ width: "120px", padding: "0.4rem" }}
                  value={item.open}
                  onChange={(e) => handleHourChange(idx, "open", e.target.value)}
                />
                <span>s.d.</span>
                <input
                  type="time"
                  disabled={item.is_closed}
                  className="form-input"
                  style={{ width: "120px", padding: "0.4rem" }}
                  value={item.close}
                  onChange={(e) => handleHourChange(idx, "close", e.target.value)}
                />
                <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", cursor: "pointer", marginLeft: "1rem" }}>
                  <input
                    type="checkbox"
                    checked={item.is_closed}
                    onChange={(e) => handleHourChange(idx, "is_closed", e.target.checked)}
                  />
                  Tutup Hari Ini
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Fasilitas */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "1.75rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            6. Kelola Fasilitas Cafe
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {facilities.map((f, idx) => (
              <div key={f.id} style={{ padding: "0.75rem", border: "1px solid var(--border-color)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>{f.name}</strong>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>{f.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={f.available}
                  onChange={() => handleFacilityToggle(idx)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 7. SEO Meta Data */}
        <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
            7. Optimasi Mesin Pencari (SEO) & Social Sharing
          </h3>

          <div className="form-group">
            <label className="form-label">SEO Meta Title</label>
            <input
              type="text"
              className="form-input"
              value={profile.seo_title}
              onChange={(e) => setProfile({ ...profile, seo_title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">SEO Meta Description</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={profile.seo_description}
              onChange={(e) => setProfile({ ...profile, seo_description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Social Share Image (OG Image)</label>
            <input
              type="text"
              className="form-input"
              value={profile.social_share_image}
              onChange={(e) => setProfile({ ...profile, social_share_image: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ position: "sticky", bottom: "16px", backgroundColor: "#FFFFFF", padding: "1rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ gap: "0.5rem" }}>
            <Save size={18} />
            {saving ? "Menyimpan Perubahan..." : "Simpan Seluruh Pengaturan Profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
