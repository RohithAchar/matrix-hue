require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

let isConnected = false;
let dbReadyResolve;
const dbReady = new Promise((resolve) => { dbReadyResolve = resolve; });

app.use(cors());
app.use(express.json());

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/matrixhue';
    await mongoose.connect(uri);
    isConnected = true;
    dbReadyResolve();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    dbReadyResolve();
    isConnected = false;
  }
}

connectDB();

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('MongoDB reconnected');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({ error: 'Service unavailable' });
  }
  next();
});

app.use('/api/session', require('./routes/session'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/global', require('./routes/global'));

if (isProd) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.dbReady = dbReady;
