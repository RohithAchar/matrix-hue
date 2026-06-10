const request = require('supertest');
const mongoose = require('mongoose');

let app;
let hostToken;
let guestToken;
let shareCode;

const mockTargets = [
  { h: 0, s: 50, l: 50 },
  { h: 120, s: 50, l: 50 },
  { h: 240, s: 50, l: 50 },
  { h: 60, s: 50, l: 50 },
  { h: 300, s: 50, l: 50 },
];

const hostScore = {
  roundScores: [7.5, 8.0, 6.5, 9.0, 8.5],
  totalScore: 39.5,
  displayName: 'Neo',
};

beforeAll(async () => {
  app = require('../src/app');
  await app.dbReady;

  const hostRes = await request(app)
    .post('/api/session')
    .send({ displayName: 'Host' });
  hostToken = hostRes.body.sessionToken;

  const guestRes = await request(app)
    .post('/api/session')
    .send({ displayName: 'Guest' });
  guestToken = guestRes.body.sessionToken;

  const chalRes = await request(app)
    .post('/api/challenges')
    .send({ sessionToken: hostToken, difficulty: 'easy', targets: mockTargets, hostScore });
  shareCode = chalRes.body.shareCode;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/challenges', () => {
  it('returns 401 for invalid sessionToken', async () => {
    const res = await request(app)
      .post('/api/challenges')
      .send({ sessionToken: 'invalid-uuid', difficulty: 'easy', targets: mockTargets, hostScore })
      .expect(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for missing sessionToken', async () => {
    const res = await request(app)
      .post('/api/challenges')
      .send({ difficulty: 'easy', targets: mockTargets, hostScore })
      .expect(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid difficulty', async () => {
    const res = await request(app)
      .post('/api/challenges')
      .send({ sessionToken: hostToken, difficulty: 'impossible', targets: mockTargets, hostScore });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('stores unique share codes', async () => {
    const res1 = await request(app)
      .post('/api/challenges')
      .send({ sessionToken: hostToken, difficulty: 'hard', targets: mockTargets, hostScore })
      .expect(200);
    const res2 = await request(app)
      .post('/api/challenges')
      .send({ sessionToken: hostToken, difficulty: 'medium', targets: mockTargets, hostScore })
      .expect(200);
    expect(res1.body.shareCode).not.toBe(res2.body.shareCode);
  });
});

describe('GET /api/challenges/:code', () => {
  it('returns difficulty and targets for valid code', async () => {
    const res = await request(app)
      .get(`/api/challenges/${shareCode}`)
      .expect(200);

    expect(res.body).toHaveProperty('difficulty', 'easy');
    expect(res.body).toHaveProperty('targets');
    expect(res.body.targets).toHaveLength(5);
  });

  it('returns 404 for unknown code', async () => {
    const res = await request(app)
      .get('/api/challenges/XXXXXX')
      .expect(404);

    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/challenges/:code/round', () => {
  it('returns score and targetColor for a valid guess', async () => {
    const res = await request(app)
      .post(`/api/challenges/${shareCode}/round`)
      .send({ sessionToken: guestToken, roundIndex: 0, guessHsl: { h: 5, s: 55, l: 45 } })
      .expect(200);

    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('targetColor');
    expect(typeof res.body.score).toBe('number');
    expect(res.body.targetColor).toHaveProperty('h');
  });

  it('accepts a second round submission', async () => {
    const res = await request(app)
      .post(`/api/challenges/${shareCode}/round`)
      .send({ sessionToken: guestToken, roundIndex: 1, guessHsl: { h: 115, s: 45, l: 55 } })
      .expect(200);

    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('targetColor');
  });

  it('returns 404 for unknown share code', async () => {
    const res = await request(app)
      .post('/api/challenges/XXXXXX/round')
      .send({ sessionToken: guestToken, roundIndex: 0, guessHsl: { h: 0, s: 50, l: 50 } })
      .expect(404);

    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 for invalid session token', async () => {
    const res = await request(app)
      .post(`/api/challenges/${shareCode}/round`)
      .send({ sessionToken: 'bad-token', roundIndex: 0, guessHsl: { h: 0, s: 50, l: 50 } })
      .expect(401);

    expect(res.body).toHaveProperty('error');
  });

  it('sets totalScore and finishedAt after completing all 5 rounds', async () => {
    for (let i = 2; i < 5; i++) {
      await request(app)
        .post(`/api/challenges/${shareCode}/round`)
        .send({ sessionToken: guestToken, roundIndex: i, guessHsl: { h: 30 * i, s: 50, l: 50 } })
        .expect(200);
    }

    const Challenge = require('../src/models/Challenge');
    const challenge = await Challenge.findOne({ shareCode });
    const entry = challenge.playerScores.find((ps) => ps.sessionToken === guestToken);
    expect(entry.roundScores).toHaveLength(5);
    expect(entry.totalScore).toBeGreaterThan(0);
    expect(entry.finishedAt).toBeDefined();
  });

  it('returns 409 when player already completed the challenge', async () => {
    const res = await request(app)
      .post(`/api/challenges/${shareCode}/round`)
      .send({ sessionToken: guestToken, roundIndex: 0, guessHsl: { h: 0, s: 50, l: 50 } })
      .expect(409);

    expect(res.body).toHaveProperty('error');
  });
});
