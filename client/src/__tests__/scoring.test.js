import { describe, it, expect } from 'vitest';
import { scoreFromDelta } from '../utils/scoring';

describe('scoreFromDelta', () => {
  it('returns 10.0 for delta 0', () => {
    expect(scoreFromDelta(0)).toBe(10);
  });

  it('returns 0 for delta >= 100', () => {
    expect(scoreFromDelta(100)).toBe(0);
    expect(scoreFromDelta(200)).toBe(0);
  });

  it('returns a value between 0 and 10 for intermediate deltas', () => {
    [1, 2.3, 5, 15, 50].forEach((delta) => {
      const s = scoreFromDelta(delta);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(10);
    });
  });

  it('decreases monotonically with increasing delta', () => {
    const prev = scoreFromDelta(1);
    [2, 3, 5, 10, 20, 50].forEach((delta) => {
      const s = scoreFromDelta(delta);
      expect(s).toBeLessThanOrEqual(prev);
    });
  });

  it('is rounded to 1 decimal place', () => {
    const s = scoreFromDelta(2.345);
    expect(s.toString()).toMatch(/^\d(\.\d)?$/);
  });

  it('applies hue penalty when hueDistance > 0', () => {
    const withoutHue = scoreFromDelta(30, 0);
    const withHue = scoreFromDelta(30, 1);
    expect(withHue).toBeLessThan(withoutHue);
    expect(withoutHue).toBe(7);
    expect(withHue).toBe(4);
  });

  it('applies proportional penalty for partial hue error', () => {
    const halfHue = scoreFromDelta(30, 0.5);
    expect(halfHue).toBe(5.5);
  });

  it('caps at 0 even with large hue penalty', () => {
    expect(scoreFromDelta(100, 1)).toBe(0);
    expect(scoreFromDelta(0, 1)).toBe(7);
  });
});
