/**
 * Tests for Screen Navigation.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { SCREENS, NAVIGATION_RULES, getScreen, getAllScreens, showsOrb, showsAskBar } = require('./screens');

describe('SCREENS', () => {
  it('should have 7 screens', () => {
    assert.strictEqual(Object.keys(SCREENS).length, 7);
  });

  it('should have home screen with Orb', () => {
    assert.ok(SCREENS.home);
    assert.strictEqual(SCREENS.home.showsOrb, true);
    assert.strictEqual(SCREENS.home.showsAskBar, true);
    assert.strictEqual(SCREENS.home.maxNudgeCards, 3);
  });

  it('should have conversation screen', () => {
    assert.ok(SCREENS.conversation);
    assert.strictEqual(SCREENS.conversation.showsOrb, true);
    assert.strictEqual(SCREENS.conversation.showsAskBar, true);
  });

  it('should have goals screen without Orb', () => {
    assert.ok(SCREENS.goals);
    assert.strictEqual(SCREENS.goals.showsOrb, false);
  });

  it('should have portfolio screen', () => {
    assert.ok(SCREENS.portfolio);
  });

  it('should have insights screen', () => {
    assert.ok(SCREENS.insights);
  });

  it('should have recommendations screen', () => {
    assert.ok(SCREENS.recommendations);
  });

  it('should have settings screen', () => {
    assert.ok(SCREENS.settings);
  });

  it('all screens should have required fields', () => {
    for (const [key, screen] of Object.entries(SCREENS)) {
      assert.strictEqual(screen.key, key);
      assert.ok(screen.title);
      assert.ok(screen.description);
      assert.strictEqual(typeof screen.showsOrb, 'boolean');
      assert.strictEqual(typeof screen.showsAskBar, 'boolean');
    }
  });
});

describe('NAVIGATION_RULES', () => {
  it('should have orbTap rule', () => {
    assert.strictEqual(NAVIGATION_RULES.orbTap, 'home');
  });

  it('should have askBarTap rule', () => {
    assert.strictEqual(NAVIGATION_RULES.askBarTap, 'conversation');
  });
});

describe('getScreen', () => {
  it('should return screen for valid key', () => {
    const screen = getScreen('home');
    assert.ok(screen);
    assert.strictEqual(screen.key, 'home');
  });

  it('should return null for invalid key', () => {
    const screen = getScreen('unknown');
    assert.strictEqual(screen, null);
  });
});

describe('getAllScreens', () => {
  it('should return all 7 screen keys', () => {
    const screens = getAllScreens();
    assert.strictEqual(screens.length, 7);
    assert.ok(screens.includes('home'));
    assert.ok(screens.includes('conversation'));
  });
});

describe('showsOrb', () => {
  it('should return true for home', () => {
    assert.strictEqual(showsOrb('home'), true);
  });

  it('should return true for conversation', () => {
    assert.strictEqual(showsOrb('conversation'), true);
  });

  it('should return false for goals', () => {
    assert.strictEqual(showsOrb('goals'), false);
  });

  it('should return false for unknown screen', () => {
    assert.strictEqual(showsOrb('unknown'), false);
  });
});

describe('showsAskBar', () => {
  it('should return true for home', () => {
    assert.strictEqual(showsAskBar('home'), true);
  });

  it('should return false for goals', () => {
    assert.strictEqual(showsAskBar('goals'), false);
  });
});
