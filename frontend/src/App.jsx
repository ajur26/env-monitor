import { useEffect, useState } from "react";

function App() {
  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/measurements/")
      .then((res) => res.json())
      .then((data) => {
        setMeasurements(data.results);
      });

    fetch("http://127.0.0.1:8000/api/measurements/stats/")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>ENV-MONITOR Dashboard</h1>

      {stats && (
        <>
          <h2>Last Measurement</h2>
          <p>
            {stats.last_measurement?.temperature}°C |{" "}
            {stats.last_measurement?.humidity}% |{" "}
            {stats.last_measurement?.co} ppm
          </p>

          <h2>Average (Last Hour)</h2>
          <p>
            {stats.last_hour_avg?.temperature?.toFixed(2)}°C |{" "}
            {stats.last_hour_avg?.humidity?.toFixed(2)}% |{" "}
            {stats.last_hour_avg?.co?.toFixed(2)} ppm
          </p>

          <h2>Average (Last 24h)</h2>
          <p>
            {stats.last_24h_avg?.temperature?.toFixed(2)}°C |{" "}
            {stats.last_24h_avg?.humidity?.toFixed(2)}% |{" "}
            {stats.last_24h_avg?.co?.toFixed(2)} ppm
          </p>
        </>
      )}

      <h2>Latest Measurements</h2>
      <ul>
        {measurements.map((m) => (
          <li key={m.id}>
            {m.temperature}°C | {m.humidity}% | {m.co} ppm
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;