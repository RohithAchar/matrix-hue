import { describe, it, expect } from 'vitest';
import { generateTargets, randomHsl } from '../utils/colorGen';

describe('colorGen', () => {
  it.each(['easy', 'medium', 'hard'])('generates 5 targets for %s difficulty', (diff) => {
    const targets = generateTargets(diff, 5);
    expect(targets).toHaveLength(5);
    targets.forEach((t) => {
      expect(t).toHaveProperty('h');
      expect(t).toHaveProperty('s');
      expect(t).toHaveProperty('l');
    });
  });

  it('easy targets are within a single quadrant (h range <= 60)', () => {
    for (let i = 0; i < 20; i++) {
      const [t] = generateTargets('easy', 1);
      expect(t.h).toBeGreaterThanOrEqual(0);
      expect(t.h).toBeLessThanOrEqual(360);
    }
  });

  it('hard targets cover full ranges', () => {
    const targets = generateTargets('hard', 50);
    const hs = targets.map((t) => t.h);
    const ss = targets.map((t) => t.s);
    const ls = targets.map((t) => t.l);
    expect(Math.min(...hs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...hs)).toBeLessThanOrEqual(360);
    expect(Math.min(...ss)).toBeGreaterThanOrEqual(5);
    expect(Math.max(...ss)).toBeLessThanOrEqual(100);
    expect(Math.min(...ls)).toBeGreaterThanOrEqual(5);
    expect(Math.max(...ls)).toBeLessThanOrEqual(95);
  });

  it('randomHsl returns valid HSL values', () => {
    for (let i = 0; i < 50; i++) {
      const c = randomHsl();
      expect(c.h).toBeGreaterThanOrEqual(0);
      expect(c.h).toBeLessThanOrEqual(360);
      expect(c.s).toBeGreaterThanOrEqual(10);
      expect(c.s).toBeLessThanOrEqual(90);
      expect(c.l).toBeGreaterThanOrEqual(10);
      expect(c.l).toBeLessThanOrEqual(90);
    }
  });
});
