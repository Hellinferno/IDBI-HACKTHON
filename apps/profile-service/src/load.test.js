/**
 * Load and performance tests for profile service.
 * Benchmarks categorization, risk scoring, profiling.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { categorize } = require('./categorization');
const { computeRiskScore } = require('./risk');
const { buildProfile, aggregateMonthly } = require('./profiling');

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

const SAMPLE_TX = { description: 'SWIGGY RESTAURANT', amount: 450, date: '2025-01-15' };
const RISK_ANSWERS = [
  { qid: 'q1', value: 5 },
  { qid: 'q2', value: 6 },
  { qid: 'q3', value: 3 },
  { qid: 'q4', value: 5 },
  { qid: 'q5', value: 3 },
  { qid: 'q6', value: 4 },
  { qid: 'q7', value: 3 },
];

describe('Load: Categorization', () => {
  it('should handle 10k categorizations with p99 < 1ms', () => {
    const stats = bench(() => categorize(SAMPLE_TX.description));
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Risk Scoring', () => {
  it('should handle 5k risk assessments with p99 < 1ms', () => {
    const stats = bench(() => computeRiskScore(RISK_ANSWERS), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Profile Building', () => {
  it('should handle 5k profile builds with p99 < 1ms', () => {
    const stats = bench(() => buildProfile({
      monthlyIncome: 85000,
      recurring: 45000,
      discretionary: 15000,
      savingsRate: 29.4,
      age: 30,
      hasSip: true,
    }), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Aggregate Monthly', () => {
  const transactions = Array.from({ length: 100 }, (_, i) => ({
    description: `TX ${i}`,
    amount: 100 + i * 10,
    date: '2025-01-15',
    category: i % 3 === 0 ? 'groceries' : i % 3 === 1 ? 'salary' : 'entertainment',
  }));

  it('should handle 1k aggregations of 100 transactions with p99 < 5ms', () => {
    const stats = bench(() => aggregateMonthly(transactions), 1000);
    assert.ok(stats.p99 < 5.0, `p99=${stats.p99.toFixed(3)}ms exceeds 5ms`);
  });
});

describe('Load: Determinism', () => {
  it('risk scoring should be deterministic across 1k runs', () => {
    const expected = computeRiskScore(RISK_ANSWERS);
    for (let i = 0; i < 1000; i++) {
      const result = computeRiskScore(RISK_ANSWERS);
      assert.deepStrictEqual(result.score, expected.score);
      assert.strictEqual(result.band, expected.band);
    }
  });

  it('categorization should be deterministic across 1k runs', () => {
    const expected = categorize(SAMPLE_TX.description);
    for (let i = 0; i < 1000; i++) {
      const result = categorize(SAMPLE_TX.description);
      assert.deepStrictEqual(result, expected);
    }
  });
});
