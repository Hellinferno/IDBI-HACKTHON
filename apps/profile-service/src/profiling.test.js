/**
 * Tests for profiling module.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  classifySpendPersonality,
  detectLifeStage,
  computeSavingsCapacity,
  aggregateMonthly,
  buildProfile,
} = require('./profiling');

describe('classifySpendPersonality', () => {
  it('should classify saver', () => {
    const result = classifySpendPersonality({ savingsRate: 35, discretionaryPct: 25, consistentInvestor: true });
    assert.strictEqual(result, 'saver');
  });

  it('should classify balanced', () => {
    const result = classifySpendPersonality({ savingsRate: 25, discretionaryPct: 40, consistentInvestor: true });
    assert.strictEqual(result, 'balanced');
  });

  it('should classify spender', () => {
    const result = classifySpendPersonality({ savingsRate: 5, discretionaryPct: 70, consistentInvestor: false });
    assert.strictEqual(result, 'spender');
  });

  it('should classify drifter', () => {
    const result = classifySpendPersonality({ savingsRate: 15, discretionaryPct: 55, consistentInvestor: false });
    assert.strictEqual(result, 'drifter');
  });
});

describe('detectLifeStage', () => {
  it('should detect student', () => {
    const result = detectLifeStage({ age: 22, hasEducationExpense: false, hasLoanEmi: false, hasInsurancePremium: false, savingsRate: 10 });
    assert.strictEqual(result, 'student');
  });

  it('should detect early career', () => {
    const result = detectLifeStage({ age: 27, hasEducationExpense: false, hasLoanEmi: false, hasInsurancePremium: false, savingsRate: 20 });
    assert.strictEqual(result, 'early_career');
  });

  it('should detect family', () => {
    const result = detectLifeStage({ age: 35, hasEducationExpense: true, hasLoanEmi: true, hasInsurancePremium: true, savingsRate: 15 });
    assert.strictEqual(result, 'family');
  });

  it('should detect pre-retirement', () => {
    const result = detectLifeStage({ age: 50, hasEducationExpense: false, hasLoanEmi: false, hasInsurancePremium: true, savingsRate: 25 });
    assert.strictEqual(result, 'pre_retirement');
  });

  it('should detect retired', () => {
    const result = detectLifeStage({ age: 65, hasEducationExpense: false, hasLoanEmi: false, hasInsurancePremium: false, savingsRate: 10 });
    assert.strictEqual(result, 'retired');
  });
});

describe('computeSavingsCapacity', () => {
  it('should compute correct surplus', () => {
    const result = computeSavingsCapacity({ monthlyIncome: 85000, recurringOutflow: 50000, discretionaryOutflow: 13000 });
    assert.strictEqual(result.surplus, 22000);
    assert.strictEqual(result.savingsRate, 25.88);
  });

  it('should floor surplus at 0', () => {
    const result = computeSavingsCapacity({ monthlyIncome: 50000, recurringOutflow: 40000, discretionaryOutflow: 20000 });
    assert.strictEqual(result.surplus, 0);
    assert.strictEqual(result.savingsRate, 0);
  });

  it('should compute canInvestMonthly', () => {
    const result = computeSavingsCapacity({ monthlyIncome: 85000, recurringOutflow: 50000, discretionaryOutflow: 13000 });
    // 22000 surplus, 20% buffer = 4400, invest = 17600
    assert.strictEqual(result.canInvestMonthly, 17600);
  });
});

describe('aggregateMonthly', () => {
  it('should aggregate transactions correctly', () => {
    const transactions = [
      { amount: 85000, direction: 'credit', category: 'salary', discretionary: false },
      { amount: 50000, direction: 'debit', category: 'rent', discretionary: false },
      { amount: 9800, direction: 'debit', category: 'dining', discretionary: true },
      { amount: 3200, direction: 'debit', category: 'groceries', discretionary: false },
    ];
    const result = aggregateMonthly(transactions);
    assert.strictEqual(result.income, 85000);
    assert.strictEqual(result.recurring, 53200);
    assert.strictEqual(result.discretionary, 9800);
    assert.strictEqual(result.totalOutflow, 63000);
  });
});

describe('buildProfile', () => {
  it('should build complete profile', () => {
    const result = buildProfile({
      monthlyIncome: 85000,
      recurring: 50000,
      discretionary: 13000,
      savingsRate: 25.88,
      age: 30,
      hasSip: true,
    });
    assert.strictEqual(result.spendPersonality, 'balanced');
    assert.strictEqual(typeof result.lifeStage, 'string');
    assert.ok(result.monthlySurplus >= 0);
    assert.ok(result.savingsRate >= 0);
  });
});
