/**
 * Tests for Orb Shaders.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  ORB_VERTEX_SHADER,
  ORB_FRAGMENT_SHADER,
  FALLBACK_2D_FRAGMENT,
  UNIFORM_SCHEMA,
  hexToVec3,
  buildUniforms,
} = require('./shaders');

describe('shader sources', () => {
  it('vertex shader declares amplitude uniform and main', () => {
    assert.ok(ORB_VERTEX_SHADER.includes('uniform float uAmplitude'));
    assert.ok(ORB_VERTEX_SHADER.includes('void main'));
  });

  it('fragment shader writes gl_FragColor', () => {
    assert.ok(ORB_FRAGMENT_SHADER.includes('gl_FragColor'));
  });

  it('2D fallback is amplitude-aware', () => {
    assert.ok(FALLBACK_2D_FRAGMENT.includes('uAmplitude'));
    assert.ok(FALLBACK_2D_FRAGMENT.includes('gl_FragColor'));
  });
});

describe('hexToVec3', () => {
  it('normalizes a hex color to 0..1', () => {
    const [r, g, b] = hexToVec3('#4A90D9');
    assert.ok(Math.abs(r - 74 / 255) < 1e-6);
    assert.ok(Math.abs(g - 144 / 255) < 1e-6);
    assert.ok(Math.abs(b - 217 / 255) < 1e-6);
  });

  it('maps white to [1,1,1]', () => {
    assert.deepStrictEqual(hexToVec3('#FFFFFF'), [1, 1, 1]);
  });
});

describe('buildUniforms', () => {
  it('maps a frame to uniform values', () => {
    const u = buildUniforms({
      time: 2,
      amplitude: 0.5,
      scale: 1.1,
      pulseSpeed: 0.8,
      color: { primary: '#FFFFFF', secondary: '#000000' },
      glow: 1.0,
      particleDensity: 0.4,
    });
    assert.strictEqual(u.uTime, 2);
    assert.strictEqual(u.uAmplitude, 0.5);
    assert.strictEqual(u.uScale, 1.1);
    assert.strictEqual(u.uGlow, 1.0);
    assert.deepStrictEqual(u.uColorPrimary, [1, 1, 1]);
    assert.deepStrictEqual(u.uColorSecondary, [0, 0, 0]);
  });

  it('applies defaults for a sparse frame', () => {
    const u = buildUniforms({});
    assert.strictEqual(u.uScale, 1.0);
    assert.strictEqual(u.uAmplitude, 0);
    assert.deepStrictEqual(u.uColorPrimary, hexToVec3('#4A90D9'));
  });
});

describe('UNIFORM_SCHEMA', () => {
  it('documents core uniforms with types', () => {
    assert.strictEqual(UNIFORM_SCHEMA.uTime.type, 'float');
    assert.strictEqual(UNIFORM_SCHEMA.uColorPrimary.type, 'vec3');
  });
});
