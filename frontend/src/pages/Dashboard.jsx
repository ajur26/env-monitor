import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Chart from "../components/Chart";
import { apiFetch } from "../api/client";
import {
  FaTemperatureHigh,
  FaTint,
  FaSmog,
} from "react-icons/fa";
import { FaGaugeHigh } from "react-icons/fa6";

function getCoUI(status) {
  if (status === "ok")
    return {
      label: "OK",
      border: "#22c55e",
      bg: "#052e16",
      fg: "#dcfce7",
      gradient: "var(--bg-panel)",
    };

  if (status === "warning")
    return {
      label: "WARNING",
      border: "#f59e0b",
      bg: "#451a03",
      fg: "#fffbeb",
      gradient: "var(--bg-panel)",
    };

  if (status === "danger")
    return {
      label: "DANGER",
      border: "#ef4444",
      bg: "#450a0a",
      fg: "#fee2e2",
      gradient: "var(--bg-panel)",
    };

  return {
    label: "UNKNOWN",
    border: "var(--border-soft)",
    bg: "var(--bg-main)",
    fg: "var(--text-main)",
    gradient: "var(--bg-panel)",
  };
}

function Card({ title, children, accent, headerRight, gradient }) {
  return (
    <div
      style={{
        background: gradient ? gradient : "var(--bg-panel)",
        padding: 24,
        borderRadius: 14,
        border: accent
          ? `1px solid ${accent}`
          : "1px solid var(--border-soft)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
        <h3 style={{ margin: 0, color: "var(--text-main)" }}>{title}</h3>
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
          ? "1px solid var(--border-main)"
          : "1px solid var(--border-soft)",
        background: active ? "var(--button-active)" : "var(--button-bg)",
        color: active ? "var(--button-active-text)" : "var(--text-main)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontWeight: active ? 600 : 500,
      }}
    >
      {children}
    </button>
  );
}

function MeasurementRow({ icon, value, unit }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 32,
        fontWeight: 700,
        color: "var(--text-main)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 32,
        }}
      >
        {icon}
      </span>
      <span>
        {value} {unit}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { point } = useParams();

  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState("1h");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);

      const [mData, sData, rData] = await Promise.all([
        apiFetch(`/measurements/?point=${point}&page=1`),
        apiFetch(`/measurements/stats/`),
        apiFetch(`/measurements/recent/?period=${period}&point=${point}`),
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
    document.body.style.background = "var(--bg-main)";

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [period, point]);

  const latest = measurements[0];
  const coUi = getCoUI(stats?.co_status);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        boxSizing: "border-box",
        background: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ marginTop: 16, color: "var(--text-main)" }}>
          {point === "living_room" ? "Living Room" : "Bedroom"} Dashboard
        </h1>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            marginBottom: 12,
            color: "var(--text-muted)",
            fontSize: 12,
          }}
        >
          Chart period
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <SmallButton
            active={period === "1h"}
            onClick={() => setPeriod("1h")}
          >
            1h
          </SmallButton>

          <SmallButton
            active={period === "24h"}
            onClick={() => setPeriod("24h")}
          >
            24h
          </SmallButton>
        </div>
      </div>

      {loading && (
        <div
          style={{
            marginBottom: 20,
            color: "var(--text-muted)",
            fontSize: 12,
          }}
        >
          Loading chart data...
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: 36,
          alignItems: "stretch",
        }}
      >
        <div style={{ width: "100%", minWidth: 0, height: "100%" }}>
          <Chart
            data={chartData}
            title="Environment measurements"
            period={period}
          />
        </div>

        <div style={{ height: "100%" }}>
          <Card
            title="Last Measurement"
            accent={coUi.border}
            gradient={coUi.gradient}
          >
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: coUi.bg,
                color: coUi.fg,
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 18,
                border: `1px solid ${coUi.border}`,
                display: "inline-block",
              }}
            >
              CO STATUS: {coUi.label}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <MeasurementRow
                icon={<FaTemperatureHigh color="#ef4444" />}
                value={latest?.temperature ?? "-"}
                unit="°C"
              />

              <MeasurementRow
                icon={<FaTint color="#3b82f6" />}
                value={latest?.humidity ?? "-"}
                unit="%"
              />

              <MeasurementRow
                icon={<FaSmog color="#e5e7eb" />}
                value={latest?.co ?? "-"}
                unit="ppm"
              />

              <MeasurementRow
                icon={<FaGaugeHigh color="#aa9c60" />}
                value={latest?.pressure ?? "-"}
                unit="hPa"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}