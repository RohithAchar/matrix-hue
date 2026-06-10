/*
 * scoring.js — Logarithmic score mapping
 *
 * Maps CIEDE2000 delta to a score out of 10:
 *   score = max(0, 10 * (1 - log(1 + delta) / log(1 + maxDelta)))
 *
 * maxDelta ≈ 100 (cap)
 *
 * Examples:
 *   delta 0   → 10.0 (perfect)
 *   delta 2.3 → ~8.2 (close)
 *   delta 15  → ~5.1 (moderate)
 *   delta 50  → ~2.3 (far off)
 *   delta 100 → 0.0 (max)
 *
 * TODO:
 * - Implement scoreFromDelta(delta) → number (rounded to 1 decimal)
 * - Export for both client and server usage
 */

export function scoreFromDelta(delta) {
  const score = 10 * (1 - delta / 100);
  return Math.max(0, Math.round(score * 10) / 10);
}
