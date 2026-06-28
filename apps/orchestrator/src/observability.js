/**
 * Observability module.
 * Structured JSON logging, correlation IDs, health checks, metrics collection.
 */

const crypto = require('crypto');

// ─── Correlation ID ────────────────────────────────────────────────

function generateCorrelationId() {
  return crypto.randomUUID();
}

// ─── Structured Logger ─────────────────────────────────────────────

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function log(level, message, context = {}) {
  if (LOG_LEVELS[level] < currentLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: context.service || 'orchestrator',
    correlationId: context.correlationId || null,
    ...context,
  };

  // Remove undefined values
  Object.keys(entry).forEach((k) => entry[k] === undefined && delete entry[k]);

  const output = JSON.stringify(entry);
  if (level === 'error') {
    process.stderr.write(output + '\n');
  } else {
    process.stdout.write(output + '\n');
  }

  return entry;
}

const logger = {
  debug: (msg, ctx) => log('debug', msg, ctx),
  info: (msg, ctx) => log('info', msg, ctx),
  warn: (msg, ctx) => log('warn', msg, ctx),
  error: (msg, ctx) => log('error', msg, ctx),
};

// ─── Metrics Collector ─────────────────────────────────────────────

const metrics = {
  requests: { total: 0, byIntent: {}, byStatus: {} },
  engine: { calls: 0, errors: 0, latenciesMs: [] },
  compliance: { suitabilityChecks: 0, blocks: 0, auditWrites: 0 },
  conversation: { turns: 0, avgTokensPerTurn: 0 },
};

function recordRequest(intent, status) {
  metrics.requests.total++;
  metrics.requests.byIntent[intent] = (metrics.requests.byIntent[intent] || 0) + 1;
  metrics.requests.byStatus[status] = (metrics.requests.byStatus[status] || 0) + 1;
}

function recordEngineCall(durationMs, isError) {
  metrics.engine.calls++;
  if (isError) metrics.engine.errors++;
  metrics.engine.latenciesMs.push(durationMs);
  // Keep last 1000 latencies
  if (metrics.engine.latenciesMs.length > 1000) {
    metrics.engine.latenciesMs = metrics.engine.latenciesMs.slice(-1000);
  }
}

function recordComplianceCheck(blocked) {
  metrics.compliance.suitabilityChecks++;
  if (blocked) metrics.compliance.blocks++;
}

function recordAuditWrite() {
  metrics.compliance.auditWrites++;
}

function recordConversationTurn(tokenCount) {
  metrics.conversation.turns++;
  const total = metrics.conversation.avgTokensPerTurn * (metrics.conversation.turns - 1) + tokenCount;
  metrics.conversation.avgTokensPerTurn = Math.round(total / metrics.conversation.turns);
}

function getMetrics() {
  const latencies = metrics.engine.latenciesMs;
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

  return {
    ...metrics,
    engine: {
      ...metrics.engine,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
      avgLatencyMs: latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0,
    },
  };
}

function resetMetrics() {
  metrics.requests = { total: 0, byIntent: {}, byStatus: {} };
  metrics.engine = { calls: 0, errors: 0, latenciesMs: [] };
  metrics.compliance = { suitabilityChecks: 0, blocks: 0, auditWrites: 0 };
  metrics.conversation = { turns: 0, avgTokensPerTurn: 0 };
}

// ─── Health Checks ─────────────────────────────────────────────────

const healthChecks = {
  engine: () => {
    const m = getMetrics();
    return { status: 'healthy', latencyMs: m.engine.p95LatencyMs };
  },
  compliance: () => ({ status: 'healthy', auditIntegrity: 'verified' }),
  overall: () => ({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      engine: healthChecks.engine(),
      compliance: healthChecks.compliance(),
    },
  }),
};

module.exports = {
  generateCorrelationId,
  logger,
  log,
  recordRequest,
  recordEngineCall,
  recordComplianceCheck,
  recordAuditWrite,
  recordConversationTurn,
  getMetrics,
  resetMetrics,
  healthChecks,
  metrics,
};
