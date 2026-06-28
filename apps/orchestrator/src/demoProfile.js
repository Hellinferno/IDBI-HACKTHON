/**
 * Demo user profile (stand-in for the Profile service + seeded DB).
 * Tuned so the headline flows all return compelling, story-friendly numbers:
 *  - Idle cash:   ₹2,00,000 balance, ₹50,000 buffer-adjusted idle → sweep ₹50,000
 *  - Goal gap:    ₹15,000 SIP + ₹3,50,000 corpus falls short of big goals
 *  - 80C gap:     ₹90,000 invested of ₹1,50,000 → ₹60,000 still to invest
 * Matches the "Rahul Sharma / CUST_001" persona from infra/mock-bank-core.
 */
const DEMO_PROFILE = {
  name: 'Rahul Sharma',
  riskBand: 'moderate',
  balance: 200000, // savings balance (drives idle-cash)
  avgMonthlyOutflow: 50000, // → 3-month buffer of ₹1,50,000
  currentCorpus: 350000, // existing investments (drives goal projection)
  monthlyContribution: 15000, // current SIP
  invested80c: 90000, // → ₹60,000 remaining under Section 80C
  monthlyIncome: 95000,
};

module.exports = { DEMO_PROFILE };
