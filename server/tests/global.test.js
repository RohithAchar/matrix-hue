const request = require('supertest');
const mongoose = require('mongoose');
const GlobalSession = require('../src/models/GlobalSession');

let app;
let sessionToken;

beforeAll(async () => {
  app = require('../src/app');
  await app.dbReady;

  const res = await request(app)
    .post('/api/session')
    .send({ displayName: 'GlobalPlayer' });
  sessionToken = res.body.sessionToken;
});

afterAll(async () => {
  await GlobalSession.deleteMany({});
  await mongoose.disconnect();
});

describe('GET /api/global/init', () => {
  it('creates a new GlobalSession for today+difficulty on first call', async () => {
    const res = await request(app)
      .get(`/api/global/init?difficulty=easy&sessionToken=${sessionToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('targets');
    expect(res.body.targets).toHaveLength(5);
    expect(res.body).toHaveProperty('date');
    expect(typeof res.body.date).toBe('string');
  });

  it('returns existing targets for subsequent calls same day+difficulty', async () => {
    const res1 = await request(app)
      .get(`/api/global/init?difficulty=easy&sessionToken=${sessionToken}`)
      .expect(200);

    const res2 = await request(app)
      .get(`/api/global/init?difficulty=easy&sessionToken=${sessionToken}`)
      .expect(200);

    expect(res2.body.targets).toEqual(res1.body.targets);
    expect(res2.body.date).toBe(res1.body.date);
  });

  it('returns 401 for invalid sessionToken', async () => {
    const res = await request(app)
      .get('/api/global/init?difficulty=easy&sessionToken=invalid-uuid')
      .expect(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for missing difficulty', async () => {
    const res = await request(app)
      .get(`/api/global/init?sessionToken=${sessionToken}`)
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .get(`/api/global/init?difficulty=impossible&sessionToken=${sessionToken}`)
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/global/round', () => {
  it('returns 404 if no GlobalSession exists for today', async () => {
    const res = await request(app)
      .post('/api/global/round')
      .send({
        sessionToken,
        difficulty: 'hard',
        roundIndex: 0,
        guessHsl: { h: 120, s: 50, l: 50 },
      })
      .expect(404);
    expect(res.body).toHaveProperty('error');
  });

  it('computes score and stores it', async () => {
    const initRes = await request(app)
      .get(`/api/global/init?difficulty=medium&sessionToken=${sessionToken}`)
      .expect(200);

    const target = initRes.body.targets[0];
    const guess = { h: target.h + 10, s: target.s, l: target.l };

    const res = await request(app)
      .post('/api/global/round')
      .send({
        sessionToken,
        difficulty: 'medium',
        roundIndex: 0,
        guessHsl: guess,
      })
      .expect(200);

    expect(res.body).toHaveProperty('score');
    expect(typeof res.body.score).toBe('number');
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(10);
    expect(res.body).toHaveProperty('targetColor');
    expect(res.body.targetColor).toEqual(target);
  });

  it('returns 401 for invalid sessionToken', async () => {
    const res = await request(app)
      .post('/api/global/round')
      .send({
        sessionToken: 'invalid-uuid',
        difficulty: 'medium',
        roundIndex: 0,
        guessHsl: { h: 120, s: 50, l: 50 },
      })
      .expect(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for out-of-range roundIndex', async () => {
    const res = await request(app)
      .post('/api/global/round')
      .send({
        sessionToken,
        difficulty: 'medium',
        roundIndex: 99,
        guessHsl: { h: 120, s: 50, l: 50 },
      })
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/global/leaderboard', () => {
  it('returns 400 for missing difficulty', async () => {
    const res = await request(app)
      .get('/api/global/leaderboard')
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .get('/api/global/leaderboard?difficulty=impossible')
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns sorted entries with rank', async () => {
    const res = await request(app)
      .get('/api/global/leaderboard?difficulty=medium')
      .expect(200);

    expect(res.body).toHaveProperty('entries');
    expect(Array.isArray(res.body.entries)).toBe(true);
    expect(res.body).toHaveProperty('difficulty', 'medium');

    if (res.body.entries.length > 1) {
      for (let i = 1; i < res.body.entries.length; i++) {
        expect(res.body.entries[i].totalScore).toBeLessThanOrEqual(res.body.entries[i - 1].totalScore);
      }
    }

    for (const entry of res.body.entries) {
      expect(entry).toHaveProperty('sessionToken');
      expect(entry).toHaveProperty('displayName');
      expect(entry).toHaveProperty('roundScores');
      expect(entry.roundScores).toHaveLength(5);
      expect(entry).toHaveProperty('totalScore');
      expect(entry).toHaveProperty('finishedAt');
      expect(entry).toHaveProperty('rank');
    }
  });

  it('returns currentPlayerEntry when sessionToken matches', async () => {
    const initRes = await request(app)
      .get(`/api/global/init?difficulty=easy&sessionToken=${sessionToken}`)
      .expect(200);

    for (let i = 0; i < 5; i++) {
      const target = initRes.body.targets[i];
      await request(app)
        .post('/api/global/round')
        .send({
          sessionToken,
          difficulty: 'easy',
          roundIndex: i,
          guessHsl: { h: target.h + 10, s: target.s, l: target.l },
        })
        .expect(200);
    }

    const res = await request(app)
      .get(`/api/global/leaderboard?difficulty=easy&sessionToken=${sessionToken}`)
      .expect(200);

    const foundInEntries = res.body.entries.some((e) => e.sessionToken === sessionToken);
    const foundInCurrent = res.body.currentPlayerEntry && res.body.currentPlayerEntry.sessionToken === sessionToken;
    expect(foundInEntries || foundInCurrent).toBe(true);
  });
});
