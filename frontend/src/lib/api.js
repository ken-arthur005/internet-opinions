/**
 * The three Spring Boot calls. Every response is normalized at this boundary
 * so no component ever touches a raw API field — if the backend DTOs change,
 * this file is the only place that changes.
 *
 * Wire contract (verified against MentionController.java / MentionService.java
 * / the ml-service pipeline):
 *   POST /api/collect?brand=            → { status, brand }    synchronous, 5–30s+
 *   GET  /api/sentiment-summary?brand=  → { brand, total, positive, negative,
 *                                           neutral, averageScore }
 *   GET  /api/mentions?brand=           → Mention[] (fields below)
 *
 * Two fields are deliberately ignored:
 *   - summary.neutral is always 0 (the ML model is binary; the backend
 *     computes neutral = total - positive - negative).
 *   - summary.averageScore averages raw model confidence (0.5–1.0 regardless
 *     of label), so a brand being trashed scores ~0.97. Meaningless as a
 *     headline. Both are recomputed from the mentions array in lib/sentiment.js.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const COLLECT_TIMEOUT_MS = 90_000;

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

/** Thrown when the 90s cap elapses — the pipeline is slow, not unreachable. */
export class TimeoutError extends Error {
  constructor() {
    super("That took too long. The analysis may still be running — try again in a moment.");
    this.name = "TimeoutError";
  }
}

/**
 * @typedef {Object} NormalizedMention
 * @property {string} id
 * @property {string} brand
 * @property {string} text        — title + description blob from the collector
 * @property {string} source
 * @property {string} url
 * @property {string} sentimentLabel   — "POSITIVE" | "NEGATIVE" (raw model output)
 * @property {number} sentimentScore   — 0.5–1.0 confidence in the label
 * @property {string|null} createdAt   — ISO-8601 with offset, or null
 */

/**
 * @typedef {Object} NormalizedSummary
 * @property {string} brand
 * @property {number} total
 * @property {number} positive   — recomputed client-side (see sentiment.js)
 * @property {number} negative
 * @property {number} neutral
 * @property {number} averageScore — signed 0..1 score (see sentiment.js)
 */

function parseDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : value;
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {NormalizedMention}
 */
export function normalizeMention(raw) {
  return {
    id: String(raw.id ?? ""),
    brand: String(raw.brand ?? ""),
    text: String(raw.text ?? ""),
    source: String(raw.source ?? "news"),
    url: String(raw.url ?? ""),
    sentimentLabel: String(raw.sentimentLabel ?? "").toUpperCase(),
    sentimentScore: Number(raw.sentimentScore ?? 0),
    createdAt: parseDate(raw.createdAt),
  };
}

/**
 * @param {Record<string, unknown>} raw
 * @returns {NormalizedSummary}
 */
export function normalizeSummary(raw) {
  return {
    brand: String(raw.brand ?? ""),
    total: Number(raw.total ?? 0),
    positive: Number(raw.positive ?? 0),
    negative: Number(raw.negative ?? 0),
    neutral: Number(raw.neutral ?? 0),
    averageScore: Number(raw.averageScore ?? 0),
  };
}

async function apiFetch(path, signal, method = "GET") {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, signal });
  } catch (err) {
    // A timeout abort carries our TimeoutError as its reason — rethrow it so
    // the UI can say "slow" rather than "unreachable". A user-initiated abort
    // (searching again mid-flight) propagates untouched and is swallowed by
    // the caller.
    if (err?.name === "AbortError") {
      if (signal?.reason instanceof TimeoutError) throw signal.reason;
      throw err;
    }
    throw new ApiError("Couldn't reach the server. Make sure the backend is running.");
  }

  if (!res.ok) {
    // A 500 from /collect leaks a raw Python exception string in detail —
    // never surface that to the user.
    throw new ApiError("Couldn't reach the server. Make sure the backend is running.");
  }

  return res;
}

async function json(res) {
  try {
    return await res.json();
  } catch {
    throw new ApiError("Couldn't reach the server. Make sure the backend is running.");
  }
}

/**
 * Synchronous trigger of the full collect + analyze + save pipeline.
 * Returns only when Supabase has the rows, so the follow-up GETs are safe.
 */
export async function collectBrand(brand, signal) {
  // POST, not GET — the controller maps this with @PostMapping, and a GET here
  // returns 405 with no CORS headers, which the browser reports as a confusing
  // "blocked by CORS policy" error rather than a method mismatch.
  const res = await apiFetch(
    `/api/collect?brand=${encodeURIComponent(brand)}`,
    signal,
    "POST",
  );
  const body = await json(res);
  if (body?.status !== "success") {
    throw new ApiError("Couldn't reach the server. Make sure the backend is running.");
  }
}

export async function fetchSentimentSummary(brand, signal) {
  const res = await apiFetch(`/api/sentiment-summary?brand=${encodeURIComponent(brand)}`, signal);
  return normalizeSummary(await json(res));
}

export async function fetchMentions(brand, signal) {
  const res = await apiFetch(`/api/mentions?brand=${encodeURIComponent(brand)}`, signal);
  const raw = await json(res);
  if (!Array.isArray(raw)) {
    throw new ApiError("Couldn't reach the server. Make sure the backend is running.");
  }
  return raw.map(normalizeMention);
}

export { COLLECT_TIMEOUT_MS };
