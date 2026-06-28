const { processTurn, addMessage } = require('./orchestrator');

/**
 * WSS streaming handler.
 * Processes client messages and streams events back.
 */
function createStreamHandler(wss) {
  const connections = new Map();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    const conversationId = token;

    if (!conversationId) {
      ws.close(4001, 'Missing conversation token');
      return;
    }

    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    connections.set(connectionId, { ws, conversationId, userId: null });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await handleClientMessage(connectionId, message);
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      connections.delete(connectionId);
    });

    ws.send(JSON.stringify({ type: 'connected', conversationId }));
  });

  async function handleClientMessage(connectionId, message) {
    const conn = connections.get(connectionId);
    if (!conn) return;

    const { ws, conversationId } = conn;

    if (message.type === 'user_message') {
      conn.userId = message.userId || conn.userId;

      addMessage(conversationId, { role: 'user', content: message.text });

      const profile = message.profile || { riskBand: 'moderate', balance: 200000 };

      try {
        for await (const event of processTurn({
          conversationId,
          userId: conn.userId,
          text: message.text,
          profile,
        })) {
          ws.send(JSON.stringify(event));

          if (event.type === 'token') {
            addMessage(conversationId, { role: 'assistant', content: event.text, avatarState: 'speaking' });
          }
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Processing failed' }));
      }
    } else if (message.type === 'user_audio') {
      ws.send(JSON.stringify({ type: 'avatar_state', state: 'listening' }));

      if (message.final) {
        ws.send(JSON.stringify({ type: 'avatar_state', state: 'thinking' }));
        ws.send(JSON.stringify({ type: 'token', text: 'I received your voice message. ' }));
        ws.send(JSON.stringify({ type: 'token', text: 'Let me process that for you.' }));
        ws.send(JSON.stringify({ type: 'avatar_state', state: 'speaking' }));
        ws.send(JSON.stringify({ type: 'done', messageId: `m_${Date.now()}` }));
      }
    }
  }

  return { connections };
}

module.exports = { createStreamHandler };
