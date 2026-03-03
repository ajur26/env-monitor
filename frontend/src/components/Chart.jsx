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

function getColor(dataKey) {
  if (dataKey === "temperature") return "#38bdf8";
  if (dataKey === "humidity") return "#22c55e";
  if (dataKey === "co") return "#ef4444";
  return "#94a3b8";
}

export default function Chart({ data, dataKey, title }) {
  const color = getColor(dataKey);

  return (
    <div
      style={{
        width: "100%",
        height: 250,
        background: "#1e293b",
        padding: 20,
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
      }}
    >
      {title && (
        <h3 style={{ margin: "0 0 16px 0", color: "#cbd5e1" }}>
          {title}
        </h3>
      )}

      <ResponsiveContainer width="100%" height="85%">
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
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}