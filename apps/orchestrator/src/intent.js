/**
 * Intent classification module.
 * Routes user messages to appropriate handlers.
 */

const INTENT_PATTERNS = [
  {
    intent: 'affordability',
    patterns: /can\s+i\s+afford|could\s+i\s+afford|able\s+to\s+(?:buy|afford)|enough\s+(?:for|to\s+buy)|will\s+i\s+have\s+enough|afford\s+(?:a|an|to)/i,
    requiresComputation: true,
  },
  {
    intent: 'goal_create',
    patterns: /create\s+(?:a\s+)?goal|set\s+(?:a\s+)?goal|want\s+to\s+save|goal\s+for|target\s+for|save\s+(?:up\s+)?(?:for|₹|rs|\d)/i,
    requiresComputation: true,
  },
  {
    intent: 'goal_status',
    patterns: /goal\s+status|how\s+(?:is|are)\s+(?:my\s+)?goal|goal\s+progress|am\s+i\s+on\s+track/i,
    requiresComputation: true,
  },
  {
    intent: 'what_if',
    patterns: /what\s+if|simulate|if\s+i\s+(?:invest|save|contribute)|change\s+(?:my\s+)?(?:horizon|amount|contribution)/i,
    requiresComputation: true,
  },
  {
    intent: 'allocation',
    patterns: /allocation|asset\s+class|how\s+much\s+(?:should\s+i|in)\s+(?:invest\s+)?(?:in\s+)?(?:equity|debt|fund)/i,
    requiresComputation: true,
  },
  {
    intent: 'portfolio',
    patterns: /portfolio|holdings|investment|mutual\s+fund|stock|equity|where\s+(?:is|are)\s+my/i,
    requiresComputation: false,
  },
  {
    intent: 'spending',
    patterns: /spend|expense|where\s+(?:did|i\s+)?(?:i\s+)?(?:spend|go)|transaction|cashflow|balance/i,
    requiresComputation: false,
  },
  {
    intent: 'idle_cash',
    patterns: /idle|cash\s+(?:sitting|lying)|too\s+much\s+(?:in\s+)?savings|where\s+to\s+park/i,
    requiresComputation: true,
  },
  {
    intent: 'tax',
    patterns: /tax|80[cC]|elss|save\s+tax|tax\s+(?:benefit|saving|optimization)/i,
    requiresComputation: true,
  },
  {
    intent: 'risk',
    patterns: /risk|conservative|aggressive|moderate|risk\s+(?:profile|appetite|tolerance)/i,
    requiresComputation: false,
  },
  {
    intent: 'rebalance',
    patterns: /rebalance|drift|off\s+(?:target|track)|adjust\s+(?:my\s+)?portfolio/i,
    requiresComputation: true,
  },
  {
    intent: 'greeting',
    patterns: /^(?:hi|hello|hey|good\s+(?:morning|afternoon|evening)|namaste)/i,
    requiresComputation: false,
  },
  {
    intent: 'help',
    patterns: /help|what\s+can\s+you\s+do|capabilities|features/i,
    requiresComputation: false,
  },
];

/**
 * Classify user message intent.
 * @param {string} message
 * @returns {{ intent: string, requiresComputation: boolean, confidence: number }}
 */
function classifyIntent(message) {
  const text = (message || '').toLowerCase().trim();

  for (const { intent, patterns, requiresComputation } of INTENT_PATTERNS) {
    if (patterns.test(text)) {
      return { intent, requiresComputation, confidence: 0.9 };
    }
  }

  return { intent: 'general', requiresComputation: false, confidence: 0.5 };
}

module.exports = { classifyIntent, INTENT_PATTERNS };
