/**
 * Tests for recommendation engine.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  generateAllocationReco,
  matchProducts,
  generateIdleCashReco,
  generateTaxReco,
  generateRebalanceRecos,
  PRODUCT_CATALOG,
  ALLOCATION_MAP,
} = require('./engine');

describe('generateAllocationReco', () => {
  it('should generate conservative allocation', () => {
    const result = generateAllocationReco('conservative');
    assert.strictEqual(result.type, 'allocation');
    assert.strictEqual(result.payload.equity, 20);
    assert.strictEqual(result.payload.debt, 60);
    assert.strictEqual(result.payload.cash, 20);
    assert.ok(result.rationale);
  });

  it('should generate moderate allocation', () => {
    const result = generateAllocationReco('moderate');
    assert.strictEqual(result.payload.equity, 50);
    assert.strictEqual(result.payload.debt, 35);
    assert.strictEqual(result.payload.cash, 15);
  });

  it('should generate aggressive allocation', () => {
    const result = generateAllocationReco('aggressive');
    assert.strictEqual(result.payload.equity, 75);
    assert.strictEqual(result.payload.debt, 20);
    assert.strictEqual(result.payload.cash, 5);
  });
});

describe('matchProducts', () => {
  it('should match products for moderate risk', () => {
    const result = matchProducts('moderate', { equity: 50, debt: 35, cash: 15 });
    assert.ok(result.length >= 3);
    assert.ok(result.every((r) => r.type === 'product'));
  });

  it('should match conservative products for conservative risk', () => {
    const result = matchProducts('conservative', { equity: 20, debt: 60, cash: 20 });
    assert.ok(result.length >= 1);
    for (const reco of result) {
      assert.ok(reco.payload.productName);
      assert.ok(reco.payload.assetClass);
    }
  });
});

describe('generateIdleCashReco', () => {
  it('should generate idle cash reco for positive amount', () => {
    const result = generateIdleCashReco(50000, 'moderate');
    assert.ok(result);
    assert.strictEqual(result.type, 'idle_cash');
    assert.strictEqual(result.payload.amount, '50000');
    assert.ok(result.rationale.includes('50,000'));
  });

  it('should return null for zero amount', () => {
    const result = generateIdleCashReco(0, 'moderate');
    assert.strictEqual(result, null);
  });

  it('should return null for negative amount', () => {
    const result = generateIdleCashReco(-1000, 'moderate');
    assert.strictEqual(result, null);
  });
});

describe('generateTaxReco', () => {
  it('should generate 80C reco when remaining', () => {
    const result = generateTaxReco({ remaining80c: 50000, riskBand: 'moderate' });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].type, 'tax');
    assert.strictEqual(result[0].payload.category, '80c');
    assert.strictEqual(result[0].payload.remaining, '50000');
  });

  it('should return empty when 80C fully used', () => {
    const result = generateTaxReco({ remaining80c: 0, riskBand: 'moderate' });
    assert.strictEqual(result.length, 0);
  });
});

describe('generateRebalanceRecos', () => {
  it('should generate rebalance recos from deltas', () => {
    const deltas = [
      { asset_class: 'equity', action: 'sell', amount: '50000' },
      { asset_class: 'debt', action: 'buy', amount: '30000' },
    ];
    const result = generateRebalanceRecos(deltas);
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].type, 'rebalance');
    assert.strictEqual(result[0].payload.action, 'sell');
  });
});

describe('PRODUCT_CATALOG', () => {
  it('should have products defined', () => {
    assert.ok(PRODUCT_CATALOG.length > 0);
  });

  it('all products should have required fields', () => {
    for (const p of PRODUCT_CATALOG) {
      assert.ok(p.id);
      assert.ok(p.name);
      assert.ok(p.assetClass);
      assert.ok(p.riskBand);
      assert.ok(p.minInvestment);
    }
  });
});

describe('ALLOCATION_MAP', () => {
  it('all allocations should sum to 100', () => {
    for (const [band, alloc] of Object.entries(ALLOCATION_MAP)) {
      const total = alloc.equity + alloc.debt + alloc.cash;
      assert.strictEqual(total, 100, `${band} allocation sums to ${total}`);
    }
  });
});
