/**
 * Tests for LLM wrapper.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { generateResponse, generateTemplateResponse, SYSTEM_PROMPT, buildFacts } = require('./llm');

// The deterministic template is the fallback (and offline-demo) path. Exact-string
// assertions are made against it; the Gemini path is non-deterministic by nature.
describe('generateTemplateResponse', () => {
  it('should respond to greeting', () => {
    const result = generateTemplateResponse({ userMessage: 'Hello' });
    assert.ok(result.text);
    assert.strictEqual(result.avatarState, 'speaking');
    assert.ok(result.text.includes('WealthOrb'));
  });

  it('should use engine numbers for goal plan', () => {
    const engineResults = {
      goalPlan: {
        targetToday: '2500000',
        targetDate: '2038-06-01',
        requiredCorpus: '5030491.18',
        projectedCorpus: '3200000.00',
        gap: '1830491.18',
        onTrack: false,
        monthlyContribution: '11800',
      },
    };
    const result = generateTemplateResponse({ userMessage: 'How is my goal?', engineResults });
    assert.ok(result.text.includes('50,30,491'));
    assert.ok(result.text.includes('on track') || result.text.includes('gap'));
  });

  it('should use engine numbers for allocation', () => {
    const engineResults = { allocation: { equity: '50', debt: '35', cash: '15' } };
    const result = generateTemplateResponse({ userMessage: 'What allocation should I have?', engineResults });
    assert.ok(result.text.includes('50%'));
    assert.ok(result.text.includes('35%'));
  });

  it('should use engine numbers for idle cash', () => {
    const engineResults = {
      idleCash: { idleAmount: '50000.00', buffer: '150000.00', suggestedSweep: '50000.00' },
    };
    const result = generateTemplateResponse({ userMessage: 'I have idle cash', engineResults });
    assert.ok(result.text.includes('50,000'));
  });

  it('should use engine numbers for tax', () => {
    const engineResults = { tax80c: { remaining: '50000.00' } };
    const result = generateTemplateResponse({ userMessage: 'How can I save tax?', engineResults });
    assert.ok(result.text.includes('50,000'));
  });

  it('should handle portfolio query', () => {
    const result = generateTemplateResponse({ userMessage: 'Show my portfolio' });
    assert.ok(result.text);
    assert.strictEqual(result.avatarState, 'thinking');
  });

  it('should have default response for unknown queries', () => {
    const result = generateTemplateResponse({ userMessage: 'something random' });
    assert.ok(result.text);
  });
});

describe('generateResponse (async, falls back to template without a key)', () => {
  it('returns a promise that resolves to text via the template fallback', async () => {
    const result = await generateResponse({ userMessage: 'Hello' });
    assert.ok(result.text);
    assert.ok(result.avatarState);
  });
});

describe('buildFacts', () => {
  it('serializes engine numbers into grounding facts', () => {
    const facts = buildFacts({ allocation: { equity: '50', debt: '35', cash: '15' } });
    assert.ok(facts.includes('50% equity'));
  });

  it('returns empty string when there are no engine results', () => {
    assert.strictEqual(buildFacts({}), '');
  });
});

describe('SYSTEM_PROMPT', () => {
  it('should be defined', () => {
    assert.ok(SYSTEM_PROMPT);
    assert.ok(SYSTEM_PROMPT.length > 0);
  });

  it('should mention core rules', () => {
    assert.ok(SYSTEM_PROMPT.includes('NEVER generate financial numbers'));
    assert.ok(SYSTEM_PROMPT.includes('computation engine'));
  });
});
