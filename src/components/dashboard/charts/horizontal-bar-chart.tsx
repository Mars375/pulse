"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HorizontalBarChartProps {
  title: string;
  data: { reason: string; count: number; percentage: number }[];
  height?: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { reason: string; count: number; percentage: number } }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface-2/80 p-3 backdrop-blur-sm">
      <p className="text-xs text-text-secondary">{item.reason}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-sm tabular-nums text-text-primary">
          {item.count.toLocaleString()}
        </span>
        <span className="font-mono text-xs tabular-nums text-text-secondary">
          {item.percentage}%
        </span>
      </div>
    </div>
  );
}

export function HorizontalBarChart({ title, data, height = 240 }: HorizontalBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="reason"
              axisLine={false}
              tickLine={false}
              width={120}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99, 102, 241, 0.05)" }} />
            <Bar
              dataKey="count"
              fill="var(--chart-1)"
              radius={[0, 4, 4, 0]}
              barSize={20}
              animationDuration={800}
            >
              <LabelList
                dataKey="percentage"
                position="right"
                fill="var(--text-secondary)"
                fontSize={12}
                style={{ fontFamily: "var(--font-mono)" }}
                formatter={((value: string | number | boolean | null | undefined) => `${value}%`) as import("recharts/types/component/Label").LabelFormatter}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
