/**
 * Tests for WebSocket Client.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { createWsClient, SERVER_EVENTS } = require('./ws-client');

describe('createWsClient', () => {
  it('should create a WebSocket client', () => {
    const client = createWsClient({
      wsUrl: 'wss://localhost/stream',
      onEvent: () => {},
    });
    assert.ok(client);
    assert.strictEqual(typeof client.connect, 'function');
    assert.strictEqual(typeof client.send, 'function');
    assert.strictEqual(typeof client.sendText, 'function');
    assert.strictEqual(typeof client.sendAudio, 'function');
    assert.strictEqual(typeof client.disconnect, 'function');
    assert.strictEqual(typeof client.isConnected, 'function');
  });

  it('should report disconnected initially', () => {
    const client = createWsClient({
      wsUrl: 'wss://localhost/stream',
      onEvent: () => {},
    });
    assert.strictEqual(client.isConnected(), false);
  });
});

describe('SERVER_EVENTS', () => {
  it('should have avatar_state event', () => {
    assert.ok(SERVER_EVENTS.avatar_state);
  });

  it('should have token event', () => {
    assert.ok(SERVER_EVENTS.token);
  });

  it('should have card event', () => {
    assert.ok(SERVER_EVENTS.card);
  });

  it('should have tts_audio event', () => {
    assert.ok(SERVER_EVENTS.tts_audio);
  });

  it('should have done event', () => {
    assert.ok(SERVER_EVENTS.done);
  });

  it('should have 5 event types', () => {
    assert.strictEqual(Object.keys(SERVER_EVENTS).length, 5);
  });
});
