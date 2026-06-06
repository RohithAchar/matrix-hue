/*
 * Challenge.js — Mongoose schema for Play with Friends challenges
 *
 * Fields:
 *   shareCode:    String (unique, indexed, 6-char alphanumeric)
 *   hostSession:  String (sessionToken of host)
 *   difficulty:   Enum ["easy", "medium", "hard"]
 *   targets:      [{ h: Number, s: Number, l: Number }] (length 5)
 *   playerScores: Array of sub-documents:
 *                   sessionToken, displayName,
 *                   roundScores: [Number], totalScore: Number,
 *                   finishedAt: Date
 *   createdAt:    Date
 */

const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  // TODO: define fields
});

module.exports = mongoose.model("Challenge", challengeSchema);
