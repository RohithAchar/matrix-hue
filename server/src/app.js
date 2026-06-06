/*
 * app.js — Express server entry point
 *
 * TODO:
 * - Load .env (process.env.MONGO_URI, process.env.PORT)
 * - Connect to MongoDB via Mongoose
 * - Set up middleware: cors(), express.json()
 * - Add MongoDB health check middleware (return 503 if not connected)
 * - Mount route modules:
 *   /api/session       → routes/session.js
 *   /api/challenges    → routes/challenges.js
 *   /api/global        → routes/global.js
 * - GET /api/health → { status: "ok", timestamp }
 * - Listen on PORT (default 3001)
 * - Log startup status
 */

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// TODO: load .env

const app = express();

// TODO: mount middleware
// TODO: mount routes
// TODO: MongoDB connection
// TODO: health check

module.exports = app;
