import { describe, it, expect } from 'vitest';
import { cieDe2000 } from '../utils/cieDe2000';

describe('cieDe2000', () => {
  it('returns 0 for identical colors', () => {
    const delta = cieDe2000(120, 50, 50, 120, 50, 50);
    expect(delta).toBeCloseTo(0, 5);
  });

  it('returns a positive number for different colors', () => {
    const delta = cieDe2000(0, 100, 50, 240, 100, 50);
    expect(delta).toBeGreaterThan(0);
  });

  it('is symmetric', () => {
    const d1 = cieDe2000(10, 30, 40, 200, 70, 80);
    const d2 = cieDe2000(200, 70, 80, 10, 30, 40);
    expect(d1).toBeCloseTo(d2, 10);
  });

  it('handles grayscale (s=0)', () => {
    const delta = cieDe2000(0, 0, 50, 120, 0, 50);
    expect(delta).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(delta)).toBe(true);
  });

  it('handles edge values (h=0, s=100, l=100)', () => {
    const delta = cieDe2000(0, 100, 100, 360, 100, 0);
    expect(Number.isFinite(delta)).toBe(true);
  });

  it('produces reasonable magnitudes (< 100)', () => {
    for (let i = 0; i < 10; i++) {
      const h1 = Math.random() * 360;
      const s1 = Math.random() * 100;
      const l1 = Math.random() * 100;
      const h2 = Math.random() * 360;
      const s2 = Math.random() * 100;
      const l2 = Math.random() * 100;
      const d = cieDe2000(h1, s1, l1, h2, s2, l2);
      expect(d).toBeLessThan(100);
    }
  });
});
