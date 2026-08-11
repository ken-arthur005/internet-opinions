"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useSearch } from "@/hooks/useSearch";
import { SearchHero } from "@/components/hero/SearchHero";
import { LoadingState } from "@/components/loading/LoadingState";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BrandBackdrop } from "@/components/dashboard/BrandBackdrop";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";

/**
 * Single-page shell and animation orchestrator.
 *
 * Two state variables, deliberately:
 *
 *   status  — where the data is (from useSearch)
 *   visual  — what is on screen
 *
 * They are separate because React unmounts synchronously. If the dashboard
 * rendered the moment status became "success", the loading screen would vanish
 * before it could fade — so exit animations run to completion and only then
 * advance `visual`.
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Home() {
  const root = useRef(null);
  const [visual, setVisual] = useState("hero");
  const { status, brand, step, data, background, error, search, reset } = useSearch();

  /* Entrances. Keyed on `visual`, so the elements being animated are
     guaranteed to be in the DOM: useGSAP is a layout effect, and React commits
     the whole subtree before any layout effect runs.

     fromTo throughout, never from — with .from(), React 19 StrictMode's double
     invoke (and revertOnUpdate) leaves elements reverted to the *from* state,
     which strands cards at opacity 0. With fromTo the resting state is the CSS
     state, so a revert is a no-op. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-content, .loading-screen, .dashboard-card", {
          opacity: 1,
          y: 0,
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();

        if (visual === "hero") {
          tl.fromTo(
            ".hero-content",
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          );
        }

        if (visual === "loading") {
          tl.fromTo(
            ".loading-screen",
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        }

        if (visual === "dashboard") {
          tl.fromTo(
            ".dashboard-card",
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power3.out",
              // GSAP's inline transform would otherwise sit on elements that
              // also carry backdrop-filter.
              clearProps: "transform",
            },
          );
        }

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [visual], revertOnUpdate: true },
  );

  /** Plays an exit timeline and resolves when it's done. */
  const playExit = useCallback((selector, vars) => {
    if (prefersReducedMotion()) return Promise.resolve();

    const targets = root.current?.querySelectorAll(selector);
    if (!targets?.length) return Promise.resolve();

    return new Promise((resolve) => {
      gsap.to(targets, { ...vars, onComplete: resolve });
    });
  }, []);

  const handleSearch = useCallback(
    (nextBrand) => {
      // Start the request immediately — the exit animation is 0.4s and collect
      // takes seconds, so there's no reason to serialise them.
      search(nextBrand);
      playExit(".hero-content", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
      }).then(() => setVisual("loading"));
    },
    [search, playExit],
  );

  const handleBack = useCallback(async () => {
    await playExit(".dashboard-card", {
      opacity: 0,
      y: -20,
      stagger: 0.04,
      duration: 0.3,
      ease: "power2.in",
    });
    reset();
    setVisual("hero");
  }, [playExit, reset]);

  /* Data has resolved — fade the loading screen out, then swap. Gated on
     visual === "loading" so a backend that answers faster than the hero exit
     can't skip a step. */
  useEffect(() => {
    if (visual !== "loading") return;
    if (status !== "success" && status !== "error" && status !== "empty") return;

    let cancelled = false;
    playExit(".loading-screen", { opacity: 0, duration: 0.3 }).then(() => {
      if (cancelled) return;
      setVisual(status === "success" ? "dashboard" : "hero");
    });

    return () => {
      cancelled = true;
    };
  }, [status, visual, playExit]);

  /* The theme image owns the hero and loading screens. On the dashboard the
     Unsplash brand photo takes over — but only if there actually is one, so a
     missing key degrades to themed artwork rather than flat colour. */
  const showThemeBackdrop = !(visual === "dashboard" && background?.url);

  return (
    <main ref={root} className="relative min-h-dvh">
      {showThemeBackdrop ? <ThemeBackdrop /> : null}

      {visual !== "hero" ? <BrandBackdrop background={background} /> : null}

      {visual === "hero" ? (
        <SearchHero onSearch={handleSearch} error={error} initialValue={brand} />
      ) : null}

      {visual === "loading" ? <LoadingState brand={brand} step={step} /> : null}

      {visual === "dashboard" && data ? (
        <Dashboard
          brand={data.brand}
          counts={data.counts}
          score={data.score}
          mentions={data.mentions}
          background={background}
          onBack={handleBack}
        />
      ) : null}
    </main>
  );
}
