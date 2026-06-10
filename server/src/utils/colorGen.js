const QUADRANTS = [
  { hMin: 0, hMax: 50 },
  { hMin: 90, hMax: 170 },
  { hMin: 180, hMax: 260 },
  { hMin: 270, hMax: 360 },
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateTargets(difficulty, count = 5) {
  const targets = [];
  const used = new Set();
  const quads = shuffled(QUADRANTS);

  for (let i = 0; i < count; i++) {
    const q = quads[i % quads.length];
    let c, key;

    if (difficulty === 'easy') {
      do {
        c = { h: rand(q.hMin, q.hMax), s: rand(60, 85), l: rand(40, 60) };
        key = `${c.h},${c.s},${c.l}`;
      } while (used.has(key));
    } else if (difficulty === 'medium') {
      do {
        c = { h: rand(0, 360), s: rand(30, 85), l: rand(25, 75) };
        key = `${c.h},${c.s},${c.l}`;
      } while (used.has(key));
    } else {
      do {
        c = { h: rand(0, 360), s: rand(5, 100), l: rand(5, 95) };
        key = `${c.h},${c.s},${c.l}`;
      } while (used.has(key));
    }

    used.add(key);
    targets.push(c);
  }

  return targets;
}

module.exports = { generateTargets };
