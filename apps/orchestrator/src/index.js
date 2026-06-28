/**
 * Orchestrator Service - Main entry point.
 * Fastify server for conversation management.
 */

const fastify = require('fastify')({ logger: true });
const { registerOrchestratorRoutes } = require('./routes');

const PORT = process.env.PORT || 8005;

// Minimal CORS so the web demo can call the orchestrator directly when deployed
// on a different origin (no extra dependency).
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type,x-user-id');
  if (request.method === 'OPTIONS') {
    reply.code(204).send();
  }
});

async function start() {
  await registerOrchestratorRoutes(fastify);

  fastify.get('/health', async () => ({ status: 'ok', service: 'orchestrator' }));

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Orchestrator service running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
