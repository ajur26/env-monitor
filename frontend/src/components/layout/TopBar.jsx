import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "60px",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border-main)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* LEWA */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "var(--text-main)",
              borderRadius: "6px",
            }}
          />
          <strong>ENV Monitor</strong>
        </div>

        <nav style={{ display: "flex", gap: "12px" }}>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/alerts">Alarms</NavLink>
        </nav>
      </div>

      {/* PRAWA */}
      <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        {formatted}
      </div>
    </div>
  );
}