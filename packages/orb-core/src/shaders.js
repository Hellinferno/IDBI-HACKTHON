/**
 * Orb Shaders.
 * GLSL shader sources + uniform schema for the 3D orb.
 * Vertex shader: amplitude-driven pulse + noise displacement.
 * Fragment shader: mood color blend + Fresnel edge glow.
 * Audio amplitude drives scale only - NO lip-sync, NO visemes.
 */

const ORB_VERTEX_SHADER = `
uniform float uTime;
uniform float uAmplitude;   // 0.0..1.0 TTS amplitude (speaking pulse)
uniform float uScale;       // base scale from state
uniform float uPulseSpeed;  // idle/thinking pulse rate
varying vec3 vNormal;
varying vec3 vPosition;

// cheap hash noise
float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}

void main() {
  vNormal = normal;
  vPosition = position;
  float pulse = sin(uTime * uPulseSpeed) * 0.02;
  float amp = uAmplitude * 0.15;              // amplitude pulse (speaking)
  float displacement = pulse + amp + hash(position) * 0.01;
  vec3 displaced = position + normal * displacement;
  vec3 scaled = displaced * uScale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
}
`.trim();

const ORB_FRAGMENT_SHADER = `
precision highp float;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform float uGlow;          // edge glow intensity (alert/celebrate)
uniform float uParticleDensity;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
  vec3 base = mix(uColorPrimary, uColorSecondary, fresnel);
  vec3 glow = uColorSecondary * fresnel * uGlow;
  gl_FragColor = vec4(base + glow, 1.0);
}
`.trim();

// Simplified shader for low-end devices / 2D fallback path.
const FALLBACK_2D_FRAGMENT = `
precision mediump float;
uniform vec3 uColorPrimary;
uniform float uAmplitude;
varying vec2 vUv;

void main() {
  float d = distance(vUv, vec2(0.5));
  float ring = smoothstep(0.5, 0.45, d) * (0.85 + uAmplitude * 0.15);
  gl_FragColor = vec4(uColorPrimary * ring, ring);
}
`.trim();

const UNIFORM_SCHEMA = {
  uTime: { type: 'float', default: 0 },
  uAmplitude: { type: 'float', default: 0 },
  uScale: { type: 'float', default: 1.0 },
  uPulseSpeed: { type: 'float', default: 0 },
  uColorPrimary: { type: 'vec3', default: [0.29, 0.56, 0.85] },
  uColorSecondary: { type: 'vec3', default: [0.36, 0.63, 0.88] },
  uGlow: { type: 'float', default: 0 },
  uParticleDensity: { type: 'float', default: 0.3 },
};

/**
 * Convert a #rrggbb hex string to a normalized [r, g, b] vec3 (0.0..1.0).
 * @param {string} hex
 * @returns {number[]}
 */
function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

/**
 * Build the uniform value map a material would receive from a render frame.
 * @param {object} frame - Output of renderer.composeFrame
 * @returns {object}
 */
function buildUniforms(frame) {
  return {
    uTime: frame.time ?? 0,
    uAmplitude: frame.amplitude ?? 0,
    uScale: frame.scale ?? 1.0,
    uPulseSpeed: frame.pulseSpeed ?? 0,
    uColorPrimary: hexToVec3(frame.color?.primary ?? '#4A90D9'),
    uColorSecondary: hexToVec3(frame.color?.secondary ?? '#5BA0E0'),
    uGlow: frame.glow ?? 0,
    uParticleDensity: frame.particleDensity ?? 0.3,
  };
}

module.exports = {
  ORB_VERTEX_SHADER,
  ORB_FRAGMENT_SHADER,
  FALLBACK_2D_FRAGMENT,
  UNIFORM_SCHEMA,
  hexToVec3,
  buildUniforms,
};
