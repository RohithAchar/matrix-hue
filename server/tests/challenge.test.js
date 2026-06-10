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

describe('GET /api/challenges/:code/leaderboard', () => {
  it('returns 404 for unknown share code', async () => {
    const res = await request(app)
      .get('/api/challenges/XXXXXX/leaderboard')
      .expect(404);

    expect(res.body).toHaveProperty('error');
  });

  it('returns leaderboard entries sorted by totalScore descending', async () => {
    const res = await request(app)
      .get(`/api/challenges/${shareCode}/leaderboard`)
      .expect(200);

    expect(res.body).toHaveProperty('shareCode', shareCode);
    expect(res.body).toHaveProperty('difficulty', 'easy');
    expect(res.body).toHaveProperty('entries');
    expect(res.body.entries.length).toBeGreaterThanOrEqual(2);

    const scores = res.body.entries.map((e) => e.totalScore);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  it('includes host entry with finishedAt', async () => {
    const res = await request(app)
      .get(`/api/challenges/${shareCode}/leaderboard`)
      .expect(200);

    const hostEntry = res.body.entries.find((e) => e.displayName === 'Neo');
    expect(hostEntry).toBeDefined();
    expect(hostEntry.roundScores).toEqual([7.5, 8.0, 6.5, 9.0, 8.5]);
    expect(hostEntry.totalScore).toBe(39.5);
    expect(hostEntry).toHaveProperty('finishedAt');
    expect(hostEntry).toHaveProperty('rank');
  });

  it('assigns correct ranks and includes sessionToken', async () => {
    const res = await request(app)
      .get(`/api/challenges/${shareCode}/leaderboard`)
      .expect(200);

    res.body.entries.forEach((e, i) => {
      expect(e.rank).toBe(i + 1);
      expect(e).toHaveProperty('sessionToken');
      expect(e).toHaveProperty('displayName');
      expect(e).toHaveProperty('roundScores');
      expect(e).toHaveProperty('totalScore');
      expect(e).toHaveProperty('finishedAt');
    });
  });

  it('tiebreaker: same totalScore, earlier finishedAt gets higher rank', async () => {
    const tieToken1 = (await request(app).post('/api/session').send({ displayName: 'TieA' })).body.sessionToken;
    const tieToken2 = (await request(app).post('/api/session').send({ displayName: 'TieB' })).body.sessionToken;

    const sameTargets = [
      { h: 0, s: 50, l: 50 },
      { h: 0, s: 50, l: 50 },
      { h: 0, s: 50, l: 50 },
      { h: 0, s: 50, l: 50 },
      { h: 0, s: 50, l: 50 },
    ];

    const chalRes = await request(app)
      .post('/api/challenges')
      .send({
        sessionToken: hostToken,
        difficulty: 'easy',
        targets: sameTargets,
        hostScore: { roundScores: [5, 5, 5, 5, 5], totalScore: 25, displayName: 'HostTie' },
      });
    const tieCode = chalRes.body.shareCode;

    const guess = { h: 0, s: 50, l: 50 };
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/challenges/${tieCode}/round`)
        .send({ sessionToken: tieToken1, roundIndex: i, guessHsl: guess });
    }

    await new Promise((r) => setTimeout(r, 10));

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post(`/api/challenges/${tieCode}/round`)
        .send({ sessionToken: tieToken2, roundIndex: i, guessHsl: guess });
    }

    const res = await request(app)
      .get(`/api/challenges/${tieCode}/leaderboard`)
      .expect(200);

    const tieEntries = res.body.entries.filter((e) => e.totalScore === 50);
    expect(tieEntries.length).toBeGreaterThanOrEqual(2);
    expect(tieEntries[0].displayName).toBe('TieA');
    expect(tieEntries[1].displayName).toBe('TieB');
    expect(tieEntries[0].rank).toBeLessThan(tieEntries[1].rank);
  });
});
