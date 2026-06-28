/**
 * Orchestrator API routes.
 * POST /conversations - Create conversation
 * POST /conversations/:id/messages - Send message
 * GET /conversations/:id/messages - Get messages
 */

const { processTurn, createConversation, addMessage, getMessages } = require('./orchestrator');
const { DEMO_PROFILE } = require('./demoProfile');

async function registerOrchestratorRoutes(app) {
  // ─── POST /conversations ────────────────────────────────────────
  app.post('/conversations', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const { channel } = request.body || {};
    const result = createConversation(userId, channel || 'text');

    return {
      conversationId: result.conversationId,
      wsUrl: `wss://${request.headers.host}/stream?token=${result.conversationId}`,
    };
  });

  // ─── POST /conversations/:id/messages ───────────────────────────
  app.post('/conversations/:id/messages', async (request, reply) => {
    const { id } = request.params;
    const { text } = request.body || {};
    const userId = request.headers['x-user-id'];

    if (!text) {
      return reply.code(400).send({ error: 'text required' });
    }

    // Add user message
    addMessage(id, { role: 'user', content: text });

    // Process turn (collect events)
    const events = [];
    const profile = DEMO_PROFILE;

    for await (const event of processTurn({
      conversationId: id,
      userId,
      text,
      profile,
    })) {
      events.push(event);
    }

    // Extract final response text
    const tokenEvents = events.filter((e) => e.type === 'token');
    const responseText = tokenEvents.map((e) => e.text).join('');

    // Add assistant message
    addMessage(id, { role: 'assistant', content: responseText });

    return {
      events,
      response: responseText,
    };
  });

  // ─── GET /conversations/:id/messages ────────────────────────────
  app.get('/conversations/:id/messages', async (request, reply) => {
    const { id } = request.params;
    const msgs = getMessages(id);
    return { conversationId: id, messages: msgs };
  });

  // ─── GET /avatar/states ─────────────────────────────────────────
  app.get('/avatar/states', async () => {
    return [
      { key: 'idle', colorHint: '#4FC3F7', motionProfile: 'gentle_breathe' },
      { key: 'listening', colorHint: '#81C784', motionProfile: 'pulse_expand' },
      { key: 'thinking', colorHint: '#FFB74D', motionProfile: 'spin_slow' },
      { key: 'speaking', colorHint: '#64B5F6', motionProfile: 'amplitude_pulse' },
      { key: 'alert', colorHint: '#FF8A65', motionProfile: 'edge_glow' },
      { key: 'celebrate', colorHint: '#FFD54F', motionProfile: 'burst_particles' },
    ];
  });
}

module.exports = { registerOrchestratorRoutes };
