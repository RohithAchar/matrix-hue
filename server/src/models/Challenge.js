const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  shareCode: { type: String, unique: true, index: true },
  hostSession: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  targets: [{ h: Number, s: Number, l: Number }],
  playerScores: [{
    sessionToken: String,
    displayName: String,
    roundScores: [Number],
    totalScore: Number,
    finishedAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Challenge', challengeSchema);
