import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "../components/Chart";
import { apiFetch } from "../api/client";
import { clearTokens } from "../auth/auth";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

function getCoUI(status) {
  if (status === "ok")
    return { label: "OK", border: "#22c55e", bg: "#052e16", fg: "#dcfce7" };
  if (status === "warning")
    return { label: "WARNING", border: "#f59e0b", bg: "#451a03", fg: "#fffbeb" };
  if (status === "danger")
    return { label: "DANGER", border: "#ef4444", bg: "#450a0a", fg: "#fee2e2" };
  return { label: "UNKNOWN", border: "#334155", bg: "#0b1220", fg: "#e2e8f0" };
}

function Card({ title, children, accent, headerRight }) {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: 24,
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        border: accent ? `1px solid ${accent}` : "1px solid transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 14,
        }}
      >
        <h3 style={{ margin: 0, color: "#cbd5e1" }}>{title}</h3>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function SmallButton({ active, onClick, children, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: danger
          ? "1px solid #ef4444"
          : active
          ? "1px solid #38bdf8"
          : "1px solid #334155",
        background: danger ? "#450a0a" : active ? "#0b1220" : "#111827",
        color: "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState("1h");
  const [expanded, setExpanded] = useState(false);

  async function load() {
    try {
      const [mData, sData, rData] = await Promise.all([
        apiFetch(`/measurements/?page=1`),
        apiFetch(`/measurements/stats/`),
        apiFetch(`/measurements/recent/?period=${period}`),
      ]);

      setMeasurements(mData?.results ?? []);
      setStats(sData);
      setChartData(rData);
    } catch (err) {
      console.error("Error loading data:", err);

      // jeśli token nieprawidłowy/wygaśnięty -> wyloguj i do logowania
      if (err?.status === 401) {
        clearTokens();
        navigate("/login", { replace: true });
      }
    }
  }

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#0f172a";

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const latest = measurements[0];
  const coUi = getCoUI(stats?.co_status);

  const visibleCount = expanded ? 20 : 5;
  const visibleMeasurements = measurements.slice(0, visibleCount);

  function handleLogout() {
    clearTokens();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        boxSizing: "border-box",
        background: "#0f172a",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ marginBottom: 10 }}>ENV-MONITOR Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center" }}>
          <SmallButton danger onClick={handleLogout}>
            Logout
          </SmallButton>
        </div>
      </div>

      {/* GÓRNA SEKCJA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: 40,
          marginBottom: 60,
        }}
      >
        {/* LEWA STRONA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Card title="Last Measurement" accent={coUi.border}>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: coUi.bg,
                color: coUi.fg,
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 14,
                border: `1px solid ${coUi.border}`,
                display: "inline-block",
              }}
            >
              CO STATUS: {coUi.label}
            </div>

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
            <div>Temp: {stats?.last_hour_avg?.temperature?.toFixed(2) ?? "-"} °C</div>
            <div>Humidity: {stats?.last_hour_avg?.humidity?.toFixed(2) ?? "-"} %</div>
            <div>CO: {stats?.last_hour_avg?.co?.toFixed(2) ?? "-"} ppm</div>
          </Card>

          <Card title="Average (Last 24h)">
            <div>Temp: {stats?.last_24h_avg?.temperature?.toFixed(2) ?? "-"} °C</div>
            <div>Humidity: {stats?.last_24h_avg?.humidity?.toFixed(2) ?? "-"} %</div>
            <div>CO: {stats?.last_24h_avg?.co?.toFixed(2) ?? "-"} ppm</div>
          </Card>
        </div>

        {/* PRAWA STRONA — WYKRES */}
        <div>
          <div style={{ marginBottom: 12, color: "#94a3b8", fontSize: 12 }}>
            Chart period
          </div>
          <div style={{ marginBottom: 20 }}>
            <SmallButton active={period === "1h"} onClick={() => setPeriod("1h")}>
              1h
            </SmallButton>
            <span style={{ marginLeft: 10 }} />
            <SmallButton active={period === "24h"} onClick={() => setPeriod("24h")}>
              24h
            </SmallButton>
          </div>

          <Chart data={chartData} />
        </div>
      </div>

      {/* DOLNA SEKCJA — LAST MEASUREMENTS 5/20 */}
      <Card
        title={`Last Measurements (${visibleMeasurements.length}/${Math.min(
          measurements.length,
          20
        )})`}
        headerRight={
          measurements.length > 5 ? (
            <SmallButton active={expanded} onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less" : "Show more"}
            </SmallButton>
          ) : null
        }
      >
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
              {visibleMeasurements.map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: "8px 0" }}>{formatTs(m.created_at)}</td>
                  <td>{m.temperature}</td>
                  <td>{m.humidity}</td>
                  <td>{m.co}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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