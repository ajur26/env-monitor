import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Clock() {
  const [now, setNow] = useState(new Date());

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
        background: "#1e293b",
        padding: 20,
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
        textAlign: "center",
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: 10 }}>
        Date / Time
      </div>

      <div style={{ fontSize: 18 }}>
        {now.toLocaleDateString()}
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        {now.toLocaleTimeString()}

        {isDay ? (
          <FaSun color="#facc15" size={22} />
        ) : (
          <FaMoon color="#60a5fa" size={22} />
        )}
      </div>
    </div>
  );
}