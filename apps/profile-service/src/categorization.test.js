/**
 * Tests for categorization engine.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { categorize, categorizeBatch, CATEGORY_RULES } = require('./categorization');

describe('categorize', () => {
  it('should categorize salary', () => {
    const result = categorize('SALARY AUG 2026');
    assert.strictEqual(result.name, 'salary');
    assert.strictEqual(result.discretionary, false);
  });

  it('should categorize rent', () => {
    const result = categorize('RENT PAYMENT');
    assert.strictEqual(result.name, 'rent');
    assert.strictEqual(result.discretionary, false);
  });

  it('should categorize groceries', () => {
    const result = categorize('BIG BASKET ORDER');
    assert.strictEqual(result.name, 'groceries');
    assert.strictEqual(result.discretionary, false);
  });

  it('should categorize dining', () => {
    const result = categorize('SWIGGY ORDER');
    assert.strictEqual(result.name, 'dining');
    assert.strictEqual(result.discretionary, true);
  });

  it('should categorize SIP', () => {
    const result = categorize('SIP AXIS BLUECHIP');
    assert.strictEqual(result.name, 'sip');
    assert.strictEqual(result.discretionary, false);
  });

  it('should categorize transport', () => {
    const result = categorize('UBER RIDE');
    assert.strictEqual(result.name, 'transport');
    assert.strictEqual(result.discretionary, true);
  });

  it('should categorize electricity', () => {
    const result = categorize('BESCOM ELECTRICITY');
    assert.strictEqual(result.name, 'utilities');
    assert.strictEqual(result.discretionary, false);
  });

  it('should categorize unknown as uncategorized', () => {
    const result = categorize('XYZ UNKNOWN MERCHANT');
    assert.strictEqual(result.name, 'uncategorized');
    assert.strictEqual(result.discretionary, true);
  });

  it('should handle empty description', () => {
    const result = categorize('');
    assert.strictEqual(result.name, 'uncategorized');
  });

  it('should handle null description', () => {
    const result = categorize(null);
    assert.strictEqual(result.name, 'uncategorized');
  });
});

describe('categorizeBatch', () => {
  it('should categorize multiple transactions', () => {
    const txns = [
      { id: '1', description: 'SALARY' },
      { id: '2', description: 'SWIGGY' },
      { id: '3', description: 'RENT' },
    ];
    const results = categorizeBatch(txns);
    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].name, 'salary');
    assert.strictEqual(results[1].name, 'dining');
    assert.strictEqual(results[2].name, 'rent');
  });
});

describe('CATEGORY_RULES', () => {
  it('should have rules defined', () => {
    assert.ok(CATEGORY_RULES.length > 0);
  });

  it('all rules should have pattern and category', () => {
    for (const rule of CATEGORY_RULES) {
      assert.ok(rule.pattern instanceof RegExp);
      assert.strictEqual(typeof rule.category, 'string');
      assert.strictEqual(typeof rule.discretionary, 'boolean');
    }
  });
});
