import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString();
}

export default function Chart({ data, title }) {
  return (
    <div
      style={{
        width: "100%",
        height: 380,
        background: "#000000",
        borderRadius: 14,
        boxShadow:
          "0 6px 20px rgba(0,0,0,0.4), 0 0 8px rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxSizing: "border-box",
        padding: 20,
      }}
    >
      {title && (
        <h3 style={{ margin: "0 0 16px 0", color: "#cbd5e1" }}>
          {title}
        </h3>
      )}

      <div style={{ width: "100%", height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#484848" strokeDasharray="3 3" />

            <XAxis
              dataKey="created_at"
              tickFormatter={formatTime}
              stroke="#94a3b8"
            />

            <YAxis stroke="#94a3b8" />

            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
              }}
              labelFormatter={(label) =>
                new Date(label).toLocaleString()
              }
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#c71d1d"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke="#1d92e6"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="co"
              name="CO"
              stroke="#e4d18b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}