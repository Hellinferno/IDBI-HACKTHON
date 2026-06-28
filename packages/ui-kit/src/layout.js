const { SPACING } = require('./theme');

function createLayout(containerWidth) {
  const gutter = SPACING.md;
  const columnWidth = (containerWidth - gutter * 2) / 12;

  return {
    row: (columns, offset = 0) => ({
      type: 'view',
      style: {
        flexDirection: 'row',
        marginLeft: offset * columnWidth,
        width: columns * columnWidth,
      },
    }),
    column: (span, offset = 0) => ({
      type: 'view',
      style: {
        width: span * columnWidth,
        marginLeft: offset * columnWidth,
      },
    }),
    stack: (gap = SPACING.sm) => ({
      type: 'view',
      style: { flexDirection: 'column', gap },
    }),
    center: () => ({
      type: 'view',
      style: { alignItems: 'center', justifyContent: 'center' },
    }),
    spacer: (height = SPACING.md) => ({
      type: 'view',
      style: { height },
    }),
  };
}

function formatCurrency(amount, currency = '₹') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency}0.00`;
  const formatted = num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency}${formatted}`;
}

function formatPercent(value) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.0%';
  return `${num.toFixed(1)}%`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

module.exports = { createLayout, formatCurrency, formatPercent, formatDate };
