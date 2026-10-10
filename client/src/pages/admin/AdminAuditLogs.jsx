import React, { useState, useEffect } from "react";
import { Activity, Shield } from "lucide-react";
import { api } from "../../services/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.getAuditLogs();
        if (res.success) setLogs(res.data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", color: "var(--primary)", margin: 0 }}>
          Audit Trail Log Aktivitas
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
          Rekam jejak setiap aksi krusial staf, kasir, konfigurasi sistem, dan proses transaksi.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--bg-cream)", borderBottom: "1px solid var(--border-color)", textAlign: "left", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.85rem 1rem" }}>Waktu</th>
                <th style={{ padding: "0.85rem 1rem" }}>Staf / Pengguna</th>
                <th style={{ padding: "0.85rem 1rem" }}>Aksi</th>
                <th style={{ padding: "0.85rem 1rem" }}>Entitas</th>
                <th style={{ padding: "0.85rem 1rem" }}>Rincian Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    {log.user_name || log.username || "Sistem Otomatis"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                    {log.entity}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
