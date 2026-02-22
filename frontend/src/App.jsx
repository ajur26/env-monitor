import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: 24,
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#cbd5e1" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function App() {
  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);

  async function load() {
    const [mRes, sRes] = await Promise.all([
      fetch(`${API_BASE}/measurements/?page=1`),
      fetch(`${API_BASE}/measurements/stats/`),
    ]);

    const mData = await mRes.json();
    const sData = await sRes.json();

    setMeasurements(mData?.results ?? []);
    setStats(sData);
  }

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#0f172a";

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const latest = measurements[0];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        padding: 40,
        boxSizing: "border-box",
        background: "#0f172a",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 10 }}>ENV-MONITOR Dashboard</h1>
      <p style={{ color: "#94a3b8", marginBottom: 40 }}>
        Auto refresh every 15 seconds
      </p>

      {/* GŁÓWNY LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: 40,
        }}
      >
        {/* LEWA KOLUMNA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Card title="Last Measurement">
            <div style={{ fontSize: 32, fontWeight: 700 }}>
              {latest?.temperature ?? "-"}°C
            </div>
            <div>Humidity: {latest?.humidity ?? "-"}%</div>
            <div>CO: {latest?.co ?? "-"} ppm</div>
            <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
              {latest ? formatTs(latest.created_at) : "-"}
            </div>
          </Card>

          <Card title="Average (Last 1h)">
            <div>
              Temp: {stats?.last_hour_avg?.temperature?.toFixed(2) ?? "-"} °C
            </div>
            <div>
              Humidity: {stats?.last_hour_avg?.humidity?.toFixed(2) ?? "-"} %
            </div>
            <div>
              CO: {stats?.last_hour_avg?.co?.toFixed(2) ?? "-"} ppm
            </div>
          </Card>

          <Card title="Average (Last 24h)">
            <div>
              Temp: {stats?.last_24h_avg?.temperature?.toFixed(2) ?? "-"} °C
            </div>
            <div>
              Humidity: {stats?.last_24h_avg?.humidity?.toFixed(2) ?? "-"} %
            </div>
            <div>
              CO: {stats?.last_24h_avg?.co?.toFixed(2) ?? "-"} ppm
            </div>
          </Card>
        </div>

        {/* PRAWA KOLUMNA */}
        <Card title="Latest Measurements">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                  <th style={{ paddingBottom: 12 }}>Time</th>
                  <th>Temp</th>
                  <th>Humidity</th>
                  <th>CO</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ padding: "10px 0" }}>
                      {formatTs(m.created_at)}
                    </td>
                    <td>{m.temperature}</td>
                    <td>{m.humidity}</td>
                    <td>{m.co}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* RESPONSYWNOŚĆ */}
      <style>
        {`
          @media (max-width: 1000px) {
            div[style*="grid-template-columns: 350px 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}