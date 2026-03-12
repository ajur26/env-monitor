import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Chart from "../components/Chart";
import { apiFetch } from "../api/client";
import Clock from "../components/Clock";
import { FaTemperatureHigh, FaTint, FaSmog } from "react-icons/fa";

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
        border: active ? "1px solid #38bdf8" : "1px solid #334155",
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
  const { point } = useParams();

  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState("1h");

  async function load() {
    try {
      const [mData, sData, rData] = await Promise.all([
        apiFetch(`/measurements/?point=${point}&page=1`),
        apiFetch(`/measurements/stats/?point=${point}`),
        apiFetch(`/measurements/recent/?period=${period}&point=${point}`),
      ]);

      setMeasurements(mData?.results ?? []);
      setStats(sData);
      setChartData(Array.isArray(rData) ? rData : []);
    } catch (err) {
      if (err?.status === 401) navigate("/login", { replace: true });
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [period, point]);

  const latest = measurements[0];
  const coUi = getCoUI(stats?.co_status);

  return (
    <div style={{ minHeight: "100vh", padding: 40, background: "#0f172a", color: "white" }}>
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 14, color: "#94a3b8" }}>Welcome back</div>
        <h1>
          {point === "living_room" ? "Living Room" : "Bedroom"} Dashboard
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 40 }}>
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
            }}
          >
            CO STATUS: {coUi.label}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 32 }}>
              <FaTemperatureHigh /> {latest?.temperature ?? "-"}°C
            </div>

            <div style={{ fontSize: 32 }}>
              <FaTint /> {latest?.humidity ?? "-"}%
            </div>

            <div style={{ fontSize: 32 }}>
              <FaSmog /> {latest?.co ?? "-"} ppm
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
            {latest ? formatTs(latest.created_at) : "-"}
          </div>
        </Card>

        <div>
          <div style={{ marginBottom: 20 }}>
            <SmallButton active={period === "1h"} onClick={() => setPeriod("1h")}>
              1h
            </SmallButton>

            <SmallButton
              active={period === "24h"}
              onClick={() => setPeriod("24h")}
              style={{ marginLeft: 10 }}
            >
              24h
            </SmallButton>
          </div>

          <Chart title={`Environment measurements (${period})`} data={chartData} />

          <Clock />
        </div>
      </div>
    </div>
  );
}