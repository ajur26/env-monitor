import { useEffect, useState } from "react";
import { clearTokens } from "../auth/auth";
import { useNavigate } from "react-router-dom";

function getTimeData() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    hour: now.getHours(),
  };
}

export default function HeaderRight() {
  const navigate = useNavigate();
  const [timeData, setTimeData] = useState(getTimeData());

  useEffect(() => {
    const id = setInterval(() => {
      setTimeData(getTimeData());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isDay = timeData.hour >= 6 && timeData.hour < 19;

  function handleLogout() {
    clearTokens();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #334155",
        }}
      >
        <div style={{ fontSize: 14, color: "#94a3b8" }}>
          Zalogowany
        </div>
        <div style={{ fontWeight: 600, marginTop: 6 }}>
          Admin
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ef4444",
            background: "#450a0a",
            color: "white",
            cursor: "pointer",
          }}
        >
          Wyloguj
        </button>
      </div>

      <div
        style={{
          background: "#1e293b",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #334155",
        }}
      >
        <div style={{ fontSize: 14, color: "#94a3b8" }}>
          Data / Godzina
        </div>

        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
          {timeData.time}
        </div>

        <div style={{ marginTop: 4 }}>
          {timeData.date}
        </div>

        <div style={{ marginTop: 10 }}>
          {isDay ? "☀ Dzień" : "🌙 Noc"}
        </div>
      </div>
    </aside>
  );
}