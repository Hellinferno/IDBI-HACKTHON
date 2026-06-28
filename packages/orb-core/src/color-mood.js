/**
 * Color Mood Channel.
 * Maps financial state → orb color/mood.
 * Separate from state-driven visuals.
 */

const MOOD_COLORS = {
  healthy: {
    primary: '#4A90D9',    // Calm blue
    secondary: '#5BA0E0',
    description: 'Financial health is good',
  },
  attention: {
    primary: '#F5A623',    // Amber
    secondary: '#FFB94D',
    description: 'Items need attention',
  },
  warning: {
    primary: '#E74C3C',    // Red
    secondary: '#FF6B6B',
    description: 'Urgent action needed',
  },
  celebrate: {
    primary: '#FFD700',    // Gold
    secondary: '#FFEC80',
    description: 'Goal achieved or positive milestone',
  },
  neutral: {
    primary: '#95A5A6',    // Gray
    secondary: '#BDC3C7',
    description: 'No strong signal',
  },
};

/**
 * Determine mood from financial metrics.
 * @param {object} metrics
 * @param {number} metrics.savingsRate - User's savings rate (%)
 * @param {boolean} metrics.goalOnTrack - Is primary goal on track
 * @param {boolean} metrics.hasAttentionItems - Pending nudges/alerts
 * @param {boolean} metrics.recentCelebration - Recent goal met or reco accepted
 * @returns {{ mood: string, color: object }}
 */
function determineMood({ savingsRate, goalOnTrack, hasAttentionItems, recentCelebration }) {
  if (recentCelebration) {
    return { mood: 'celebrate', color: MOOD_COLORS.celebrate };
  }

  if (hasAttentionItems) {
    return { mood: 'attention', color: MOOD_COLORS.attention };
  }

  if (goalOnTrack && savingsRate >= 20) {
    return { mood: 'healthy', color: MOOD_COLORS.healthy };
  }

  if (!goalOnTrack || savingsRate < 10) {
    return { mood: 'warning', color: MOOD_COLORS.warning };
  }

  return { mood: 'neutral', color: MOOD_COLORS.neutral };
}

/**
 * Get color for a specific mood.
 * @param {string} mood
 * @returns {object|null}
 */
function getMoodColor(mood) {
  return MOOD_COLORS[mood] || null;
}

/**
 * Interpolate between two hex colors.
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @param {number} t - 0.0 to 1.0
 * @returns {string} Hex color
 */
function interpolateColor(color1, color2, t) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

module.exports = {
  MOOD_COLORS,
  determineMood,
  getMoodColor,
  interpolateColor,
};
