/**
 * What-If Simulator.
 * Maps goal-screen sliders -> engine recompute (never local math).
 * Every number comes from the computation engine via the API client;
 * this module only manages slider state + recompute dispatch. This keeps
 * the "numbers are never invented in the client" invariant intact.
 */

const SLIDER_BOUNDS = {
  monthlySip: { min: 500, max: 200000, step: 500 },
  years: { min: 1, max: 40, step: 1 },
  expectedReturn: { min: 1, max: 20, step: 0.5 },
  targetAmount: { min: 10000, max: 100000000, step: 10000 },
  lumpsum: { min: 0, max: 100000000, step: 10000 },
};

/**
 * Clamp a slider value to its declared bounds.
 * @param {string} name
 * @param {number} value
 * @returns {number}
 */
function clampSlider(name, value) {
  const b = SLIDER_BOUNDS[name];
  if (!b) return value;
  return Math.max(b.min, Math.min(b.max, value));
}

/**
 * Create a what-if simulator bound to a goal.
 * @param {object} opts
 * @param {object} opts.apiClient - must expose simulateGoal(goalId, params)
 * @param {string} opts.goalId
 * @param {object} [opts.initialParams]
 * @param {Function} [opts.onResult]
 * @param {Function} [opts.onError]
 * @returns {object}
 */
function createWhatIfSimulator({ apiClient, goalId, initialParams = {}, onResult = () => {}, onError = () => {} }) {
  if (!apiClient || typeof apiClient.simulateGoal !== 'function') {
    throw new Error('apiClient with simulateGoal() required');
  }
  if (!goalId) throw new Error('goalId required');

  let params = { ...initialParams };

  function setParam(name, value) {
    params = { ...params, [name]: clampSlider(name, value) };
    return params[name];
  }

  function getParams() {
    return { ...params };
  }

  async function recompute() {
    try {
      const result = await apiClient.simulateGoal(goalId, params);
      onResult(result);
      return result;
    } catch (err) {
      onError(err);
      throw err;
    }
  }

  function reset() {
    params = { ...initialParams };
  }

  return { setParam, getParams, recompute, reset, bounds: SLIDER_BOUNDS };
}

module.exports = { createWhatIfSimulator, SLIDER_BOUNDS, clampSlider };
