/**
 * Compliance API routes.
 * POST /compliance/suitability-check
 * POST /compliance/audit
 * GET /compliance/audit/:userId
 * POST /compliance/consent
 * GET /compliance/consent/:userId
 * POST /compliance/nudge/check
 */

const {
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
} = require('./compliance');

async function registerComplianceRoutes(app) {
  // ─── POST /compliance/suitability-check ─────────────────────────
  app.post('/compliance/suitability-check', async (request, reply) => {
    const { recommendation, profile } = request.body || {};
    if (!recommendation || !profile) {
      return reply.code(400).send({ error: 'recommendation and profile required' });
    }

    const result = checkSuitability(recommendation, profile);
    const disclaimer = result.passed ? getDisclaimer(recommendation) : null;

    return {
      passed: result.passed,
      reason: result.reason,
      ruleId: result.ruleId,
      disclaimer,
    };
  });

  // ─── POST /compliance/audit ─────────────────────────────────────
  app.post('/compliance/audit', async (request, reply) => {
    const { userId, eventType, payload, computationInputs } = request.body || {};
    if (!userId || !eventType) {
      return reply.code(400).send({ error: 'userId and eventType required' });
    }

    const result = writeAuditEntry({ userId, eventType, payload, computationInputs });
    return { auditId: result.id, hash: result.hash };
  });

  // ─── GET /compliance/audit/:userId ──────────────────────────────
  app.get('/compliance/audit/:userId', async (request, reply) => {
    const { userId } = request.params;
    const log = getUserAuditLog(userId);
    return { userId, entries: log };
  });

  // ─── GET /compliance/audit-verify ───────────────────────────────
  app.get('/compliance/audit-verify', async () => {
    return verifyAuditIntegrity();
  });

  // ─── POST /compliance/consent ───────────────────────────────────
  app.post('/compliance/consent', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const { scope, granted } = request.body || {};
    if (!scope || typeof granted !== 'boolean') {
      return reply.code(400).send({ error: 'scope and granted (boolean) required' });
    }

    setConsent(userId, scope, granted);
    return { status: 'ok', scope, granted };
  });

  // ─── GET /compliance/consent/:userId ────────────────────────────
  app.get('/compliance/consent/:userId', async (request, reply) => {
    const { userId } = request.params;
    return { userId, consents: getConsents(userId) };
  });

  // ─── POST /compliance/nudge/check ──────────────────────────────
  app.post('/compliance/nudge/check', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }

    const { trigger } = request.body || {};
    if (!trigger) {
      return reply.code(400).send({ error: 'trigger required' });
    }

    // Check consent first
    if (!hasConsent(userId, 'advisory')) {
      return { allowed: false, reason: 'No advisory consent' };
    }

    const allowed = shouldShowNudge(userId, trigger);
    if (allowed) {
      recordNudge(userId, trigger);
    }

    return { allowed, trigger };
  });
}

module.exports = { registerComplianceRoutes };
