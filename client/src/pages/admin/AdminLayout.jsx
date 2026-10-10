import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  Coffee, LayoutDashboard, Utensils, Archive, QrCode, ClipboardList, 
  Tag, Users, Settings, CreditCard, Activity, LogOut, ExternalLink, ShieldCheck, ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navSections = [
    {
      title: "RINGKASAN & ANALITIK",
      items: [
        { label: "Dashboard Eksekutif", path: "/admin", icon: <LayoutDashboard size={17} /> }
      ]
    },
    {
      title: "KATALOG & PERSEDIAAN",
      items: [
        { label: "Manajemen Menu", path: "/admin/menu", icon: <Utensils size={17} /> },
        { label: "Stok & Mutasi Bahan", path: "/admin/stock", icon: <Archive size={17} /> }
      ]
    },
    {
      title: "OPERASIONAL MEJA",
      items: [
        { label: "Meja & QR Code Akrilik", path: "/admin/tables", icon: <QrCode size={17} /> },
        { label: "Riwayat Seluruh Pesanan", path: "/admin/orders", icon: <ClipboardList size={17} /> }
      ]
    },
    {
      title: "MARKETING & DISKON",
      items: [
        { label: "Promosi & Bundling", path: "/admin/promotions", icon: <Tag size={17} /> }
      ]
    },
    {
      title: "PENGATURAN TOKO & GATEWAY",
      items: [
        { label: "Profil Cafe, Jam & SEO", path: "/admin/settings/profile", icon: <Settings size={17} /> },
        { label: "Payment Gateway QRIS", path: "/admin/settings/payment", icon: <CreditCard size={17} /> },
        { label: "Staf & Kasir", path: "/admin/staff", icon: <Users size={17} /> },
        { label: "Audit Trail Log", path: "/admin/audit-logs", icon: <Activity size={17} /> }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  // Find current section name for breadcrumb
  let currentLabel = "Dashboard";
  navSections.forEach(s => s.items.forEach(i => {
    if (isActive(i.path)) currentLabel = i.label;
  }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
      {/* DISTINCT EXECUTIVE DARK ROAST SIDEBAR */}
      <aside style={{
        width: "270px",
        backgroundColor: "var(--bg-dark)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        flexShrink: 0,
        boxShadow: "4px 0 24px rgba(0,0,0,0.2)"
      }}>
        {/* Brand Header */}
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              backgroundColor: "var(--accent)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(200, 109, 59, 0.35)"
            }}>
              <Coffee size={22} />
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF", display: "block", lineHeight: 1.1 }}>
                Ruang Namu
              </span>
              <span style={{ fontSize: "0.72rem", color: "#FDE047", fontWeight: 700, letterSpacing: "0.06em" }}>
                OWNER & MANAGER
              </span>
            </div>
          </Link>
        </div>

        {/* Categorized Navigation */}
        <nav style={{ flex: 1, padding: "1.25rem 0.85rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#8E7D72", letterSpacing: "0.08em", padding: "0 0.65rem 0.4rem 0.65rem" }}>
                {section.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.7rem",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: active ? 700 : 500,
                        color: active ? "#FFFFFF" : "#C4B6AA",
                        backgroundColor: active ? "var(--primary)" : "transparent",
                        borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                        transition: "all 0.18s ease"
                      }}
                    >
                      <span style={{ color: active ? "var(--accent)" : "inherit" }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Link
            to="/cashier"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.82rem",
              color: "#86EFAC",
              backgroundColor: "rgba(30, 126, 52, 0.15)",
              border: "1px solid rgba(134, 239, 172, 0.25)",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px"
            }}
          >
            <ExternalLink size={14} /> Buka Layar Kasir POS
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#9C8E84" }}>
              {user?.name || "Administrator"}
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "#FCA5A5",
                fontSize: "0.78rem"
              }}
            >
              <LogOut size={13} /> Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Header Breadcrumb Bar */}
        <header style={{
          backgroundColor: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-color)",
          padding: "0.85rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <span>Portal Manajemen</span>
            <ChevronRight size={14} />
            <strong style={{ color: "var(--primary)" }}>{currentLabel}</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.76rem",
              backgroundColor: "var(--success-bg)",
              color: "var(--success)",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-full)",
              fontWeight: 700
            }}>
              <ShieldCheck size={14} /> Database & Gateway Sinkron
            </span>
          </div>
        </header>

        {/* Dynamic Nested View */}
        <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
