/** Display formatting. Numbers in the UI are JetBrains Mono per DESIGN.md. */

/** @param {number} value 0..1 @returns {string} e.g. "67%" */
export function toPercent(value, total) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/** @param {number} score 0..1 @returns {string} e.g. "0.78" */
export function formatScore(score) {
  if (!Number.isFinite(score)) return "0.00";
  return score.toFixed(2);
}

const RELATIVE_UNITS = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 604800, divisor: 86400, unit: "day" },
];

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * "3 hours ago". The collector only gathers the last 7 days, so anything
 * beyond a week falls back to an absolute date.
 *
 * @param {string|null} iso
 */
export function formatRelativeTime(iso) {
  if (!iso) return "";
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return "";

  const deltaSeconds = (timestamp - Date.now()) / 1000;
  const absolute = Math.abs(deltaSeconds);

  for (const { limit, divisor, unit } of RELATIVE_UNITS) {
    if (absolute < limit) {
      return relativeFormatter.format(Math.round(deltaSeconds / divisor), unit);
    }
  }

  return new Date(timestamp).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

/** Sorts newest first, tolerating null/unparseable dates by sinking them. */
export function byNewest(a, b) {
  const left = a.createdAt ? Date.parse(a.createdAt) : Number.NEGATIVE_INFINITY;
  const right = b.createdAt ? Date.parse(b.createdAt) : Number.NEGATIVE_INFINITY;
  return right - left;
}
