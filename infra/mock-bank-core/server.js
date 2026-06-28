const fastify = require('fastify')({ logger: true });
const { CUSTOMERS, generateTransactions } = require('./data');

fastify.get('/health', async () => ({ status: 'ok', service: 'mock-bank-core' }));

fastify.get('/api/customers/:customerId/transactions', async (request, reply) => {
  const { customerId } = request.params;
  const customer = CUSTOMERS[customerId];
  if (!customer) return reply.code(404).send({ error: 'Customer not found' });
  const accountId = customer.accounts[0]?.id;
  if (!accountId) return reply.code(404).send({ error: 'No accounts found' });
  return { transactions: generateTransactions(accountId, 20) };
});

fastify.get('/api/customers/:customerId/balances', async (request, reply) => {
  const { customerId } = request.params;
  const customer = CUSTOMERS[customerId];
  if (!customer) return reply.code(404).send({ error: 'Customer not found' });
  return {
    accounts: customer.accounts.map(a => ({
      id: a.id,
      accountType: a.type,
      balance: a.balance,
      syncedAt: new Date().toISOString(),
    })),
  };
});

fastify.get('/api/customers/:customerId/holdings', async (request, reply) => {
  const { customerId } = request.params;
  const customer = CUSTOMERS[customerId];
  if (!customer) return reply.code(404).send({ error: 'Customer not found' });
  return {
    holdings: [
      { id: 'H1', instrumentRef: 'HDFC_MF_EQUITY', assetClass: 'equity', units: 150.5, avgCost: 450.00, currentValue: 52500.00 },
      { id: 'H2', instrumentRef: 'ICICI_MF_DEBT', assetClass: 'debt', units: 200.0, avgCost: 50.00, currentValue: 10500.00 },
      { id: 'H3', instrumentRef: 'SBI_MF_HYBRID', assetClass: 'hybrid', units: 100.0, avgCost: 120.00, currentValue: 13200.00 },
    ],
  };
});

fastify.get('/api/customers/:customerId/profile', async (request, reply) => {
  const { customerId } = request.params;
  if (!CUSTOMERS[customerId]) return reply.code(404).send({ error: 'Customer not found' });
  return {
    id: customerId,
    name: CUSTOMERS[customerId].name,
    accounts: CUSTOMERS[customerId].accounts,
  };
});

async function start() {
  const port = process.env.MOCK_BANK_PORT || 4000;
  try {
    await fastify.listen({ port: Number(port), host: '0.0.0.0' });
    fastify.log.info(`Mock bank-core listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

module.exports = { fastify, start };

if (require.main === module) start();
