import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function Alarms() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch("/measurements/alarms/");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setAlarms(list);
    } catch (err) {
      console.error("Failed to load alarms:", err);
      setError("Failed to load alarms");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cardStyle = {
    background: "var(--bg-panel)",
    padding: 24,
    borderRadius: 14,
    border: "1px solid var(--border-soft)",
  };

  const thStyle = {
    textAlign: "left",
    color: "var(--text-muted)",
    paddingBottom: 12,
    fontWeight: 500,
  };

  const tdStyle = {
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Alarm History</h1>

      <div style={cardStyle}>
        {loading && <div>Loading...</div>}

        {error && (
          <div style={{ color: "var(--border-main)" }}>
            {error}
          </div>
        )}

        {!loading && alarms.length === 0 && (
          <div style={{ color: "var(--text-muted)" }}>
            No alarms available
          </div>
        )}

        {!loading && alarms.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Room</th>
                <th style={thStyle}>CO</th>
                <th style={thStyle}>Message</th>
              </tr>
            </thead>

            <tbody>
              {alarms.map((a) => (
                <tr key={a.id}>
                  <td style={tdStyle}>{formatTs(a.created_at)}</td>
                  <td style={tdStyle}>{a.point}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {a.co} ppm
                    </span>
                  </td>
                  <td style={tdStyle}>{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}