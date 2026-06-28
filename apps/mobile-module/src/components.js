/**
 * Card Components.
 * Primary content units for the WealthOrb UI.
 * Cards appear in conversation and on Home screen.
 */

/**
 * Card type definitions.
 * Each card has a kind, data shape, and rendering rules.
 */
const CARD_TYPES = {
  nudge: {
    kind: 'nudge',
    fields: ['title', 'body', 'cta', 'urgency'],
    required: ['title', 'body'],
    description: 'Proactive nudge card (idle cash, missed SIP, overspend, etc.)',
    maxOnHome: 3,
  },
  recommendation: {
    kind: 'recommendation',
    fields: ['product', 'rationale', 'suitability', 'disclaimer'],
    required: ['product', 'rationale', 'suitability'],
    description: 'Product recommendation with suitability badge and disclaimer',
    alwaysShowDisclaimer: true,
  },
  goal: {
    kind: 'goal',
    fields: ['name', 'target', 'corpus', 'gap', 'progress'],
    required: ['name', 'target', 'corpus', 'gap'],
    description: 'Goal progress card with corpus, gap, and progress',
  },
  chart: {
    kind: 'chart',
    fields: ['series', 'type', 'caption'],
    required: ['series', 'type', 'caption'],
    description: 'Chart card (allocation donut, spend breakdown, etc.)',
  },
  explainer: {
    kind: 'explainer',
    fields: ['number', 'steps', 'breakdown'],
    required: ['number'],
    description: '"Why" breakdown of a number - tappable from any number',
  },
  insight: {
    kind: 'insight',
    fields: ['pattern', 'personality', 'summary'],
    required: ['pattern', 'personality', 'summary'],
    description: 'Spend pattern / personality insight',
  },
};

/**
 * Create a nudge card.
 * @param {object} data
 * @returns {object}
 */
function createNudgeCard(data) {
  return {
    kind: 'nudge',
    id: `card_nudge_${Date.now()}`,
    title: data.title,
    body: data.body,
    cta: data.cta || null,
    urgency: data.urgency || 'normal',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a recommendation card.
 * @param {object} data
 * @returns {object}
 */
function createRecommendationCard(data) {
  return {
    kind: 'recommendation',
    id: `card_reco_${Date.now()}`,
    product: data.product,
    rationale: data.rationale,
    suitability: data.suitability || 'pending',
    disclaimer: data.disclaimer || 'This is a suggestion based on your profile.',
    computationInputs: data.computationInputs || null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a goal card.
 * @param {object} data
 * @returns {object}
 */
function createGoalCard(data) {
  return {
    kind: 'goal',
    id: `card_goal_${Date.now()}`,
    name: data.name,
    target: data.target,
    corpus: data.corpus,
    gap: data.gap,
    progress: data.progress || 0,
    onTrack: data.onTrack || false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a chart card.
 * @param {object} data
 * @returns {object}
 */
function createChartCard(data) {
  return {
    kind: 'chart',
    id: `card_chart_${Date.now()}`,
    series: data.series || [],
    type: data.type || 'donut',
    caption: data.caption || '',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an explainer card.
 * @param {object} data
 * @returns {object}
 */
function createExplainerCard(data) {
  return {
    kind: 'explainer',
    id: `card_explain_${Date.now()}`,
    number: data.number,
    steps: data.steps || [],
    breakdown: data.breakdown || [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an insight card.
 * @param {object} data
 * @returns {object}
 */
function createInsightCard(data) {
  return {
    kind: 'insight',
    id: `card_insight_${Date.now()}`,
    pattern: data.pattern,
    personality: data.personality,
    summary: data.summary,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Validate a card against its type schema.
 * @param {object} card
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateCard(card) {
  const errors = [];
  const typeDef = CARD_TYPES[card.kind];

  if (!typeDef) {
    return { valid: false, errors: [`Unknown card kind: ${card.kind}`] };
  }

  for (const field of typeDef.required || typeDef.fields) {
    if (card[field] === undefined || card[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (typeDef.alwaysShowDisclaimer && !card.disclaimer) {
    errors.push('Disclaimer required for recommendation cards');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  CARD_TYPES,
  createNudgeCard,
  createRecommendationCard,
  createGoalCard,
  createChartCard,
  createExplainerCard,
  createInsightCard,
  validateCard,
};
