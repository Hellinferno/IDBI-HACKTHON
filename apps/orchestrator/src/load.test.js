/**
 * Load and performance tests for orchestrator service.
 * Benchmarks intent classification, RAG retrieval, LLM wrapper.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { classifyIntent } = require('./intent');
const { retrieve, isAnswerable } = require('./rag');
const { generateResponse, SYSTEM_PROMPT } = require('./llm');

function bench(fn, iterations = 10000) {
  const latencies = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn(i);
    latencies.push(performance.now() - start);
  }
  latencies.sort((a, b) => a - b);
  return {
    p50: latencies[Math.floor(latencies.length * 0.5)],
    p99: latencies[Math.floor(latencies.length * 0.99)],
    avg: latencies.reduce((s, l) => s + l, 0) / latencies.length,
  };
}

describe('Load: Intent Classification', () => {
  it('should handle 10k intent classifications with p99 < 1ms', () => {
    const stats = bench(() => classifyIntent('What is my current portfolio value?'));
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });

  it('should handle varied inputs with p99 < 2ms', () => {
    const inputs = [
      'How much am I saving?',
      'Can I afford a car?',
      'What is XIRR?',
      'Tell me about mutual funds',
      'Show my transactions',
      'मेरा पोर्टफोलियो क्या है',
    ];
    const stats = bench((i) => classifyIntent(inputs[i % inputs.length]), 5000);
    assert.ok(stats.p99 < 2.0, `p99=${stats.p99.toFixed(3)}ms exceeds 2ms`);
  });
});

describe('Load: RAG Retrieval', () => {
  it('should handle 5k RAG retrievals with p99 < 2ms', () => {
    const stats = bench(() => retrieve('What are ELSS tax benefits?'), 5000);
    assert.ok(stats.p99 < 2.0, `p99=${stats.p99.toFixed(3)}ms exceeds 2ms`);
  });

  it('answerability check should handle 5k calls with p99 < 1ms', () => {
    const stats = bench(() => isAnswerable('What are ELSS benefits?'), 5000);
    assert.ok(stats.p99 < 1.0, `p99=${stats.p99.toFixed(3)}ms exceeds 1ms`);
  });
});

describe('Load: LLM Wrapper', () => {
  it('generateResponse should handle 5k calls with p99 < 2ms', () => {
    const profile = { riskBand: 'moderate', balance: 200000 };
    const context = '[SIP Guide] SIPs benefit from rupee cost averaging.';
    const engineResults = {};
    const stats = bench(() => generateResponse({ userMessage: 'How much am I saving?', context, engineResults, profile }), 5000);
    assert.ok(stats.p99 < 2.0, `p99=${stats.p99.toFixed(3)}ms exceeds 2ms`);
  });

  it('SYSTEM_PROMPT should be non-empty and contain core rules', () => {
    assert.ok(SYSTEM_PROMPT.length > 100);
    assert.ok(SYSTEM_PROMPT.includes('NEVER generate financial numbers'));
  });
});

describe('Load: Determinism', () => {
  it('intent classification should be deterministic', () => {
    const expected = classifyIntent('What is my portfolio value?');
    for (let i = 0; i < 1000; i++) {
      assert.deepStrictEqual(classifyIntent('What is my portfolio value?'), expected);
    }
  });

  it('RAG retrieval should be deterministic', () => {
    const expected = retrieve('ELSS tax benefits');
    for (let i = 0; i < 1000; i++) {
      const result = retrieve('ELSS tax benefits');
      assert.deepStrictEqual(result, expected);
    }
  });
});

describe('Load: No-Fabrication Under Pressure', () => {
  it('LLM response should use engine numbers, not fabricate', () => {
    const profile = { riskBand: 'moderate' };
    const context = '';
    // When no engine results provided, response should not contain fabricated numbers
    for (let i = 0; i < 1000; i++) {
      const result = generateResponse({
        userMessage: 'What is my portfolio value?',
        context,
        engineResults: {},
        profile,
      });
      // Default response should not contain any ₹ amounts
      assert.ok(!result.text.includes('₹'), `Fabricated number found: ${result.text}`);
    }
  });
});
