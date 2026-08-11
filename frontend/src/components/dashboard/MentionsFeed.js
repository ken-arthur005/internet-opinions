"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { StateMessage } from "@/components/ui/StateMessage";
import { deriveSentiment } from "@/lib/sentiment";
import { FeedFilters } from "./FeedFilters";
import { MentionRow } from "./MentionRow";

/**
 * The main mentions feed.
 *
 * The blur sits on this container rather than on each row — one composite
 * layer instead of one per article, which matters over a fixed backdrop.
 */
export function MentionsFeed({ mentions, counts }) {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    if (filter === "all") return mentions;
    return mentions.filter((mention) => deriveSentiment(mention) === filter);
  }, [mentions, filter]);

  return (
    <Card className="dashboard-card flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 px-5 pt-5 pb-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-medium text-fg">Mentions</h2>
          <span className="font-mono text-xs text-fg-muted">{visible.length}</span>
        </div>
        <FeedFilters active={filter} onChange={setFilter} counts={counts} />
      </div>

      {visible.length === 0 ? (
        <StateMessage
          title="No mentions in this category."
          hint="Try a different filter."
        />
      ) : (
        <ul className="thin-scrollbar max-h-[640px] divide-y divide-line overflow-y-auto border-t border-line">
          {visible.map((mention) => (
            <MentionRow key={mention.id} mention={mention} />
          ))}
        </ul>
      )}
    </Card>
  );
}
