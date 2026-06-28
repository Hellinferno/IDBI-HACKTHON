/**
 * Tests for observability module.
 * Verifies: structured logging, correlation IDs, metrics, health checks.
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  generateCorrelationId,
  logger,
  recordRequest,
  recordEngineCall,
  recordComplianceCheck,
  recordAuditWrite,
  recordConversationTurn,
  getMetrics,
  resetMetrics,
  healthChecks,
} = require('./observability');

describe('Correlation ID', () => {
  it('generates a UUID v4', () => {
    const id = generateCorrelationId();
    assert.strictEqual(typeof id, 'string');
    assert.ok(id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  });

  it('generates unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateCorrelationId());
    }
    assert.strictEqual(ids.size, 100);
  });
});

describe('Structured Logger', () => {
  it('log returns a structured entry', () => {
    const entry = logger.info('test message', { correlationId: 'abc-123', userId: 'u1' });
    assert.strictEqual(entry.level, 'info');
    assert.strictEqual(entry.message, 'test message');
    assert.strictEqual(entry.correlationId, 'abc-123');
    assert.strictEqual(entry.userId, 'u1');
    assert.ok(entry.timestamp);
    assert.ok(entry.service);
  });

  it('error level is supported', () => {
    const entry = logger.error('something failed', { correlationId: 'err-1' });
    assert.strictEqual(entry.level, 'error');
    assert.strictEqual(entry.message, 'something failed');
  });

  it('warn level is supported', () => {
    const entry = logger.warn('heads up', {});
    assert.strictEqual(entry.level, 'warn');
  });

  it('debug level is supported', () => {
    const entry = logger.debug('verbose info', {});
    assert.strictEqual(entry, undefined, 'debug filtered at info level');
  });
});

describe('Metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('records request count and intent breakdown', () => {
    recordRequest('goal_create', 200);
    recordRequest('goal_create', 200);
    recordRequest('allocation', 200);
    recordRequest('allocation', 500);
    const m = getMetrics();
    assert.strictEqual(m.requests.total, 4);
    assert.strictEqual(m.requests.byIntent.goal_create, 2);
    assert.strictEqual(m.requests.byIntent.allocation, 2);
    assert.strictEqual(m.requests.byStatus[200], 3);
    assert.strictEqual(m.requests.byStatus[500], 1);
  });

  it('records engine calls and latencies', () => {
    recordEngineCall(15, false);
    recordEngineCall(25, false);
    recordEngineCall(100, true);
    const m = getMetrics();
    assert.strictEqual(m.engine.calls, 3);
    assert.strictEqual(m.engine.errors, 1);
    assert.ok(m.engine.avgLatencyMs > 0);
    assert.ok(m.engine.p95LatencyMs > 0);
  });

  it('records compliance checks', () => {
    recordComplianceCheck(false);
    recordComplianceCheck(true);
    recordComplianceCheck(false);
    const m = getMetrics();
    assert.strictEqual(m.compliance.suitabilityChecks, 3);
    assert.strictEqual(m.compliance.blocks, 1);
  });

  it('records conversation turns with avg tokens', () => {
    recordConversationTurn(50);
    recordConversationTurn(100);
    const m = getMetrics();
    assert.strictEqual(m.conversation.turns, 2);
    assert.strictEqual(m.conversation.avgTokensPerTurn, 75);
  });

  it('latency percentiles are ordered', () => {
    for (let i = 0; i < 100; i++) {
      recordEngineCall(i, false);
    }
    const m = getMetrics();
    assert.ok(m.engine.p50LatencyMs <= m.engine.p95LatencyMs);
    assert.ok(m.engine.p95LatencyMs <= m.engine.p99LatencyMs);
  });

  it('reset clears all metrics', () => {
    recordRequest('test', 200);
    recordEngineCall(10, false);
    resetMetrics();
    const m = getMetrics();
    assert.strictEqual(m.requests.total, 0);
    assert.strictEqual(m.engine.calls, 0);
  });

  it('keeps last 1000 engine latencies (rolling window)', () => {
    for (let i = 0; i < 1500; i++) {
      recordEngineCall(i, false);
    }
    const m = getMetrics();
    assert.strictEqual(m.engine.latenciesMs.length, 1000);
  });
});

describe('Health Checks', () => {
  it('engine health returns healthy status', () => {
    const h = healthChecks.engine();
    assert.strictEqual(h.status, 'healthy');
    assert.ok(typeof h.latencyMs === 'number');
  });

  it('compliance health returns healthy status', () => {
    const h = healthChecks.compliance();
    assert.strictEqual(h.status, 'healthy');
    assert.strictEqual(h.auditIntegrity, 'verified');
  });

  it('overall health includes uptime and timestamp', () => {
    const h = healthChecks.overall();
    assert.strictEqual(h.status, 'healthy');
    assert.ok(h.uptime > 0);
    assert.ok(h.timestamp);
    assert.ok(h.checks.engine);
    assert.ok(h.checks.compliance);
  });
});
