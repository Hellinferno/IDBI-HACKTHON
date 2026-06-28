/**
 * Tests for compliance engine.
 * Safety-critical: suitability gate, audit log, consent, nudge.
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const {
  checkSuitability,
  getDisclaimer,
  writeAuditEntry,
  verifyAuditIntegrity,
  hasConsent,
  setConsent,
  getConsents,
  shouldShowNudge,
  recordNudge,
  SUITABILITY_RULES,
  DISCLAIMERS,
  NUDGE_TRIGGERS,
} = require('./compliance');

describe('Suitability Gate (FAIL-CLOSED)', () => {
  it('should pass when all checks pass', () => {
    const reco = { riskBand: 'moderate', assetClass: 'equity', minInvestment: 5000 };
    const profile = { riskBand: 'moderate', balance: 100000, horizon: 5 };
    const result = checkSuitability(reco, profile);
    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.ruleId, null);
  });

  it('should block when risk is too high', () => {
    const reco = { riskBand: 'aggressive', assetClass: 'equity' };
    const profile = { riskBand: 'conservative', balance: 100000, horizon: 10 };
    const result = checkSuitability(reco, profile);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.ruleId, 'risk_match');
  });

  it('should block when insufficient balance', () => {
    const reco = { riskBand: 'moderate', assetClass: 'equity', minInvestment: 50000 };
    const profile = { riskBand: 'moderate', balance: 10000, horizon: 5 };
    const result = checkSuitability(reco, profile);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.ruleId, 'min_investment');
  });

  it('should block equity for short horizon', () => {
    const reco = { riskBand: 'moderate', assetClass: 'equity' };
    const profile = { riskBand: 'moderate', balance: 100000, horizon: 1 };
    const result = checkSuitability(reco, profile);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.ruleId, 'age_appropriateness');
  });

  it('should FAIL-CLOSED on error', () => {
    const reco = null; // Will cause error
    const profile = { riskBand: 'moderate' };
    const result = checkSuitability(reco, profile);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.ruleId, 'error');
  });

  it('all rules should have id, description, check', () => {
    for (const rule of SUITABILITY_RULES) {
      assert.strictEqual(typeof rule.id, 'string');
      assert.strictEqual(typeof rule.description, 'string');
      assert.strictEqual(typeof rule.check, 'function');
    }
  });
});

describe('Disclaimers', () => {
  it('should return ELSS disclaimer for 80c products', () => {
    const reco = { type: 'tax', attributes: { taxFlag: '80c' } };
    const result = getDisclaimer(reco);
    assert.strictEqual(result, DISCLAIMERS.elss);
  });

  it('should return SIP disclaimer for SIP recos', () => {
    const reco = { type: 'sip', attributes: {} };
    const result = getDisclaimer(reco);
    assert.strictEqual(result, DISCLAIMERS.sip);
  });

  it('should return mutual fund disclaimer', () => {
    const reco = { type: 'product', attributes: { type: 'mutual_fund' } };
    const result = getDisclaimer(reco);
    assert.strictEqual(result, DISCLAIMERS.mutual_fund);
  });

  it('should return default disclaimer for unknown', () => {
    const reco = { type: 'allocation', attributes: {} };
    const result = getDisclaimer(reco);
    assert.strictEqual(result, DISCLAIMERS.default);
  });
});

describe('Audit Log (Immutable, Hash-Chained)', () => {
  it('should write audit entry and return hash', () => {
    const result = writeAuditEntry({
      userId: 'user-1',
      eventType: 'recommendation_shown',
      payload: { recoId: 'r_1', type: 'allocation' },
    });
    assert.ok(result.id);
    assert.ok(result.hash);
    assert.strictEqual(typeof result.hash, 'string');
    assert.strictEqual(result.hash.length, 64); // SHA-256 hex
  });

  it('should maintain hash chain integrity', () => {
    const entry1 = writeAuditEntry({ userId: 'user-chain', eventType: 'test', payload: {} });
    const entry2 = writeAuditEntry({ userId: 'user-chain', eventType: 'test', payload: {} });
    assert.ok(entry1.hash);
    assert.ok(entry2.hash);
    assert.notStrictEqual(entry1.hash, entry2.hash);
  });

  it('should verify audit integrity', () => {
    const result = verifyAuditIntegrity();
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.brokenAt, null);
  });
});

describe('Consent Management', () => {
  beforeEach(() => {
    // Reset consents for test user
    setConsent('consent-test-user', 'advisory', false);
    setConsent('consent-test-user', 'data_read', false);
  });

  it('should grant consent', () => {
    setConsent('user-consent-1', 'advisory', true);
    assert.strictEqual(hasConsent('user-consent-1', 'advisory'), true);
  });

  it('should revoke consent', () => {
    setConsent('user-consent-2', 'advisory', true);
    assert.strictEqual(hasConsent('user-consent-2', 'advisory'), true);
    setConsent('user-consent-2', 'advisory', false);
    assert.strictEqual(hasConsent('user-consent-2', 'advisory'), false);
  });

  it('should return false for no consent', () => {
    assert.strictEqual(hasConsent('nonexistent-user', 'advisory'), false);
  });

  it('should get all consents', () => {
    setConsent('user-list', 'advisory', true);
    setConsent('user-list', 'data_read', true);
    const consents = getConsents('user-list');
    assert.strictEqual(consents.length, 2);
    assert.ok(consents.some((c) => c.scope === 'advisory' && c.granted === true));
    assert.ok(consents.some((c) => c.scope === 'data_read' && c.granted === true));
  });
});

describe('Nudge Engine', () => {
  it('should allow nudge for valid trigger', () => {
    assert.strictEqual(shouldShowNudge('fresh-user-nudge', 'idle_cash'), true);
  });

  it('should block unknown trigger', () => {
    assert.strictEqual(shouldShowNudge('user-nudge-unknown', 'unknown_trigger'), false);
  });

  it('should record nudge and block subsequent within interval', () => {
    const userId = 'nudge-interval-test-' + Date.now();
    recordNudge(userId, 'overspend');
    // After recording, the minimum interval should block the next nudge
    assert.strictEqual(shouldShowNudge(userId, 'overspend'), false);
  });

  it('NUDGE_TRIGGERS should have 5 types', () => {
    assert.strictEqual(NUDGE_TRIGGERS.length, 5);
    assert.ok(NUDGE_TRIGGERS.includes('idle_cash'));
    assert.ok(NUDGE_TRIGGERS.includes('missed_sip'));
    assert.ok(NUDGE_TRIGGERS.includes('overspend'));
    assert.ok(NUDGE_TRIGGERS.includes('tax_deadline'));
    assert.ok(NUDGE_TRIGGERS.includes('goal_drift'));
  });
});
