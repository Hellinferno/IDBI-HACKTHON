/**
 * Tests for Orb State Machine.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { ORB_STATES, VALID_TRANSITIONS, isValidTransition, getVisualConfig, getValidStates } = require('./state-machine');

describe('ORB_STATES', () => {
  it('should have 6 states', () => {
    const states = Object.keys(ORB_STATES);
    assert.strictEqual(states.length, 6);
  });

  it('should have idle state', () => {
    assert.ok(ORB_STATES.idle);
    assert.strictEqual(ORB_STATES.idle.colorHint, '#4A90D9');
    assert.strictEqual(ORB_STATES.idle.motionProfile, 'slow_drift');
  });

  it('should have listening state', () => {
    assert.ok(ORB_STATES.listening);
    assert.strictEqual(ORB_STATES.listening.motionProfile, 'inward_pull');
  });

  it('should have thinking state', () => {
    assert.ok(ORB_STATES.thinking);
    assert.strictEqual(ORB_STATES.thinking.particleDensity, 0.8);
  });

  it('should have speaking state with amplitude_pulse', () => {
    assert.ok(ORB_STATES.speaking);
    assert.strictEqual(ORB_STATES.speaking.motionProfile, 'amplitude_pulse');
    assert.strictEqual(ORB_STATES.speaking.pulseSpeed, 0); // Driven by audio
  });

  it('should have alert state with amber color', () => {
    assert.ok(ORB_STATES.alert);
    assert.strictEqual(ORB_STATES.alert.colorHint, '#F5A623');
  });

  it('should have celebrate state', () => {
    assert.ok(ORB_STATES.celebrate);
    assert.strictEqual(ORB_STATES.celebrate.colorHint, '#FFD700');
  });

  it('all states should have required fields', () => {
    for (const [key, state] of Object.entries(ORB_STATES)) {
      assert.strictEqual(state.key, key);
      assert.ok(state.colorHint);
      assert.ok(state.motionProfile);
      assert.strictEqual(typeof state.particleDensity, 'number');
      assert.strictEqual(typeof state.scale, 'number');
      assert.ok(state.description);
    }
  });
});

describe('VALID_TRANSITIONS', () => {
  it('idle can transition to listening', () => {
    assert.ok(VALID_TRANSITIONS.idle.includes('listening'));
  });

  it('idle can transition to alert', () => {
    assert.ok(VALID_TRANSITIONS.idle.includes('alert'));
  });

  it('listening can transition to thinking', () => {
    assert.ok(VALID_TRANSITIONS.listening.includes('thinking'));
  });

  it('thinking can transition to speaking', () => {
    assert.ok(VALID_TRANSITIONS.thinking.includes('speaking'));
  });

  it('speaking can transition to idle', () => {
    assert.ok(VALID_TRANSITIONS.speaking.includes('idle'));
  });

  it('speaking can transition to celebrate', () => {
    assert.ok(VALID_TRANSITIONS.speaking.includes('celebrate'));
  });
});

describe('isValidTransition', () => {
  it('should allow valid transition idle → listening', () => {
    assert.strictEqual(isValidTransition('idle', 'listening'), true);
  });

  it('should allow valid transition thinking → speaking', () => {
    assert.strictEqual(isValidTransition('thinking', 'speaking'), true);
  });

  it('should block invalid transition idle → speaking', () => {
    assert.strictEqual(isValidTransition('idle', 'speaking'), false);
  });

  it('should block invalid transition alert → thinking', () => {
    assert.strictEqual(isValidTransition('alert', 'thinking'), false);
  });

  it('should handle unknown state', () => {
    assert.strictEqual(isValidTransition('unknown', 'idle'), false);
  });
});

describe('getVisualConfig', () => {
  it('should return config for valid state', () => {
    const config = getVisualConfig('idle');
    assert.ok(config);
    assert.strictEqual(config.key, 'idle');
  });

  it('should return null for invalid state', () => {
    const config = getVisualConfig('unknown');
    assert.strictEqual(config, null);
  });
});

describe('getValidStates', () => {
  it('should return all 6 states', () => {
    const states = getValidStates();
    assert.strictEqual(states.length, 6);
    assert.ok(states.includes('idle'));
    assert.ok(states.includes('listening'));
    assert.ok(states.includes('thinking'));
    assert.ok(states.includes('speaking'));
    assert.ok(states.includes('alert'));
    assert.ok(states.includes('celebrate'));
  });
});
