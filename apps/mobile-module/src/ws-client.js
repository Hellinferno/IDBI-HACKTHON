/**
 * WebSocket Client.
 * Handles WSS streaming for conversation turns.
 * Receives: avatar_state, token, card, tts_audio, done events.
 */

/**
 * Create a WebSocket client for conversation streaming.
 * @param {object} config
 * @param {string} config.wsUrl - WebSocket URL
 * @param {Function} config.onEvent - Event handler
 * @returns {object} WebSocket client
 */
function createWsClient({ wsUrl, onEvent }) {
  let ws = null;
  let connected = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket.
   */
  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        connected = true;
        reconnectAttempts = 0;
        onEvent({ type: 'connected' });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEvent(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        connected = false;
        onEvent({ type: 'disconnected' });

        // Auto-reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          setTimeout(connect, 1000 * reconnectAttempts);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  }

  /**
   * Send a message.
   * @param {object} message
   */
  function send(message) {
    if (ws && connected) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send a user text message.
   * @param {string} text
   */
  function sendText(text) {
    send({ type: 'user_message', text });
  }

  /**
   * Send an audio chunk.
   * @param {string} chunk - Base64 PCM audio
   * @param {boolean} isFinal
   */
  function sendAudio(chunk, isFinal = false) {
    send({ type: 'user_audio', chunk, final: isFinal });
  }

  /**
   * Disconnect.
   */
  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
      connected = false;
    }
  }

  /**
   * Check if connected.
   * @returns {boolean}
   */
  function isConnected() {
    return connected;
  }

  return {
    connect,
    send,
    sendText,
    sendAudio,
    disconnect,
    isConnected,
  };
}

/**
 * Event types received from server.
 */
const SERVER_EVENTS = {
  avatar_state: 'Avatar state change (idle|listening|thinking|speaking|alert|celebrate)',
  token: 'Streaming text token',
  card: 'Inline card (recommendation, chart, goal, explainer)',
  tts_audio: 'TTS audio chunk (base64 PCM)',
  done: 'Turn complete with messageId',
};

module.exports = { createWsClient, SERVER_EVENTS };
