/**
 * @wealthorb/orb-core
 * 3D Orb renderer core - state mapping, audio pipeline, color mood,
 * shaders, LOD/2D fallback, and renderer-agnostic frame composition.
 * Zero business logic. Only visual state mapping.
 */

const { ORB_STATES, VALID_TRANSITIONS, isValidTransition, getVisualConfig, getValidStates } = require('./state-machine');
const { computeAmplitude, smoothAmplitude, amplitudeToScale, createAudioContext, STT_CONFIG, TTS_CONFIG, VOICE_LANGUAGES } = require('./audio-pipeline');
const { MOOD_COLORS, determineMood, getMoodColor, interpolateColor } = require('./color-mood');
const { ORB_VERTEX_SHADER, ORB_FRAGMENT_SHADER, FALLBACK_2D_FRAGMENT, UNIFORM_SCHEMA, hexToVec3, buildUniforms } = require('./shaders');
const { LOD_TIERS, TARGET_FPS, FRAME_BUDGET_MS, selectLod, getTier, get2DFallback, estimateFrameCost, meetsFrameBudget } = require('./lod');
const { composeFrame, buildRenderProps, GLOW_STATES } = require('./renderer');

module.exports = {
  // State machine
  ORB_STATES,
  VALID_TRANSITIONS,
  isValidTransition,
  getVisualConfig,
  getValidStates,

  // Audio pipeline
  computeAmplitude,
  smoothAmplitude,
  amplitudeToScale,
  createAudioContext,
  STT_CONFIG,
  TTS_CONFIG,
  VOICE_LANGUAGES,

  // Color mood
  MOOD_COLORS,
  determineMood,
  getMoodColor,
  interpolateColor,

  // Shaders
  ORB_VERTEX_SHADER,
  ORB_FRAGMENT_SHADER,
  FALLBACK_2D_FRAGMENT,
  UNIFORM_SCHEMA,
  hexToVec3,
  buildUniforms,

  // LOD + 2D fallback
  LOD_TIERS,
  TARGET_FPS,
  FRAME_BUDGET_MS,
  selectLod,
  getTier,
  get2DFallback,
  estimateFrameCost,
  meetsFrameBudget,

  // Renderer
  composeFrame,
  buildRenderProps,
  GLOW_STATES,
};
