const QUADRANTS = [
  { name: 'reds', hMin: 0, hMax: 60 },
  { name: 'greens', hMin: 90, hMax: 180 },
  { name: 'blues', hMin: 180, hMax: 270 },
  { name: 'purples', hMin: 270, hMax: 360 },
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hslKey(c) {
  return `${c.h},${c.s},${c.l}`;
}

export function generateTargets(difficulty, count = 5) {
  const targets = [];
  const used = new Set();

  const ranges = [];
  if (difficulty === 'easy') {
    const quadrant = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)];
    ranges.push({ hMin: quadrant.hMin, hMax: quadrant.hMax, sMin: 50, sMax: 75, lMin: 40, lMax: 60 });
  } else if (difficulty === 'medium') {
    ranges.push({ hMin: 0, hMax: 360, sMin: 30, sMax: 85, lMin: 25, lMax: 75 });
  } else {
    ranges.push({ hMin: 0, hMax: 360, sMin: 5, sMax: 100, lMin: 5, lMax: 95 });
  }

  while (targets.length < count) {
    const r = ranges[0];
    const c = { h: rand(r.hMin, r.hMax), s: rand(r.sMin, r.sMax), l: rand(r.lMin, r.lMax) };
    const key = hslKey(c);
    if (!used.has(key)) {
      used.add(key);
      targets.push(c);
    }
  }

  return targets;
}

export function randomHsl() {
  return { h: rand(0, 360), s: rand(10, 90), l: rand(10, 90) };
}
