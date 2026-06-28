/**
 * Transaction categorization engine.
 * Rules-based with pattern matching; ML fallback handled externally.
 */

const CATEGORY_RULES = [
  // Salary / Income
  { pattern: /salary|sal|payroll|wages/i, category: 'salary', discretionary: false },
  { pattern: /credit interest|interest credit|dividend/i, category: 'investment_income', discretionary: false },
  { pattern: /refund|cashback/i, category: 'refund', discretionary: false },

  // Fixed expenses
  { pattern: /rent|house rent/i, category: 'rent', discretionary: false },
  { pattern: /electricity|electric|power|bescom|msedcl|mppożycz/i, category: 'utilities', discretionary: false },
  { pattern: /water|sewage|municipal/i, category: 'utilities', discretionary: false },
  { pattern: /internet|broadband|wifi|jio fiber|airtel fiber/i, category: 'utilities', discretionary: false },
  { pattern: /insurance|premium|lic|health ins/i, category: 'insurance', discretionary: false },
  { pattern: /emi|loan install|home loan|car loan|personal loan/i, category: 'loan_emi', discretionary: false },
  { pattern: /school|college|tuition|education fee/i, category: 'education', discretionary: false },

  // Recurring
  { pattern: /sip|mutual fund|mf purchase|systematic/i, category: 'sip', discretionary: false },
  { pattern: /netflix|hotstar|prime video|sony liv|zee5|subscription/i, category: 'subscriptions', discretionary: true },

  // Groceries & essentials
  { pattern: /big basket|bb|blinkit|zepto|swiggy instamart|dmart|more supermarket|reliance fresh|bigbazaar/i, category: 'groceries', discretionary: false },
  { pattern: /kirana|provision|grocery|vegetable|fruit|supermarket/i, category: 'groceries', discretionary: false },

  // Dining & food
  { pattern: /swiggy|zomato|dominos|pizza|burger|kfc|mcdonald|subway|restaurant|cafe|coffee|starbucks|chaayos/i, category: 'dining', discretionary: true },
  { pattern: /food|eatery|dhaba|mess|canteen/i, category: 'dining', discretionary: true },

  // Transport
  { pattern: /uber|ola|rapido|metro|irctc|railway|bus pass|petrol|diesel|fuel|hpcl|bpcl|ioc/i, category: 'transport', discretionary: true },
  { pattern: /parking|toll|fastag/i, category: 'transport', discretionary: true },

  // Shopping
  { pattern: /amazon|flipkart|myntra|ajio|nykaa|meesho|tatacliq/i, category: 'shopping', discretionary: true },
  { pattern: /clothing|shoes|apparel|fashion/i, category: 'shopping', discretionary: true },

  // Entertainment
  { pattern: /movie|pvr|inox|bookmyshow|event|concert/i, category: 'entertainment', discretionary: true },
  { pattern: /gym|fitness|cult.fit|health/i, category: 'health_fitness', discretionary: true },

  // Healthcare
  { pattern: /hospital|medical|pharmacy|apollo|medplus|pharmeasy|1mg|doctor/i, category: 'healthcare', discretionary: false },

  // Transfers
  { pattern: /neft|imps|upi|transfer|sent to|paid to/i, category: 'transfer', discretionary: true },
  { pattern: /atm|cash withdrawal/i, category: 'atm_withdrawal', discretionary: true },

  // Credit card
  { pattern: /credit card|cc payment|card payment/i, category: 'credit_card_payment', discretionary: false },
];

const FALLBACK_CATEGORY = { name: 'uncategorized', discretionary: true };

/**
 * Categorize a transaction based on its description.
 * @param {string} description - Raw transaction narration
 * @returns {{ categoryId: string, name: string, discretionary: boolean }}
 */
function categorize(description) {
  const desc = (description || '').toLowerCase().trim();

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(desc)) {
      return {
        categoryId: null, // Will be resolved to DB id
        name: rule.category,
        discretionary: rule.discretionary,
      };
    }
  }

  return {
    categoryId: null,
    name: FALLBACK_CATEGORY.name,
    discretionary: FALLBACK_CATEGORY.discretionary,
  };
}

/**
 * Categorize a batch of transactions.
 * @param {Array<{ id: string, description: string }>} transactions
 * @returns {Array<{ id: string, name: string, discretionary: boolean }>}
 */
function categorizeBatch(transactions) {
  return transactions.map((txn) => ({
    id: txn.id,
    ...categorize(txn.description),
  }));
}

module.exports = { categorize, categorizeBatch, CATEGORY_RULES };
