import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Coffee, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(username, password);
      if (loggedUser.role === "cashier") {
        navigate("/cashier");
      } else {
        navigate(from === "/cashier" ? "/cashier" : "/admin");
      }
    } catch (err) {
      setError(err.message || "Username atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-cream)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%", padding: "2.25rem", boxShadow: "var(--shadow-lg)" }}>
        {/* Logo & Heading */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "var(--primary)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.75rem auto"
          }}>
            <Coffee size={26} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "var(--primary)", margin: 0 }}>
            Login Staf Ruang Namu
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Akses portal kasir operasional & administrator cafe
          </p>
        </div>

        {error && (
          <div style={{
            padding: "0.65rem 0.85rem",
            backgroundColor: "var(--danger-bg)",
            color: "var(--danger)",
            fontSize: "0.85rem",
            borderRadius: "var(--radius-sm)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
              <input
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: "36px" }}
                placeholder="admin / kasir"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi (Password)</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: "36px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px dashed var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <span style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Kredensial Default Staf:</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin", "admin123")}
              className="btn btn-sm btn-outline"
              style={{ flex: 1, fontSize: "0.78rem" }}
            >
              Isi Admin (Owner)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("kasir", "kasir123")}
              className="btn btn-sm btn-outline"
              style={{ flex: 1, fontSize: "0.78rem" }}
            >
              Isi Kasir (POS)
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link to="/" style={{ fontSize: "0.85rem", color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            <ArrowLeft size={14} /> Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
