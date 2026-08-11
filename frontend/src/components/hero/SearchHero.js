"use client";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { HeroWordmark } from "./HeroWordmark";
import { BrandSearchForm } from "./BrandSearchForm";

/**
 * The pre-search state: full viewport, centred, over the theme backdrop.
 *
 * The theme switcher lives inside .hero-content so it inherits the GSAP fade
 * on the way out rather than hanging around over the loading screen.
 *
 * Errors surface here rather than on a dedicated screen — the search box is
 * right there, so retrying is one keystroke instead of a navigation.
 */
export function SearchHero({ onSearch, error, initialValue }) {
  return (
    <section className="hero-content noise-layer relative z-10 flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      <HeroWordmark />

      <BrandSearchForm onSubmit={onSearch} initialValue={initialValue} />

      {error ? (
        <p role="alert" className="max-w-[480px] text-center text-sm text-negative">
          {error}
        </p>
      ) : null}
    </section>
  );
}
