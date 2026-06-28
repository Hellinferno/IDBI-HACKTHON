/**
 * Load and performance tests for reco service.
 * Benchmarks recommendation generation, product matching.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  generateAllocationReco,
  matchProducts,
  generateIdleCashReco,
  generateTaxReco,
  generateRebalanceRecos,
} = require('./engine');

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

describe('Load: Allocation Reco', () => {
  it('should handle 10k allocation reco generations with p99 < 1ms', () => {
    const stats = bench(() => generateAllocationReco('moderate'));
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Product Matching', () => {
  it('should handle 5k product matches with p99 < 1ms', () => {
    const alloc = generateAllocationReco('moderate');
    const stats = bench(() => matchProducts('moderate', alloc.payload), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Idle Cash Reco', () => {
  it('should handle 5k idle cash reco generations with p99 < 1ms', () => {
    const stats = bench(() => generateIdleCashReco(200000, 'moderate'), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Tax Reco', () => {
  it('should handle 5k tax reco generations with p99 < 1ms', () => {
    const stats = bench(() => generateTaxReco({ remaining80c: 50000, riskBand: 'moderate' }), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Rebalance Reco', () => {
  it('should handle 5k rebalance reco generations with p99 < 1ms', () => {
    const deltas = [
      { asset_class: 'equity', action: 'buy', amount: '50000' },
      { asset_class: 'debt', action: 'sell', amount: '30000' },
    ];
    const stats = bench(() => generateRebalanceRecos(deltas), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: Full Recommendation Pipeline', () => {
  it('should generate full reco set in < 5ms p99', () => {
    const stats = bench(() => {
      const alloc = generateAllocationReco('moderate');
      const products = matchProducts('moderate', alloc.payload);
      const idle = generateIdleCashReco(200000, 'moderate');
      const tax = generateTaxReco({ remaining80c: 50000, riskBand: 'moderate' });
      return { alloc, products, idle, tax };
    }, 2000);
    assert.ok(stats.p99 < 5.0, `Full pipeline p99=${stats.p99.toFixed(3)}ms exceeds 5ms`);
  });
});

describe('Load: Determinism', () => {
  it('allocation reco should be deterministic across 1k runs', () => {
    const expected = generateAllocationReco('moderate');
    for (let i = 0; i < 1000; i++) {
      const result = generateAllocationReco('moderate');
      assert.deepStrictEqual(result, expected);
    }
  });

  it('product matching should be deterministic across 1k runs', () => {
    const alloc = generateAllocationReco('moderate');
    const expected = matchProducts('moderate', alloc.payload);
    for (let i = 0; i < 1000; i++) {
      const result = matchProducts('moderate', alloc.payload);
      assert.deepStrictEqual(result, expected);
    }
  });
});
