import { useEffect, useState } from "react";

function App() {
  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [mRes, sRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/measurements/"),
          fetch("http://127.0.0.1:8000/api/measurements/stats/"),
        ]);

        if (!mRes.ok) throw new Error(`Measurements fetch failed: ${mRes.status}`);
        if (!sRes.ok) throw new Error(`Stats fetch failed: ${sRes.status}`);

        const mData = await mRes.json();
        const sData = await sRes.json();

        setMeasurements(mData?.results ?? []);
        setStats(sData);
        setError(null);
      } catch (e) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div style={{ padding: 20, fontFamily: "Arial" }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, fontFamily: "Arial" }}>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>ENV-MONITOR Dashboard</h1>

      {stats && (
        <>
          <h2>Last Measurement</h2>
          <p>
            {stats.last_measurement?.temperature ?? "-"}°C |{" "}
            {stats.last_measurement?.humidity ?? "-"}% |{" "}
            {stats.last_measurement?.co ?? "-"} ppm
          </p>

          <h2>Average (Last Hour)</h2>
          <p>
            {stats.last_hour_avg?.temperature != null
              ? stats.last_hour_avg.temperature.toFixed(2)
              : "-"}
            °C |{" "}
            {stats.last_hour_avg?.humidity != null
              ? stats.last_hour_avg.humidity.toFixed(2)
              : "-"}
            % |{" "}
            {stats.last_hour_avg?.co != null ? stats.last_hour_avg.co.toFixed(2) : "-"} ppm
          </p>

          <h2>Average (Last 24h)</h2>
          <p>
            {stats.last_24h_avg?.temperature != null
              ? stats.last_24h_avg.temperature.toFixed(2)
              : "-"}
            °C |{" "}
            {stats.last_24h_avg?.humidity != null
              ? stats.last_24h_avg.humidity.toFixed(2)
              : "-"}
            % |{" "}
            {stats.last_24h_avg?.co != null ? stats.last_24h_avg.co.toFixed(2) : "-"} ppm
          </p>
        </>
      )}

      <h2>Latest Measurements</h2>
      {measurements.length === 0 ? (
        <p>No measurements yet.</p>
      ) : (
        <ul>
          {measurements.map((m) => (
            <li key={m.id}>
              {m.temperature}°C | {m.humidity}% | {m.co} ppm
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;