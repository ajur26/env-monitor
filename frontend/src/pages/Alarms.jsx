import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

function formatTs(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function Alarms() {
  const [alarms, setAlarms] = useState([]);

  async function load() {
    try {
      const data = await apiFetch("/measurements/?page=1");

      const filtered = (data?.results ?? []).filter(
        (m) => m.co_status === "warning" || m.co_status === "danger"
      );

      setAlarms(filtered);
    } catch (err) {
      console.error("Failed to load alarms:", err);
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
        {alarms.length === 0 && <div>Brak alarmów</div>}

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#94a3b8" }}>
              <th style={{ paddingBottom: 12 }}>Czas</th>
              <th>CO</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {alarms.map((a) => (
              <tr key={a.id}>
                <td style={{ padding: "8px 0" }}>{formatTs(a.created_at)}</td>
                <td>{a.co} ppm</td>
                <td>{a.co_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}