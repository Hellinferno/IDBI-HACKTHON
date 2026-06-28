/**
 * Conversation Orchestrator.
 * Turn manager: resolves intent, fetches context + RAG, calls LLM,
 * delegates numeric requests to Computation Engine.
 */

const { classifyIntent } = require('./intent');
const { retrieve, buildContext } = require('./rag');
const { generateResponse } = require('./llm');

const COMPUTATION_ENGINE_URL = process.env.COMPUTATION_ENGINE_URL || 'http://localhost:8001';
const ENGINE_TIMEOUT_MS = Number(process.env.ENGINE_TIMEOUT_MS || 5000);

// In-memory conversation store
const conversations = new Map();
const messages = new Map();

/**
 * Process a user message through the full advisory pipeline.
 * @param {object} params
 * @param {string} params.conversationId
 * @param {string} params.userId
 * @param {string} params.text - User's message
 * @param {object} params.profile - User's financial profile
 * @returns {AsyncGenerator} Yields events: avatar_state, token, card, done
 */
async function* processTurn({ conversationId, userId, text, profile }) {
  // 1. Avatar → listening
  yield { type: 'avatar_state', state: 'listening' };

  // 2. Classify intent
  const { intent, requiresComputation } = classifyIntent(text);

  // 3. Retrieve RAG context
  const ragResults = retrieve(text, 3);
  const ragContext = buildContext(ragResults);

  // 4. Avatar → thinking
  yield { type: 'avatar_state', state: 'thinking' };

  // 5. Call computation engine if needed
  let engineResults = {};
  if (requiresComputation) {
    engineResults = await callComputationEngine(intent, text, profile);
  }

  // 6. Generate LLM response with verified numbers
  const response = await generateResponse({
    userMessage: text,
    context: ragContext,
    engineResults,
    profile,
  });

  // 7. Avatar → speaking
  yield { type: 'avatar_state', state: response.avatarState };

  // 8. Stream response tokens
  const tokens = response.text.split(' ');
  for (let i = 0; i < tokens.length; i++) {
    yield { type: 'token', text: (i === 0 ? '' : ' ') + tokens[i] };
  }

  // 9. Send any cards
  if (engineResults.goalPlan) {
    yield { type: 'card', card: { kind: 'goal', data: engineResults.goalPlan } };
  }
  if (engineResults.allocation) {
    yield { type: 'card', card: { kind: 'recommendation', data: engineResults.allocation } };
  }
  if (engineResults.idleCash) {
    yield { type: 'card', card: { kind: 'idle_cash', data: engineResults.idleCash } };
  }
  if (engineResults.tax80c) {
    yield { type: 'card', card: { kind: 'tax', data: engineResults.tax80c } };
  }

  // 10. Done
  yield { type: 'done', messageId: `m_${Date.now()}` };
}

/**
 * POST to the computation engine and return the parsed JSON.
 * The engine is the single source of truth for every number we surface.
 * @param {string} path - Engine route, e.g. '/compute/goal-plan'
 * @param {object} body - Request payload
 * @returns {Promise<object>} Engine response
 */
