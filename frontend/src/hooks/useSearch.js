"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ApiError,
  TimeoutError,
  COLLECT_TIMEOUT_MS,
  collectBrand,
  fetchMentions,
  fetchSentimentSummary,
} from "@/lib/api";
import { computeCounts, computeSignedScore } from "@/lib/sentiment";
import { byNewest } from "@/lib/format";
import { getBrandBackground, preloadImage } from "@/lib/unsplash";

/**
 * Owns the search lifecycle: the three sequential backend calls, the parallel
 * background fetch, and the error/empty taxonomy.
 *
 * Status is deliberately separate from the page's visual phase — the page
 * holds an exit animation open after status has already resolved.
 *
 * @typedef {"idle"|"loading"|"success"|"error"|"empty"} SearchStatus
 */

export const STEPS = ["Collecting articles", "Running sentiment", "Building dashboard"];

export function useSearch() {
  const [status, setStatus] = useState("idle");
  const [brand, setBrand] = useState("");
  const [step, setStep] = useState(0);
  const [data, setData] = useState(null);
  const [background, setBackground] = useState(null);
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);

  // Abort any in-flight request if the component unmounts mid-search.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const search = useCallback(async (rawBrand) => {
    const trimmed = rawBrand.trim();
    if (!trimmed) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const timeoutId = setTimeout(
      () => controller.abort(new TimeoutError()),
      COLLECT_TIMEOUT_MS,
    );

    setBrand(trimmed);
    setStatus("loading");
    setStep(0);
    setError(null);
    setData(null);
    setBackground(null);

    // Fires alongside collect rather than after it. Collect can run 30s+, so
    // this is free time — and DESIGN.md wants the image fading in *during*
    // loading, not after the dashboard mounts.
    const backgroundPromise = getBrandBackground(trimmed, controller.signal)
      .then(async (bg) => {
        await preloadImage(bg.url);
        return bg;
      })
      .catch(() => ({ url: null, alt: null, credit: null }));

    try {
      // Strictly sequential: collect only returns once Supabase has the rows,
      // so parallelising would read stale or empty data.
      await collectBrand(trimmed, controller.signal);
      setStep(1);

      await fetchSentimentSummary(trimmed, controller.signal);
      setStep(2);

      const mentions = await fetchMentions(trimmed, controller.signal);

      clearTimeout(timeoutId);

      if (mentions.length === 0) {
        // 200 with an empty array is the "no coverage" case, not a failure —
        // the backend never 404s for an unknown brand.
        setError(`No results found for "${trimmed}". Try a different name.`);
        setStatus("empty");
        return;
      }

      const sorted = [...mentions].sort(byNewest);
      const counts = computeCounts(sorted);

      setData({
        brand: trimmed,
        mentions: sorted,
        counts,
        score: computeSignedScore(sorted),
      });

      setBackground(await backgroundPromise);
      setStatus("success");
    } catch (err) {
      clearTimeout(timeoutId);

      // A newer search aborted this one — that search owns the state now.
      if (err?.name === "AbortError") return;

      if (err instanceof TimeoutError || err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Couldn't reach the server. Make sure the backend is running.");
      }
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setStatus("idle");
    setBrand("");
    setStep(0);
    setData(null);
    setBackground(null);
    setError(null);
  }, []);

  /** Clears an error without losing the typed brand, so retry is one keystroke. */
  const dismissError = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, brand, step, data, background, error, search, reset, dismissError };
}
