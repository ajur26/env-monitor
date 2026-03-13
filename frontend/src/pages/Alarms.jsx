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

      // obsługa paginacji DRF lub zwykłej listy
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
    <div>
      <h1 style={{ marginBottom: 30 }}>Historia alarmów</h1>

      <div
        style={{
          background: "#1e293b",
          padding: 24,
          borderRadius: 14,
        }}
      >
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && alarms.length === 0 && <div>Brak alarmów</div>}

        {!loading && alarms.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#94a3b8" }}>
                <th style={{ paddingBottom: 12 }}>Czas</th>
                <th>Pomieszczenie</th>
                <th>CO</th>
                <th>Opis</th>
              </tr>
            </thead>

            <tbody>
              {alarms.map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: "8px 0" }}>
                    {formatTs(a.created_at)}
                  </td>
                  <td>{a.point}</td>
                  <td>{a.co} ppm</td>
                  <td>{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
