/**
 * Audio I/O wiring.
 * Connects device STT capture + TTS playback to the orchestrator stream
 * and the orb amplitude pulse. Device specifics live behind injectable
 * adapters, so this layer is unit-testable without a microphone/speaker.
 * NO lip-sync - TTS amplitude drives the orb scale only.
 */

const DEFAULT_STT_CONFIG = {
  language: 'en-IN',
  sampleRate: 16000,
  encoding: 'pcm_s16le',
  channels: 1,
  chunkSize: 4096,
};

const DEFAULT_TTS_CONFIG = {
  language: 'en-IN',
  voiceId: 'aditi',
  sampleRate: 24000,
  encoding: 'pcm_s16le',
  speed: 1.0,
  pitch: 1.0,
};

/**
 * Minimal exponential amplitude smoother for the speaking pulse.
 * In production the host passes orb-core's createAudioContext instead.
 * @param {number} [smoothing] - 0.0 (none) to 1.0 (full)
 * @returns {{ push: Function, value: Function, reset: Function }}
 */
function createDefaultAmplitudeTracker(smoothing = 0.7) {
  let prev = 0;
  return {
    push(amplitude) {
      prev = prev * smoothing + amplitude * (1 - smoothing);
      return prev;
    },
    value() {
      return prev;
    },
    reset() {
      prev = 0;
    },
  };
}

/**
 * STT capture controller.
 * @param {object} opts
 * @param {object} opts.adapter - { start(config, onData), stop() }
 * @param {Function} [opts.onPartial] - interim transcript handler
 * @param {Function} [opts.onFinal] - final transcript handler
 * @param {object} [opts.config]
 * @returns {object}
 */
function createSttController({ adapter, onPartial = () => {}, onFinal = () => {}, config = {} }) {
  if (!adapter || typeof adapter.start !== 'function') {
    throw new Error('STT adapter with start() required');
  }
  const cfg = { ...DEFAULT_STT_CONFIG, ...config };
  let capturing = false;

  function start() {
    if (capturing) return;
    capturing = true;
    adapter.start(cfg, (event) => {
      if (event.isFinal) onFinal(event.transcript);
      else onPartial(event.transcript);
    });
  }

  function stop() {
    if (!capturing) return;
    capturing = false;
    if (adapter.stop) adapter.stop();
  }

  return { start, stop, isCapturing: () => capturing, config: cfg };
}

/**
 * TTS playback controller.
 * Plays queued audio chunks through an adapter and feeds each chunk's
 * amplitude to the orb pulse (onAmplitude).
 * @param {object} opts
 * @param {object} opts.adapter - { playChunk(chunk, config) -> Promise<number>, stop?() }
 * @param {object} [opts.amplitudeTracker]
 * @param {Function} [opts.onAmplitude] - orb pulse driver (0.0..1.0)
 * @param {Function} [opts.onDone]
 * @param {object} [opts.config]
 * @returns {object}
 */
function createTtsController({
  adapter,
  amplitudeTracker = createDefaultAmplitudeTracker(),
  onAmplitude = () => {},
  onDone = () => {},
  config = {},
}) {
  if (!adapter || typeof adapter.playChunk !== 'function') {
    throw new Error('TTS adapter with playChunk() required');
  }
  const cfg = { ...DEFAULT_TTS_CONFIG, ...config };
  let playing = false;
  const queue = [];

  function enqueue(chunk) {
    queue.push(chunk);
  }

  function feedAmplitude(amplitude) {
    const smoothed = amplitudeTracker.push(amplitude);
    onAmplitude(smoothed);
    return smoothed;
  }

  async function play() {
    if (playing) return;
    playing = true;
    while (queue.length > 0) {
      const chunk = queue.shift();
      const amp = await adapter.playChunk(chunk, cfg);
      feedAmplitude(typeof amp === 'number' ? amp : 0);
    }
    playing = false;
    amplitudeTracker.reset();
    onAmplitude(0); // settle the orb back to rest
    onDone();
  }

  function stop() {
    queue.length = 0;
    playing = false;
    amplitudeTracker.reset();
    onAmplitude(0);
    if (adapter.stop) adapter.stop();
  }

  return {
    enqueue,
    play,
    stop,
    feedAmplitude,
    isPlaying: () => playing,
    pending: () => queue.length,
    config: cfg,
  };
}

module.exports = {
  createSttController,
  createTtsController,
  createDefaultAmplitudeTracker,
  DEFAULT_STT_CONFIG,
  DEFAULT_TTS_CONFIG,
};
