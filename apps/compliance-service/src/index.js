/**
 * Compliance Service - Main entry point.
 * Suitability gate, disclaimer attachment, audit logging, consent, nudges.
 */

const fastify = require('fastify')({ logger: true });
const { registerComplianceRoutes } = require('./routes');

const PORT = process.env.PORT || 8003;

async function start() {
  await registerComplianceRoutes(fastify);

  fastify.get('/health', async () => ({ status: 'ok', service: 'compliance-service' }));

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Compliance service running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
