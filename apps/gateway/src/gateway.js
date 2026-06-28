const fastify = require('fastify')({ logger: true, genReqId: () => require('crypto').randomUUID() });
const { authPlugin } = require('./auth');
const { proxyRequest, SERVICE_URLS } = require('./proxy');

fastify.register(authPlugin);

fastify.addHook('onRequest', async (request) => {
  request.log = request.log.child({ correlationId: request.id, userId: request.user?.userId });
});

fastify.get('/health', async () => ({
  status: 'ok',
  service: 'gateway',
  timestamp: new Date().toISOString(),
  upstreams: Object.fromEntries(Object.entries(SERVICE_URLS).map(([k]) => [k, 'configured'])),
}));

fastify.setNotFoundHandler(async (request, reply) => {
  return proxyRequest(fastify, request, reply);
});

fastify.addHook('preHandler', async (request, reply) => {
  if (request.url === '/health') return;
  return proxyRequest(fastify, request, reply);
});

async function start() {
  const port = process.env.GATEWAY_PORT || 3000;
  try {
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    fastify.log.info(`Gateway listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

module.exports = { fastify, start };

if (require.main === module) start();
