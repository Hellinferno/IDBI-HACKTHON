/**
 * Recommendation API routes.
 * POST /recommendations - Get recommendations for a user
 * POST /recommendations/:id/action - Accept or dismiss a recommendation
 */

const {
  generateAllocationReco,
  matchProducts,
  generateIdleCashReco,
  generateTaxReco,
  generateRebalanceRecos,
} = require('./engine');

// In-memory store for demo
const recommendations = new Map();
let recoIdCounter = 1;

async function registerRecoRoutes(app) {
  // ─── GET /recommendations ─────────────────────────────────────
  app.get('/recommendations', async (request, reply) => {
    const userId = request.query.userId || request.headers['x-user-id'];
    if (!userId) {
      return reply.code(400).send({ error: 'userId required' });
    }
    const userRecos = [...recommendations.values()].filter(r => r.userId === userId);
    return { items: userRecos };
  });

  // ─── POST /recommendations ─────────────────────────────────────
  app.post('/recommendations', async (request, reply) => {
    const userId = request.headers['x-user-id'] || 'anonymous';
    const { riskBand, idleAmount, remaining80c, rebalanceDeltas } = request.body || {};

    if (!riskBand) {
      return reply.code(400).send({ error: 'riskBand required' });
    }

    const items = [];

    // Allocation recommendation
    const allocationReco = generateAllocationReco(riskBand);
    const products = matchProducts(riskBand, allocationReco.payload);
    items.push({ id: `r_${recoIdCounter++}`, ...allocationReco, suitability: 'pending' });

    // Product recommendations
    for (const product of products) {
      items.push({ id: `r_${recoIdCounter++}`, ...product, suitability: 'pending' });
    }

    // Idle cash recommendation
    if (idleAmount && idleAmount > 0) {
      const idleReco = generateIdleCashReco(idleAmount, riskBand);
      if (idleReco) {
        items.push({ id: `r_${recoIdCounter++}`, ...idleReco, suitability: 'pending' });
      }
    }

    // Tax recommendation
    if (remaining80c && remaining80c > 0) {
      const taxRecos = generateTaxReco({ remaining80c, riskBand });
      for (const reco of taxRecos) {
        items.push({ id: `r_${recoIdCounter++}`, ...reco, suitability: 'pending' });
      }
    }

    // Rebalance recommendations
    if (rebalanceDeltas && rebalanceDeltas.length > 0) {
      const rebalanceRecos = generateRebalanceRecos(rebalanceDeltas);
      for (const reco of rebalanceRecos) {
        items.push({ id: `r_${recoIdCounter++}`, ...reco, suitability: 'pending' });
      }
    }

    // Store recommendations
    for (const item of items) {
      recommendations.set(item.id, { ...item, userId, status: 'active' });
    }

    return { items };
  });

  // ─── POST /recommendations/:id/action ───────────────────────────
  app.post('/recommendations/:id/action', async (request, reply) => {
    const { id } = request.params;
    const { action } = request.body || {};

    if (!['accept', 'dismiss'].includes(action)) {
      return reply.code(400).send({ error: 'action must be accept or dismiss' });
    }

    const reco = recommendations.get(id);
    if (!reco) {
      return reply.code(404).send({ error: 'Recommendation not found' });
    }

    reco.status = action === 'accept' ? 'accepted' : 'dismissed';

    return { status: reco.status, auditId: null };
  });
}

module.exports = { registerRecoRoutes };
