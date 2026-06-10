const Challenge = require('../models/Challenge');
const Player = require('../models/Player');

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

module.exports = { createChallenge };
