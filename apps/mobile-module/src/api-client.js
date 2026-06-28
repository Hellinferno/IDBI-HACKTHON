/**
 * API Client.
 * Generated client for WealthOrb backend services.
 * In production, this would be auto-generated from api-contracts.
 */

const BASE_URL = process.env.WEALTHORB_API_URL || 'http://localhost:8000';

/**
 * Create an API client instance.
 * @param {object} config
 * @param {string} config.token - JWT token from bank app session
 * @param {string} [config.baseUrl]
 * @returns {object} API client
 */
function createApiClient({ token, baseUrl = BASE_URL }) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  /**
   * Make an API request.
   * @param {string} method
   * @param {string} path
   * @param {object} [body]
   * @returns {Promise<object>}
   */
  async function request(method, path, body) {
    const url = `${baseUrl}${path}`;
    const options = {
      method,
      headers,
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`API request failed: ${method} ${path}`, err.message);
      throw err;
    }
  }

  return {
    // Profile
    getProfile: (userId) => request('GET', `/api/v1/profile?userId=${userId}`),
    submitRiskAssessment: (answers) => request('POST', '/api/v1/profile/risk-assessment', { answers }),

    // Insights
    getSpending: (userId, period) => request('GET', `/api/v1/insights/spending?userId=${userId}&period=${period}`),

    // Goals
    createGoal: (goal) => request('POST', '/api/v1/goals', goal),
    getGoalProjection: (goalId) => request('GET', `/api/v1/goals/${goalId}/projection`),
    simulateGoal: (goalId, params) => request('POST', `/api/v1/goals/${goalId}/simulate`, params),

    // Recommendations
    getRecommendations: () => request('GET', '/api/v1/recommendations'),
    takeRecommendationAction: (id, action) => request('POST', `/api/v1/recommendations/${id}/action`, { action }),

    // Conversation
    createConversation: (channel) => request('POST', '/api/v1/conversations', { channel }),
    sendMessage: (conversationId, text) => request('POST', `/api/v1/conversations/${conversationId}/messages`, { text }),
    getMessages: (conversationId) => request('GET', `/api/v1/conversations/${conversationId}/messages`),

    // Nudges
    getNudges: () => request('GET', '/api/v1/nudges'),
    dismissNudge: (id) => request('POST', `/api/v1/nudges/${id}/dismiss`),

    // Consent
    getConsents: (userId) => request('GET', `/api/v1/consents?userId=${userId}`),
    updateConsent: (scope, granted) => request('PUT', '/api/v1/consents', { scope, granted }),

    // Avatar
    getAvatarStates: () => request('GET', '/api/v1/avatar/states'),
  };
}

module.exports = { createApiClient };
