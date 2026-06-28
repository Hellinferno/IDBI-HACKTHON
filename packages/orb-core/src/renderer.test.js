/**
 * Tests for Orb Renderer (frame composition + render props + perf budget).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { composeFrame, buildRenderProps } = require('./renderer');
const { getTier, meetsFrameBudget } = require('./lod');

describe('composeFrame', () => {
  it('idle frame has base scale, no glow, state color', () => {
    const f = composeFrame({ state: 'idle' });
    assert.strictEqual(f.scale, 1.0);
    assert.strictEqual(f.glow, 0);
    assert.strictEqual(f.color.primary, '#4A90D9');
  });

  it('speaking frame pulses scale with amplitude', () => {
    const quiet = composeFrame({ state: 'speaking', amplitude: 0 });
    const loud = composeFrame({ state: 'speaking', amplitude: 1.0 });
    assert.ok(loud.scale > quiet.scale);
    assert.strictEqual(loud.amplitude, 1.0);
  });

  it('non-speaking states ignore amplitude', () => {
    const f = composeFrame({ state: 'thinking', amplitude: 1.0 });
    assert.strictEqual(f.amplitude, 0);
    assert.strictEqual(f.scale, 1.05); // thinking base scale, no pulse
  });

  it('mood color overrides the state hint', () => {
    const f = composeFrame({ state: 'idle', mood: 'warning' });
    assert.strictEqual(f.color.primary, '#E74C3C'); // MOOD_COLORS.warning
  });

  it('alert state emits full edge glow', () => {
    assert.strictEqual(composeFrame({ state: 'alert' }).glow, 1.0);
  });

  it('falls back to idle visuals for an unknown state', () => {
    const f = composeFrame({ state: 'bogus' });
    assert.strictEqual(f.state, 'idle');
  });
});

describe('buildRenderProps', () => {
  it('mid tier uses the 3D shader pair', () => {
    const props = buildRenderProps(composeFrame({ state: 'idle' }), 'mid');
    assert.strictEqual(props.use2D, false);
    assert.ok(props.vertexShader.includes('void main'));
    assert.ok(props.fragmentShader.includes('gl_FragColor'));
  });

  it('scales particle count by tier and density', () => {
    const frame = composeFrame({ state: 'thinking' }); // particleDensity 0.8
    const props = buildRenderProps(frame, 'mid');
    assert.strictEqual(props.particleCount, Math.round(getTier('mid').particleCount * 0.8));
    assert.ok(props.particleCount <= getTier('mid').particleCount);
  });

  it('2D fallback drops the vertex shader and uses the ring fragment', () => {
    const props = buildRenderProps(composeFrame({ state: 'speaking', amplitude: 0.5 }), 'fallback2d');
    assert.strictEqual(props.use2D, true);
    assert.strictEqual(props.vertexShader, null);
    assert.ok(props.fragmentShader.includes('ring'));
  });

  it('unknown tier defaults to mid', () => {
    const props = buildRenderProps(composeFrame({ state: 'idle' }), 'nope');
    assert.strictEqual(props.sphereSegments, getTier('mid').sphereSegments);
  });
});

describe('performance', () => {
  it('mid tier composition meets the 30fps frame budget', () => {
    assert.ok(meetsFrameBudget('mid', 30));
  });

  it('frame composition is deterministic for the same inputs', () => {
    const a = composeFrame({ state: 'speaking', amplitude: 0.5, mood: 'healthy', time: 3 });
    const b = composeFrame({ state: 'speaking', amplitude: 0.5, mood: 'healthy', time: 3 });
    assert.deepStrictEqual(a, b);
  });

  it('sustains a long animation loop without drift', () => {
    let last = null;
    for (let i = 0; i < 5000; i++) {
      const f = composeFrame({ state: 'idle', time: i });
      assert.strictEqual(f.scale, 1.0);
      last = f;
    }
    assert.strictEqual(last.state, 'idle');
  });
});
