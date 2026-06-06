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

const mongoose = require("mongoose");

const globalSessionSchema = new mongoose.Schema({
  // TODO: define fields
});

// TODO: add compound unique index on (date, difficulty)

module.exports = mongoose.model("GlobalSession", globalSessionSchema);
