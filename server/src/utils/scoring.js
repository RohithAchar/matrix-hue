function scoreFromDelta(delta) {
  const score = 10 * (1 - delta / 100);
  return Math.max(0, Math.round(score * 10) / 10);
}

module.exports = { scoreFromDelta };
