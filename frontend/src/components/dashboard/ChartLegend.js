import { toPercent } from "@/lib/format";

/**
 * Custom legend below the donut. DESIGN.md rules out legends inside the chart,
 * and building it here means it inherits real theme colours instead of
 * Recharts' resolved SVG fills.
 */
export function ChartLegend({ items, total }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2.5">
          <span
            className={`size-2 shrink-0 rounded-pill ${item.dotClass}`}
            aria-hidden="true"
          />
          <span className="flex-1 text-sm text-fg-secondary">{item.name}</span>
          <span className="font-mono text-sm text-fg">
            {toPercent(item.value, total)}
          </span>
        </li>
      ))}
    </ul>
  );
}
