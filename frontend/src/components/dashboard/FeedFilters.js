const FILTERS = [
  { id: "all", label: "All" },
  { id: "POSITIVE", label: "Positive" },
  { id: "NEGATIVE", label: "Negative" },
  { id: "NEUTRAL", label: "Neutral" },
];

export function FeedFilters({ active, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const count =
          filter.id === "all" ? counts.total : counts[filter.id.toLowerCase()];
        const activeFilter = active === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            aria-pressed={activeFilter}
            className={`rounded-pill border px-3 py-1.5 text-sm transition-colors duration-150 ${
              activeFilter
                ? "border-accent bg-accent-dim text-fg"
                : "border-line text-fg-secondary hover:border-line-accent hover:text-fg"
            }`}
          >
            {filter.label}
            <span className="ml-1.5 font-mono text-xs text-fg-muted">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
