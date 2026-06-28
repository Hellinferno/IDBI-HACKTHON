/**
 * Profile API routes.
 * GET /profile - Get user's financial profile
 * POST /profile/risk-assessment - Submit risk questionnaire
 * GET /profile/spending - Get spending breakdown
 */

const { computeRiskScore, isRiskAssessmentValid } = require('./risk');
const { aggregateMonthly, buildProfile } = require('./profiling');
const { ingest } = require('./ingestion');
const { createGoal, getGoal, getGoalsByUser, computeProjection, simulateGoal } = require('./goals');

// In-memory store for demo (would be Postgres in production)
const profiles = new Map();
const riskAssessments = new Map();
const transactionCache = new Map();

async function registerRoutes(app) {
  // ─── GET /profile ──────────────────────────────────────────────
  app.get('/profile', async (request, reply) => {
    const userId = request.query.userId || request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const profile = profiles.get(userId);
    const risk = riskAssessments.get(userId);

    if (!profile) {
      return reply.code(404).send({ error: 'Profile not found. Run ingestion first.' });
    }

    return {
      userId,
      financialProfile: {
        monthlyIncome: String(profile.monthlyIncome),
        monthlySurplus: String(profile.monthlySurplus),
        savingsRate: String(profile.savingsRate),
        spendPersonality: profile.spendPersonality,
        lifeStage: profile.lifeStage,
      },
      risk: risk || { score: null, band: null, validUntil: null },
    };
  });

  // ─── POST /profile/risk-assessment ─────────────────────────────
  app.post('/profile/risk-assessment', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const { answers } = request.body || {};
    if (!answers || !Array.isArray(answers)) {
      return reply.code(400).send({ error: 'answers array required' });
    }

    const result = computeRiskScore(answers);
    riskAssessments.set(userId, result);

    return {
      score: result.score,
      band: result.band,
      validUntil: result.validUntil,
    };
  });

  // ─── GET /profile/spending ─────────────────────────────────────
  app.get('/profile/spending', async (request, reply) => {
    const userId = request.query.userId || request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const transactions = transactionCache.get(userId) || [];
    const aggregated = aggregateMonthly(transactions);

    return {
      period: 'last_month',
      categories: Object.entries(aggregated.categoryTotals).map(([category, amount]) => ({
        category,
        amount: String(Math.round(amount * 100) / 100),
        discretionary: isDiscretionary(category),
      })),
      idleCash: {
        amount: '0.00',
        suggestedAction: 'none',
      },
    };
  });

  // ─── POST /profile/ingest ──────────────────────────────────────
  app.post('/profile/ingest', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const { customerRef } = request.body || {};
    if (!customerRef) {
      return reply.code(400).send({ error: 'customerRef required' });
    }

    // Ingest from bank-core
    const { transactions, balances } = await ingest(customerRef);

    // Cache transactions
    transactionCache.set(userId, transactions);

    // Build profile from aggregated data
    const aggregated = aggregateMonthly(transactions);

    // Compute total balance
    const totalBalance = balances.reduce((sum, b) => sum + Number(b.balance), 0);
    const hasSip = transactions.some((t) => t.category === 'sip');

    const profile = buildProfile({
      monthlyIncome: aggregated.income || 85000,
      recurring: aggregated.recurring,
      discretionary: aggregated.discretionary,
      savingsRate: aggregated.income > 0
        ? ((aggregated.income - aggregated.totalOutflow) / aggregated.income) * 100
        : 0,
      age: 30,
      hasSip,
    });

    profiles.set(userId, profile);

    return {
      status: 'ok',
      transactionCount: transactions.length,
      profile: {
        monthlyIncome: String(profile.monthlyIncome),
        monthlySurplus: String(profile.monthlySurplus),
        savingsRate: String(profile.savingsRate),
        spendPersonality: profile.spendPersonality,
        lifeStage: profile.lifeStage,
      },
    };
  });

  // ─── POST /goals ─────────────────────────────────────────────────
  app.post('/goals', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const { name, goalType, targetAmount, targetDate, priority } = request.body || {};
    if (!name || !goalType || !targetAmount || !targetDate) {
      return reply.code(400).send({ error: 'name, goalType, targetAmount, targetDate required' });
    }

    const goal = createGoal(userId, { name, goalType, targetAmount, targetDate, priority });
    const projection = computeProjection(goal);

    return reply.code(201).send({ goal, projection });
  });

  // ─── GET /goals/{goalId}/projection ────────────────────────────
  app.get('/goals/:goalId/projection', async (request, reply) => {
    const { goalId } = request.params;
    const goal = getGoal(goalId);
    if (!goal) {
      return reply.code(404).send({ error: 'Goal not found' });
    }
    return computeProjection(goal);
  });

  // ─── POST /goals/{goalId}/simulate ─────────────────────────────
  app.post('/goals/:goalId/simulate', async (request, reply) => {
    const { goalId } = request.params;
    const result = simulateGoal(goalId, request.body || {});
    if (!result) {
      return reply.code(404).send({ error: 'Goal not found' });
    }
    return result;
  });
}

function isDiscretionary(category) {
  const nonDiscretionary = [
    'salary', 'rent', 'utilities', 'insurance', 'loan_emi',
    'education', 'healthcare', 'groceries', 'sip', 'credit_card_payment',
  ];
  return !nonDiscretionary.includes(category);
}

module.exports = { registerRoutes };
