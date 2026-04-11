import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function History() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch("/measurements/?page=1");
      setMeasurements(data?.results ?? []);
    } catch (err) {
      console.error("Failed to load measurements:", err);
      setError("Failed to load measurements");
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
      <h1 style={{ marginBottom: 24 }}>Measurement History</h1>

      <div style={cardStyle}>
        {loading && <div>Loading...</div>}

        {error && (
          <div style={{ color: "var(--border-main)" }}>
            {error}
          </div>
        )}

        {!loading && !error && measurements.length === 0 && (
          <div style={{ color: "var(--text-muted)" }}>
            No measurements available
          </div>
        )}

        {!loading && measurements.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Temperature</th>
                <th style={thStyle}>Humidity</th>
                <th style={thStyle}>CO</th>
              </tr>
            </thead>

            <tbody>
              {measurements.map((m) => (
                <tr key={m.id}>
                  <td style={tdStyle}>{formatTs(m.created_at)}</td>
                  <td style={tdStyle}>{m.temperature} °C</td>
                  <td style={tdStyle}>{m.humidity} %</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600 }}>{m.co} ppm</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}