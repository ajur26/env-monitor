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
        background: "var(--bg-panel)",
        borderRadius: 14,
        border: "1px solid var(--border-soft)",
        boxSizing: "border-box",
        padding: 20,
      }}
    >
      {title && (
        <h3
          style={{
            margin: "0 0 16px 0",
            color: "var(--text-main)",
            fontWeight: 600,
          }}
        >
          {title}
        </h3>
      )}

      <div style={{ width: "100%", height: "320px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="created_at"
              tickFormatter={formatTime}
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-soft)",
                borderRadius: 10,
                color: "var(--text-main)",
              }}
              labelFormatter={(label) =>
                new Date(label).toLocaleString()
              }
            />

            <Legend
              wrapperStyle={{
                color: "var(--text-muted)",
                fontSize: 12,
              }}
            />

            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="co"
              name="CO"
              stroke="#e5e7eb"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="pressure"
              name="Pressure"
              stroke="#aa9c60"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}