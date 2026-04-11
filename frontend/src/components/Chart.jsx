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

function formatTime(ts, period) {
  const date = new Date(ts);

  if (period === "24h") {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleTimeString();
}

function formatTooltipValue(value, name) {
  if (value == null) return ["-", name];

  if (name === "Temperature") return [`${value} °C`, name];
  if (name === "Humidity") return [`${value} %`, name];
  if (name === "CO") return [`${value} ppm`, name];
  if (name === "Pressure") return [`${value} hPa`, name];

  return [value, name];
}

export default function Chart({ data, title, period }) {
  const showPressure = period === "24h";

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
              tickFormatter={(value) => formatTime(value, period)}
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              yAxisId="left"
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
            />

            {showPressure && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--text-muted)"
                tick={{ fontSize: 12 }}
              />
            )}

            <Tooltip
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-soft)",
                borderRadius: 10,
                color: "var(--text-main)",
              }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={formatTooltipValue}
            />

            <Legend
              wrapperStyle={{
                color: "var(--text-muted)",
                fontSize: 12,
              }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temperature"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              name="Humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="co"
              name="CO"
              stroke="#e5e7eb"
              strokeWidth={2}
              dot={false}
            />

            {showPressure && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pressure"
                name="Pressure"
                stroke="#aa9c60"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}