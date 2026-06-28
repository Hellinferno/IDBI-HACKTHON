/**
 * Tests for Audio I/O wiring (STT capture + TTS playback + orb pulse).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { createSttController, createTtsController, createDefaultAmplitudeTracker } = require('./audio-io');

describe('createSttController', () => {
  it('throws without an adapter', () => {
    assert.throws(() => createSttController({}));
  });

  it('starts and stops capture', () => {
    let started = false;
    let stopped = false;
    const adapter = { start: () => { started = true; }, stop: () => { stopped = true; } };
    const stt = createSttController({ adapter });
    assert.strictEqual(stt.isCapturing(), false);
    stt.start();
    assert.strictEqual(stt.isCapturing(), true);
    assert.ok(started);
    stt.stop();
    assert.strictEqual(stt.isCapturing(), false);
    assert.ok(stopped);
  });

  it('routes partial and final transcripts', () => {
    let onData;
    const adapter = { start: (cfg, cb) => { onData = cb; }, stop: () => {} };
    const partials = [];
    const finals = [];
    const stt = createSttController({ adapter, onPartial: (x) => partials.push(x), onFinal: (x) => finals.push(x) });
    stt.start();
    onData({ transcript: 'hel', isFinal: false });
    onData({ transcript: 'hello', isFinal: true });
    assert.deepStrictEqual(partials, ['hel']);
    assert.deepStrictEqual(finals, ['hello']);
  });

  it('defaults to the en-IN voice config', () => {
    const stt = createSttController({ adapter: { start() {}, stop() {} } });
    assert.strictEqual(stt.config.language, 'en-IN');
    assert.strictEqual(stt.config.sampleRate, 16000);
  });
});

describe('createTtsController', () => {
  it('throws without an adapter', () => {
    assert.throws(() => createTtsController({}));
  });

  it('plays queued chunks and drives the orb pulse', async () => {
    const amps = [];
    const adapter = { playChunk: async (chunk) => chunk.amp };
    const tts = createTtsController({ adapter, onAmplitude: (a) => amps.push(a) });
    tts.enqueue({ amp: 0.5 });
    tts.enqueue({ amp: 1.0 });
    assert.strictEqual(tts.pending(), 2);
    await tts.play();
    assert.strictEqual(tts.isPlaying(), false);
    assert.ok(amps.length >= 3);
    assert.strictEqual(amps[amps.length - 1], 0); // settles back to rest
  });

  it('stop clears the queue and resets the pulse', () => {
    const amps = [];
    const adapter = { playChunk: async () => 0.5, stop: () => {} };
    const tts = createTtsController({ adapter, onAmplitude: (a) => amps.push(a) });
    tts.enqueue({ amp: 0.5 });
    tts.stop();
    assert.strictEqual(tts.pending(), 0);
    assert.strictEqual(amps[amps.length - 1], 0);
  });

  it('fires onDone after playback drains', async () => {
    let done = false;
    const adapter = { playChunk: async () => 0.2 };
    const tts = createTtsController({ adapter, onDone: () => { done = true; } });
    tts.enqueue({ amp: 0.2 });
    await tts.play();
    assert.ok(done);
  });
});

describe('createDefaultAmplitudeTracker', () => {
  it('smooths amplitude toward the input', () => {
    const tr = createDefaultAmplitudeTracker();
    const a = tr.push(1.0);
    assert.ok(a > 0 && a < 1.0);
    const b = tr.push(1.0);
    assert.ok(b > a);
  });

  it('reset returns to zero', () => {
    const tr = createDefaultAmplitudeTracker();
    tr.push(1.0);
    tr.reset();
    assert.strictEqual(tr.value(), 0);
  });
});
