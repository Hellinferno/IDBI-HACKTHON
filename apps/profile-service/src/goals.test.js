const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { createGoal, getGoal, getGoalsByUser, computeProjection, simulateGoal, goals } = require('./goals');

describe('Goals', () => {
  beforeEach(() => {
    goals.clear();
  });

  describe('createGoal', () => {
    it('should create a goal with required fields', () => {
      const goal = createGoal('u1', {
        name: 'Retirement',
        goalType: 'retirement',
        targetAmount: '5000000',
        targetDate: '2040-01-01',
        priority: 1,
      });
      assert.ok(goal.id);
      assert.equal(goal.userId, 'u1');
      assert.equal(goal.name, 'Retirement');
      assert.equal(goal.goalType, 'retirement');
      assert.equal(goal.targetAmount, 5000000);
      assert.equal(goal.status, 'active');
    });

    it('should generate unique IDs', () => {
      const g1 = createGoal('u1', { name: 'A', goalType: 'custom', targetAmount: '1000', targetDate: '2030-01-01' });
      const g2 = createGoal('u1', { name: 'B', goalType: 'custom', targetAmount: '2000', targetDate: '2030-01-01' });
      assert.notEqual(g1.id, g2.id);
    });

    it('should default priority to 1', () => {
      const goal = createGoal('u1', { name: 'Goal', goalType: 'custom', targetAmount: '1000', targetDate: '2030-01-01' });
      assert.equal(goal.priority, 1);
    });

    it('should default inflation rate to 6.0', () => {
      const goal = createGoal('u1', { name: 'Goal', goalType: 'custom', targetAmount: '1000', targetDate: '2030-01-01' });
      assert.equal(goal.inflationRate, '6.0');
    });
  });

  describe('getGoal', () => {
    it('should retrieve an existing goal', () => {
      const goal = createGoal('u1', { name: 'Goal', goalType: 'custom', targetAmount: '1000', targetDate: '2030-01-01' });
      const found = getGoal(goal.id);
      assert.ok(found);
      assert.equal(found.id, goal.id);
    });

    it('should return null for unknown goal', () => {
      assert.equal(getGoal('nonexistent'), null);
    });
  });

  describe('getGoalsByUser', () => {
    it('should return goals for a user', () => {
      createGoal('u1', { name: 'A', goalType: 'custom', targetAmount: '1000', targetDate: '2030-01-01' });
      createGoal('u1', { name: 'B', goalType: 'custom', targetAmount: '2000', targetDate: '2030-01-01' });
      createGoal('u2', { name: 'C', goalType: 'custom', targetAmount: '3000', targetDate: '2030-01-01' });
      const userGoals = getGoalsByUser('u1');
      assert.equal(userGoals.length, 2);
    });

    it('should return empty for user with no goals', () => {
      assert.equal(getGoalsByUser('nobody').length, 0);
    });
  });

  describe('computeProjection', () => {
    it('should compute projection with default params', () => {
      const goal = createGoal('u1', {
        name: 'House',
        goalType: 'home',
        targetAmount: '5000000',
        targetDate: '2035-01-01',
      });
      const proj = computeProjection(goal);
      assert.ok(proj.requiredCorpus);
      assert.ok(proj.projectedCorpus);
      assert.ok(proj.gap);
      assert.ok(proj.assumptions);
      assert.equal(proj.goalId, goal.id);
      assert.ok(proj.computedAt);
    });

    it('should inflate target by inflation rate', () => {
      const goal = createGoal('u1', {
        name: 'Goal',
        goalType: 'custom',
        targetAmount: '1000000',
        targetDate: '2030-01-01',
      });
      const proj = computeProjection(goal);
      const inflated = parseFloat(proj.requiredCorpus);
      assert.ok(inflated > 1000000, 'Required corpus should be inflated');
    });

    it('should compute gap when contribution is insufficient', () => {
      const goal = createGoal('u1', {
        name: 'Big Goal',
        goalType: 'custom',
        targetAmount: '10000000',
        targetDate: '2028-01-01',
        monthlyContribution: '5000',
      });
      const proj = computeProjection(goal, { monthlyContribution: 5000 });
      assert.ok(parseFloat(proj.gap) > 0, 'Should have a gap');
    });

    it('should return zero gap when contribution is sufficient', () => {
      const goal = createGoal('u1', {
        name: 'Small Goal',
        goalType: 'custom',
        targetAmount: '10000',
        targetDate: '2030-01-01',
      });
      const proj = computeProjection(goal, { monthlyContribution: 50000 });
      assert.equal(parseFloat(proj.gap), 0);
    });

    it('should include assumptions', () => {
      const goal = createGoal('u1', {
        name: 'Goal',
        goalType: 'custom',
        targetAmount: '100000',
        targetDate: '2030-01-01',
      });
      const proj = computeProjection(goal);
      assert.ok(proj.assumptions.inflation);
      assert.ok(proj.assumptions.expectedReturn);
    });
  });

  describe('simulateGoal', () => {
    it('should simulate with custom params', () => {
      const goal = createGoal('u1', {
        name: 'Goal',
        goalType: 'custom',
        targetAmount: '1000000',
        targetDate: '2035-01-01',
      });
      const result = simulateGoal(goal.id, { monthlyContribution: 15000 });
      assert.ok(result);
      assert.equal(result.goalId, goal.id);
      assert.equal(parseFloat(result.monthlyContribution), 15000);
    });

    it('should return null for unknown goal', () => {
      assert.equal(simulateGoal('nonexistent', {}), null);
    });

    it('should allow changing target date', () => {
      const goal = createGoal('u1', {
        name: 'Goal',
        goalType: 'custom',
        targetAmount: '1000000',
        targetDate: '2035-01-01',
      });
      const result = simulateGoal(goal.id, { targetDate: '2040-01-01' });
      assert.ok(result);
      assert.ok(result.monthsToGoal > 0);
    });
  });
});
