import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString();
}

export default function Chart({ data }) {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
          <XAxis
            dataKey="created_at"
            tickFormatter={formatTime}
            stroke="#94a3b8"
          />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "none" }}
            labelFormatter={(label) =>
              new Date(label).toLocaleString()
            }
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="co"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}