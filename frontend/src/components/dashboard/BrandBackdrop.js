"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Full-bleed brand image behind the dashboard.
 *
 * Two deliberate choices:
 *
 * - z-0, not DESIGN.md's z-index:-1. A negative index would put this behind
 *   the root background, which paints over it and makes the image invisible.
 *   Content sits at z-10 instead.
 *
 * - The scrim is a vertical gradient (.brand-scrim) rather than a flat
 *   var(--overlay) fill, so the photo stays legible in the top band and
 *   resolves to solid base colour by the card grid. See globals.css.
 *
 * The fade-in lives here rather than in the page orchestrator so that phase
 * changes can't revert it mid-flight.
 */
export function BrandBackdrop({ background }) {
  const ref = useRef(null);
  const url = background?.url ?? null;

  useGSAP(
    () => {
      if (!url || !ref.current) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(ref.current, { opacity: 1 });
        return;
      }

      const tween = gsap.to(ref.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
      });
      return () => tween.kill();
    },
    { dependencies: [url] },
  );

  if (!url) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="dashboard-bg pointer-events-none fixed inset-0 z-0 opacity-0"
    >
      <Image
        src={url}
        alt=""
        fill
        sizes="100vw"
        priority={false}
        // Unsplash's terms require hotlinking their CDN rather than re-serving
        // the bytes from our own domain, which is what the optimizer would do.
        unoptimized
        className="object-cover"
      />
      <div className="brand-scrim absolute inset-0" />
    </div>
  );
}
