const request = require('supertest');
const mongoose = require('mongoose');

let app;

beforeAll(async () => {
  app = require('../src/app');
  await app.dbReady;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/session', () => {
  it('creates a session and returns sessionToken + displayName', async () => {
    const res = await request(app)
      .post('/api/session')
      .send({ displayName: 'Neo' })
      .expect(200);

    expect(res.body).toHaveProperty('sessionToken');
    expect(res.body).toHaveProperty('displayName', 'Neo');
    expect(res.body.sessionToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('returns 400 for empty display name', async () => {
    const res = await request(app)
      .post('/api/session')
      .send({ displayName: '' })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for missing display name', async () => {
    const res = await request(app)
      .post('/api/session')
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for name over 30 characters', async () => {
    const res = await request(app)
      .post('/api/session')
      .send({ displayName: 'a'.repeat(31) })
      .expect(400);

    expect(res.body).toHaveProperty('error');
  });

  it('trims whitespace from display name', async () => {
    const res = await request(app)
      .post('/api/session')
      .send({ displayName: '  Neo  ' })
      .expect(200);

    expect(res.body.displayName).toBe('Neo');
  });
});
