import { Card } from "@/components/ui/Card";
import { toPercent } from "@/lib/format";
import { SENTIMENT_BG_CLASS, SENTIMENT_TEXT_CLASS } from "@/lib/sentiment";

/**
 * One big-number card. The percentage is the headline; the raw count sits
 * underneath, since a percentage over 8 articles means something different
 * than over 50.
 */
export function SentimentStatCard({ sentiment, label, count, total }) {
  return (
    <Card className="dashboard-card flex flex-col gap-3 px-6 py-5">
      <div className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-pill ${SENTIMENT_BG_CLASS[sentiment]}`}
          aria-hidden="true"
        />
        <span className="text-sm text-fg-secondary">{label}</span>
      </div>

      <p className={`font-mono text-2xl font-medium ${SENTIMENT_TEXT_CLASS[sentiment]}`}>
        {toPercent(count, total)}
      </p>

      <p className="text-xs text-fg-muted">
        <span className="font-mono">{count}</span> of{" "}
        <span className="font-mono">{total}</span>
      </p>
    </Card>
  );
}
