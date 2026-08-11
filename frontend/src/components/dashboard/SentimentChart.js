"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/Card";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  NEGATIVE,
  NEUTRAL,
  POSITIVE,
  SENTIMENT_BG_CLASS,
  SENTIMENT_LABEL,
  SENTIMENT_VAR,
} from "@/lib/sentiment";
import { ChartLegend } from "./ChartLegend";
import { ChartTooltip } from "./ChartTooltip";

// Module-level so the array identity is stable across renders.
const CHART_VARS = [
  SENTIMENT_VAR[POSITIVE],
  SENTIMENT_VAR[NEGATIVE],
  SENTIMENT_VAR[NEUTRAL],
];

const CHART_HEIGHT = 200;

export function SentimentChart({ counts }) {
  const colors = useThemeColors(CHART_VARS);
  const ready = Boolean(colors[SENTIMENT_VAR[POSITIVE]]);

  const items = [
    {
      name: SENTIMENT_LABEL[POSITIVE],
      value: counts.positive,
      fill: colors[SENTIMENT_VAR[POSITIVE]],
      dotClass: SENTIMENT_BG_CLASS[POSITIVE],
    },
    {
      name: SENTIMENT_LABEL[NEGATIVE],
      value: counts.negative,
      fill: colors[SENTIMENT_VAR[NEGATIVE]],
      dotClass: SENTIMENT_BG_CLASS[NEGATIVE],
    },
    {
      name: SENTIMENT_LABEL[NEUTRAL],
      value: counts.neutral,
      fill: colors[SENTIMENT_VAR[NEUTRAL]],
      dotClass: SENTIMENT_BG_CLASS[NEUTRAL],
    },
  ];

  const slices = items.filter((item) => item.value > 0);

  return (
    <Card className="dashboard-card flex flex-col gap-5 px-6 py-5">
      <h2 className="font-display text-lg font-medium text-fg">Breakdown</h2>

      {/* Fixed height on the wrapper: ResponsiveContainer measures its parent,
          and a parent with no resolved height renders the chart at zero.
          The placeholder matches exactly so the pre-mount pass and the mounted
          chart occupy identical space. */}
      <div className="h-[200px] w-full">
        {ready ? (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
              >
                {slices.map((item) => (
                  <Cell key={item.name} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip cursor={false} content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : null}
      </div>

      <ChartLegend items={items} total={counts.total} />
    </Card>
  );
}
