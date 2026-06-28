/**
 * Data ingestion module.
 * Pulls transactions from bank-core adapter, deduplicates, and categorizes.
 */

const { categorizeBatch } = require('./categorization');

const BANK_CORE_URL = process.env.BANK_CORE_URL || 'http://localhost:4000';

/**
 * Fetch transactions from bank-core.
 * @param {string} customerRef
 * @param {string} [since] - ISO date to fetch from
 * @returns {Promise<Array>} Raw transactions
 */
async function fetchTransactions(customerRef, since) {
  const url = new URL('/api/transactions', BANK_CORE_URL);
  url.searchParams.set('customerRef', customerRef);
  if (since) url.searchParams.set('since', since);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Bank core returned ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Failed to fetch transactions for ${customerRef}:`, err.message);
    return [];
  }
}

/**
 * Fetch balances from bank-core.
 * @param {string} customerRef
 * @returns {Promise<Array>} Account balances
 */
async function fetchBalances(customerRef) {
  const url = new URL('/api/balances', BANK_CORE_URL);
  url.searchParams.set('customerRef', customerRef);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Bank core returned ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Failed to fetch balances for ${customerRef}:`, err.message);
    return [];
  }
}

/**
 * Deduplicate transactions by source_ref.
 * @param {Array} transactions
 * @returns {Array} Deduplicated transactions
 */
function deduplicate(transactions) {
  const seen = new Set();
  return transactions.filter((txn) => {
    const key = txn.source_ref || txn.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Full ingestion pipeline: fetch → dedupe → categorize.
 * @param {string} customerRef
 * @param {string} [since]
 * @returns {Promise<{ transactions: Array, balances: Array }>}
 */
async function ingest(customerRef, since) {
  const [rawTransactions, balances] = await Promise.all([
    fetchTransactions(customerRef, since),
    fetchBalances(customerRef),
  ]);

  const deduped = deduplicate(rawTransactions);
  const categorized = categorizeBatch(deduped);

  return {
    transactions: categorized.map((txn, i) => ({
      ...deduped[i],
      category: txn.name,
      discretionary: txn.discretionary,
    })),
    balances,
  };
}

module.exports = { fetchTransactions, fetchBalances, deduplicate, ingest, BANK_CORE_URL };
