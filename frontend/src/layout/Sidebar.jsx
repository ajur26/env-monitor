import { NavLink } from "react-router-dom";
import { FaHome, FaChartLine, FaBell } from "react-icons/fa";

function MenuItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 10,
        textDecoration: "none",
        background: isActive ? "#1e293b" : "transparent",
        color: isActive ? "white" : "#94a3b8",
        fontWeight: isActive ? 600 : 400,
      })}
    >
      {icon}
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
        justifyContent: "space-between", // góra + dół sidebaru
      }}
    >
      {/* GÓRNA CZĘŚĆ SIDEBAR */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
          <MenuItem to="/" icon={<FaHome size={16} />} label="Home" />
          <MenuItem to="/history" icon={<FaChartLine size={16} />} label="Historia" />
          <MenuItem to="/alarms" icon={<FaBell size={16} />} label="Alarmy" />
        </div>
      </div>

      {/* DOLNA CZĘŚĆ SIDEBAR – PANEL UŻYTKOWNIKA */}
      <div
        style={{
          borderTop: "1px solid #1e293b",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 14, color: "#94a3b8" }}>
          Zalogowany: <strong>Admin</strong>
        </div>

        <button
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "#1e293b",
            color: "white",
            cursor: "pointer",
          }}
        >
          Wyloguj
        </button>
      </div>
    </aside>
  );
}