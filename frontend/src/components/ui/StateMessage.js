/**
 * Empty, error and loading copy in one place, so the exact wording DESIGN.md
 * specifies can't drift between components.
 */
export function StateMessage({ title, hint, tone = "muted", action }) {
  const toneClass = tone === "error" ? "text-negative" : "text-fg-secondary";

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className={`text-base ${toneClass}`}>{title}</p>
      {hint ? <p className="text-sm text-fg-muted">{hint}</p> : null}
      {action}
    </div>
  );
}
