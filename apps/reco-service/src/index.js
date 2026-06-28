/**
 * Recommendation Service - Main entry point.
 * Fastify server for recommendation engine.
 */

const fastify = require('fastify')({ logger: true });
const { registerRecoRoutes } = require('./routes');

const PORT = process.env.PORT || 8004;

async function start() {
  await registerRecoRoutes(fastify);

  fastify.get('/health', async () => ({ status: 'ok', service: 'reco-service' }));

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Recommendation service running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
