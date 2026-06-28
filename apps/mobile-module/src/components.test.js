/**
 * Tests for Card Components.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  CARD_TYPES,
  createNudgeCard,
  createRecommendationCard,
  createGoalCard,
  createChartCard,
  createExplainerCard,
  createInsightCard,
  validateCard,
} = require('./components');

describe('CARD_TYPES', () => {
  it('should have 6 card types', () => {
    assert.strictEqual(Object.keys(CARD_TYPES).length, 6);
  });

  it('should have nudge type', () => {
    assert.ok(CARD_TYPES.nudge);
    assert.ok(CARD_TYPES.nudge.fields.includes('title'));
    assert.ok(CARD_TYPES.nudge.fields.includes('body'));
  });

  it('should have recommendation type', () => {
    assert.ok(CARD_TYPES.recommendation);
    assert.ok(CARD_TYPES.recommendation.alwaysShowDisclaimer);
  });

  it('should have goal type', () => {
    assert.ok(CARD_TYPES.goal);
    assert.ok(CARD_TYPES.goal.fields.includes('target'));
  });

  it('should have chart type', () => {
    assert.ok(CARD_TYPES.chart);
  });

  it('should have explainer type', () => {
    assert.ok(CARD_TYPES.explainer);
    assert.ok(CARD_TYPES.explainer.fields.includes('steps'));
  });

  it('should have insight type', () => {
    assert.ok(CARD_TYPES.insight);
  });
});

describe('createNudgeCard', () => {
  it('should create a nudge card', () => {
    const card = createNudgeCard({ title: 'Idle Cash', body: 'You have ₹50,000 idle', urgency: 'high' });
    assert.strictEqual(card.kind, 'nudge');
    assert.strictEqual(card.title, 'Idle Cash');
    assert.strictEqual(card.body, 'You have ₹50,000 idle');
    assert.strictEqual(card.urgency, 'high');
    assert.ok(card.id);
    assert.ok(card.createdAt);
  });

  it('should default urgency to normal', () => {
    const card = createNudgeCard({ title: 'Test', body: 'Test body' });
    assert.strictEqual(card.urgency, 'normal');
  });
});

describe('createRecommendationCard', () => {
  it('should create a recommendation card', () => {
    const card = createRecommendationCard({
      product: 'HDFC Mid-Cap Fund',
      rationale: 'Good for growth',
      suitability: 'passed',
      disclaimer: 'Market risks apply',
    });
    assert.strictEqual(card.kind, 'recommendation');
    assert.strictEqual(card.suitability, 'passed');
    assert.ok(card.disclaimer);
  });
});

describe('createGoalCard', () => {
  it('should create a goal card', () => {
    const card = createGoalCard({
      name: 'Retirement',
      target: '5000000',
      corpus: '3000000',
      gap: '2000000',
      onTrack: false,
    });
    assert.strictEqual(card.kind, 'goal');
    assert.strictEqual(card.name, 'Retirement');
    assert.strictEqual(card.onTrack, false);
  });
});

describe('createChartCard', () => {
  it('should create a chart card', () => {
    const card = createChartCard({
      series: [{ label: 'Equity', value: 50 }],
      type: 'donut',
      caption: 'Asset Allocation',
    });
    assert.strictEqual(card.kind, 'chart');
    assert.strictEqual(card.type, 'donut');
  });
});

describe('createExplainerCard', () => {
  it('should create an explainer card', () => {
    const card = createExplainerCard({
      number: '5030491',
      steps: [{ label: 'Inflated target', value: '5030491' }],
    });
    assert.strictEqual(card.kind, 'explainer');
    assert.ok(card.steps.length > 0);
  });
});

describe('createInsightCard', () => {
  it('should create an insight card', () => {
    const card = createInsightCard({
      pattern: 'Dining spend increased 20%',
      personality: 'balanced',
      summary: 'Consider budgeting for dining',
    });
    assert.strictEqual(card.kind, 'insight');
  });
});

describe('validateCard', () => {
  it('should validate a valid nudge card', () => {
    const card = createNudgeCard({ title: 'Test', body: 'Test body' });
    const result = validateCard(card);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  it('should invalidate a card with missing fields', () => {
    const result = validateCard({ kind: 'nudge' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
  });

  it('should invalidate unknown card kind', () => {
    const result = validateCard({ kind: 'unknown' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors[0].includes('Unknown'));
  });

  it('should require disclaimer for recommendation', () => {
    const result = validateCard({
      kind: 'recommendation',
      product: 'Fund',
      rationale: 'Good',
      suitability: 'passed',
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('Disclaimer')));
  });
});
