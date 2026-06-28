/**
 * RAG (Retrieval-Augmented Generation) module.
 * Retrieves relevant context from catalog + regulatory corpus.
 */

// Mock RAG corpus (would come from vector DB in production)
const RAG_CORPUS = [
  {
    id: 'doc-1',
    title: 'SIP Investment Guide',
    content: 'A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in mutual funds. SIPs benefit from rupee cost averaging and are ideal for long-term wealth creation.',
    category: 'product',
    tags: ['sip', 'mutual_fund', 'investment'],
  },
  {
    id: 'doc-2',
    title: 'Section 80C Tax Benefits',
    content: 'Under Section 80C of the Income Tax Act, you can claim deductions up to ₹1,50,000 per year on investments in ELSS, PPF, NSC, and other qualifying instruments.',
    category: 'regulatory',
    tags: ['tax', '80c', 'elss', 'deduction'],
  },
  {
    id: 'doc-3',
    title: 'Emergency Fund Recommendations',
    content: 'Financial experts recommend maintaining an emergency fund of 6-12 months of essential expenses in liquid funds or high-yield savings accounts.',
    category: 'product',
    tags: ['emergency', 'liquid_fund', 'savings'],
  },
  {
    id: 'doc-4',
    title: 'Risk Assessment Methodology',
    content: 'Risk profiling considers age, income, investment horizon, risk tolerance, and financial goals. Scores range from 0-100, mapped to conservative, moderate, or aggressive bands.',
    category: 'regulatory',
    tags: ['risk', 'assessment', 'profiling'],
  },
  {
    id: 'doc-5',
    title: 'Asset Allocation by Risk Profile',
    content: 'Conservative: 20% equity, 60% debt, 20% cash. Moderate: 50% equity, 35% debt, 15% cash. Aggressive: 75% equity, 20% debt, 5% cash.',
    category: 'product',
    tags: ['allocation', 'risk', 'equity', 'debt'],
  },
  {
    id: 'doc-6',
    title: 'Goal-Based Investing',
    content: 'Goal-based investing aligns your investment strategy with specific financial objectives like retirement, education, or home purchase. Each goal has its own timeline and risk profile.',
    category: 'product',
    tags: ['goal', 'planning', 'retirement', 'education'],
  },
  {
    id: 'doc-7',
    title: 'KYC Requirements',
    content: 'Know Your Customer (KYC) is mandatory for all financial transactions. PAN, Aadhaar, and address proof are required for KYC verification.',
    category: 'regulatory',
    tags: ['kyc', 'compliance', 'verification'],
  },
  {
    id: 'doc-8',
    title: 'Mutual Fund Risk Categories',
    content: 'Mutual funds are categorized by SEBI into low, moderate, and high risk based on their underlying assets and investment strategy.',
    category: 'regulatory',
    tags: ['mutual_fund', 'risk', 'sebi', 'classification'],
  },
];

/**
 * Simple keyword-based retrieval (would use vector similarity in production).
 * @param {string} query
 * @param {number} topK - Number of results
 * @returns {Array} Relevant documents
 */
function retrieve(query, topK = 3) {
  const queryTerms = (query || '').toLowerCase().split(/\s+/);

  const scored = RAG_CORPUS.map((doc) => {
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

/**
 * Build context string from retrieved documents.
 * @param {Array} docs
 * @returns {string}
 */
function buildContext(docs) {
  if (!docs || docs.length === 0) return '';
  return docs.map((d) => `[${d.title}] ${d.content}`).join('\n\n');
}

/**
 * Check if a query can be answered from corpus.
 * @param {string} query
 * @returns {{ answerable: boolean, topScore: number }}
 */
function isAnswerable(query) {
  const results = retrieve(query, 1);
  return {
    answerable: results.length > 0 && results[0].score >= 2,
    topScore: results.length > 0 ? results[0].score : 0,
  };
}

module.exports = { retrieve, buildContext, isAnswerable, RAG_CORPUS };
