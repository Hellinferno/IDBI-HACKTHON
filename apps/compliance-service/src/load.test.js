/**
 * Load and performance tests for compliance service.
 * Benchmarks suitability checks, audit writes, consent operations.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  checkSuitability,
  writeAuditEntry,
  verifyAuditIntegrity,
  hasConsent,
  setConsent,
  shouldShowNudge,
  recordNudge,
} = require('./compliance');

function bench(fn, iterations = 10000) {
  const latencies = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(i);
    latencies.push(performance.now() - start);
  }
  latencies.sort((a, b) => a - b);
  return {
    p50: latencies[Math.floor(latencies.length * 0.5)],
    p99: latencies[Math.floor(latencies.length * 0.99)],
    avg: latencies.reduce((s, l) => s + l, 0) / latencies.length,
  };
}

const RECO = { riskBand: 'moderate', assetClass: 'equity', minInvestment: 5000 };
const PROFILE = { riskBand: 'moderate', balance: 100000, horizon: 5 };

describe('Load: Suitability Check', () => {
  it('should handle 10k suitability checks with p99 < 1ms', () => {
    const stats = bench(() => checkSuitability(RECO, PROFILE));
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Audit Write', () => {
  it('should handle 5k audit writes with p99 < 2ms', () => {
    const stats = bench((i) => writeAuditEntry({
      userId: `load-user-${i}`,
      eventType: 'recommendation_shown',
      payload: { recoId: `r_${i}` },
    }), 5000);
    assert.ok(stats.p99 < 2.0, `p99=${stats.p99.toFixed(3)}ms exceeds 2ms`);
  });

  it('audit integrity should hold after 5k writes', () => {
    const result = verifyAuditIntegrity();
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.brokenAt, null);
  });
});

describe('Load: Consent Operations', () => {
  it('should handle 10k consent checks with p99 < 0.5ms', () => {
    setConsent('load-consent-user', 'advisory', true);
    const stats = bench(() => hasConsent('load-consent-user', 'advisory'));
    assert.ok(stats.p99 < 0.5, `p99=${stats.p99.toFixed(3)}ms exceeds 0.5ms`);
  });
});

describe('Load: Nudge Engine', () => {
  it('should handle 1k nudge checks with p99 < 1ms', () => {
    const userId = 'load-nudge-user-' + Date.now();
    setConsent(userId, 'advisory', true);
    const stats = bench(() => shouldShowNudge(userId, 'idle_cash'), 1000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Concurrent Audit Writes', () => {
  it('should handle parallel writes without corruption', async () => {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(Promise.resolve().then(() => writeAuditEntry({
        userId: `concurrent-user-${i}`,
        eventType: 'test_concurrent',
        payload: { index: i },
      })));
    }
    const results = await Promise.all(promises);
    assert.strictEqual(results.length, 100);
    for (const r of results) {
      assert.ok(r.hash);
      assert.strictEqual(r.hash.length, 64);
    }
    const integrity = verifyAuditIntegrity();
    assert.strictEqual(integrity.valid, true);
  });
});
