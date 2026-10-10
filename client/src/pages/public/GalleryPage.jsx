import React, { useState } from "react";
import { X, ZoomIn, Coffee } from "lucide-react";

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryItems = [
    {
      title: "Espresso Extraction",
      category: "Kopi Spesialti",
      url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Sudut Tenang Membaca",
      category: "Interior Ruang",
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Hand Poured V60 Filter",
      category: "Manual Brew",
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Latte Art Kopi Namu",
      category: "Kopi Spesialti",
      url: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Croissant Almond Hangat",
      category: "Pastry & Bites",
      url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Cold Brew Slow Drip",
      category: "Signature Drink",
      url: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Nasi Goreng Kecombrang",
      category: "Main Course",
      url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900&auto=format&fit=crop&q=80"
    },
    {
      title: "Area Outdoor Sore Hari",
      category: "Suasana Cafe",
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            DOKUMENTASI VISUAL
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", color: "var(--primary)", marginTop: "0.35rem" }}>
            Galeri Suasana Ruang Namu
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Sekelumit potret sudut hangat, racikan barista, dan sajian kuliner yang menemani momen Anda.
          </p>
        </div>

        {/* Gallery Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem"
        }}>
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(item)}
              style={{
                position: "relative",
                height: "260px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)"
              }}
              className="gallery-card"
            >
              <img
                src={item.url}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(31,22,18,0.85) 0%, rgba(31,22,18,0) 60%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "1.25rem",
                color: "#FFFFFF"
              }}>
                <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>{item.category}</span>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-serif)" }}>{item.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "760px", padding: 0, overflow: "hidden", backgroundColor: "transparent", boxShadow: "none" }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: "var(--radius-md)" }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    color: "#FFFFFF",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <X size={20} />
                </button>
                <div style={{
                  backgroundColor: "var(--bg-coffee)",
                  color: "#FFFFFF",
                  padding: "1rem 1.5rem",
                  borderRadius: "0 0 var(--radius-md) var(--radius-md)"
                }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>{selectedImage.category}</span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "#FFFFFF" }}>{selectedImage.title}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gallery-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
