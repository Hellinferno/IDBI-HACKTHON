/**
 * Tests for Accessibility helpers.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  orbStateLabel,
  orbLiveRegion,
  cardA11yLabel,
  screenA11yLabel,
  applyReducedMotion,
  meetsTapTarget,
  MIN_TAP_TARGET,
} = require('./a11y');

describe('orb labels', () => {
  it('labels orb states in English', () => {
    assert.strictEqual(orbStateLabel('speaking'), 'Speaking');
  });

  it('labels orb states in Hindi', () => {
    assert.strictEqual(orbStateLabel('alert', 'hi-IN'), 'ध्यान देने की आवश्यकता');
  });

  it('alert uses an assertive live region', () => {
    assert.strictEqual(orbLiveRegion('alert'), 'assertive');
  });

  it('speaking is off so tokens are announced as text instead', () => {
    assert.strictEqual(orbLiveRegion('speaking'), 'off');
  });
});

describe('cardA11yLabel', () => {
  it('labels nudge cards', () => {
    const label = cardA11yLabel({ kind: 'nudge', title: 'Idle cash', body: 'Move to a liquid fund' });
    assert.ok(label.includes('Idle cash'));
    assert.ok(label.includes('liquid fund'));
  });

  it('includes the disclaimer for recommendation cards', () => {
    const label = cardA11yLabel({ kind: 'recommendation', product: 'ELSS', rationale: 'tax saving', disclaimer: 'market risk' });
    assert.ok(label.includes('market risk'));
  });

  it('handles an unknown card kind', () => {
    assert.strictEqual(cardA11yLabel({ kind: 'xyz' }), 'Card');
  });
});

describe('screenA11yLabel', () => {
  it('labels screens', () => {
    assert.strictEqual(screenA11yLabel('portfolio'), 'Portfolio');
  });
});

describe('applyReducedMotion', () => {
  it('zeros motion fields but preserves scale', () => {
    const reduced = applyReducedMotion({ pulseSpeed: 1.5, amplitude: 0.8, motionProfile: 'warm_bloom', scale: 1.1 });
    assert.strictEqual(reduced.pulseSpeed, 0);
    assert.strictEqual(reduced.amplitude, 0);
    assert.strictEqual(reduced.motionProfile, 'static');
    assert.strictEqual(reduced.scale, 1.1);
  });
});

describe('meetsTapTarget', () => {
  it('accepts targets at or above the minimum', () => {
    assert.ok(meetsTapTarget(48));
    assert.ok(meetsTapTarget(MIN_TAP_TARGET));
  });

  it('rejects targets below the minimum', () => {
    assert.strictEqual(meetsTapTarget(40), false);
  });
});
