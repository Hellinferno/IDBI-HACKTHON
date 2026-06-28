/**
 * Tests for Localization (en-IN / hi-IN).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { t, createI18n, STRINGS, DEFAULT_LOCALE } = require('./i18n');

describe('t', () => {
  it('returns English by default', () => {
    assert.strictEqual(t('screen.home'), 'Wealth Advisor');
  });

  it('returns Hindi when requested', () => {
    assert.strictEqual(t('screen.goals', 'hi-IN'), 'लक्ष्य');
  });

  it('falls back to English for an unknown locale', () => {
    assert.strictEqual(t('screen.home', 'fr-FR'), 'Wealth Advisor');
  });

  it('returns the key for an unknown string', () => {
    assert.strictEqual(t('does.not.exist'), 'does.not.exist');
  });
});

describe('createI18n', () => {
  it('translates in the selected locale', () => {
    const i = createI18n({ locale: 'hi-IN' });
    assert.strictEqual(i.t('action.ask'), 'पूछें');
  });

  it('switches locale at runtime', () => {
    const i = createI18n({ locale: 'en-IN' });
    i.setLocale('hi-IN');
    assert.strictEqual(i.getLocale(), 'hi-IN');
    assert.strictEqual(i.t('screen.settings'), 'सेटिंग्स');
  });

  it('ignores an unknown locale on switch', () => {
    const i = createI18n({});
    i.setLocale('xx');
    assert.strictEqual(i.getLocale(), DEFAULT_LOCALE);
  });

  it('lists available locales', () => {
    const available = createI18n({}).available();
    assert.ok(available.includes('en-IN'));
    assert.ok(available.includes('hi-IN'));
  });
});

describe('catalog parity', () => {
  it('Hindi covers every English key', () => {
    const en = Object.keys(STRINGS['en-IN']);
    const hi = Object.keys(STRINGS['hi-IN']);
    for (const k of en) {
      assert.ok(hi.includes(k), `missing hi-IN key: ${k}`);
    }
  });
});
