const GlobalSession = require('../models/GlobalSession');
const Player = require('../models/Player');
const { generateTargets } = require('../utils/colorGen');
const { cieDe2000 } = require('../utils/cieDe2000');
const { scoreFromDelta } = require('../utils/scoring');

function todayUTC() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

async function initGlobal(req, res) {
  const { difficulty, sessionToken } = req.query;

  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
  }

  if (!sessionToken) {
    return res.status(400).json({ error: 'sessionToken is required' });
  }

  const player = await Player.findOne({ sessionToken });
  if (!player) {
    return res.status(401).json({ error: 'Invalid session token' });
  }

  const date = todayUTC();

  let session = await GlobalSession.findOne({ date, difficulty });

  if (!session) {
    const targets = generateTargets(difficulty, 5);
    session = await GlobalSession.create({ date, difficulty, targets });
  }

  res.json({ targets: session.targets, date });
}

async function submitRound(req, res) {
  const { sessionToken, difficulty, roundIndex, guessHsl } = req.body;

  if (!sessionToken || !difficulty || roundIndex == null || !guessHsl) {
    return res.status(400).json({ error: 'sessionToken, difficulty, roundIndex, and guessHsl are required' });
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }

  if (roundIndex < 0 || roundIndex > 4) {
    return res.status(400).json({ error: 'roundIndex must be 0-4' });
  }

  if (guessHsl.h == null || guessHsl.s == null || guessHsl.l == null) {
    return res.status(400).json({ error: 'guessHsl must have h, s, and l' });
  }

  const player = await Player.findOne({ sessionToken });
  if (!player) {
    return res.status(401).json({ error: 'Invalid session token' });
  }

  const date = todayUTC();
  const session = await GlobalSession.findOne({ date, difficulty });

  if (!session) {
    return res.status(404).json({ error: 'No global challenge active for today' });
  }

  const target = session.targets[roundIndex];
  if (!target) {
    return res.status(400).json({ error: 'Invalid roundIndex' });
  }

  const delta = cieDe2000(
    target.h, target.s, target.l,
    guessHsl.h, guessHsl.s, guessHsl.l
  );
  const hueDist = Math.min(Math.abs(target.h - guessHsl.h), 360 - Math.abs(target.h - guessHsl.h)) / 180;
  const score = scoreFromDelta(delta, hueDist);

  let entry = session.playerScores.find((ps) => ps.sessionToken === sessionToken);

  if (!entry) {
    session.playerScores.push({
      sessionToken,
      displayName: player.displayName,
      roundScores: [],
    });
    entry = session.playerScores[session.playerScores.length - 1];
  }

  const prev = entry.roundScores[roundIndex] || 0;
  if (score > prev) {
    entry.roundScores[roundIndex] = score;
  }

  const validScores = entry.roundScores.filter((s) => s != null && s > 0);
  entry.totalScore = validScores.length > 0 ? validScores.reduce((sum, s) => sum + s, 0) : 0;

  if (validScores.length === 5) {
    entry.finishedAt = new Date();
  }

  try {
    await session.save();
    res.json({ score, targetColor: target });
  } catch (err) {
    console.error('Failed to save round:', err.message);
    res.status(500).json({ error: 'Failed to save round result' });
  }
}

async function getLeaderboard(req, res) {
  const { difficulty, sessionToken } = req.query;

  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
  }

  const date = todayUTC();
  const session = await GlobalSession.findOne({ date, difficulty });

  if (!session) {
    return res.json({ date, difficulty, entries: [], currentPlayerEntry: null });
  }

  const completed = session.playerScores
    .filter((ps) => ps.finishedAt)
    .sort((a, b) => {
      const scoreDiff = b.totalScore - a.totalScore;
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(a.finishedAt) - new Date(b.finishedAt);
    })
    .map((ps, i) => ({
      rank: i + 1,
      sessionToken: ps.sessionToken,
      displayName: ps.displayName,
      roundScores: ps.roundScores,
      totalScore: ps.totalScore,
      finishedAt: ps.finishedAt,
    }));

  const entries = completed.slice(0, 100);
  let currentPlayerEntry = null;

  if (sessionToken) {
    const playerIndex = completed.findIndex((e) => e.sessionToken === sessionToken);
    if (playerIndex >= 100) {
      currentPlayerEntry = completed[playerIndex];
    }
  }

  res.json({ date, difficulty, entries, currentPlayerEntry });
}

module.exports = { initGlobal, submitRound, getLeaderboard };
