/*
 * challenges.js — Play with Friends challenge routes
 *
 * POST /api/challenges
 *   Body: { sessionToken, difficulty, targets: [{h,s,l}], hostScore: {...} }
 *   Response: { shareCode: string }
 *   Logic: Validate session, generate 6-char code, save challenge
 *
 * GET /api/challenges/:code
 *   Response: { difficulty, targets: [{h,s,l}] }
 *   Logic: Find by shareCode, return targets + difficulty (not scores)
 *
 * POST /api/challenges/:code/round
 *   Body: { sessionToken, roundIndex, guessHsl: {h,s,l} }
 *   Response: { score: number, targetColor: {h,s,l} }
 *   Logic: Validate session, check not already completed,
 *          compute CIEDE2000, store/update playerScores entry
 *
 * GET /api/challenges/:code/leaderboard
 *   Response: { shareCode, difficulty, entries: [...] }
 *   Logic: Sort playerScores by totalScore desc, assign ranks
 */

const { Router } = require("express");

const router = Router();

// TODO: POST /api/challenges
// TODO: GET /api/challenges/:code
// TODO: POST /api/challenges/:code/round
// TODO: GET /api/challenges/:code/leaderboard

module.exports = router;
