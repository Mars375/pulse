"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StackedAreaChartProps {
  title: string;
  data: { month: string; starter: number; pro: number; business: number }[];
  height?: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface-2/80 p-3 backdrop-blur-sm">
      <p className="mb-1.5 text-xs text-text-secondary">{label}</p>
      {payload.reverse().map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-text-secondary capitalize">{entry.name}</span>
          </div>
          <span className="font-mono text-xs tabular-nums text-text-primary">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StackedAreaChart({ title, data, height = 300 }: StackedAreaChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="starterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="proGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="businessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-default)" }} />
            <Area
              type="monotone"
              dataKey="starter"
              stackId="1"
              stroke="var(--chart-3)"
              strokeWidth={1.5}
              fill="url(#starterGradient)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="pro"
              stackId="1"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill="url(#proGradient)"
              animationDuration={1000}
            />
            <Area
              type="monotone"
              dataKey="business"
              stackId="1"
              stroke="var(--chart-2)"
              strokeWidth={1.5}
              fill="url(#businessGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
