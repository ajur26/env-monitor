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
        background: "var(--bg-panel)",
        padding: 20,
        borderRadius: 14,
        border: "1px solid var(--border-soft)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: "var(--text-muted)",
          marginBottom: 10,
          fontSize: 13,
        }}
      >
        Date / Time
      </div>

      <div
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
        }}
      >
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
          marginTop: 4,
        }}
      >
        {now.toLocaleTimeString()}

        {isDay ? (
          <FaSun color="#facc15" size={20} />
        ) : (
          <FaMoon color="#e5e7eb" size={20} />
        )}
      </div>
    </div>
  );
}