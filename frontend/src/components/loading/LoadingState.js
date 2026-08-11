"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { LoadingSteps } from "./LoadingSteps";

/**
 * Loading screen. Sits above the backdrop, which is already fading the brand
 * image in behind it.
 *
 * The collect call is synchronous on the backend and scores up to 50 articles
 * through a large model, so this can hold for 30s+ — the pulse and the live
 * step indicator are what keep it from reading as a hang.
 */
export function LoadingState({ brand, step }) {
  const scope = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(".loading-dot", {
          scale: 1.4,
          opacity: 0.4,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        // An infinite repeat must be killed explicitly or it outlives unmount.
        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      className="loading-screen relative z-10 flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16"
    >
      <h2 className="font-display text-xl font-semibold text-fg-secondary">
        Internet Opinions
      </h2>

      <div className="flex items-center gap-4">
        <span className="loading-dot size-3 rounded-pill bg-accent" aria-hidden="true" />
        <p aria-live="polite" className="text-xl text-fg">
          Analyzing {brand}...
        </p>
      </div>

      <LoadingSteps step={step} />
    </section>
  );
}
