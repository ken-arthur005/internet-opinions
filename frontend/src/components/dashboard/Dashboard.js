"use client";

import { DashboardHeader } from "./DashboardHeader";
import { BrandBanner } from "./BrandBanner";
import { SentimentSummary } from "./SentimentSummary";
import { SentimentScoreBar } from "./SentimentScoreBar";
import { SentimentChart } from "./SentimentChart";
import { MentionsFeed } from "./MentionsFeed";
import { RecentMentions } from "./RecentMentions";
import { UnsplashCredit } from "./UnsplashCredit";

/**
 * Results layout. Every card carries .dashboard-card so the page orchestrator
 * can stagger them in — that class is the contract between this tree and the
 * GSAP timeline in app/page.js.
 */
export function Dashboard({ brand, counts, score, mentions, background, onBack }) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
      <DashboardHeader brand={brand} onBack={onBack} />
      <BrandBanner brand={brand} total={counts.total} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8">
          <SentimentSummary counts={counts} />
          <SentimentScoreBar score={score} />
          <MentionsFeed mentions={mentions} counts={counts} />
        </div>

        <aside className="flex flex-col gap-4 lg:col-span-4">
          <SentimentChart counts={counts} />
          <RecentMentions mentions={mentions} />
        </aside>
      </div>

      <div className="pt-8">
        <UnsplashCredit background={background} />
      </div>
    </div>
  );
}
