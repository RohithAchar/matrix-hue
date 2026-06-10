/*
 * GlobalSession.js — Mongoose schema for daily global challenges
 *
 * Fields:
 *   date:         String ("YYYY-MM-DD")
 *   difficulty:   Enum ["easy", "medium", "hard"]
 *   targets:      [{ h, s, l }] (length 5)
 *   playerScores: Array of sub-documents (same as Challenge)
 *   createdAt:    Date
 *
 * Index: Compound unique on (date, difficulty)
 */

const mongoose = require('mongoose');

const globalSessionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  targets: [{ h: Number, s: Number, l: Number }],
  playerScores: [{
    sessionToken: String,
    displayName: String,
    roundScores: [Number],
    totalScore: Number,
    finishedAt: Date,
  }],
  createdAt: { type: Date, default: Date.now },
});

globalSessionSchema.index({ date: 1, difficulty: 1 }, { unique: true });

module.exports = mongoose.model('GlobalSession', globalSessionSchema);
