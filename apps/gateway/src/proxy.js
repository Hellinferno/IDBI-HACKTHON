const SERVICE_URLS = {
  profile: process.env.PROFILE_SERVICE_URL || 'http://localhost:3001',
  reco: process.env.RECO_SERVICE_URL || 'http://localhost:3002',
  compliance: process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3003',
  orchestrator: process.env.ORCHESTRATOR_URL || 'http://localhost:3004',
  engine: process.env.ENGINE_URL || 'http://localhost:8000',
};

const ROUTE_MAP = [
  { prefix: '/api/v1/profile', target: 'profile' },
  { prefix: '/api/v1/insights', target: 'profile' },
  { prefix: '/api/v1/goals', target: 'profile' },
  { prefix: '/api/v1/recommendations', target: 'reco' },
  { prefix: '/api/v1/conversations', target: 'orchestrator' },
  { prefix: '/api/v1/nudges', target: 'compliance' },
  { prefix: '/api/v1/consents', target: 'compliance' },
  { prefix: '/api/v1/avatar', target: 'orchestrator' },
];

function resolveTarget(url) {
  for (const route of ROUTE_MAP) {
    if (url.startsWith(route.prefix)) {
      return { baseUrl: SERVICE_URLS[route.target], stripPrefix: null };
    }
  }
  return null;
}

async function proxyRequest(fastify, request, reply) {
  const match = resolveTarget(request.url);
  if (!match) {
    return reply.code(404).send({ type: 'https://errors/not-found', title: 'Not Found', status: 404, detail: `No route for ${request.url}` });
  }

  const url = new URL(request.url, match.baseUrl);
  const headers = { ...request.headers, 'x-correlation-id': request.id, 'x-user-id': request.user?.userId };
  delete headers.host;

  const fetchOpts = {
    method: request.method,
    headers,
    body: ['POST', 'PUT', 'PATCH'].includes(request.method) ? JSON.stringify(request.body) : undefined,
  };

  try {
    const resp = await fetch(url.toString(), fetchOpts);
    const body = await resp.text();
    reply.code(resp.status);
    for (const [key, value] of resp.headers.entries()) {
      if (key !== 'transfer-encoding') reply.header(key, value);
    }
    reply.send(body);
  } catch (err) {
    fastify.log.error({ err, target: url.toString() }, 'Proxy error');
    reply.code(502).send({ type: 'https://errors/gateway', title: 'Bad Gateway', status: 502, detail: 'Upstream service unavailable' });
  }
}

module.exports = { SERVICE_URLS, ROUTE_MAP, resolveTarget, proxyRequest };
