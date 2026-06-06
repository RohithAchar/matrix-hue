/*
 * session.js — Session routes
 *
 * POST /api/session
 *   Body: { displayName: string }
 *   Response: { sessionToken: string, displayName: string }
 *   Logic: Generate UUID, create Player document, return token
 *   Validation: displayName 1-30 chars, trimmed → 400 if invalid
 */

const { Router } = require("express");

const router = Router();

// TODO: POST /api/session
// TODO: validate displayName
// TODO: generate UUID, create Player, respond

module.exports = router;
