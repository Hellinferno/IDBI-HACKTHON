/**
 * Accessibility helpers.
 * Screen-reader labels, live-region politeness, reduced-motion handling,
 * and tap-target checks for the embedded module.
 */

const { t } = require('./i18n');

const MIN_TAP_TARGET = 44; // dp - WCAG 2.5.5 / Material guidance

// Live-region politeness per orb state. Speaking is 'off' because the
// streamed tokens are announced as text, not the orb itself.
const ORB_STATE_POLITENESS = {
  idle: 'off',
  listening: 'polite',
  thinking: 'polite',
  speaking: 'off',
  alert: 'assertive',
  celebrate: 'polite',
};

/**
 * Accessible label for an orb state.
 * @param {string} state
 * @param {string} [locale]
 * @returns {string}
 */
function orbStateLabel(state, locale) {
  return t(`orb.${state}`, locale);
}

/**
 * Live-region politeness for an orb state.
 * @param {string} state
 * @returns {string}
 */
function orbLiveRegion(state) {
  return ORB_STATE_POLITENESS[state] || 'polite';
}

/**
 * Accessible label for a content card.
 * @param {object} card
 * @returns {string}
 */
function cardA11yLabel(card) {
  switch (card.kind) {
    case 'nudge':
      return `${card.title}. ${card.body}`;
    case 'recommendation':
      return `Recommendation: ${card.product}. ${card.rationale}. ${card.disclaimer || ''}`.trim();
    case 'goal':
      return `Goal ${card.name}: ${card.progress}% of target ${card.target}`;
    case 'chart':
      return card.caption || 'Chart';
    case 'explainer':
      return `Explanation of ${card.number}`;
    case 'insight':
      return card.summary || 'Insight';
    default:
      return 'Card';
  }
}

/**
 * Accessible label for a screen.
 * @param {string} screenKey
 * @param {string} [locale]
 * @returns {string}
 */
function screenA11yLabel(screenKey, locale) {
  return t(`screen.${screenKey}`, locale);
}

/**
 * Zero out motion fields for reduced-motion users.
 * @param {object} frame - orb-core render frame
 * @returns {object}
 */
function applyReducedMotion(frame) {
  return { ...frame, pulseSpeed: 0, amplitude: 0, motionProfile: 'static' };
}

/**
 * Whether a tap target meets the minimum size.
 * @param {number} sizeDp
 * @returns {boolean}
 */
function meetsTapTarget(sizeDp) {
  return sizeDp >= MIN_TAP_TARGET;
}

module.exports = {
  MIN_TAP_TARGET,
  ORB_STATE_POLITENESS,
  orbStateLabel,
  orbLiveRegion,
  cardA11yLabel,
  screenA11yLabel,
  applyReducedMotion,
  meetsTapTarget,
};
