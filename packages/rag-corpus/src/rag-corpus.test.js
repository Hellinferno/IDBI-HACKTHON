const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { CORPUS, retrieve, buildContext, isAnswerable } = require('./index');

describe('CORPUS', () => {
  it('should have at least 10 documents', () => {
    assert.ok(CORPUS.length >= 10);
  });

  it('all documents should have required fields', () => {
    for (const doc of CORPUS) {
      assert.ok(doc.id, 'missing id');
      assert.ok(doc.title, 'missing title');
      assert.ok(doc.content, 'missing content');
      assert.ok(doc.category, 'missing category');
      assert.ok(Array.isArray(doc.tags), 'tags should be array');
      assert.ok(doc.tags.length > 0, 'should have at least one tag');
    }
  });

  it('should have both product and regulatory categories', () => {
    const categories = [...new Set(CORPUS.map(d => d.category))];
    assert.ok(categories.includes('product'));
    assert.ok(categories.includes('regulatory'));
  });

  it('should have unique ids', () => {
    const ids = CORPUS.map(d => d.id);
    const unique = new Set(ids);
    assert.equal(unique.size, ids.length);
  });

  it('should cover key financial topics', () => {
    const allTags = CORPUS.flatMap(d => d.tags);
    assert.ok(allTags.some(t => t.includes('sip')), 'should cover SIP');
    assert.ok(allTags.some(t => t.includes('tax') || t.includes('80c')), 'should cover tax');
    assert.ok(allTags.some(t => t.includes('risk')), 'should cover risk');
    assert.ok(allTags.some(t => t.includes('goal')), 'should cover goals');
    assert.ok(allTags.some(t => t.includes('emergency')), 'should cover emergency fund');
  });
});

describe('retrieve', () => {
  it('should retrieve SIP-related documents for SIP query', () => {
    const results = retrieve('What is SIP investment');
    assert.ok(results.length > 0);
    assert.ok(results.some(d => d.title.toLowerCase().includes('sip')));
  });

  it('should retrieve tax documents for tax query', () => {
    const results = retrieve('Section 80C tax deduction');
    assert.ok(results.length > 0);
    assert.ok(results.some(d => d.tags.includes('80c')));
  });

  it('should retrieve risk documents for risk query', () => {
    const results = retrieve('risk assessment profiling');
    assert.ok(results.length > 0);
    assert.ok(results.some(d => d.tags.includes('risk')));
  });

  it('should retrieve goal documents for goal query', () => {
    const results = retrieve('goal based investing retirement');
    assert.ok(results.length > 0);
    assert.ok(results.some(d => d.tags.includes('goal')));
  });

  it('should respect topK limit', () => {
    const results = retrieve('investment mutual fund risk', 2);
    assert.ok(results.length <= 2);
  });

  it('should return empty for irrelevant query', () => {
    const results = retrieve('quantum computing blockchain');
    assert.equal(results.length, 0);
  });

  it('should return results sorted by score descending', () => {
    const results = retrieve('SIP investment mutual fund');
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i].score <= results[i - 1].score);
    }
  });

  it('should handle empty query', () => {
    const results = retrieve('');
    assert.equal(results.length, 0);
  });

  it('should handle null query', () => {
    const results = retrieve(null);
    assert.equal(results.length, 0);
  });
});

describe('buildContext', () => {
  it('should build context from documents', () => {
    const docs = [{ title: 'Test', content: 'Content' }];
    const ctx = buildContext(docs);
    assert.ok(ctx.includes('[Test]'));
    assert.ok(ctx.includes('Content'));
  });

  it('should handle empty docs', () => {
    assert.equal(buildContext([]), '');
  });

  it('should handle null docs', () => {
    assert.equal(buildContext(null), '');
  });

  it('should join multiple docs with newlines', () => {
    const docs = [
      { title: 'A', content: 'Content A' },
      { title: 'B', content: 'Content B' },
    ];
    const ctx = buildContext(docs);
    assert.ok(ctx.includes('[A] Content A'));
    assert.ok(ctx.includes('[B] Content B'));
    assert.ok(ctx.includes('\n\n'));
  });
});

describe('isAnswerable', () => {
  it('should return answerable for known topics', () => {
    const result = isAnswerable('What is SIP investment');
    assert.ok(result.answerable);
    assert.ok(result.topScore >= 2);
  });

  it('should return not answerable for unknown topics', () => {
    const result = isAnswerable('quantum computing blockchain');
    assert.equal(result.answerable, false);
    assert.equal(result.topScore, 0);
  });

  it('should return score for partial matches', () => {
    const result = isAnswerable('invest');
    assert.ok(result.topScore >= 0);
  });
});
