const { COLORS, SPACING, BORDER_RADIUS, SHADOW } = require('./theme');

function renderNudgeCard(nudge) {
  return {
    type: 'view',
    style: {
      backgroundColor: COLORS.card.nudge,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOW.sm,
    },
    children: [
      { type: 'text', style: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary }, text: nudge.title || 'Tip' },
      { type: 'text', style: { fontSize: 13, color: COLORS.text.secondary, marginTop: SPACING.xs }, text: nudge.message || '' },
      nudge.cta ? { type: 'button', style: { backgroundColor: COLORS.primary, color: COLORS.text.inverse, borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.sm, textAlign: 'center' }, text: nudge.cta } : null,
    ].filter(Boolean),
  };
}

function renderRecommendationCard(reco) {
  return {
    type: 'view',
    style: {
      backgroundColor: COLORS.card.recommendation,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOW.sm,
    },
    children: [
      { type: 'text', style: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary }, text: reco.title || 'Recommendation' },
      { type: 'text', style: { fontSize: 13, color: COLORS.text.secondary, marginTop: SPACING.xs }, text: reco.rationale || '' },
      { type: 'text', style: { fontSize: 16, fontWeight: '700', color: COLORS.success, marginTop: SPACING.sm }, text: reco.amount || '' },
      { type: 'text', style: { fontSize: 11, color: COLORS.text.disabled, marginTop: SPACING.xs }, text: reco.disclaimer || '' },
    ],
  };
}

function renderGoalCard(goal) {
  const progress = goal.progress || 0;
  return {
    type: 'view',
    style: {
      backgroundColor: COLORS.card.goal,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOW.sm,
    },
    children: [
      { type: 'text', style: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary }, text: goal.name || 'Goal' },
      { type: 'view', style: { backgroundColor: COLORS.border, height: 8, borderRadius: BORDER_RADIUS.sm, marginTop: SPACING.sm },
        children: [{ type: 'view', style: { backgroundColor: COLORS.primary, height: 8, borderRadius: BORDER_RADIUS.sm, width: `${Math.min(100, Math.max(0, progress))}%` } }],
      },
      { type: 'text', style: { fontSize: 12, color: COLORS.text.secondary, marginTop: SPACING.xs }, text: `${progress}% of target` },
    ],
  };
}

function renderChartCard(chart) {
  return {
    type: 'view',
    style: {
      backgroundColor: COLORS.card.chart,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOW.sm,
    },
    children: [
      { type: 'text', style: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary }, text: chart.title || 'Chart' },
      { type: 'view', style: { height: 120, marginTop: SPACING.sm },
        children: chart.data ? [{ type: 'chart', data: chart.data }] : [],
      },
    ],
  };
}

function renderExplainerCard(explainer) {
  return {
    type: 'view',
    style: {
      backgroundColor: COLORS.card.explainer,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOW.sm,
    },
    children: [
      { type: 'text', style: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary }, text: explainer.title || 'Did you know?' },
      { type: 'text', style: { fontSize: 13, color: COLORS.text.secondary, marginTop: SPACING.xs, lineHeight: 20 }, text: explainer.text || '' },
    ],
  };
}

function renderInsightCard(insight) {
  return {
    type: 'view',
    style: {
      backgroundColor: COLORS.card.insight,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.md,
      ...SHADOW.sm,
    },
    children: [
      { type: 'text', style: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary }, text: insight.title || 'Insight' },
      { type: 'text', style: { fontSize: 13, color: COLORS.text.secondary, marginTop: SPACING.xs }, text: insight.summary || '' },
      insight.metric ? { type: 'text', style: { fontSize: 20, fontWeight: '700', color: COLORS.primary, marginTop: SPACING.sm }, text: insight.metric } : null,
    ].filter(Boolean),
  };
}

const CARD_RENDERERS = {
  nudge: renderNudgeCard,
  recommendation: renderRecommendationCard,
  goal: renderGoalCard,
  chart: renderChartCard,
  explainer: renderExplainerCard,
  insight: renderInsightCard,
};

function renderCard(kind, data) {
  const renderer = CARD_RENDERERS[kind];
  if (!renderer) return null;
  return renderer(data);
}

module.exports = { renderCard, CARD_RENDERERS, renderNudgeCard, renderRecommendationCard, renderGoalCard, renderChartCard, renderExplainerCard, renderInsightCard };
