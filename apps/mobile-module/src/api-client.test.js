/**
 * Tests for API Client.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { createApiClient } = require('./api-client');

describe('createApiClient', () => {
  it('should create an API client', () => {
    const client = createApiClient({ token: 'test-token' });
    assert.ok(client);
    assert.strictEqual(typeof client.getProfile, 'function');
    assert.strictEqual(typeof client.submitRiskAssessment, 'function');
    assert.strictEqual(typeof client.getSpending, 'function');
    assert.strictEqual(typeof client.createGoal, 'function');
    assert.strictEqual(typeof client.getGoalProjection, 'function');
    assert.strictEqual(typeof client.simulateGoal, 'function');
    assert.strictEqual(typeof client.getRecommendations, 'function');
    assert.strictEqual(typeof client.takeRecommendationAction, 'function');
    assert.strictEqual(typeof client.createConversation, 'function');
    assert.strictEqual(typeof client.sendMessage, 'function');
    assert.strictEqual(typeof client.getMessages, 'function');
    assert.strictEqual(typeof client.getNudges, 'function');
    assert.strictEqual(typeof client.dismissNudge, 'function');
    assert.strictEqual(typeof client.getConsents, 'function');
    assert.strictEqual(typeof client.updateConsent, 'function');
    assert.strictEqual(typeof client.getAvatarStates, 'function');
  });

  it('should have all required methods', () => {
    const client = createApiClient({ token: 'test' });
    const methods = Object.keys(client);
    assert.ok(methods.length >= 15);
  });
});
