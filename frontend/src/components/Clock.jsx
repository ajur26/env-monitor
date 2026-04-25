import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const isDay = hour >= 6 && hour < 19;

  return (
    <div className="clock-card">
      <div className="clock-label">Date / Time</div>

      <div className="clock-date">
        {now.toLocaleDateString()}
      </div>

      <div className="clock-time">
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