/*
 * colorGen.js — Client-side HSL color generation
 *
 * Generates random target colors constrained by difficulty
 *
 * Easy:
 *   Hue: one of 4 quadrants per game (reds 0-60, greens 90-180,
 *        blues 180-270, purples 270-360)
 *   Saturation: 50-75%
 *   Lightness: 40-60%
 *
 * Medium:
 *   Hue: 0-360
 *   Saturation: 30-85%
 *   Lightness: 25-75%
 *
 * Hard:
 *   Hue: 0-360
 *   Saturation: 5-100%
 *   Lightness: 5-95%
 *
 * TODO:
 * - generateTargets(difficulty, count) → array of {h,s,l}
 *   For Easy: pick one quadrant, generate all 'count' colors in that quadrant
 *   For Medium/Hard: fully random within constraints
 * - Re-export same logic on server for server-side generation
 */

export function generateTargets(difficulty, count = 5) {
  const targets = [];
  for (let i = 0; i < count; i++) {
    targets.push({ h: 180, s: 50, l: 50 }); // placeholder
  }
  return targets;
}
