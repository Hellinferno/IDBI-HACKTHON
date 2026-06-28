/**
 * Profile Service - Main entry point.
 * Fastify server for data ingestion, categorization, profiling, and risk assessment.
 */

const fastify = require('fastify')({ logger: true });
const { registerRoutes } = require('./routes');

const PORT = process.env.PORT || 8002;

async function start() {
  await registerRoutes(fastify);

  fastify.get('/health', async () => ({ status: 'ok', service: 'profile-service' }));

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Profile service running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
