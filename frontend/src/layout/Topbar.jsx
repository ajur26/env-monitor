import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaMoon, FaSun } from "react-icons/fa";
import { clearTokens } from "../auth/auth";
import logo from "../assets/env_button_logo.webp";

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const isDay = hour >= 6 && hour < 19;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-brand">
          <img src={logo} alt="ENV-MONITOR" className="topbar-logo" />
        </div>

        <div ref={dropdownRef} className="rooms-dropdown">
          <button
            onClick={() => setRoomsOpen((prev) => !prev)}
            className={`topbar-link ${isRoomsActive ? "active" : ""}`}
          >
            Rooms
            <FaChevronDown size={12} />
          </button>

          {roomsOpen && (
            <div className="rooms-menu">
              <button
                onClick={() => handleRoomSelect("living_room")}
                className={`rooms-menu-item ${isLivingRoom ? "active" : ""}`}
              >
                Living Room
              </button>

              <button
                onClick={() => handleRoomSelect("bedroom")}
                className={`rooms-menu-item ${isBedroom ? "active" : ""}`}
              >
                Bedroom
              </button>
            </div>
          )}
        </div>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `topbar-link ${isActive ? "active" : ""}`
          }
        >
          History
        </NavLink>

        <NavLink
          to="/alarms"
          className={({ isActive }) =>
            `topbar-link ${isActive ? "active" : ""}`
          }
        >
          Alarms
        </NavLink>
      </div>

      <div className="topbar-right">
        <div className="topbar-time">
          <span className="topbar-date">{now.toLocaleDateString()}</span>
          <span className="topbar-clock">{now.toLocaleTimeString()}</span>
          {isDay ? (
            <FaSun color="#facc15" size={14} />
          ) : (
            <FaMoon color="#e5e7eb" size={14} />
          )}
        </div>

        <div className="topbar-user">Admin</div>

        <button onClick={handleLogout} className="logout-button">
          Log out
        </button>
      </div>
    </header>
  );
}