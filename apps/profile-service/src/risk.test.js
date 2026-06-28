/**
 * Tests for risk assessment module.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { computeRiskScore, getBand, isRiskAssessmentValid, RISK_QUESTIONS } = require('./risk');

describe('computeRiskScore', () => {
  it('should compute score for conservative answers', () => {
    const answers = [
      { qid: 'q1', value: 1 }, // 55+ age
      { qid: 'q2', value: 1 }, // <1 year horizon
      { qid: 'q3', value: 1 }, // Sell everything
      { qid: 'q4', value: 2 }, // <10% income
      { qid: 'q5', value: 1 }, // No emergency fund
      { qid: 'q6', value: 1 }, // Capital preservation
      { qid: 'q7', value: 1 }, // No experience
    ];
    const result = computeRiskScore(answers);
    assert.ok(result.score >= 0 && result.score <= 100);
    assert.strictEqual(result.band, 'conservative');
    assert.ok(result.validUntil);
  });

  it('should compute score for aggressive answers', () => {
    const answers = [
      { qid: 'q1', value: 3 }, // 18-25
      { qid: 'q2', value: 8 }, // >10 years
      { qid: 'q3', value: 8 }, // Buy more on drop
      { qid: 'q4', value: 8 }, // >30% income
      { qid: 'q5', value: 6 }, // Fully funded emergency
      { qid: 'q6', value: 8 }, // Aggressive growth
      { qid: 'q7', value: 7 }, // Extensive experience
    ];
    const result = computeRiskScore(answers);
    assert.ok(result.score >= 0 && result.score <= 100);
    assert.strictEqual(result.band, 'aggressive');
  });

  it('should return validUntil 1 year from now', () => {
    const result = computeRiskScore([{ qid: 'q1', value: 3 }]);
    const validUntil = new Date(result.validUntil);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    assert.ok(Math.abs(validUntil - oneYearFromNow) < 86400000); // Within 1 day
  });

  it('should handle empty answers', () => {
    const result = computeRiskScore([]);
    assert.ok(result.score >= 0 && result.score <= 100);
  });
});

describe('getBand', () => {
  it('should return conservative for low scores', () => {
    assert.strictEqual(getBand(0), 'conservative');
    assert.strictEqual(getBand(30), 'conservative');
  });

  it('should return moderate for mid scores', () => {
    assert.strictEqual(getBand(31), 'moderate');
    assert.strictEqual(getBand(60), 'moderate');
  });

  it('should return aggressive for high scores', () => {
    assert.strictEqual(getBand(61), 'aggressive');
    assert.strictEqual(getBand(100), 'aggressive');
  });
});

describe('isRiskAssessmentValid', () => {
  it('should return true for future date', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    assert.strictEqual(isRiskAssessmentValid(future.toISOString().split('T')[0]), true);
  });

  it('should return false for past date', () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    assert.strictEqual(isRiskAssessmentValid(past.toISOString().split('T')[0]), false);
  });
});

describe('RISK_QUESTIONS', () => {
  it('should have 7 questions', () => {
    assert.strictEqual(RISK_QUESTIONS.length, 7);
  });

  it('all questions should have id, text, options', () => {
    for (const q of RISK_QUESTIONS) {
      assert.strictEqual(typeof q.id, 'string');
      assert.strictEqual(typeof q.text, 'string');
      assert.ok(typeof q.options === 'object' && q.options !== null);
    }
  });
});
