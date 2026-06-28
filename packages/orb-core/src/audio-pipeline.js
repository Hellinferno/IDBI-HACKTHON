/**
 * Audio Pipeline.
 * STT capture, TTS playback, amplitude analyser for speaking pulse.
 * NO lip-sync, NO visemes - purely audio amplitude driven.
 */

/**
 * Compute amplitude from audio samples.
 * Used to drive orb pulse during speaking state.
 * @param {Float32Array} samples - PCM audio samples (-1.0 to 1.0)
 * @returns {number} Amplitude (0.0 to 1.0)
 */
function computeAmplitude(samples) {
  if (!samples || samples.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += Math.abs(samples[i]);
  }
  return Math.min(sum / samples.length, 1.0);
}

/**
 * Smooth amplitude over time for natural orb pulse.
 * @param {number} currentAmplitude
 * @param {number} previousAmplitude
 * @param {number} smoothing - 0.0 (no smoothing) to 1.0 (full smoothing)
 * @returns {number}
 */
function smoothAmplitude(currentAmplitude, previousAmplitude, smoothing = 0.7) {
  return previousAmplitude * smoothing + currentAmplitude * (1 - smoothing);
}

/**
 * Map amplitude to orb scale for speaking pulse.
 * @param {number} amplitude - 0.0 to 1.0
 * @param {number} baseScale - Base scale (default 1.0)
 * @param {number} maxPulse - Maximum pulse amount (default 0.15)
 * @returns {number} Scale to apply
 */
function amplitudeToScale(amplitude, baseScale = 1.0, maxPulse = 0.15) {
  return baseScale + amplitude * maxPulse;
}

/**
 * STT (Speech-to-Text) configuration.
 */
const STT_CONFIG = {
  language: 'en-IN',
  sampleRate: 16000,
  encoding: 'pcm_s16le',
  channels: 1,
  chunkSize: 4096,
};

/**
 * TTS (Text-to-Speech) configuration.
 */
const TTS_CONFIG = {
  language: 'en-IN',
  voiceId: 'aditi',           // Female Indian English voice
  sampleRate: 24000,
  encoding: 'pcm_s16le',
  speed: 1.0,
  pitch: 1.0,
};

/**
 * Supported languages for voice.
 */
const VOICE_LANGUAGES = {
  'en-IN': { stt: 'en-IN', tts: 'aditi', label: 'English (India)' },
  'hi-IN': { stt: 'hi-IN', tts: 'aditi', label: 'Hindi' },
};

/**
 * Create an audio context for amplitude analysis.
 * In production, this would use Web Audio API or React Native Audio API.
 * @returns {object} Audio context with methods
 */
function createAudioContext() {
  let previousAmplitude = 0;

  return {
    /**
     * Process audio chunk and return smoothed amplitude.
     * @param {Float32Array} samples
     * @returns {number}
     */
    processChunk(samples) {
      const raw = computeAmplitude(samples);
      const smoothed = smoothAmplitude(raw, previousAmplitude);
      previousAmplitude = smoothed;
      return smoothed;
    },

    /**
     * Get orb scale from current amplitude.
     * @returns {number}
     */
    getOrbScale() {
      return amplitudeToScale(previousAmplitude);
    },

    /**
     * Reset audio context.
     */
    reset() {
      previousAmplitude = 0;
    },
  };
}

module.exports = {
  computeAmplitude,
  smoothAmplitude,
  amplitudeToScale,
  createAudioContext,
  STT_CONFIG,
  TTS_CONFIG,
  VOICE_LANGUAGES,
};
