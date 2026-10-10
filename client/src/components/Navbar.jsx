import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Coffee, ShoppingBag, Menu, X, Clock, MapPin, Shield } from "lucide-react";
import { useCafe } from "../context/CafeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { profile, isOpen, todaySchedule } = useCafe();
  const { cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  const navLinks = [
    { label: "Beranda", path: "/" },
    { label: "Profil", path: "/profile" },
    { label: "Menu", path: "/menu" },
    { label: "Fasilitas", path: "/facilities" },
    { label: "Galeri", path: "/gallery" },
    { label: "Promosi", path: "/promotions" },
    { label: "Lokasi & Jam", path: "/location" },
    { label: "Kontak", path: "/contact" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      backgroundColor: "rgba(253, 251, 247, 0.95)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid var(--border-color)"
    }}>
      {/* Top Announcement Bar */}
      <div style={{
        backgroundColor: "var(--bg-coffee)",
        color: "#FFFFFF",
        padding: "0.35rem 1rem",
        fontSize: "0.8rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0 auto" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Clock size={13} />
            {isOpen ? (
              <span style={{ color: "#86EFAC", fontWeight: 600 }}>Buka Sekarang ({todaySchedule})</span>
            ) : (
              <span style={{ color: "#FCA5A5", fontWeight: 600 }}>Tutup ({todaySchedule})</span>
            )}
          </span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>Pesan Mandiri Cepat via QR Meja & QRIS Dinamis</span>
        </div>
        {isAuthenticated && (
          <Link
            to={user?.role === "cashier" ? "/cashier" : "/admin"}
            style={{ color: "#FDE047", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 700 }}
          >
            <Shield size={12} /> {user?.role === "cashier" ? "Meja Kasir POS" : "Panel Owner & Admin"}
          </Link>
        )}
      </div>

      {/* Main Navigation */}
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Coffee size={22} />
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 700, color: "var(--primary)", display: "block", lineHeight: 1.1 }}>
              {profile?.name || "Cafe Ruang Namu"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600, letterSpacing: "0.04em" }}>
              SPECIALTY COFFEE & SPACE
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav style={{ display: "none", alignItems: "center", gap: "1.25rem" }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: "0.92rem",
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? "var(--accent)" : "var(--text-main)",
                transition: "color 0.2s"
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link to="/order" className="btn btn-accent btn-sm" style={{ padding: "0.55rem 1rem" }}>
            <Coffee size={16} /> Pesan Sekarang
          </Link>

          {onOpenCart && (
            <button
              onClick={onOpenCart}
              style={{
                position: "relative",
                padding: "0.6rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-sand)",
                color: "var(--primary)"
              }}
              title="Lihat Keranjang"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "var(--accent)",
                  color: "#FFFFFF",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: "0.5rem", color: "var(--primary)" }}
            className="mobile-toggle"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--border-color)",
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: "0.5rem 0",
                fontSize: "1rem",
                fontWeight: isActive(link.path) ? 700 : 500,
                color: isActive(link.path) ? "var(--accent)" : "var(--text-main)",
                borderBottom: "1px solid var(--border-light)"
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ paddingTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
            <Link
              to="/order"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-accent"
              style={{ flex: 1 }}
            >
              <Coffee size={18} /> Buka Pemesanan
            </Link>
            <Link
              to="/cashier"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-outline"
              style={{ fontSize: "0.85rem" }}
            >
              Kasir
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 992px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
