import React, { useRef, useState } from "react";
import { ShieldCheck, QrCode } from "lucide-react";

export default function HolographicQris3D({ qrUrl, amount, orderNumber }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
    glareX: 50,
    glareY: 50,
    opacity: 0
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 16;

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.25
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      glareX: 50,
      glareY: 50,
      opacity: 0
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        margin: "0 auto 1.25rem auto",
        width: "100%",
        maxWidth: "320px",
        borderRadius: "20px",
        padding: "1.5rem",
        background: "linear-gradient(135deg, #2C1810 0%, #4A2E1B 40%, #1F1612 100%)",
        boxShadow: "0 20px 40px -15px rgba(44, 24, 16, 0.4), 0 0 25px rgba(200, 109, 59, 0.25)",
        border: "1.5px solid rgba(255, 255, 255, 0.15)",
        transformStyle: "preserve-3d",
        transform: style.transform,
        transition: "transform 0.12s ease-out, box-shadow 0.2s ease-out",
        cursor: "pointer",
        color: "#FFFFFF",
        textAlign: "center"
      }}
    >
      {/* Dynamic Specular / Hologram Reflection */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(circle at ${style.glareX}% ${style.glareY}%, rgba(255, 255, 255, ${style.opacity}) 0%, rgba(200, 109, 59, 0.2) 40%, transparent 80%)`,
          mixBlendMode: "overlay",
          transition: "opacity 0.2s"
        }}
      />

      {/* Holographic Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", transform: "translateZ(25px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#FDE047", fontWeight: 700 }}>
          <ShieldCheck size={16} /> QRIS DINAMIS
        </div>
        <span style={{ fontSize: "0.72rem", color: "#D1C7BD", letterSpacing: "0.05em" }}>
          {orderNumber}
        </span>
      </div>

      {/* 3D Elevated QR Code Paper */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "0.85rem",
          borderRadius: "14px",
          display: "inline-block",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.35)",
          transform: "translateZ(40px)",
          marginBottom: "1rem"
        }}
      >
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="Dynamic QRIS"
            style={{ width: "200px", height: "200px", display: "block", objectFit: "contain" }}
          />
        ) : (
          <div style={{ width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <QrCode size={80} color="#2C1810" />
          </div>
        )}
      </div>

      {/* 3D Elevated Amount */}
      <div style={{ transform: "translateZ(30px)" }}>
        <span style={{ fontSize: "0.75rem", color: "#D1C7BD", display: "block" }}>
          TOTAL BAYAR (PAS)
        </span>
        <strong style={{ fontSize: "1.45rem", color: "#FDBA74", letterSpacing: "-0.02em" }}>
          Rp {(amount || 0).toLocaleString("id-ID")}
        </strong>
      </div>
    </div>
  );
}
