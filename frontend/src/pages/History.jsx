import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function History() {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch("/measurements/?page=1");
      setMeasurements(data?.results ?? []);
    } catch (err) {
      console.error("Failed to load measurements:", err);
      setError("Failed to load measurements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="history-page">
      <h1 className="history-title">Measurement History</h1>

      <div className="history-card">
        {loading && <div>Loading...</div>}

        {error && <div className="history-error">{error}</div>}

        {!loading && !error && measurements.length === 0 && (
          <div className="history-empty">No measurements available</div>
        )}

        {!loading && measurements.length > 0 && (
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Temperature</th>
                  <th>Humidity</th>
                  <th>CO</th>
                </tr>
              </thead>

              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id}>
                    <td>{formatTs(m.created_at)}</td>
                    <td>{m.temperature} °C</td>
                    <td>{m.humidity} %</td>
                    <td>
                      <span className="co-value">{m.co} ppm</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}