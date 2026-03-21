"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CohortHeatmapProps {
  title: string;
  data: { cohort: string; months: number[] }[];
}

const columnHeaders = Array.from({ length: 12 }, (_, i) => `M${i}`);

export function CohortHeatmap({ title, data }: CohortHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    cohort: string;
    month: string;
    retention: number;
    x: number;
    y: number;
  } | null>(null);

  const totalColumns = columnHeaders.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `120px repeat(${totalColumns}, minmax(40px, 1fr))`,
            }}
          >
            {/* Column headers */}
            <div /> {/* Empty corner cell */}
            {columnHeaders.map((header) => (
              <div
                key={header}
                className="flex items-center justify-center py-2 font-mono text-xs text-text-tertiary"
              >
                {header}
              </div>
            ))}

            {/* Data rows */}
            {data.map((row, rowIndex) => (
              <Fragment key={row.cohort}>
                {/* Row header */}
                <div
                  className="flex items-center py-1.5 pr-3 font-mono text-xs text-text-secondary"
                >
                  {row.cohort}
                </div>

                {/* Cells */}
                {row.months.map((retention, colIndex) => (
                  <motion.div
                    key={`${row.cohort}-${colIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: rowIndex * 0.05 + colIndex * 0.02,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative flex cursor-default items-center justify-center rounded py-1.5"
                    style={{
                      backgroundColor:
                        retention > 0
                          ? `rgba(99, 102, 241, ${retention / 100})`
                          : "var(--bg-surface-2)",
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        cohort: row.cohort,
                        month: columnHeaders[colIndex],
                        retention,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className="font-mono text-xs tabular-nums text-text-primary">
                      {retention > 0 ? `${retention}%` : ""}
                    </span>
                  </motion.div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-border-default bg-bg-surface-2/90 px-3 py-2 backdrop-blur-sm"
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
            }}
          >
            <p className="text-xs text-text-secondary">
              {tooltip.cohort} &middot; {tooltip.month}
            </p>
            <p className="font-mono text-sm font-medium tabular-nums text-text-primary">
              {tooltip.retention}% retained
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
