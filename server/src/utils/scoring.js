function scoreFromDelta(delta, hueDistance = 0) {
  const penalty = hueDistance * 3;
  const score = 10 * (1 - delta / 100) - penalty;
  return Math.max(0, Math.round(score * 10) / 10);
}

module.exports = { scoreFromDelta };
