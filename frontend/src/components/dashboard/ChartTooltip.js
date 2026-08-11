/**
 * Custom tooltip.
 *
 * Recharts' built-in tooltip is styled through contentStyle/itemStyle, which
 * are inline style objects — this renders real elements instead so the tooltip
 * picks up theme variables like every other surface.
 */
export function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { name, value } = payload[0];

  return (
    <div className="rounded-field border border-line bg-card px-3 py-2">
      <span className="text-sm text-fg-secondary">{name}</span>{" "}
      <span className="font-mono text-sm text-fg">{value}</span>
    </div>
  );
}
