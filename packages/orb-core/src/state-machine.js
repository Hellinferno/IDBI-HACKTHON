/**
 * Orb State Machine.
 * Maps orchestrator events → visual states.
 * 6 states: idle, listening, thinking, speaking, alert, celebrate.
 */

const ORB_STATES = {
  idle: {
    key: 'idle',
    colorHint: '#4A90D9',       // Calm blue
    motionProfile: 'slow_drift',
    particleDensity: 0.3,
    scale: 1.0,
    pulseSpeed: 0,
    description: 'Slow drift, neutral blue - app idle on Home',
  },
  listening: {
    key: 'listening',
    colorHint: '#5BA0E0',       // Slightly brighter blue
    motionProfile: 'inward_pull',
    particleDensity: 0.5,
    scale: 1.0,
    pulseSpeed: 0.5,
    description: 'Inward pull, ring effect - mic active',
  },
  thinking: {
    key: 'thinking',
    colorHint: '#7B68EE',       // Purple
    motionProfile: 'orbit_particles',
    particleDensity: 0.8,
    scale: 1.05,
    pulseSpeed: 1.0,
    description: 'Orbiting particles - awaiting LLM response',
  },
  speaking: {
    key: 'speaking',
    colorHint: '#4A90D9',       // Blue (mood channel overrides)
    motionProfile: 'amplitude_pulse',
    particleDensity: 0.4,
    scale: 1.0,
    pulseSpeed: 0,              // Driven by audio amplitude
    description: 'Amplitude pulse driven by TTS audio - NO lip-sync',
  },
  alert: {
    key: 'alert',
    colorHint: '#F5A623',       // Amber
    motionProfile: 'edge_glow',
    particleDensity: 0.6,
    scale: 1.02,
    pulseSpeed: 0.8,
    description: 'Amber edge glow - attention item present',
  },
  celebrate: {
    key: 'celebrate',
    colorHint: '#FFD700',       // Warm gold
    motionProfile: 'warm_bloom',
    particleDensity: 1.0,
    scale: 1.1,
    pulseSpeed: 1.5,
    description: 'Warm bloom - goal reached / reco accepted',
  },
};

const VALID_TRANSITIONS = {
  idle: ['listening', 'alert'],
  listening: ['thinking'],
  thinking: ['speaking'],
  speaking: ['idle', 'celebrate'],
  alert: ['idle'],
  celebrate: ['idle'],
};

/**
 * Validate a state transition.
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
function isValidTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get visual config for an orb state.
 * @param {string} state
 * @returns {object|null}
 */
function getVisualConfig(state) {
  return ORB_STATES[state] || null;
}

/**
 * Get all valid states.
 * @returns {string[]}
 */
function getValidStates() {
  return Object.keys(ORB_STATES);
}

module.exports = {
  ORB_STATES,
  VALID_TRANSITIONS,
  isValidTransition,
  getVisualConfig,
  getValidStates,
};
