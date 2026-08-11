import { NextResponse } from "next/server";

/**
 * Server-side proxy for the Unsplash random-photo endpoint.
 *
 * DESIGN.md sketches this as a direct browser fetch with
 * NEXT_PUBLIC_UNSPLASH_ACCESS_KEY, but NEXT_PUBLIC_* is inlined into the
 * client bundle — that publishes the key to anyone who opens devtools. The
 * route keeps it server-only and returns just the URL and attribution.
 *
 * Also required by Unsplash's API terms: attribution to the photographer, and
 * a download-tracking ping. Both are handled here.
 */

const UNSPLASH_API = "https://api.unsplash.com/photos/random";
const UTM = "?utm_source=internet_opinions&utm_medium=referral";

const EMPTY = { url: null, alt: null, credit: null };

// Unsplash's demo tier allows 50 requests/hour, so repeat searches for the
// same brand are served from memory. Bounded to keep a long-running dev server
// from growing without limit.
const CACHE_MAX = 40;
const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();

function readCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  // Refresh insertion order so this stays the most-recently-used entry.
  cache.delete(key);
  cache.set(key, hit);
  return hit.value;
}

function writeCache(key, value) {
  if (cache.size >= CACHE_MAX) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { value, at: Date.now() });
}

export async function GET(request) {
  const brand = request.nextUrl.searchParams.get("brand")?.trim();
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!brand) {
    return NextResponse.json(EMPTY);
  }

  // No key configured is a valid setup — the app degrades to a flat backdrop.
  if (!accessKey) {
    return NextResponse.json(EMPTY);
  }

  const cacheKey = brand.toLowerCase();
  const cached = readCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const url = new URL(UNSPLASH_API);
    url.searchParams.set("query", brand);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      // Our own LRU handles reuse; Next's fetch cache would also key on the
      // random endpoint and pin one photo forever.
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(EMPTY);
    }

    const photo = await res.json();

    // `regular` (~1080px wide) rather than `full` (~4000px): it sits behind a
    // scrim at partial opacity, so full costs megabytes for no visible gain.
    const payload = {
      url: photo?.urls?.regular ?? null,
      alt: photo?.alt_description ?? null,
      credit: photo?.user
        ? {
            name: photo.user.name ?? "Unknown",
            link: `${photo.user.links?.html ?? "https://unsplash.com"}${UTM}`,
            unsplashLink: `https://unsplash.com${UTM}`,
          }
        : null,
    };

    if (!payload.url) {
      return NextResponse.json(EMPTY);
    }

    // Required by the API guidelines whenever a photo is displayed. Fire and
    // forget — the response must not wait on it.
    if (photo?.links?.download_location) {
      fetch(photo.links.download_location, {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }).catch(() => {});
    }

    writeCache(cacheKey, payload);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(EMPTY);
  }
}
