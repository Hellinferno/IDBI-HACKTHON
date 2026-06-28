/**
 * Tests for conversation orchestrator.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { processTurn, createConversation, addMessage, getMessages } = require('./orchestrator');

describe('createConversation', () => {
  it('should create a conversation', () => {
    const result = createConversation('user-1', 'text');
    assert.ok(result.conversationId);
    assert.ok(result.conversationId.startsWith('c_'));
  });

  it('should create with voice channel', () => {
    const result = createConversation('user-2', 'voice');
    assert.ok(result.conversationId);
  });
});

describe('addMessage and getMessages', () => {
  it('should add and retrieve messages', () => {
    const { conversationId } = createConversation('user-msg', 'text');
    addMessage(conversationId, { role: 'user', content: 'Hello' });
    addMessage(conversationId, { role: 'assistant', content: 'Hi there' });

    const msgs = getMessages(conversationId);
    assert.strictEqual(msgs.length, 2);
    assert.strictEqual(msgs[0].role, 'user');
    assert.strictEqual(msgs[1].role, 'assistant');
  });

  it('should return empty for unknown conversation', () => {
    const msgs = getMessages('nonexistent');
    assert.strictEqual(msgs.length, 0);
  });
});

describe('processTurn', () => {
  it('should yield events for a greeting', async () => {
    const { conversationId } = createConversation('user-turn', 'text');
    const events = [];
    const gen = processTurn({
      conversationId,
      userId: 'user-turn',
      text: 'Hello',
      profile: { riskBand: 'moderate' },
    });

    for await (const event of gen) {
      events.push(event);
    }

    assert.ok(events.length > 0);
    assert.ok(events.some((e) => e.type === 'avatar_state'));
    assert.ok(events.some((e) => e.type === 'token'));
    assert.ok(events.some((e) => e.type === 'done'));
  });

  it('should yield events for a goal query', async () => {
    const { conversationId } = createConversation('user-goal', 'text');
    const events = [];
    const gen = processTurn({
      conversationId,
      userId: 'user-goal',
      text: 'How is my goal progress?',
      profile: { riskBand: 'moderate' },
    });

    for await (const event of gen) {
      events.push(event);
    }

    assert.ok(events.length > 0);
    // Should have a goal card
    assert.ok(events.some((e) => e.type === 'card' && e.card.kind === 'goal'));
  });

  it('should yield events for allocation query', async () => {
    const { conversationId } = createConversation('user-alloc', 'text');
    const events = [];
    const gen = processTurn({
      conversationId,
      userId: 'user-alloc',
      text: 'What allocation should I have?',
      profile: { riskBand: 'moderate' },
    });

    for await (const event of gen) {
      events.push(event);
    }

    assert.ok(events.length > 0);
    assert.ok(events.some((e) => e.type === 'avatar_state'));
  });
});
