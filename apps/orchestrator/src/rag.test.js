/**
 * Tests for RAG module.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { retrieve, buildContext, isAnswerable, RAG_CORPUS } = require('./rag');

describe('retrieve', () => {
  it('should retrieve relevant documents for SIP query', () => {
    const results = retrieve('What is SIP investment?', 3);
    assert.ok(results.length > 0);
    assert.ok(results[0].title.includes('SIP'));
  });

  it('should retrieve relevant documents for tax query', () => {
    const results = retrieve('Section 80C tax benefits', 3);
    assert.ok(results.length > 0);
    assert.ok(results[0].tags.includes('80c'));
  });

  it('should return empty for irrelevant query', () => {
    const results = retrieve('quantum physics', 3);
    assert.strictEqual(results.length, 0);
  });

  it('should respect topK limit', () => {
    const results = retrieve('investment fund portfolio', 2);
    assert.ok(results.length <= 2);
  });
});

describe('buildContext', () => {
  it('should build context from documents', () => {
    const docs = [
      { title: 'Doc 1', content: 'Content 1' },
      { title: 'Doc 2', content: 'Content 2' },
    ];
    const context = buildContext(docs);
    assert.ok(context.includes('[Doc 1] Content 1'));
    assert.ok(context.includes('[Doc 2] Content 2'));
  });

  it('should handle empty docs', () => {
    const context = buildContext([]);
    assert.strictEqual(context, '');
  });

  it('should handle null docs', () => {
    const context = buildContext(null);
    assert.strictEqual(context, '');
  });
});

describe('isAnswerable', () => {
  it('should return answerable for known topics', () => {
    const result = isAnswerable('What is SIP?');
    assert.strictEqual(result.answerable, true);
  });

  it('should return not answerable for unknown topics', () => {
    const result = isAnswerable('quantum entanglement');
    assert.strictEqual(result.answerable, false);
  });
});

describe('RAG_CORPUS', () => {
  it('should have documents defined', () => {
    assert.ok(RAG_CORPUS.length > 0);
  });

  it('all documents should have required fields', () => {
    for (const doc of RAG_CORPUS) {
      assert.ok(doc.id);
      assert.ok(doc.title);
      assert.ok(doc.content);
      assert.ok(doc.category);
      assert.ok(Array.isArray(doc.tags));
    }
  });
});
