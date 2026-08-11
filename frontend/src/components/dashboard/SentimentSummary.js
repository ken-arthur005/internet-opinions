import { SentimentStatCard } from "./SentimentStatCard";
import { NEGATIVE, NEUTRAL, POSITIVE } from "@/lib/sentiment";

export function SentimentSummary({ counts }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SentimentStatCard
        sentiment={POSITIVE}
        label="Positive"
        count={counts.positive}
        total={counts.total}
      />
      <SentimentStatCard
        sentiment={NEGATIVE}
        label="Negative"
        count={counts.negative}
        total={counts.total}
      />
      <SentimentStatCard
        sentiment={NEUTRAL}
        label="Neutral"
        count={counts.neutral}
        total={counts.total}
      />
    </div>
  );
}
