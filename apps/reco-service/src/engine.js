/**
 * Recommendation Engine.
 * Generates allocation, product match, idle-cash, tax, rebalance recommendations.
 * All outputs pass through Compliance before reaching client.
 */

// Product catalog (would come from DB in production)
const PRODUCT_CATALOG = [
  { id: 'P001', name: 'HDFC Mid-Cap Opportunities Fund', assetClass: 'equity', riskBand: 'aggressive', minInvestment: 5000, attributes: { type: 'mutual_fund', category: 'mid_cap', lockIn: 'none', taxFlag: 'elss' } },
  { id: 'P002', name: 'SBI Bluechip Fund', assetClass: 'equity', riskBand: 'moderate', minInvestment: 5000, attributes: { type: 'mutual_fund', category: 'large_cap', lockIn: 'none', taxFlag: 'none' } },
  { id: 'P003', name: 'ICICI Prudential Liquid Fund', assetClass: 'debt', riskBand: 'conservative', minInvestment: 1000, attributes: { type: 'mutual_fund', category: 'liquid', lockIn: 'none', taxFlag: 'none' } },
  { id: 'P004', name: 'Axis Short Term Fund', assetClass: 'debt', riskBand: 'moderate', minInvestment: 5000, attributes: { type: 'mutual_fund', category: 'short_term', lockIn: 'none', taxFlag: 'none' } },
  { id: 'P005', name: 'Parag Parikh Flexi Cap Fund', assetClass: 'equity', riskBand: 'moderate', minInvestment: 1000, attributes: { type: 'mutual_fund', category: 'flexi_cap', lockIn: 'none', taxFlag: 'none' } },
  { id: 'P006', name: 'Nippon India Liquid Fund', assetClass: 'cash', riskBand: 'conservative', minInvestment: 1000, attributes: { type: 'mutual_fund', category: 'liquid', lockIn: 'none', taxFlag: 'none' } },
  { id: 'P007', name: 'HDFC ELSS Tax Saver', assetClass: 'equity', riskBand: 'moderate', minInvestment: 500, attributes: { type: 'mutual_fund', category: 'elss', lockIn: '3_years', taxFlag: '80c' } },
  { id: 'P008', name: 'Axis ELSS Tax Saver', assetClass: 'equity', riskBand: 'aggressive', minInvestment: 500, attributes: { type: 'mutual_fund', category: 'elss', lockIn: '3_years', taxFlag: '80c' } },
];

const ALLOCATION_MAP = {
  conservative: { equity: 20, debt: 60, cash: 20 },
  moderate: { equity: 50, debt: 35, cash: 15 },
  aggressive: { equity: 75, debt: 20, cash: 5 },
};

/**
 * Generate allocation recommendation from risk band.
 * @param {string} riskBand
 * @returns {object} Allocation recommendation
 */
function generateAllocationReco(riskBand) {
  const alloc = ALLOCATION_MAP[riskBand] || ALLOCATION_MAP.moderate;
  return {
    type: 'allocation',
    payload: alloc,
    rationale: `Based on your ${riskBand} risk profile, we recommend: ${alloc.equity}% equity, ${alloc.debt}% debt, ${alloc.cash}% cash.`,
  };
}

/**
 * Match products from catalog based on allocation and risk band.
 * @param {string} riskBand
 * @param {object} allocation - { equity, debt, cash }
 * @returns {Array} Product recommendations
 */
function matchProducts(riskBand, allocation) {
  const recommendations = [];
  const suitableProducts = PRODUCT_CATALOG.filter((p) => {
    if (riskBand === 'conservative') return p.riskBand === 'conservative';
    if (riskBand === 'moderate') return p.riskBand !== 'aggressive';
    return true;
  });

  for (const [assetClass, pct] of Object.entries(allocation)) {
    const products = suitableProducts.filter((p) => p.assetClass === assetClass);
    if (products.length > 0) {
      const product = products[0]; // Simplified: pick best match
      recommendations.push({
        type: 'product',
        payload: {
          productId: product.id,
          productName: product.name,
          assetClass,
          allocationPct: pct,
          minInvestment: product.minInvestment,
          attributes: product.attributes,
        },
        rationale: `For ${assetClass} allocation (${pct}%), we recommend ${product.name}.`,
      });
    }
  }

  return recommendations;
}

/**
 * Generate idle-cash recommendation.
 * @param {number} idleAmount
 * @param {string} riskBand
 * @returns {object|null} Idle-cash recommendation
 */
function generateIdleCashReco(idleAmount, riskBand) {
  if (idleAmount <= 0) return null;

  const liquidFund = PRODUCT_CATALOG.find((p) => p.assetClass === 'cash' && p.riskBand === 'conservative');
  return {
    type: 'idle_cash',
    payload: {
      amount: String(idleAmount),
      product: liquidFund ? liquidFund.name : 'Liquid Fund',
      productId: liquidFund ? liquidFund.id : null,
    },
    rationale: `You have ₹${idleAmount.toLocaleString('en-IN')} idle in your savings. Consider moving it to ${liquidFund ? liquidFund.name : 'a liquid fund'} for better returns.`,
  };
}

/**
 * Generate tax optimization recommendations.
 * @param {object} params
 * @returns {Array} Tax recommendations
 */
function generateTaxReco({ remaining80c, riskBand }) {
  const recos = [];

  if (remaining80c > 0) {
    const elssProduct = PRODUCT_CATALOG.find(
      (p) => p.attributes.taxFlag === '80c' && (riskBand === 'moderate' || riskBand === 'aggressive')
    );

    recos.push({
      type: 'tax',
      payload: {
        category: '80c',
        remaining: String(remaining80c),
        product: elssProduct ? elssProduct.name : 'ELSS Fund',
        productId: elssProduct ? elssProduct.id : null,
      },
      rationale: `You have ₹${remaining80c.toLocaleString('en-IN')} remaining under Section 80C. Invest in ${elssProduct ? elssProduct.name : 'an ELSS fund'} to save tax.`,
    });
  }

  return recos;
}

/**
 * Generate rebalance recommendation.
 * @param {Array} deltas - From computation engine
 * @returns {Array} Rebalance recommendations
 */
function generateRebalanceRecos(deltas) {
  return deltas.map((delta) => ({
    type: 'rebalance',
    payload: delta,
    rationale: `Your ${delta.assetClass} allocation is off. ${delta.action === 'buy' ? 'Buy' : 'Sell'} ₹${Number(delta.amount).toLocaleString('en-IN')} of ${delta.assetClass}.`,
  }));
}

module.exports = {
  generateAllocationReco,
  matchProducts,
  generateIdleCashReco,
  generateTaxReco,
  generateRebalanceRecos,
  PRODUCT_CATALOG,
  ALLOCATION_MAP,
};
