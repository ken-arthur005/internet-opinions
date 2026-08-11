/**
 * Sentiment derivation.
 *
 * Two things the backend cannot give us, computed here instead:
 *
 * 1. NEUTRAL. The ML model (siebert/sentiment-roberta-large-english) is a
 *    binary classifier — it only ever emits POSITIVE or NEGATIVE. The backend
 *    computes neutral = total - positive - negative, which is therefore always
 *    exactly 0. We treat a low-confidence prediction as neutral instead: if
 *    the model is only 60% sure an article is positive, "neutral" is a more
 *    honest label than "positive".
 *
 * 2. THE HEADLINE SCORE. The backend's averageScore averages raw confidence,
 *    which sits at 0.5–1.0 regardless of which label won. A brand with
 *    uniformly hostile coverage averages ~0.97 — indistinguishable from a
 *    beloved one. We build a signed score instead, so the number means what a
 *    reader assumes it means.
 */

/**
 * Below this confidence the model is judged undecided. 0.75 sits well above
 * the 0.5 floor (where the binary classifier is a coin flip) while staying
 * under the ~0.9+ the model reports when it is genuinely certain.
 */
export const NEUTRAL_THRESHOLD = 0.75;

export const POSITIVE = "POSITIVE";
export const NEGATIVE = "NEGATIVE";
export const NEUTRAL = "NEUTRAL";

/**
 * The displayed sentiment for a mention, which is not always the raw model
 * label. Returns one of POSITIVE | NEGATIVE | NEUTRAL.
 *
 * @param {{ sentimentLabel: string, sentimentScore: number }} mention
 */
export function deriveSentiment(mention) {
  const score = Number(mention?.sentimentScore);
  if (!Number.isFinite(score) || score < NEUTRAL_THRESHOLD) return NEUTRAL;
  if (mention.sentimentLabel === POSITIVE) return POSITIVE;
  if (mention.sentimentLabel === NEGATIVE) return NEGATIVE;
  return NEUTRAL;
}

/**
 * Counts per derived sentiment. Replaces the backend's summary counts, which
 * are computed from the raw labels and so never report a neutral.
 *
 * @param {Array<object>} mentions
 */
export function computeCounts(mentions) {
  const counts = { positive: 0, negative: 0, neutral: 0, total: mentions.length };

  for (const mention of mentions) {
    const sentiment = deriveSentiment(mention);
    if (sentiment === POSITIVE) counts.positive += 1;
    else if (sentiment === NEGATIVE) counts.negative += 1;
    else counts.neutral += 1;
  }

  return counts;
}

/**
 * A signed sentiment score in 0..1, where 0.5 is perfectly balanced.
 *
 * Each mention contributes +confidence when positive and -confidence when
 * negative; neutrals contribute 0 but still count toward the denominator, so
 * a wall of low-confidence coverage correctly pulls toward the middle. The
 * -1..1 mean is then mapped to 0..1 for display.
 *
 * @param {Array<object>} mentions
 * @returns {number} 0..1
 */
export function computeSignedScore(mentions) {
  if (!mentions.length) return 0.5;

  let sum = 0;
  for (const mention of mentions) {
    const sentiment = deriveSentiment(mention);
    const score = Number(mention.sentimentScore) || 0;
    if (sentiment === POSITIVE) sum += score;
    else if (sentiment === NEGATIVE) sum -= score;
  }

  const mean = sum / mentions.length; // -1..1
  return (mean + 1) / 2; // 0..1
}

/**
 * Short verdict for the score bar. Thresholds are deliberately conservative —
 * with a signed score, 0.5 means genuinely mixed, not mediocre.
 */
export function describeScore(score) {
  if (score >= 0.72) return "Overwhelmingly positive";
  if (score >= 0.58) return "Leaning positive";
  if (score > 0.42) return "Mixed";
  if (score > 0.28) return "Leaning negative";
  return "Overwhelmingly negative";
}

/** Tailwind v4 scans source as plain text, so class names can never be built
 *  by interpolation. These maps are the only safe way to vary colour. */
export const SENTIMENT_TEXT_CLASS = {
  [POSITIVE]: "text-positive",
  [NEGATIVE]: "text-negative",
  [NEUTRAL]: "text-neutral",
};

export const SENTIMENT_BG_CLASS = {
  [POSITIVE]: "bg-positive",
  [NEGATIVE]: "bg-negative",
  [NEUTRAL]: "bg-neutral",
};

export const SENTIMENT_LABEL = {
  [POSITIVE]: "Positive",
  [NEGATIVE]: "Negative",
  [NEUTRAL]: "Neutral",
};

export const SENTIMENT_VAR = {
  [POSITIVE]: "--positive",
  [NEGATIVE]: "--negative",
  [NEUTRAL]: "--neutral",
};
