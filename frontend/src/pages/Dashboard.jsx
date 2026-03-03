import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "../components/Chart";
import { apiFetch } from "../api/client";

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

function SmallButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: active
          ? "1px solid #38bdf8"
          : "1px solid #334155",
        background: active ? "#0b1220" : "#111827",
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
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);

      const [mData, sData, rData] = await Promise.all([
        apiFetch(`/measurements/?page=1`),
        apiFetch(`/measurements/stats/`),
        apiFetch(`/measurements/recent/?period=${period}`),
      ]);

      setMeasurements(mData?.results ?? []);
      setStats(sData);
      setChartData(Array.isArray(rData) ? rData : []);
    } catch (err) {
      console.error("Error loading data:", err);

      if (err?.status === 401) {
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#0f172a";

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [period]);

  const latest = measurements[0];
  const coUi = getCoUI(stats?.co_status);

  const visibleCount = expanded ? 20 : 5;
  const visibleMeasurements = measurements.slice(0, visibleCount);

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
      <div style={{ marginBottom: 20 }}>
        <h1>ENV-MONITOR Dashboard</h1>
      </div>

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
        </div>

        {/* PRAWA STRONA — WYKRESY */}
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

          {loading && (
            <div style={{ marginBottom: 20, color: "#94a3b8", fontSize: 12 }}>
              Loading chart data...
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <Chart
              title={`Temperature (${period})`}
              data={chartData}
              dataKey="temperature"
            />
            <Chart
              title={`Humidity (${period})`}
              data={chartData}
              dataKey="humidity"
            />
            <Chart
              title={`CO (${period})`}
              data={chartData}
              dataKey="co"
            />
          </div>
        </div>
      </div>
    </div>
  );
}