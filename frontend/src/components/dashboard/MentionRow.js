import { SentimentPill } from "@/components/ui/SentimentPill";
import { formatRelativeTime } from "@/lib/format";
import { deriveSentiment } from "@/lib/sentiment";

/**
 * One mention row. The collector concatenates title + description into a
 * single `text` blob, so the headline is that blob clamped — the title
 * naturally leads the string, and heuristic splitting would break headlines
 * that contain periods ("Apple Inc. announces...").
 */
export function MentionRow({ mention, compact = false }) {
  const sentiment = deriveSentiment(mention);
  const relative = formatRelativeTime(mention.createdAt);

  if (compact) {
    return (
      <li>
        <a
          href={mention.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-card-hover/60"
        >
          <span className="mt-1.5">
            <SentimentPill sentiment={sentiment} compact />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="line-clamp-2 text-sm text-fg-secondary transition-colors duration-150 group-hover:text-fg">
              {mention.text}
            </span>
            <span className="text-xs text-fg-muted">{mention.source}</span>
          </span>
        </a>
      </li>
    );
  }

  return (
    <li>
      <a
        href={mention.url || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2.5 px-5 py-4 transition-colors duration-150 hover:bg-card-hover/60"
      >
        <p className="line-clamp-2 text-sm text-fg transition-colors duration-150 group-hover:text-fg-secondary">
          {mention.text}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <SentimentPill sentiment={sentiment} score={mention.sentimentScore} />
          <span className="text-xs font-medium text-fg-secondary">{mention.source}</span>
          {relative ? <span className="font-mono text-xs text-fg-muted">{relative}</span> : null}
        </div>
      </a>
    </li>
  );
}
