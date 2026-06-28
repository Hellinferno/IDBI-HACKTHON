/**
 * Level of Detail (LOD) + 2D fallback.
 * Picks a render tier from device capability so the orb holds >= 30fps
 * on mid-tier Android, degrading to a 2D shader ring on low-end devices.
 */

const LOD_TIERS = {
  high: {
    key: 'high',
    sphereSegments: 128,
    particleCount: 2000,
    shaderQuality: 'high',
    use2D: false,
    estFrameCostMs: 8,
    description: 'Flagship GPUs - full particle field + high-poly orb',
  },
  mid: {
    key: 'mid',
    sphereSegments: 64,
    particleCount: 600,
    shaderQuality: 'medium',
    use2D: false,
    estFrameCostMs: 22,
    description: 'Mid-tier Android - target tier, must hold 30fps',
  },
  low: {
    key: 'low',
    sphereSegments: 32,
    particleCount: 150,
    shaderQuality: 'low',
    use2D: false,
    estFrameCostMs: 30,
    description: 'Budget devices - reduced poly + particles',
  },
  fallback2d: {
    key: 'fallback2d',
    sphereSegments: 0,
    particleCount: 0,
    shaderQuality: 'fallback',
    use2D: true,
    estFrameCostMs: 6,
    description: '2D shader ring - no WebGL / very low-end devices',
  },
};

const TARGET_FPS = 30;
const FRAME_BUDGET_MS = 1000 / TARGET_FPS; // 33.33ms

/**
 * Select a LOD tier from device capability hints.
 * Steps down one tier under power-save or reduced-motion constraints.
 * @param {object} caps
 * @param {string} [caps.gpuTier] - 'high' | 'mid' | 'low'
 * @param {boolean} [caps.isLowPowerMode]
 * @param {boolean} [caps.prefersReducedMotion]
 * @param {boolean} [caps.supportsWebGL]
 * @returns {string} tier key
 */
function selectLod({ gpuTier = 'mid', isLowPowerMode = false, prefersReducedMotion = false, supportsWebGL = true } = {}) {
  if (!supportsWebGL) return 'fallback2d';
  if (isLowPowerMode || prefersReducedMotion) {
    if (gpuTier === 'high') return 'mid';
    if (gpuTier === 'mid') return 'low';
    return 'fallback2d';
  }
  if (LOD_TIERS[gpuTier]) return gpuTier;
  return 'mid';
}

/**
 * Get a tier config by key.
 * @param {string} key
 * @returns {object|null}
 */
function getTier(key) {
  return LOD_TIERS[key] || null;
}

/**
 * Get the 2D fallback tier.
 * @returns {object}
 */
function get2DFallback() {
  return LOD_TIERS.fallback2d;
}

/**
 * Estimated per-frame render cost in ms for a tier.
 * @param {string} tierKey
 * @returns {number}
 */
function estimateFrameCost(tierKey) {
  const tier = LOD_TIERS[tierKey];
  return tier ? tier.estFrameCostMs : Infinity;
}

/**
 * Whether a tier stays within the frame budget for a target FPS.
 * @param {string} tierKey
 * @param {number} [targetFps]
 * @returns {boolean}
 */
function meetsFrameBudget(tierKey, targetFps = TARGET_FPS) {
  return estimateFrameCost(tierKey) <= 1000 / targetFps;
}

module.exports = {
  LOD_TIERS,
  TARGET_FPS,
  FRAME_BUDGET_MS,
  selectLod,
  getTier,
  get2DFallback,
  estimateFrameCost,
  meetsFrameBudget,
};
