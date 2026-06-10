const { v4: uuidv4 } = require('uuid');
const Player = require('../models/Player');

async function createSession(req, res) {
  const displayName = (req.body.displayName || '').trim();

  if (!displayName || displayName.length > 30) {
    return res.status(400).json({ error: 'Display name is required (1-30 characters)' });
  }

  const sessionToken = uuidv4();

  try {
    await Player.create({ sessionToken, displayName });
    res.json({ sessionToken, displayName });
  } catch (err) {
    console.error('Failed to create player:', err.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

module.exports = { createSession };
