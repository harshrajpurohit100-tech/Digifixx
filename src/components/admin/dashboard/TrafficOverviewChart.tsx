"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrafficOverviewChartProps = {
  data: {
    date: string;
    visits: number;
    conversions: number;
  }[];
};

export function TrafficOverviewChart({ data }: TrafficOverviewChartProps) {
  const hasData = data.some((item) => item.visits > 0 || item.conversions > 0);

  if (!hasData) {
    return (
      <div className="flex h-[292px] items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center">
        <div>
          <p className="text-sm font-bold text-[#0F172A]">
            No traffic data yet
          </p>
          <p className="mt-2 text-sm text-[#64748B]">
            Open a public landing page to start collecting visits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[292px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            }}
            labelStyle={{ color: "#0F172A", fontWeight: 700 }}
          />
          <Line
            type="monotone"
            dataKey="visits"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="#16A34A"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
