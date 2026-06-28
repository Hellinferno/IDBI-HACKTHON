/**
 * Tests for Audio Pipeline.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { computeAmplitude, smoothAmplitude, amplitudeToScale, createAudioContext, STT_CONFIG, TTS_CONFIG, VOICE_LANGUAGES } = require('./audio-pipeline');

describe('computeAmplitude', () => {
  it('should compute amplitude from samples', () => {
    const samples = new Float32Array([0.5, -0.5, 0.3, -0.3]);
    const amplitude = computeAmplitude(samples);
    assert.ok(amplitude > 0);
    assert.ok(amplitude <= 1.0);
  });

  it('should return 0 for silent audio', () => {
    const samples = new Float32Array([0, 0, 0, 0]);
    const amplitude = computeAmplitude(samples);
    assert.strictEqual(amplitude, 0);
  });

  it('should return 0 for empty samples', () => {
    const amplitude = computeAmplitude(new Float32Array([]));
    assert.strictEqual(amplitude, 0);
  });

  it('should return 0 for null samples', () => {
    const amplitude = computeAmplitude(null);
    assert.strictEqual(amplitude, 0);
  });

  it('should cap at 1.0', () => {
    const samples = new Float32Array([1.0, 1.0, 1.0]);
    const amplitude = computeAmplitude(samples);
    assert.strictEqual(amplitude, 1.0);
  });
});

describe('smoothAmplitude', () => {
  it('should smooth between current and previous', () => {
    const result = smoothAmplitude(0.8, 0.2, 0.5);
    assert.ok(result > 0.2);
    assert.ok(result < 0.8);
  });

  it('should return current when previous is 0', () => {
    const result = smoothAmplitude(0.5, 0, 0.7);
    assert.ok(result > 0);
  });
});

describe('amplitudeToScale', () => {
  it('should map amplitude to scale', () => {
    const scale = amplitudeToScale(0.5, 1.0, 0.2);
    assert.ok(scale > 1.0);
    assert.ok(scale < 1.2);
  });

  it('should return base scale for zero amplitude', () => {
    const scale = amplitudeToScale(0, 1.0, 0.2);
    assert.strictEqual(scale, 1.0);
  });
});

describe('createAudioContext', () => {
  it('should create audio context', () => {
    const ctx = createAudioContext();
    assert.ok(ctx);
    assert.strictEqual(typeof ctx.processChunk, 'function');
    assert.strictEqual(typeof ctx.getOrbScale, 'function');
    assert.strictEqual(typeof ctx.reset, 'function');
  });

  it('should process audio chunks', () => {
    const ctx = createAudioContext();
    const samples = new Float32Array([0.5, -0.5, 0.3, -0.3]);
    const amplitude = ctx.processChunk(samples);
    assert.ok(amplitude >= 0);
    assert.ok(amplitude <= 1);
  });

  it('should return orb scale', () => {
    const ctx = createAudioContext();
    ctx.processChunk(new Float32Array([0.5]));
    const scale = ctx.getOrbScale();
    assert.ok(scale >= 1.0);
  });

  it('should reset', () => {
    const ctx = createAudioContext();
    ctx.processChunk(new Float32Array([0.8]));
    ctx.reset();
    const scale = ctx.getOrbScale();
    assert.strictEqual(scale, 1.0);
  });
});

describe('STT_CONFIG', () => {
  it('should have required fields', () => {
    assert.ok(STT_CONFIG.language);
    assert.ok(STT_CONFIG.sampleRate);
    assert.ok(STT_CONFIG.encoding);
  });
});

describe('TTS_CONFIG', () => {
  it('should have required fields', () => {
    assert.ok(TTS_CONFIG.language);
    assert.ok(TTS_CONFIG.voiceId);
    assert.ok(TTS_CONFIG.sampleRate);
  });
});

describe('VOICE_LANGUAGES', () => {
  it('should support English and Hindi', () => {
    assert.ok(VOICE_LANGUAGES['en-IN']);
    assert.ok(VOICE_LANGUAGES['hi-IN']);
  });
});
