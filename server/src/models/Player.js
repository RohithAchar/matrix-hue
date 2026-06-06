/*
 * Player.js — Mongoose schema for player sessions
 *
 * Fields:
 *   sessionToken: String (unique, indexed, UUID v4)
 *   displayName:  String (1-30 chars)
 *   createdAt:    Date (default: Date.now)
 */

const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  // TODO: define fields
});

module.exports = mongoose.model("Player", playerSchema);
