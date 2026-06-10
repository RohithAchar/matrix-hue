const request = require('supertest');
const mongoose = require('mongoose');

let app;
let sessionToken;

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

  const res = await request(app)
    .post('/api/session')
    .send({ displayName: 'Neo' });
  sessionToken = res.body.sessionToken;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/challenges', () => {
  it('creates a challenge and returns a 6-char share code', async () => {
    const res = await request(app)
      .post('/api/challenges')
      .send({ sessionToken, difficulty: 'easy', targets: mockTargets, hostScore })
      .expect(200);

    expect(res.body).toHaveProperty('shareCode');
    expect(res.body.shareCode).toMatch(/^[A-Z2-9]{6}$/);
  });

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
      .send({ sessionToken, difficulty: 'impossible', targets: mockTargets, hostScore });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('stores the share code uniquely', async () => {
    const res1 = await request(app)
      .post('/api/challenges')
      .send({ sessionToken, difficulty: 'easy', targets: mockTargets, hostScore })
      .expect(200);

    const res2 = await request(app)
      .post('/api/challenges')
      .send({ sessionToken, difficulty: 'hard', targets: mockTargets, hostScore })
      .expect(200);

    expect(res1.body.shareCode).not.toBe(res2.body.shareCode);
  });
});
