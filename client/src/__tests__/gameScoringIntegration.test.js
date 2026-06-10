import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cieDe2000 } from '../utils/cieDe2000';
import { scoreFromDelta } from '../utils/scoring';

describe('game scoring integration', () => {
  it('identical colors yield score 10', () => {
    const delta = cieDe2000(180, 50, 50, 180, 50, 50);
    expect(delta).toBeCloseTo(0, 5);
    expect(scoreFromDelta(delta)).toBe(10);
  });

  it('very different colors yield score 0', () => {
    const delta = cieDe2000(0, 100, 100, 180, 0, 0);
    const score = scoreFromDelta(delta);
    expect(delta).toBeGreaterThan(0);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(10);
  });

  it('nearby colors give a high score', () => {
    const delta = cieDe2000(120, 50, 50, 125, 55, 52);
    const score = scoreFromDelta(delta);
    expect(score).toBeGreaterThan(7);
  });
});
