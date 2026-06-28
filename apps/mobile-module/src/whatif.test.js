/**
 * Tests for the What-If Simulator.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { createWhatIfSimulator, clampSlider, SLIDER_BOUNDS } = require('./whatif');

function fakeClient(result = { corpus: 100 }) {
  const calls = [];
  return {
    calls,
    simulateGoal: async (goalId, params) => {
      calls.push({ goalId, params });
      return result;
    },
  };
}

describe('createWhatIfSimulator', () => {
  it('throws without an apiClient', () => {
    assert.throws(() => createWhatIfSimulator({ goalId: 'g1' }));
  });

  it('throws without a goalId', () => {
    assert.throws(() => createWhatIfSimulator({ apiClient: fakeClient() }));
  });

  it('clamps slider params to bounds', () => {
    const sim = createWhatIfSimulator({ apiClient: fakeClient(), goalId: 'g1' });
    sim.setParam('monthlySip', 1000000); // above max 200000
    assert.strictEqual(sim.getParams().monthlySip, 200000);
    sim.setParam('years', 0); // below min 1
    assert.strictEqual(sim.getParams().years, 1);
  });

  it('recompute calls the engine with the current params', async () => {
    const client = fakeClient({ corpus: 5000 });
    const sim = createWhatIfSimulator({ apiClient: client, goalId: 'g1' });
    sim.setParam('monthlySip', 5000);
    const r = await sim.recompute();
    assert.strictEqual(r.corpus, 5000);
    assert.strictEqual(client.calls.length, 1);
    assert.strictEqual(client.calls[0].goalId, 'g1');
    assert.strictEqual(client.calls[0].params.monthlySip, 5000);
  });

  it('delivers engine output to onResult', async () => {
    let got;
    const sim = createWhatIfSimulator({ apiClient: fakeClient({ corpus: 42 }), goalId: 'g1', onResult: (r) => { got = r; } });
    await sim.recompute();
    assert.strictEqual(got.corpus, 42);
  });

  it('reset restores the initial params', () => {
    const sim = createWhatIfSimulator({ apiClient: fakeClient(), goalId: 'g1', initialParams: { years: 10 } });
    sim.setParam('years', 20);
    sim.reset();
    assert.strictEqual(sim.getParams().years, 10);
  });

  it('propagates engine errors to onError and rejects', async () => {
    const client = { simulateGoal: async () => { throw new Error('engine down'); } };
    let err;
    const sim = createWhatIfSimulator({ apiClient: client, goalId: 'g1', onError: (e) => { err = e; } });
    await assert.rejects(() => sim.recompute());
    assert.ok(err);
  });
});

describe('clampSlider', () => {
  it('clamps to declared bounds', () => {
    assert.strictEqual(clampSlider('years', 100), SLIDER_BOUNDS.years.max);
    assert.strictEqual(clampSlider('years', -5), SLIDER_BOUNDS.years.min);
  });

  it('passes through unknown sliders unchanged', () => {
    assert.strictEqual(clampSlider('unknown', 7), 7);
  });
});
