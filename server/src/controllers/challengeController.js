const Challenge = require('../models/Challenge');
const Player = require('../models/Player');
const { cieDe2000 } = require('../utils/cieDe2000');
const { scoreFromDelta } = require('../utils/scoring');

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateShareCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function createChallenge(req, res) {
  const { sessionToken, difficulty, targets, hostScore } = req.body;

  if (!sessionToken) {
    return res.status(400).json({ error: 'sessionToken is required' });
  }

  const player = await Player.findOne({ sessionToken });
  if (!player) {
    return res.status(401).json({ error: 'Invalid session token' });
  }

  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }

  if (!Array.isArray(targets) || targets.length !== 5) {
    return res.status(400).json({ error: 'targets must be an array of 5 colors' });
  }

  if (!hostScore || !Array.isArray(hostScore.roundScores) || hostScore.roundScores.length !== 5 || hostScore.totalScore == null) {
    return res.status(400).json({ error: 'hostScore must include roundScores (length 5) and totalScore' });
  }

  let shareCode;
  for (let attempt = 0; attempt < 3; attempt++) {
    shareCode = generateShareCode();
    const exists = await Challenge.findOne({ shareCode });
    if (!exists) break;
    shareCode = null;
  }

  if (!shareCode) {
    return res.status(500).json({ error: 'Failed to generate unique share code' });
  }

  try {
    await Challenge.create({
      shareCode,
      hostSession: sessionToken,
      difficulty,
      targets,
      playerScores: [{
        sessionToken,
        displayName: hostScore.displayName || player.displayName,
        roundScores: hostScore.roundScores,
        totalScore: hostScore.totalScore,
      }],
    });

    res.json({ shareCode });
  } catch (err) {
    console.error('Failed to create challenge:', err.message);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
}

async function getChallenge(req, res) {
  const challenge = await Challenge.findOne({ shareCode: req.params.code });

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  res.json({
    difficulty: challenge.difficulty,
    targets: challenge.targets,
  });
}

async function submitRound(req, res) {
  const { sessionToken, roundIndex, guessHsl } = req.body;

  if (sessionToken == null || roundIndex == null || !guessHsl) {
    return res.status(400).json({ error: 'sessionToken, roundIndex, and guessHsl are required' });
  }

  if (roundIndex < 0 || roundIndex > 4) {
    return res.status(400).json({ error: 'roundIndex must be 0-4' });
  }

  const challenge = await Challenge.findOne({ shareCode: req.params.code });
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const player = await Player.findOne({ sessionToken });
  if (!player) {
    return res.status(401).json({ error: 'Invalid session token' });
  }

  let entry = challenge.playerScores.find((ps) => ps.sessionToken === sessionToken);

  if (entry && entry.roundScores.length >= 5) {
    return res.status(409).json({ error: 'You have already completed this challenge' });
  }

  const target = challenge.targets[roundIndex];
  const delta = cieDe2000(
    target.h, target.s, target.l,
    guessHsl.h, guessHsl.s, guessHsl.l
  );
  const score = scoreFromDelta(delta);

  if (!entry) {
    challenge.playerScores.push({
      sessionToken,
      displayName: player.displayName,
      roundScores: [],
    });
    entry = challenge.playerScores[challenge.playerScores.length - 1];
  }

  entry.roundScores[roundIndex] = score;

  if (roundIndex === 4) {
    entry.totalScore = entry.roundScores.reduce((sum, s) => sum + s, 0);
    entry.finishedAt = new Date();
  }

  try {
    await challenge.save();
    res.json({ score, targetColor: target });
  } catch (err) {
    console.error('Failed to save round:', err.message);
    res.status(500).json({ error: 'Failed to save round result' });
  }
}

module.exports = { createChallenge, getChallenge, submitRound };
