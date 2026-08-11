"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

const TITLE = "Internet Opinions";
const TAGLINE = "Discover what the internet thinks";
const SEEN_KEY = "io-intro-seen";

gsap.registerPlugin(TextPlugin);

/** Plays once per tab. Returning to the hero via "Search again" shows the
 *  finished title rather than replaying the whole sequence. */
function introAlreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage unavailable — the intro just replays, which is harmless.
  }
}

export function HeroWordmark() {
  const scope = useRef(null);
  const [typing, setTyping] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // The markup ships with the real text so SSR and view-source are correct;
      // useGSAP is a layout effect, so this clears it before the first paint.
      if (reduced || introAlreadySeen()) {
        gsap.set(".hero-title-text", { text: TITLE });
        gsap.set(".hero-tagline", { opacity: 1, y: 0 });
        return;
      }

      setTyping(true);
      markIntroSeen();

      const tl = gsap.timeline();

      tl.set(".hero-title-text", { text: "" })
        .set(".hero-tagline", { opacity: 0, y: 8 })
        .to(".hero-title-text", {
          text: TITLE,
          duration: 1.2,
          ease: "none",
        })
        .to(
          ".hero-tagline",
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "+=0.15",
        )
        .call(() => setTyping(false));

      return () => tl.kill();
    },
    { scope },
  );

  return (
    <div ref={scope} className="flex flex-col items-center gap-4 text-center">
      {/* aria-label carries the finished title so screen readers announce it
          once, rather than reading each partial string as it types. */}
      <h1
        aria-label={TITLE}
        className="relative font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl lg:text-4xl"
      >
        {/* Invisible sizing copy: reserves the final width and height so the
            centred line can't reflow or re-wrap as characters land. */}
        <span aria-hidden="true" className="invisible">
          {TITLE}
        </span>

        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
        >
          <span className="hero-title-text">{TITLE}</span>
          {typing ? <span className="type-caret" /> : null}
        </span>
      </h1>

      <p className="hero-tagline text-lg text-fg-secondary">{TAGLINE}</p>
    </div>
  );
}
