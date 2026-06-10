const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  sessionToken: { type: String, unique: true, index: true },
  displayName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Player', playerSchema);
