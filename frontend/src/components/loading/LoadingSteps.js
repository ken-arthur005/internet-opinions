import { STEPS } from "@/hooks/useSearch";

/**
 * Step indicator for the collect pipeline. Steps advance on real call
 * resolution, not a timer — collect can run well past 30s and a fake
 * progress bar would finish long before the data does.
 */
export function LoadingSteps({ step }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      {STEPS.map((label, index) => {
        const done = index < step;
        const active = index === step;

        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`text-sm transition-colors duration-300 ${
                active ? "text-fg" : done ? "text-fg-secondary" : "text-fg-muted"
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span className="text-fg-muted" aria-hidden="true">
                ·
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
