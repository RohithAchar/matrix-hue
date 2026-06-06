/*
 * global.js — Global mode routes
 *
 * GET /api/global/init
 *   Query: difficulty, sessionToken
 *   Response: { targets: [{h,s,l}], date: "YYYY-MM-DD" }
 *   Logic: Find GlobalSession for today+difficulty.
 *          If not found, generate 5 targets, create session.
 *          Return targets.
 *
 * POST /api/global/round
 *   Body: { sessionToken, difficulty, roundIndex, guessHsl: {h,s,l} }
 *   Response: { score: number, targetColor: {h,s,l} }
 *   Logic: Find today's GlobalSession.
 *          Compute CIEDE2000, update best score per round.
 *
 * GET /api/global/leaderboard
 *   Query: difficulty, sessionToken (optional)
 *   Response: { date, difficulty, entries: [top 100], currentPlayerEntry }
 *   Logic: Sort playerScores, return top 100 + player's rank if outside
 */

const { Router } = require("express");

const router = Router();

// TODO: GET /api/global/init
// TODO: POST /api/global/round
// TODO: GET /api/global/leaderboard

module.exports = router;
