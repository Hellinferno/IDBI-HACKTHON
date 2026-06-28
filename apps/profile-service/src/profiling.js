/**
 * Financial profiling module.
 * Computes spend personality, life stage, savings capacity from transaction data.
 */

/**
 * Classify spend personality from transaction patterns.
 * @param {object} params
 * @param {number} params.savingsRate - Monthly savings rate (%)
 * @param {number} params.discretionaryPct - % of spending that's discretionary
 * @param {number} params.consistentInvestor - Has regular SIPs
 * @returns {string} spend personality
 */
function classifySpendPersonality({ savingsRate, discretionaryPct, consistentInvestor }) {
  if (savingsRate >= 30 && discretionaryPct < 30) return 'saver';
  if (savingsRate >= 20 && discretionaryPct < 50) return 'balanced';
  if (savingsRate < 10 || discretionaryPct > 60) return 'spender';
  return 'drifter';
}

/**
 * Detect life stage from financial signals.
 * @param {object} params
 * @param {number} params.age - User age (estimated or from profile)
 * @param {boolean} params.hasEducationExpense - Regular education payments
 * @param {boolean} params.hasLoanEmi - Active loan EMIs
 * @param {boolean} params.hasInsurancePremium - Insurance payments
 * @param {number} params.savingsRate - Monthly savings rate
 * @returns {string} life stage
 */
function detectLifeStage({ age, hasEducationExpense, hasLoanEmi, hasInsurancePremium, savingsRate }) {
  if (age < 25) return 'student';
  if (age < 30 && savingsRate > 15) return 'early_career';
  if (age < 45 && (hasEducationExpense || hasLoanEmi)) return 'family';
  if (age >= 45 && age < 60) return 'pre_retirement';
  if (age >= 60) return 'retired';
  return 'early_career';
}

/**
 * Compute savings capacity from income and expenses.
 * @param {object} params
 * @param {number} params.monthlyIncome
 * @param {number} params.recurringOutflow
 * @param {number} params.discretionaryOutflow
 * @returns {{ surplus: number, savingsRate: number, canInvestMonthly: number }}
 */
function computeSavingsCapacity({ monthlyIncome, recurringOutflow, discretionaryOutflow }) {
  const surplus = Math.max(0, monthlyIncome - recurringOutflow - discretionaryOutflow);
  const savingsRate = monthlyIncome > 0 ? (surplus / monthlyIncome) * 100 : 0;

  // After keeping 20% as emergency buffer
  const emergencyBuffer = surplus * 0.2;
  const canInvestMonthly = Math.max(0, surplus - emergencyBuffer);

  return {
    surplus: Math.round(surplus * 100) / 100,
    savingsRate: Math.round(savingsRate * 100) / 100,
    canInvestMonthly: Math.round(canInvestMonthly * 100) / 100,
  };
}

/**
 * Aggregate transactions into monthly summary.
 * @param {Array} transactions - Transaction records
 * @returns {object} Monthly aggregated data
 */
function aggregateMonthly(transactions) {
  const totals = { income: 0, recurring: 0, discretionary: 0, totalOutflow: 0 };
  const categoryTotals = {};

  for (const txn of transactions) {
    const amount = Math.abs(Number(txn.amount));
    const isCredit = txn.direction === 'credit';

    if (isCredit) {
      totals.income += amount;
    } else {
      totals.totalOutflow += amount;
      if (txn.discretionary) {
        totals.discretionary += amount;
      } else {
        totals.recurring += amount;
      }
    }

    const cat = txn.category || 'uncategorized';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
  }

  return {
    ...totals,
    income: Math.round(totals.income * 100) / 100,
    recurring: Math.round(totals.recurring * 100) / 100,
    discretionary: Math.round(totals.discretionary * 100) / 100,
    totalOutflow: Math.round(totals.totalOutflow * 100) / 100,
    categoryTotals,
  };
}

/**
 * Build a complete financial profile from aggregated data.
 * @param {object} params
 * @returns {object} Financial profile
 */
function buildProfile({ monthlyIncome, recurring, discretionary, savingsRate, age, hasSip }) {
  const savingsCapacity = computeSavingsCapacity({
    monthlyIncome,
    recurringOutflow: recurring,
    discretionaryOutflow: discretionary,
  });

  const discretionaryPct = monthlyIncome > 0 ? (discretionary / monthlyIncome) * 100 : 0;

  const spendPersonality = classifySpendPersonality({
    savingsRate: savingsCapacity.savingsRate,
    discretionaryPct,
    consistentInvestor: hasSip,
  });

  const lifeStage = detectLifeStage({
    age,
    hasEducationExpense: false,
    hasLoanEmi: false,
    hasInsurancePremium: false,
    savingsRate: savingsCapacity.savingsRate,
  });

  return {
    monthlyIncome: savingsCapacity.surplus + recurring + discretionary,
    monthlySurplus: savingsCapacity.surplus,
    savingsRate: savingsCapacity.savingsRate,
    spendPersonality,
    lifeStage,
    canInvestMonthly: savingsCapacity.canInvestMonthly,
  };
}

module.exports = {
  classifySpendPersonality,
  detectLifeStage,
  computeSavingsCapacity,
  aggregateMonthly,
  buildProfile,
};
