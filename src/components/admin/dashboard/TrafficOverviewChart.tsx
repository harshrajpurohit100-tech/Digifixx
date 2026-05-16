"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
      <div className="flex h-[306px] items-center justify-center rounded-[20px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center">
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
    <div className="h-[306px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 14, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="visitsGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient
              id="conversionsGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.14} />
              <stop offset="95%" stopColor="#16A34A" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="#E2E8F0"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
            vertical={false}
          />
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
              borderRadius: 14,
              boxShadow: "0 16px 36px rgba(15,23,42,0.10)",
            }}
            labelStyle={{ color: "#0F172A", fontWeight: 700 }}
          />
          <Area
            type="monotone"
            dataKey="visits"
            stroke="#2563EB"
            strokeWidth={2.8}
            fill="url(#visitsGradient)"
            dot={{ r: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="conversions"
            stroke="#16A34A"
            strokeWidth={2.8}
            fill="url(#conversionsGradient)"
            dot={{ r: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
