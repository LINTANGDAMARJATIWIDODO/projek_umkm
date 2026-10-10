import React, { useState, useEffect } from "react";
import { Plus, Users, Shield, Key, Check, X } from "lucide-react";
import { api } from "../../services/api";

export default function AdminStaff() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", role: "cashier", name: "" });
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(formData);
      alert("Akun staf berhasil dibuat.");
      setModalOpen(false);
      setFormData({ username: "", password: "", role: "cashier", name: "" });
      loadUsers();
    } catch (err) {
      alert("Gagal membuat staf: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
            Manajemen Staf & Hak Akses
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
            Kelola akun operasional kasir dan administrator Cafe Ruang Namu.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Tambah Staf Baru
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: "0.88rem", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-cream)", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.85rem 1rem" }}>Nama Staf</th>
              <th style={{ padding: "0.85rem 1rem" }}>Username</th>
              <th style={{ padding: "0.85rem 1rem" }}>Peran (Role)</th>
              <th style={{ padding: "0.85rem 1rem" }}>Status</th>
              <th style={{ padding: "0.85rem 1rem" }}>Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "0.85rem 1rem" }}>{u.username}</td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <span className={`badge ${u.role === "admin" ? "badge-info" : "badge-warning"}`}>
                    {u.role === "admin" ? "Administrator" : "Kasir Operasional"}
                  </span>
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  <span className="badge badge-success">Aktif</span>
                </td>
                <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>
                  {new Date(u.created_at).toLocaleDateString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: "2rem", maxWidth: "440px" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "1.25rem" }}>
              Tambah Akun Staf Baru
            </h3>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap Staf</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Rian Kasir"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username Login</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: kasir2"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Sandi (Password)</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Peran (Role)</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="cashier">Kasir Operasional (Hanya Layar Kasir)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Buat Akun Staf
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
