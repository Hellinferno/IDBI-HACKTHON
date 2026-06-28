/**
 * Tests for Color Mood Channel.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { MOOD_COLORS, determineMood, getMoodColor, interpolateColor } = require('./color-mood');

describe('MOOD_COLORS', () => {
  it('should have 5 moods', () => {
    assert.strictEqual(Object.keys(MOOD_COLORS).length, 5);
  });

  it('should have healthy mood', () => {
    assert.ok(MOOD_COLORS.healthy);
    assert.strictEqual(MOOD_COLORS.healthy.primary, '#4A90D9');
  });

  it('should have attention mood', () => {
    assert.ok(MOOD_COLORS.attention);
    assert.strictEqual(MOOD_COLORS.attention.primary, '#F5A623');
  });

  it('should have warning mood', () => {
    assert.ok(MOOD_COLORS.warning);
    assert.strictEqual(MOOD_COLORS.warning.primary, '#E74C3C');
  });

  it('should have celebrate mood', () => {
    assert.ok(MOOD_COLORS.celebrate);
    assert.strictEqual(MOOD_COLORS.celebrate.primary, '#FFD700');
  });

  it('should have neutral mood', () => {
    assert.ok(MOOD_COLORS.neutral);
  });
});

describe('determineMood', () => {
  it('should return celebrate for recent celebration', () => {
    const result = determineMood({
      savingsRate: 25,
      goalOnTrack: true,
      hasAttentionItems: false,
      recentCelebration: true,
    });
    assert.strictEqual(result.mood, 'celebrate');
  });

  it('should return attention when attention items present', () => {
    const result = determineMood({
      savingsRate: 25,
      goalOnTrack: true,
      hasAttentionItems: true,
      recentCelebration: false,
    });
    assert.strictEqual(result.mood, 'attention');
  });

  it('should return healthy when goal on track and good savings', () => {
    const result = determineMood({
      savingsRate: 25,
      goalOnTrack: true,
      hasAttentionItems: false,
      recentCelebration: false,
    });
    assert.strictEqual(result.mood, 'healthy');
  });

  it('should return warning when goal off track', () => {
    const result = determineMood({
      savingsRate: 25,
      goalOnTrack: false,
      hasAttentionItems: false,
      recentCelebration: false,
    });
    assert.strictEqual(result.mood, 'warning');
  });

  it('should return warning when low savings rate', () => {
    const result = determineMood({
      savingsRate: 5,
      goalOnTrack: true,
      hasAttentionItems: false,
      recentCelebration: false,
    });
    assert.strictEqual(result.mood, 'warning');
  });

  it('should return neutral for average metrics', () => {
    const result = determineMood({
      savingsRate: 15,
      goalOnTrack: true,
      hasAttentionItems: false,
      recentCelebration: false,
    });
    assert.strictEqual(result.mood, 'neutral');
  });
});

describe('getMoodColor', () => {
  it('should return color for valid mood', () => {
    const color = getMoodColor('healthy');
    assert.ok(color);
    assert.ok(color.primary);
  });

  it('should return null for invalid mood', () => {
    const color = getMoodColor('unknown');
    assert.strictEqual(color, null);
  });
});

describe('interpolateColor', () => {
  it('should interpolate between two colors', () => {
    const result = interpolateColor('#000000', '#FFFFFF', 0.5);
    assert.ok(result);
    assert.ok(result === '#7f7f7f' || result === '#808080');
  });

  it('should return first color at t=0', () => {
    const result = interpolateColor('#FF0000', '#00FF00', 0);
    assert.strictEqual(result, '#ff0000');
  });

  it('should return second color at t=1', () => {
    const result = interpolateColor('#FF0000', '#00FF00', 1);
    assert.strictEqual(result, '#00ff00');
  });
});
