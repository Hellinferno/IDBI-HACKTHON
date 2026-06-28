/**
 * Tests for intent classification.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { classifyIntent, INTENT_PATTERNS } = require('./intent');

describe('classifyIntent', () => {
  it('should classify goal creation intent', () => {
    const result = classifyIntent('I want to create a goal for retirement');
    assert.strictEqual(result.intent, 'goal_create');
    assert.strictEqual(result.requiresComputation, true);
  });

  it('should classify goal status intent', () => {
    const result = classifyIntent('How is my goal progress?');
    assert.strictEqual(result.intent, 'goal_status');
    assert.strictEqual(result.requiresComputation, true);
  });

  it('should classify what-if intent', () => {
    const result = classifyIntent('What if I increase my contribution to 15000?');
    assert.strictEqual(result.intent, 'what_if');
    assert.strictEqual(result.requiresComputation, true);
  });

  it('should classify portfolio intent', () => {
    const result = classifyIntent('Show me my portfolio');
    assert.strictEqual(result.intent, 'portfolio');
    assert.strictEqual(result.requiresComputation, false);
  });

  it('should classify spending intent', () => {
    const result = classifyIntent('Where did I spend money last month?');
    assert.strictEqual(result.intent, 'spending');
  });

  it('should classify allocation intent', () => {
    const result = classifyIntent('How much should I invest in equity and debt funds?');
    assert.strictEqual(result.intent, 'allocation');
    assert.strictEqual(result.requiresComputation, true);
  });

  it('should classify idle cash intent', () => {
    const result = classifyIntent('I have too much cash sitting in savings');
    assert.strictEqual(result.intent, 'idle_cash');
    assert.strictEqual(result.requiresComputation, true);
  });

  it('should classify tax intent', () => {
    const result = classifyIntent('How can I save tax under 80C?');
    assert.strictEqual(result.intent, 'tax');
    assert.strictEqual(result.requiresComputation, true);
  });

  it('should classify greeting intent', () => {
    const result = classifyIntent('Hello');
    assert.strictEqual(result.intent, 'greeting');
    assert.strictEqual(result.requiresComputation, false);
  });

  it('should classify help intent', () => {
    const result = classifyIntent('What can you do?');
    assert.strictEqual(result.intent, 'help');
    assert.strictEqual(result.requiresComputation, false);
  });

  it('should classify general intent for unknown messages', () => {
    const result = classifyIntent('tell me about cricket');
    assert.strictEqual(result.intent, 'general');
    assert.strictEqual(result.requiresComputation, false);
    assert.strictEqual(result.confidence, 0.5);
  });

  it('should handle empty message', () => {
    const result = classifyIntent('');
    assert.strictEqual(result.intent, 'general');
  });

  it('should handle null message', () => {
    const result = classifyIntent(null);
    assert.strictEqual(result.intent, 'general');
  });
});

describe('INTENT_PATTERNS', () => {
  it('should have patterns defined', () => {
    assert.ok(INTENT_PATTERNS.length > 0);
  });

  it('all patterns should have intent, patterns, requiresComputation', () => {
    for (const p of INTENT_PATTERNS) {
      assert.strictEqual(typeof p.intent, 'string');
      assert.ok(p.patterns instanceof RegExp);
      assert.strictEqual(typeof p.requiresComputation, 'boolean');
    }
  });
});
