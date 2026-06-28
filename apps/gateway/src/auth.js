const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function verifyToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${parts[0]}.${parts[1]}`)
      .digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expectedSig))) return null;
    return { userId: payload.sub || payload.userId, customerRef: payload.customerRef };
  } catch {
    return null;
  }
}

function signToken(payload, expiresIn = 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + expiresIn })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

async function authPlugin(fastify) {
  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url === '/health' || request.url === '/api/v1/health') return;

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ type: 'https://errors/auth', title: 'Unauthorized', status: 401, detail: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7);
    const user = verifyToken(token);
    if (!user) {
      return reply.code(401).send({ type: 'https://errors/auth', title: 'Unauthorized', status: 401, detail: 'Invalid or expired token' });
    }
    request.user = user;
  });
}

module.exports = { authPlugin, verifyToken, signToken, JWT_SECRET };
