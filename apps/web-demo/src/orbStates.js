// Web port of packages/orb-core state-machine + color-mood, so the demo orb
// matches the design system. Adds render hints (rotation speed, distortion).

export const ORB_STATES = {
  idle: {
    color: '#4A90D9', motion: 'slow_drift', particleDensity: 0.3,
    scale: 1.0, pulseSpeed: 0.4, rotSpeed: 0.15, distort: 0.25,
    label: 'Idle',
  },
  listening: {
    color: '#5BA0E0', motion: 'inward_pull', particleDensity: 0.5,
    scale: 0.96, pulseSpeed: 1.4, rotSpeed: 0.25, distort: 0.18,
    label: 'Listening',
  },
  thinking: {
    color: '#7B68EE', motion: 'orbit_particles', particleDensity: 1.0,
    scale: 1.05, pulseSpeed: 2.2, rotSpeed: 1.1, distort: 0.45,
    label: 'Thinking',
  },
  speaking: {
    color: '#3DA8F5', motion: 'amplitude_pulse', particleDensity: 0.6,
    scale: 1.03, pulseSpeed: 0, rotSpeed: 0.35, distort: 0.32,
    label: 'Speaking',
  },
  alert: {
    color: '#F5A623', motion: 'edge_glow', particleDensity: 0.6,
    scale: 1.02, pulseSpeed: 1.6, rotSpeed: 0.4, distort: 0.3,
    label: 'Attention',
  },
  celebrate: {
    color: '#FFD700', motion: 'warm_bloom', particleDensity: 1.4,
    scale: 1.12, pulseSpeed: 2.6, rotSpeed: 0.8, distort: 0.5,
    label: 'On track!',
  },
};

export function configFor(state) {
  return ORB_STATES[state] || ORB_STATES.idle;
}
