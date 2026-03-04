import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function History() {
  const [measurements, setMeasurements] = useState([]);

  async function load() {
    try {
      const data = await apiFetch("/measurements/?page=1");
      setMeasurements(data?.results ?? []);
    } catch (err) {
      console.error("Failed to load measurements:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 30 }}>Historia pomiarów</h1>

      <div
        style={{
          background: "#1e293b",
          padding: 24,
          borderRadius: 14,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#94a3b8" }}>
              <th style={{ paddingBottom: 12 }}>Czas</th>
              <th>Temperatura</th>
              <th>Wilgotność</th>
              <th>CO</th>
            </tr>
          </thead>

          <tbody>
            {measurements.map((m) => (
              <tr key={m.id}>
                <td style={{ padding: "8px 0" }}>{formatTs(m.created_at)}</td>
                <td>{m.temperature} °C</td>
                <td>{m.humidity} %</td>
                <td>{m.co} ppm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}