const crypto = require('crypto');

const goals = new Map();

function createGoal(userId, data) {
  const id = `goal_${crypto.randomUUID().slice(0, 8)}`;
  const goal = {
    id,
    userId,
    name: data.name,
    goalType: data.goalType,
    targetAmount: parseFloat(data.targetAmount),
    targetDate: data.targetDate,
    inflationRate: data.inflationRate || '6.0',
    priority: data.priority || 1,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  goals.set(id, goal);
  return goal;
}

function getGoal(goalId) {
  return goals.get(goalId) || null;
}

function getGoalsByUser(userId) {
  return [...goals.values()].filter(g => g.userId === userId);
}

function computeProjection(goal, params = {}) {
  const inflationRate = parseFloat(params.inflationRate || goal.inflationRate || '6.0') / 100;
  const expectedReturn = parseFloat(params.expectedReturn || '11.0') / 100;
  const monthlyContribution = parseFloat(params.monthlyContribution || goal.monthlyContribution || 5000);
  const targetDate = params.targetDate || goal.targetDate;
  const now = new Date();
  const target = new Date(targetDate);
  const monthsToGoal = Math.max(1, Math.round((target - now) / (1000 * 60 * 60 * 24 * 30)));

  const inflatedTarget = goal.targetAmount * Math.pow(1 + inflationRate, monthsToGoal / 12);
  const monthlyRate = expectedReturn / 12;
  const futureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate);
  const gap = Math.max(0, inflatedTarget - futureValue);
  const requiredSip = gap > 0
    ? (gap * monthlyRate) / (Math.pow(1 + monthlyRate, monthsToGoal) - 1)
    : 0;

  return {
    goalId: goal.id,
    requiredCorpus: String(Math.round(inflatedTarget * 100) / 100),
    monthlyContribution: String(monthlyContribution),
    projectedCorpus: String(Math.round(futureValue * 100) / 100),
    gap: String(Math.round(gap * 100) / 100),
    assumptions: {
      inflation: String(inflationRate * 100),
      expectedReturn: String(expectedReturn * 100),
    },
    computedAt: now.toISOString(),
    monthsToGoal,
    requiredSip: String(Math.round(requiredSip * 100) / 100),
  };
}

function simulateGoal(goalId, params) {
  const goal = goals.get(goalId);
  if (!goal) return null;
  return computeProjection(goal, params);
}

module.exports = { createGoal, getGoal, getGoalsByUser, computeProjection, simulateGoal, goals };
