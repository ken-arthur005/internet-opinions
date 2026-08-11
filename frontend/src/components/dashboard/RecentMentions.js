import { Card } from "@/components/ui/Card";
import { MentionRow } from "./MentionRow";

const RECENT_COUNT = 5;

/**
 * Right-rail companion to the main feed. DESIGN.md's layout shows a feed in
 * both columns; rather than render the same list twice, this one is scoped to
 * the newest few and stripped down to a scannable list.
 */
export function RecentMentions({ mentions }) {
  const recent = mentions.slice(0, RECENT_COUNT);

  return (
    <Card className="dashboard-card flex flex-col overflow-hidden">
      <h2 className="px-5 pt-5 pb-4 font-display text-lg font-medium text-fg">
        Recent mentions
      </h2>

      <ul className="divide-y divide-line border-t border-line">
        {recent.map((mention) => (
          <MentionRow key={mention.id} mention={mention} compact />
        ))}
      </ul>
    </Card>
  );
}
