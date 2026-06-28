const { CORPUS } = require('./corpus');

function retrieve(query, topK = 3) {
  const queryTerms = (query || '').toLowerCase().split(/\s+/);
  const scored = CORPUS.map((doc) => {
    const docText = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      if (term.length < 2) continue;
      if (docText.includes(term)) score += 1;
      if (doc.tags.some((t) => t.includes(term))) score += 2;
    }
    return { ...doc, score };
  });
  return scored
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function buildContext(docs) {
  if (!docs || docs.length === 0) return '';
  return docs.map((d) => `[${d.title}] ${d.content}`).join('\n\n');
}

function isAnswerable(query) {
  const results = retrieve(query, 1);
  return {
    answerable: results.length > 0 && results[0].score >= 2,
    topScore: results.length > 0 ? results[0].score : 0,
  };
}

module.exports = { retrieve, buildContext, isAnswerable, CORPUS };
