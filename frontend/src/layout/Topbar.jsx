import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaMoon, FaSun } from "react-icons/fa";
import { clearTokens } from "../auth/auth";

function navLinkStyle(isActive) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 10,
    textDecoration: "none",
    border: isActive
      ? "1px solid var(--border-main)"
      : "1px solid var(--border-soft)",
    background: isActive ? "var(--button-active)" : "var(--button-bg)",
    color: isActive ? "var(--button-active-text)" : "var(--text-main)",
    fontSize: 14,
    fontWeight: isActive ? 600 : 500,
    transition: "all 0.2s ease",
  };
}

function dropdownItemStyle(active) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: active
      ? "1px solid var(--border-main)"
      : "1px solid transparent",
    background: active ? "var(--button-active)" : "transparent",
    color: active ? "var(--button-active-text)" : "var(--text-main)",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s ease",
  };
}

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  const isLivingRoom = location.pathname.includes("/room/living_room");
  const isBedroom = location.pathname.includes("/room/bedroom");
  const isRoomsActive = isLivingRoom || isBedroom;

  function handleLogout() {
    clearTokens();
    navigate("/login", { replace: true });
  }

  function handleRoomSelect(room) {
    navigate(`/room/${room}`);
    setRoomsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoomsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const isDay = hour >= 6 && hour < 19;

  return (
    <div
      style={{
        width: "100%",
        height: 64,
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border-soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginRight: 10,
            color: "var(--text-main)",
          }}
        >
          ENV-MONITOR
        </div>

        <div
          ref={dropdownRef}
          style={{
            position: "relative",
          }}
        >
          <button
            onClick={() => setRoomsOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 10,
              border: isRoomsActive
                ? "1px solid var(--border-main)"
                : "1px solid var(--border-soft)",
              background: isRoomsActive
                ? "var(--button-active)"
                : "var(--button-bg)",
              color: isRoomsActive
                ? "var(--button-active-text)"
                : "var(--text-main)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: isRoomsActive ? 600 : 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isRoomsActive) {
                e.currentTarget.style.background = "var(--button-bg-hover)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isRoomsActive
                ? "var(--button-active)"
                : "var(--button-bg)";
            }}
          >
            Rooms
            <FaChevronDown size={12} />
          </button>

          {roomsOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: 180,
                padding: 8,
                borderRadius: 12,
                border: "1px solid var(--border-soft)",
                background: "var(--bg-panel)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <button
                onClick={() => handleRoomSelect("living_room")}
                style={dropdownItemStyle(isLivingRoom)}
                onMouseEnter={(e) => {
                  if (!isLivingRoom) {
                    e.currentTarget.style.background = "var(--button-bg-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isLivingRoom
                    ? "var(--button-active)"
                    : "transparent";
                }}
              >
                Living Room
              </button>

              <button
                onClick={() => handleRoomSelect("bedroom")}
                style={dropdownItemStyle(isBedroom)}
                onMouseEnter={(e) => {
                  if (!isBedroom) {
                    e.currentTarget.style.background = "var(--button-bg-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isBedroom
                    ? "var(--button-active)"
                    : "transparent";
                }}
              >
                Bedroom
              </button>
            </div>
          )}
        </div>

        <NavLink
          to="/history"
          style={({ isActive }) => navLinkStyle(isActive)}
          onMouseEnter={(e) => {
            if (!location.pathname.startsWith("/history")) {
              e.currentTarget.style.background = "var(--button-bg-hover)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = location.pathname.startsWith("/history")
              ? "var(--button-active)"
              : "var(--button-bg)";
          }}
        >
          History
        </NavLink>

        <NavLink
          to="/alarms"
          style={({ isActive }) => navLinkStyle(isActive)}
          onMouseEnter={(e) => {
            if (!location.pathname.startsWith("/alarms")) {
              e.currentTarget.style.background = "var(--button-bg-hover)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = location.pathname.startsWith("/alarms")
              ? "var(--button-active)"
              : "var(--button-bg)";
          }}
        >
          Alarms
        </NavLink>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-muted)",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          <span>{now.toLocaleDateString()}</span>
          <span
            style={{
              color: "var(--text-main)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {now.toLocaleTimeString()}
          </span>
          {isDay ? (
            <FaSun color="#facc15" size={14} />
          ) : (
            <FaMoon color="#e5e7eb" size={14} />
          )}
        </div>

        <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Admin</div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid var(--border-soft)",
            background: "var(--button-bg)",
            color: "var(--text-main)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--button-bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--button-bg)";
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}