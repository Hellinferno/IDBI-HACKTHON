/**
 * Compliance Engine.
 * Suitability gate (fail-closed), disclaimer attachment, immutable audit log,
 * consent enforcement, nudge engine.
 */

const crypto = require('crypto');

// ─── Disclaimers ───────────────────────────────────────────────────

const DISCLAIMERS = {
  mutual_fund: 'Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.',
  elss: 'ELSS investments have a 3-year lock-in period. Past performance is not indicative of future results.',
  sip: 'SIP does not guarantee returns. Returns may vary based on market conditions.',
  default: 'This is a suggestion based on your profile and is not guaranteed financial advice. Please consult a certified financial advisor.',
};

// ─── Suitability Rules ─────────────────────────────────────────────

const SUITABILITY_RULES = [
  {
    id: 'risk_match',
    description: 'Product risk band must match or be lower than user risk band',
    check: (reco, profile) => {
      const riskOrder = { conservative: 1, moderate: 2, aggressive: 3 };
      const userRisk = riskOrder[profile.riskBand] || 2;
      const productRisk = riskOrder[reco.riskBand] || 2;
      return productRisk <= userRisk;
    },
  },
  {
    id: 'min_investment',
    description: 'User must have sufficient balance for minimum investment',
    check: (reco, profile) => {
      if (!reco.minInvestment) return true;
      return (profile.balance || 0) >= reco.minInvestment;
    },
  },
  {
    id: 'age_appropriateness',
    description: 'Equity products not suitable for very short horizons',
    check: (reco, profile) => {
      if (reco.assetClass === 'equity' && profile.horizon < 3) return false;
      return true;
    },
  },
];

/**
 * Run suitability check on a recommendation.
 * FAIL-CLOSED: if check errors, recommendation is blocked.
 * @param {object} recommendation
 * @param {object} profile - User's risk profile
 * @returns {{ passed: boolean, reason: string, ruleId: string }}
 */
function checkSuitability(recommendation, profile) {
  try {
    for (const rule of SUITABILITY_RULES) {
      if (!rule.check(recommendation, profile)) {
        return {
          passed: false,
          reason: `Suitability failed: ${rule.description}`,
          ruleId: rule.id,
        };
      }
    }
    return { passed: true, reason: 'All suitability checks passed', ruleId: null };
  } catch (err) {
    // FAIL-CLOSED: any error = block
    return {
      passed: false,
      reason: `Suitability check error: ${err.message}`,
      ruleId: 'error',
    };
  }
}

/**
 * Get appropriate disclaimer for a recommendation.
 * @param {object} recommendation
 * @returns {string}
 */
function getDisclaimer(recommendation) {
  const type = recommendation.type;
  const attributes = recommendation.attributes || {};

  if (attributes.taxFlag === '80c') return DISCLAIMERS.elss;
  if (type === 'idle_cash' || type === 'sip') return DISCLAIMERS.sip;
  if (attributes.type === 'mutual_fund') return DISCLAIMERS.mutual_fund;
  return DISCLAIMERS.default;
}

// ─── Audit Log (Immutable, Hash-Chained) ───────────────────────────

const auditLog = [];
let lastHash = 'GENESIS';

/**
 * Write an immutable audit record.
 * @param {object} entry - { userId, eventType, payload, computationInputs }
 * @returns {object} Audit record with hash
 */
function writeAuditEntry(entry) {
  const record = {
    id: crypto.randomUUID(),
    userId: entry.userId,
    eventType: entry.eventType,
    payload: entry.payload,
    computationInputs: entry.computationInputs || null,
    prevHash: lastHash,
    created_at: new Date().toISOString(),
  };

  // Compute chained hash
  const content = JSON.stringify(record);
  record.hash = crypto.createHash('sha256').update(content).digest('hex');
  lastHash = record.hash;

  auditLog.push(record);
  return { id: record.id, hash: record.hash };
}

/**
 * Verify audit log integrity.
 * @returns {{ valid: boolean, brokenAt: number|null }}
 */