async function postEngine(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENGINE_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${COMPUTATION_ENGINE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new Error(`engine ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/**
 * Add a whole number of years to an ISO date (YYYY-MM-DD).
 */
function addYears(isoDate, years) {
  const d = new Date(isoDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
}

/**
 * Extract goal parameters from free-form text, falling back to the user's
 * profile and sensible demo defaults so a turn never breaks mid-conversation.
 * (A real LLM tool-call can replace this with robust slot-filling.)
 * @param {string} text
 * @param {object} profile
 * @returns {object} goal-plan request body
 */
function extractGoalParams(text, profile) {
  const t = (text || '').toLowerCase();

  // Amount: "20 lakh"/"20l", "1 crore"/"1cr", or a bare number like 2000000.
  let targetToday = profile?.goalTarget || '2000000';
  const croreMatch = t.match(/(\d+(?:\.\d+)?)\s*(crore|cr)\b/);
  const lakhMatch = t.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|l)\b/);
  const bareMatch = t.match(/\b(\d{5,})\b/);
  if (croreMatch) targetToday = String(Math.round(parseFloat(croreMatch[1]) * 1e7));
  else if (lakhMatch) targetToday = String(Math.round(parseFloat(lakhMatch[1]) * 1e5));
  else if (bareMatch) targetToday = bareMatch[1];

  // Horizon: "in 3 years", "3 yr", "after 5 years".
  let years = 3;
  const yearMatch = t.match(/(\d+)\s*(year|yr)/);
  if (yearMatch) years = parseInt(yearMatch[1], 10);

  const asOf = profile?.asOf || new Date().toISOString().split('T')[0];

  const returnByBand = { conservative: '8', moderate: '11', aggressive: '13' };
  const expectedReturn = returnByBand[profile?.riskBand] || '11';

  return {
    target_today: targetToday,
    target_date: addYears(asOf, years),
    expected_return: expectedReturn,
    inflation: '6',
    current_corpus: String(profile?.currentCorpus ?? profile?.balance ?? 350000),
    monthly_contribution: String(profile?.monthlyContribution ?? 15000),
    as_of: asOf,
  };
}

/**
 * Call the computation engine based on intent. Every figure returned here
 * comes from the engine over HTTP — the LLM only phrases these numbers.
 * @param {string} intent
 * @param {string} text
 * @param {object} profile
 * @returns {Promise<object>} Engine results keyed for the response layer
 */
async function callComputationEngine(intent, text, profile) {
  try {
    switch (intent) {
      case 'goal_create':
      case 'goal_status':
      case 'what_if':
      case 'affordability': {
        const params = extractGoalParams(text, profile);
        const plan = await postEngine('/compute/goal-plan', params);
        // Merge the inputs the response layer needs back in (engine returns derived figures only).
        return {
          goalPlan: {
            targetToday: params.target_today,
            targetDate: params.target_date,
            monthlyContribution: params.monthly_contribution,
            ...plan,
          },
        };
      }
      case 'allocation': {
        const allocation = await postEngine('/compute/allocation', {
          risk_band: profile?.riskBand || 'moderate',
        });
        return { allocation };
      }
      case 'idle_cash': {
        const idleCash = await postEngine('/compute/idle-cash', {
          balance: String(profile?.balance ?? 200000),
          avg_monthly_outflow: String(profile?.avgMonthlyOutflow ?? 50000),
          buffer_months: 3,
          idle_days: 30,
        });
        return { idleCash };
      }
      case 'tax': {
        const tax80c = await postEngine('/compute/tax-80c-gap', {
          invested_80c: String(profile?.invested80c ?? 100000),
          limit: '150000.00',
        });
        return { tax80c };
      }
      default:
        return {};
    }
  } catch (err) {
    console.error('Computation engine call failed:', err.message);
    return {};
  }
}

/**
 * Create a new conversation.
 * @param {string} userId
 * @param {string} channel - 'text' or 'voice'
 * @returns {{ conversationId: string }}
 */
function createConversation(userId, channel = 'text') {
  const conversationId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  conversations.set(conversationId, {
    id: conversationId,
    userId,
    channel,
    startedAt: new Date().toISOString(),
  });
  messages.set(conversationId, []);
  return { conversationId };
}

/**
 * Add a message to conversation history.
 * @param {string} conversationId
 * @param {object} message - { role, content, avatarState }
 */
function addMessage(conversationId, message) {
  const convMessages = messages.get(conversationId) || [];
  convMessages.push({
    id: `m_${Date.now()}`,
    ...message,
    createdAt: new Date().toISOString(),
  });
  messages.set(conversationId, convMessages);
}

/**
 * Get conversation messages.
 * @param {string} conversationId
 * @returns {Array}
 */
function getMessages(conversationId) {
  return messages.get(conversationId) || [];
}

module.exports = { processTurn, createConversation, addMessage, getMessages };
