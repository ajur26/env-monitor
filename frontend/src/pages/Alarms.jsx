import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function Alarms() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data = await apiFetch("/measurements/alarms/");

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setAlarms(list);
    } catch (err) {
      console.error("Failed to load alarms:", err);
      setError("Failed to load alarms");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="alarms-page">
      <h1 className="alarms-title">Alarm History</h1>

      <div className="alarms-card">
        {loading && <div>Loading...</div>}

        {error && <div className="alarms-error">{error}</div>}

        {!loading && alarms.length === 0 && (
          <div className="alarms-empty">No alarms available</div>
        )}

        {!loading && alarms.length > 0 && (
          <div className="table-wrapper">
            <table className="alarms-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Room</th>
                  <th>CO</th>
                  <th>Message</th>
                </tr>
              </thead>

              <tbody>
                {alarms.map((a) => (
                  <tr key={a.id}>
                    <td>{formatTs(a.created_at)}</td>
                    <td>{a.point}</td>
                    <td>
                      <span className="co-value">{a.co} ppm</span>
                    </td>
                    <td>{a.message}</td>
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