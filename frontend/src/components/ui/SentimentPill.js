import {
  SENTIMENT_BG_CLASS,
  SENTIMENT_LABEL,
  SENTIMENT_TEXT_CLASS,
} from "@/lib/sentiment";

/**
 * Sentiment badge — a coloured dot plus label.
 *
 * Class names come from the lookup maps in lib/sentiment rather than string
 * interpolation: Tailwind v4 scans source as plain text, so `text-${x}` would
 * never be generated.
 */
export function SentimentPill({ sentiment, score, compact = false }) {
  const dotClass = SENTIMENT_BG_CLASS[sentiment] ?? "bg-neutral";
  const textClass = SENTIMENT_TEXT_CLASS[sentiment] ?? "text-neutral";

  if (compact) {
    return (
      <span
        className={`inline-block size-2 shrink-0 rounded-pill ${dotClass}`}
        title={SENTIMENT_LABEL[sentiment]}
      >
        <span className="sr-only">{SENTIMENT_LABEL[sentiment]}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-line px-2.5 py-1">
      <span className={`size-1.5 rounded-pill ${dotClass}`} aria-hidden="true" />
      <span className={`text-xs font-medium ${textClass}`}>
        {SENTIMENT_LABEL[sentiment]}
      </span>
      {typeof score === "number" ? (
        <span className="font-mono text-xs text-fg-muted">{score.toFixed(2)}</span>
      ) : null}
    </span>
  );
}
