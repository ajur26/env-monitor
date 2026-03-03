import { NavLink } from "react-router-dom";

function MenuItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: "block",
        padding: "12px 16px",
        borderRadius: 10,
        textDecoration: "none",
        background: isActive ? "#1e293b" : "transparent",
        color: isActive ? "white" : "#94a3b8",
        fontWeight: isActive ? 600 : 400,
      })}
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside
      style={{
        padding: 20,
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          borderBottom: "1px solid #1e293b",
          paddingBottom: 12,
        }}
      >
        ENV-MONITOR
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <MenuItem to="/" label="Home" end />
        <MenuItem to="/history" label="Historia" />
        <MenuItem to="/alarms" label="Alarmy" />
      </div>
    </aside>
  );
}