/**
 * Client-side wrapper around our own /api/background route.
 *
 * The Unsplash access key never reaches the browser — the route handler holds
 * it server-side. This function only ever talks to our origin.
 */

/**
 * @typedef {Object} BrandBackground
 * @property {string|null} url
 * @property {string|null} alt
 * @property {{name: string, link: string, unsplashLink: string}|null} credit
 */

const EMPTY = { url: null, alt: null, credit: null };

/**
 * Never rejects. The background is decorative — a failure here must not take
 * the dashboard down with it.
 *
 * @param {string} brand
 * @param {AbortSignal} [signal]
 * @returns {Promise<BrandBackground>}
 */
export async function getBrandBackground(brand, signal) {
  try {
    const res = await fetch(`/api/background?brand=${encodeURIComponent(brand)}`, { signal });
    if (!res.ok) return EMPTY;
    return await res.json();
  } catch {
    return EMPTY;
  }
}

/**
 * Decodes the image off the main thread so the dashboard reveal doesn't land
 * on a half-painted background. Resolves either way.
 *
 * @param {string|null} url
 */
export function preloadImage(url) {
  if (!url || typeof window === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = url;
  });
}
