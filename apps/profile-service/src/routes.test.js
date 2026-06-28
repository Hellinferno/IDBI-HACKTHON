/**
 * API tests for profile service routes.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fastify = require('fastify')({ logger: false });
const { registerRoutes } = require('./routes');

let server;

before(async () => {
  await registerRoutes(fastify);
  fastify.get('/health', async () => ({ status: 'ok' }));
  await fastify.listen({ port: 0, host: '127.0.0.1' });
  server = fastify;
});

after(async () => {
  if (server) await server.close();
});

describe('GET /health', () => {
  it('should return ok', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });
    assert.strictEqual(response.statusCode, 200);
  });
});

describe('GET /profile', () => {
  it('should return 400 without userId', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/profile',
    });
    assert.strictEqual(response.statusCode, 400);
  });

  it('should return 404 for unknown user', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/profile?userId=unknown',
    });
    assert.strictEqual(response.statusCode, 404);
  });
});

describe('POST /profile/risk-assessment', () => {
  it('should return 400 without userId', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/profile/risk-assessment',
      payload: { answers: [] },
    });
    assert.strictEqual(response.statusCode, 400);
  });

  it('should return 400 without answers', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/profile/risk-assessment',
      headers: { 'x-user-id': 'test-user' },
      payload: {},
    });
    assert.strictEqual(response.statusCode, 400);
  });

  it('should compute risk score', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/profile/risk-assessment',
      headers: { 'x-user-id': 'test-user' },
      payload: {
        answers: [
          { qid: 'q1', value: 3 },
          { qid: 'q2', value: 6 },
          { qid: 'q3', value: 5 },
          { qid: 'q4', value: 4 },
          { qid: 'q5', value: 3 },
          { qid: 'q6', value: 6 },
          { qid: 'q7', value: 5 },
        ],
      },
    });
    assert.strictEqual(response.statusCode, 200);
    const data = JSON.parse(response.payload);
    assert.ok(data.score >= 0 && data.score <= 100);
    assert.ok(data.band);
    assert.ok(data.validUntil);
  });
});

describe('POST /profile/ingest', () => {
  it('should return 400 without customerRef', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/profile/ingest',
      headers: { 'x-user-id': 'test-user' },
      payload: {},
    });
    assert.strictEqual(response.statusCode, 400);
  });

  it('should ingest and build profile', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/profile/ingest',
      headers: { 'x-user-id': 'user-001' },
      payload: { customerRef: 'CUST_001' },
    });
    assert.strictEqual(response.statusCode, 200);
    const data = JSON.parse(response.payload);
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.profile);
    assert.ok(data.profile.spendPersonality);
    assert.ok(data.profile.lifeStage);
  });

  it('should return profile after ingestion', async () => {
    // First ingest
    await server.inject({
      method: 'POST',
      url: '/profile/ingest',
      headers: { 'x-user-id': 'user-002' },
      payload: { customerRef: 'CUST_002' },
    });

    // Then fetch profile
    const response = await server.inject({
      method: 'GET',
      url: '/profile?userId=user-002',
    });
    assert.strictEqual(response.statusCode, 200);
    const data = JSON.parse(response.payload);
    assert.ok(data.financialProfile);
    assert.ok(data.risk);
  });
});
