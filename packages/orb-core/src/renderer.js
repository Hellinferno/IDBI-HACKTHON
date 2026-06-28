/**
 * Orb Renderer.
 * Renderer-agnostic frame composition for the 3D orb.
 * Produces the props/uniforms a react-three-fiber <mesh> + shader consume.
 * Combines: state visual config + color mood + audio amplitude + LOD tier.
 * Zero business logic - pure visual mapping.
 */

const { getVisualConfig } = require('./state-machine');
const { getMoodColor } = require('./color-mood');
const { amplitudeToScale } = require('./audio-pipeline');
const { buildUniforms, ORB_VERTEX_SHADER, ORB_FRAGMENT_SHADER, FALLBACK_2D_FRAGMENT } = require('./shaders');
const { getTier } = require('./lod');

// Edge-glow intensity by state (drives uGlow uniform).
const GLOW_STATES = { alert: 1.0, celebrate: 0.6 };

/**
 * Compose a render frame from orb inputs.
 * Mood color (financial channel) overrides the state color hint when present.
 * Amplitude pulse applies only in the speaking state.
 * @param {object} input
 * @param {string} [input.state]
 * @param {number} [input.amplitude] - 0.0..1.0 TTS amplitude
 * @param {string|null} [input.mood] - color-mood key
 * @param {number} [input.time] - animation clock seconds
 * @returns {object} render frame
 */
function composeFrame({ state = 'idle', amplitude = 0, mood = null, time = 0 } = {}) {
  const visual = getVisualConfig(state) || getVisualConfig('idle');
  const moodColor = mood ? getMoodColor(mood) : null;

  const primary = moodColor?.primary || visual.colorHint;
  const secondary = moodColor?.secondary || visual.colorHint;

  const scale = state === 'speaking'
    ? amplitudeToScale(amplitude, visual.scale)
    : visual.scale;

  return {
    state: visual.key,
    color: { primary, secondary },
    scale,
    amplitude: state === 'speaking' ? amplitude : 0,
    particleDensity: visual.particleDensity,
    pulseSpeed: visual.pulseSpeed,
    motionProfile: visual.motionProfile,
    glow: GLOW_STATES[state] || 0,
    time,
  };
}

/**
 * Build renderer props (geometry + shaders + uniforms) for a frame at a LOD tier.
 * @param {object} frame - Output of composeFrame
 * @param {string} [lodTier] - LOD tier key
 * @returns {object} render props
 */
function buildRenderProps(frame, lodTier = 'mid') {
  const tier = getTier(lodTier) || getTier('mid');
  const uniforms = buildUniforms(frame);
  return {
    use2D: tier.use2D,
    sphereSegments: tier.sphereSegments,
    particleCount: Math.round(tier.particleCount * frame.particleDensity),
    vertexShader: tier.use2D ? null : ORB_VERTEX_SHADER,
    fragmentShader: tier.use2D ? FALLBACK_2D_FRAGMENT : ORB_FRAGMENT_SHADER,
    uniforms,
    shaderQuality: tier.shaderQuality,
  };
}

module.exports = {
  composeFrame,
  buildRenderProps,
  GLOW_STATES,
};
