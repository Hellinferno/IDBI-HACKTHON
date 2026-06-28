const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, THEME, renderCard, CARD_RENDERERS, createLayout, formatCurrency, formatPercent, formatDate } = require('./index');

describe('Theme', () => {
  it('should have primary color', () => {
    assert.ok(COLORS.primary);
  });

  it('should have all text colors', () => {
    assert.ok(COLORS.text.primary);
    assert.ok(COLORS.text.secondary);
    assert.ok(COLORS.text.disabled);
    assert.ok(COLORS.text.inverse);
  });

  it('should have spacing scale', () => {
    assert.ok(SPACING.xs < SPACING.sm);
    assert.ok(SPACING.sm < SPACING.md);
    assert.ok(SPACING.md < SPACING.lg);
    assert.ok(SPACING.lg < SPACING.xl);
  });

  it('should have typography', () => {
    assert.ok(TYPOGRAPHY.h1);
    assert.ok(TYPOGRAPHY.body);
    assert.ok(TYPOGRAPHY.caption);
  });

  it('should have border radius', () => {
    assert.ok(BORDER_RADIUS.sm < BORDER_RADIUS.md);
    assert.ok(BORDER_RADIUS.md < BORDER_RADIUS.lg);
  });

  it('should have shadow levels', () => {
    assert.ok(THEME.SHADOW.sm);
    assert.ok(THEME.SHADOW.md);
    assert.ok(THEME.SHADOW.lg);
  });

  it('should have orb state colors', () => {
    assert.ok(COLORS.orb.idle);
    assert.ok(COLORS.orb.listening);
    assert.ok(COLORS.orb.thinking);
    assert.ok(COLORS.orb.speaking);
    assert.ok(COLORS.orb.alert);
    assert.ok(COLORS.orb.celebrate);
  });

  it('should have card background colors', () => {
    assert.ok(COLORS.card.nudge);
    assert.ok(COLORS.card.recommendation);
    assert.ok(COLORS.card.goal);
    assert.ok(COLORS.card.chart);
    assert.ok(COLORS.card.explainer);
    assert.ok(COLORS.card.insight);
  });
});

describe('Card Renderers', () => {
  it('should have 6 card renderers', () => {
    assert.equal(Object.keys(CARD_RENDERERS).length, 6);
  });

  it('should render nudge card', () => {
    const card = renderCard('nudge', { title: 'Tip', message: 'Save more', cta: 'Start SIP' });
    assert.ok(card);
    assert.equal(card.type, 'view');
    assert.ok(card.children.length >= 2);
  });

  it('should render recommendation card', () => {
    const card = renderCard('recommendation', { title: 'Invest', rationale: 'Good time', amount: '₹10,000' });
    assert.ok(card);
    assert.equal(card.type, 'view');
  });

  it('should render goal card', () => {
    const card = renderCard('goal', { name: 'Retirement', progress: 45 });
    assert.ok(card);
    assert.equal(card.type, 'view');
  });

  it('should render chart card', () => {
    const card = renderCard('chart', { title: 'Spending', data: [10, 20, 30] });
    assert.ok(card);
    assert.equal(card.type, 'view');
  });

  it('should render explainer card', () => {
    const card = renderCard('explainer', { title: 'Did you know?', text: 'SIPs help' });
    assert.ok(card);
    assert.equal(card.type, 'view');
  });

  it('should render insight card', () => {
    const card = renderCard('insight', { title: 'Savings', summary: 'Good job', metric: '25%' });
    assert.ok(card);
    assert.equal(card.type, 'view');
  });

  it('should return null for unknown card kind', () => {
    const card = renderCard('unknown', {});
    assert.equal(card, null);
  });

  it('should handle nudge without cta', () => {
    const card = renderCard('nudge', { title: 'Tip', message: 'Save' });
    assert.ok(card);
    assert.equal(card.children.length, 2);
  });

  it('should handle goal without progress', () => {
    const card = renderCard('goal', { name: 'Goal' });
    assert.ok(card);
  });

  it('should handle insight without metric', () => {
    const card = renderCard('insight', { title: 'Insight', summary: 'Text' });
    assert.ok(card);
    assert.equal(card.children.length, 2);
  });
});

describe('Layout', () => {
  it('should create layout with container width', () => {
    const layout = createLayout(360);
    assert.ok(layout.row);
    assert.ok(layout.column);
    assert.ok(layout.stack);
    assert.ok(layout.center);
    assert.ok(layout.spacer);
  });

  it('should create row with columns', () => {
    const layout = createLayout(360);
    const row = layout.row(6);
    assert.equal(row.type, 'view');
    assert.ok(row.style.flexDirection === 'row');
  });

  it('should create column with span', () => {
    const layout = createLayout(360);
    const col = layout.column(4);
    assert.equal(col.type, 'view');
    assert.ok(col.style.width > 0);
  });

  it('should create stack with gap', () => {
    const layout = createLayout(360);
    const stack = layout.stack(12);
    assert.equal(stack.type, 'view');
    assert.equal(stack.style.gap, 12);
  });

  it('should create spacer', () => {
    const layout = createLayout(360);
    const spacer = layout.spacer(20);
    assert.equal(spacer.type, 'view');
    assert.equal(spacer.style.height, 20);
  });
});

describe('Formatters', () => {
  it('should format currency', () => {
    assert.equal(formatCurrency(12500), '₹12,500.00');
    assert.equal(formatCurrency('85000.50'), '₹85,000.50');
  });

  it('should format currency with custom symbol', () => {
    assert.equal(formatCurrency(1000, '$'), '$1,000.00');
  });

  it('should handle NaN currency', () => {
    assert.equal(formatCurrency('abc'), '₹0.00');
  });

  it('should format percent', () => {
    assert.equal(formatPercent(25.9), '25.9%');
    assert.equal(formatPercent('12.5'), '12.5%');
  });

  it('should handle NaN percent', () => {
    assert.equal(formatPercent('abc'), '0.0%');
  });

  it('should format date', () => {
    const result = formatDate('2026-06-25');
    assert.ok(result.includes('Jun') || result.includes('25'));
  });

  it('should handle null date', () => {
    assert.equal(formatDate(null), '');
    assert.equal(formatDate(''), '');
  });
});
