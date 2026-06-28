/**
 * Tests for ingestion module.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { deduplicate } = require('./ingestion');

describe('deduplicate', () => {
  it('should remove duplicate transactions by source_ref', () => {
    const transactions = [
      { id: '1', source_ref: 'TXN_001', amount: 100 },
      { id: '2', source_ref: 'TXN_002', amount: 200 },
      { id: '3', source_ref: 'TXN_001', amount: 100 },
    ];
    const result = deduplicate(transactions);
    assert.strictEqual(result.length, 2);
  });

  it('should keep unique transactions', () => {
    const transactions = [
      { id: '1', source_ref: 'TXN_001', amount: 100 },
      { id: '2', source_ref: 'TXN_002', amount: 200 },
      { id: '3', source_ref: 'TXN_003', amount: 300 },
    ];
    const result = deduplicate(transactions);
    assert.strictEqual(result.length, 3);
  });

  it('should handle empty array', () => {
    const result = deduplicate([]);
    assert.strictEqual(result.length, 0);
  });

  it('should handle transactions without source_ref', () => {
    const transactions = [
      { id: '1', amount: 100 },
      { id: '1', amount: 100 },
    ];
    const result = deduplicate(transactions);
    // Uses id as fallback key
    assert.strictEqual(result.length, 1);
  });
});
