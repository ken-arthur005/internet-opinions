import { Card } from "@/components/ui/Card";
import { formatScore } from "@/lib/format";
import { describeScore } from "@/lib/sentiment";

const SEGMENTS = 40;

/**
 * Overall sentiment score.
 *
 * The value is the signed score from lib/sentiment, NOT the backend's
 * averageScore — that field averages raw model confidence and reads ~0.97 even
 * for uniformly hostile coverage. Here 0.5 is genuinely balanced.
 *
 * Rendered as discrete ticks rather than a solid bar, echoing the segmented
 * meters in the reference designs.
 */
export function SentimentScoreBar({ score }) {
  const filled = Math.round(score * SEGMENTS);
  const tone =
    score >= 0.58 ? "bg-positive" : score > 0.42 ? "bg-neutral" : "bg-negative";

  return (
    <Card className="dashboard-card flex flex-col gap-4 px-6 py-5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-fg-secondary">Sentiment score</span>
        <span className="text-xs text-fg-muted">{describeScore(score)}</span>
      </div>

      <div
        className="flex items-end gap-[3px]"
        role="meter"
        aria-valuenow={Number(formatScore(score))}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-label="Overall sentiment score"
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={`h-8 flex-1 rounded-[1px] transition-colors duration-500 ${
              index < filled ? tone : "bg-line"
            }`}
          />
        ))}
      </div>

      <p className="font-mono text-2xl font-medium text-fg">
        {formatScore(score)}
        <span className="text-sm text-fg-muted"> / 1.00</span>
      </p>
    </Card>
  );
}
