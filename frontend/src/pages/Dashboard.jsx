import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Chart from "../components/Chart";
import { apiFetch } from "../api/client";
import { FaTemperatureHigh, FaTint, FaSmog } from "react-icons/fa";
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
      className="dashboard-card"
      style={{
        background: gradient ? gradient : "var(--bg-panel)",
        border: accent
          ? `1px solid ${accent}`
          : "1px solid var(--border-soft)",
      }}
    >
      <div className="dashboard-card-header">
        <h3>{title}</h3>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function SmallButton({ active, onClick, children }) {
  return (
    <button
      className={`period-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MeasurementRow({ icon, value, unit }) {
  return (
    <div className="measurement-row">
      <span className="measurement-icon">{icon}</span>
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
    <main className="dashboard-page">
      <header className="dashboard-header">
        <h1>{point === "living_room" ? "Living Room" : "Bedroom"} Dashboard</h1>
      </header>

      <section className="period-section">
        <div className="period-label">Chart period</div>

        <div className="period-buttons">
          <SmallButton active={period === "1h"} onClick={() => setPeriod("1h")}>
            1h
          </SmallButton>

          <SmallButton
            active={period === "24h"}
            onClick={() => setPeriod("24h")}
          >
            24h
          </SmallButton>
        </div>
      </section>

      {loading && <div className="loading-text">Loading chart data...</div>}

      <section className="dashboard-grid">
        <div className="chart-column">
          <Chart
            data={chartData}
            title="Environment measurements"
            period={period}
          />
        </div>

        <div className="last-measurement-column">
          <Card
            title="Last Measurement"
            accent={coUi.border}
            gradient={coUi.gradient}
          >
            <div
              className="co-status-badge"
              style={{
                background: coUi.bg,
                color: coUi.fg,
                border: `1px solid ${coUi.border}`,
              }}
            >
              CO STATUS: {coUi.label}
            </div>

            <div className="measurement-list">
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
      </section>
    </main>
  );
}