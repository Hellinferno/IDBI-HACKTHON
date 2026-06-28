/**
 * Tests for LOD + 2D fallback.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  LOD_TIERS,
  TARGET_FPS,
  selectLod,
  getTier,
  get2DFallback,
  estimateFrameCost,
  meetsFrameBudget,
} = require('./lod');

describe('selectLod', () => {
  it('defaults to mid tier', () => {
    assert.strictEqual(selectLod(), 'mid');
  });

  it('uses 2D fallback without WebGL', () => {
    assert.strictEqual(selectLod({ supportsWebGL: false }), 'fallback2d');
  });

  it('steps high down to mid under low-power mode', () => {
    assert.strictEqual(selectLod({ gpuTier: 'high', isLowPowerMode: true }), 'mid');
  });

  it('steps mid down to low under reduced motion', () => {
    assert.strictEqual(selectLod({ gpuTier: 'mid', prefersReducedMotion: true }), 'low');
  });

  it('honors a valid gpu tier', () => {
    assert.strictEqual(selectLod({ gpuTier: 'high' }), 'high');
  });

  it('falls back to mid for an unknown gpu tier', () => {
    assert.strictEqual(selectLod({ gpuTier: 'unobtanium' }), 'mid');
  });
});

describe('frame budget', () => {
  it('mid tier holds the 30fps target', () => {
    assert.ok(meetsFrameBudget('mid', TARGET_FPS));
  });

  it('every tier stays within the 30fps budget', () => {
    for (const key of Object.keys(LOD_TIERS)) {
      assert.ok(meetsFrameBudget(key, 30), `${key} exceeds 30fps budget`);
    }
  });

  it('unknown tier costs Infinity and misses budget', () => {
    assert.strictEqual(estimateFrameCost('nope'), Infinity);
    assert.strictEqual(meetsFrameBudget('nope'), false);
  });
});

describe('tier accessors', () => {
  it('getTier returns a tier config', () => {
    assert.strictEqual(getTier('high').sphereSegments, 128);
  });

  it('get2DFallback is a 2D tier', () => {
    assert.strictEqual(get2DFallback().use2D, true);
    assert.strictEqual(get2DFallback().particleCount, 0);
  });
});
