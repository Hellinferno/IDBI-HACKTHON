const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { verifyToken, signToken, JWT_SECRET } = require('./auth');
const { resolveTarget, ROUTE_MAP } = require('./proxy');

describe('JWT Auth', () => {
  it('should sign and verify a valid token', () => {
    const token = signToken({ userId: 'u1', customerRef: 'CUST_001' });
    const payload = verifyToken(token);
    assert.ok(payload);
    assert.equal(payload.userId, 'u1');
    assert.equal(payload.customerRef, 'CUST_001');
  });

  it('should reject an expired token', () => {
    const token = signToken({ userId: 'u1' }, -10);
    const payload = verifyToken(token);
    assert.equal(payload, null);
  });

  it('should reject a tampered token', () => {
    const token = signToken({ userId: 'u1' });
    const parts = token.split('.');
    parts[2] = 'tampered';
    const payload = verifyToken(parts.join('.'));
    assert.equal(payload, null);
  });

  it('should reject null/undefined token', () => {
    assert.equal(verifyToken(null), null);
    assert.equal(verifyToken(undefined), null);
    assert.equal(verifyToken(''), null);
  });

  it('should reject a malformed token', () => {
    assert.equal(verifyToken('not-a-jwt'), null);
    assert.equal(verifyToken('a.b'), null);
  });
});

describe('Route Resolution', () => {
  it('should route /api/v1/profile to profile service', () => {
    const match = resolveTarget('/api/v1/profile');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3001'));
  });

  it('should route /api/v1/recommendations to reco service', () => {
    const match = resolveTarget('/api/v1/recommendations');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3002'));
  });

  it('should route /api/v1/conversations to orchestrator', () => {
    const match = resolveTarget('/api/v1/conversations');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3004'));
  });

  it('should route /api/v1/nudges to compliance', () => {
    const match = resolveTarget('/api/v1/nudges');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3003'));
  });

  it('should route /api/v1/consents to compliance', () => {
    const match = resolveTarget('/api/v1/consents');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3003'));
  });

  it('should route /api/v1/goals to profile', () => {
    const match = resolveTarget('/api/v1/goals');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3001'));
  });

  it('should route /api/v1/avatar to orchestrator', () => {
    const match = resolveTarget('/api/v1/avatar');
    assert.ok(match);
    assert.ok(match.baseUrl.includes('3004'));
  });

  it('should return null for unknown routes', () => {
    const match = resolveTarget('/api/v1/unknown');
    assert.equal(match, null);
  });

  it('should have all required routes defined', () => {
    const prefixes = ROUTE_MAP.map(r => r.prefix);
    assert.ok(prefixes.includes('/api/v1/profile'));
    assert.ok(prefixes.includes('/api/v1/recommendations'));
    assert.ok(prefixes.includes('/api/v1/conversations'));
    assert.ok(prefixes.includes('/api/v1/nudges'));
    assert.ok(prefixes.includes('/api/v1/consents'));
    assert.ok(prefixes.includes('/api/v1/goals'));
    assert.ok(prefixes.includes('/api/v1/avatar'));
    assert.ok(prefixes.includes('/api/v1/insights'));
  });
});

describe('Service URLs', () => {
  it('should have all service URLs configured', () => {
    const { SERVICE_URLS } = require('./proxy');
    assert.ok(SERVICE_URLS.profile);
    assert.ok(SERVICE_URLS.reco);
    assert.ok(SERVICE_URLS.compliance);
    assert.ok(SERVICE_URLS.orchestrator);
    assert.ok(SERVICE_URLS.engine);
  });

  it('should have valid URL format', () => {
    const { SERVICE_URLS } = require('./proxy');
    for (const [name, url] of Object.entries(SERVICE_URLS)) {
      assert.ok(url.startsWith('http://'), `${name} URL should start with http://`);
    }
  });
});

describe('Token edge cases', () => {
  it('should handle token with extra dots', () => {
    const token = signToken({ userId: 'u1' });
    const payload = verifyToken(token + '.extra');
    assert.equal(payload, null);
  });

  it('should handle base64url padding variations', () => {
    const token = signToken({ userId: 'u1', customerRef: 'C' });
    const payload = verifyToken(token);
    assert.ok(payload);
    assert.equal(payload.customerRef, 'C');
  });
});