function verifyAuditIntegrity() {
  let prevHash = 'GENESIS';
  for (let i = 0; i < auditLog.length; i++) {
    const record = auditLog[i];
    if (record.prevHash !== prevHash) {
      return { valid: false, brokenAt: i };
    }
    prevHash = record.hash;
  }
  return { valid: true, brokenAt: null };
}

/**
 * Get audit log for a user.
 * @param {string} userId
 * @returns {Array}
 */
function getUserAuditLog(userId) {
  return auditLog.filter((r) => r.userId === userId);
}

// ─── Consent Management ────────────────────────────────────────────

const consents = new Map(); // userId → Map<scope, { granted, grantedAt, revokedAt }>

/**
 * Check if user has granted consent for a scope.
 * @param {string} userId
 * @param {string} scope - e.g. 'data_read', 'advisory', 'notifications'
 * @returns {boolean}
 */
function hasConsent(userId, scope) {
  const userConsents = consents.get(userId);
  if (!userConsents) return false;
  const consent = userConsents.get(scope);
  return consent && consent.granted;
}

/**
 * Grant or revoke consent.
 * @param {string} userId
 * @param {string} scope
 * @param {boolean} granted
 */
function setConsent(userId, scope, granted) {
  if (!consents.has(userId)) {
    consents.set(userId, new Map());
  }
  const userConsents = consents.get(userId);
  userConsents.set(scope, {
    granted,
    grantedAt: granted ? new Date().toISOString() : null,
    revokedAt: !granted ? new Date().toISOString() : null,
  });

  // Audit the consent change
  writeAuditEntry({
    userId,
    eventType: 'consent_change',
    payload: { scope, granted },
  });
}

/**
 * Get all consents for a user.
 * @param {string} userId
 * @returns {Array}
 */
function getConsents(userId) {
  const userConsents = consents.get(userId);
  if (!userConsents) return [];
  return Array.from(userConsents.entries()).map(([scope, data]) => ({
    scope,
    ...data,
  }));
}

// ─── Nudge Engine ──────────────────────────────────────────────────

const NUDGE_TRIGGERS = [
  'idle_cash',
  'missed_sip',
  'overspend',
  'tax_deadline',
  'goal_drift',
];

const NUDGE_CAPS = {
  maxPerDay: 3,
  minIntervalMinutes: 60,
};

const nudgeHistory = new Map(); // userId → [{ trigger, shownAt }]

/**
 * Check if a nudge should be shown (respecting caps).
 * @param {string} userId
 * @param {string} trigger
 * @returns {boolean}
 */
function shouldShowNudge(userId, trigger) {
  if (!NUDGE_TRIGGERS.includes(trigger)) return false;

  const history = nudgeHistory.get(userId) || [];
  const today = new Date().toISOString().split('T')[0];
  const todayNudges = history.filter((n) => n.shownAt.startsWith(today));

  // Daily cap
  if (todayNudges.length >= NUDGE_CAPS.maxPerDay) return false;

  // Minimum interval
  const lastNudge = history[history.length - 1];
  if (lastNudge) {
    const lastTime = new Date(lastNudge.shownAt).getTime();
    const now = Date.now();
    if (now - lastTime < NUDGE_CAPS.minIntervalMinutes * 60 * 1000) return false;
  }

  return true;
}

/**
 * Record that a nudge was shown.
 * @param {string} userId
 * @param {string} trigger
 */
function recordNudge(userId, trigger) {
  if (!nudgeHistory.has(userId)) {
    nudgeHistory.set(userId, []);
  }
  nudgeHistory.get(userId).push({
    trigger,
    shownAt: new Date().toISOString(),
  });
}

module.exports = {
  checkSuitability,
  getDisclaimer,
  writeAuditEntry,
  verifyAuditIntegrity,
  getUserAuditLog,
  hasConsent,
  setConsent,
  getConsents,
  shouldShowNudge,
  recordNudge,
  SUITABILITY_RULES,
  DISCLAIMERS,
  NUDGE_TRIGGERS,
  NUDGE_CAPS,
};
