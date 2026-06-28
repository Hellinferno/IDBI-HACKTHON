/**
 * LLM wrapper module.
 * Wraps LLM calls and ensures numbers always come from the computation engine.
 * The LLM only phrases answers; it never invents financial figures.
 *
 * Provider: Google Gemini (set GEMINI_API_KEY). If no key is set or the call
 * fails, we fall back to deterministic templates so the demo never breaks.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 9000);

// System prompt for the WealthOrb advisor
const SYSTEM_PROMPT = `You are WealthOrb, an AI-powered wealth advisor embedded in a bank's mobile app.

CORE RULES:
1. NEVER generate financial numbers OR dates yourself. Every figure and every date MUST be copied exactly from the "VERIFIED NUMBERS" provided to you by the computation engine — do not recompute, round differently, or restate a date in your own words.
2. If a number is not in the VERIFIED NUMBERS, say "I don't have that calculated yet" - never guess or estimate.
3. Ground your responses in the user's data and the context provided.
4. Be clear, concise, and warm. Use plain language (avoid jargon). Keep replies to 2-4 sentences.
5. Always frame this as guidance, not guaranteed financial advice.
6. Support English and Hindi (respond in the language the user uses).

PHRASING RULES:
- Phrase engine numbers naturally: "Your monthly surplus is ₹22,000" not "monthlySurplus: 22000.00".
- When explaining "why", use the steps provided by the engine.
- For recommendations, include the rationale and note that suitability has been verified.
- For goals, always say whether the user is on track or not.`;

/**
 * Turn engine results into plain-language facts the LLM is allowed to cite.
 * @param {object} engineResults
 * @returns {string}
 */
function buildFacts(engineResults = {}) {
  const lines = [];
  const rupee = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? v : '₹' + n.toLocaleString('en-IN');
  };

  if (engineResults.goalPlan) {
    const g = engineResults.goalPlan;
    lines.push(
      `Goal: target ${rupee(g.targetToday)} (in today's value) by ${g.targetDate}.`,
      `Required corpus: ${rupee(g.requiredCorpus)}. Projected on current plan: ${rupee(g.projectedCorpus)}.`,
      `Monthly contribution: ${rupee(g.monthlyContribution)}. Gap: ${rupee(g.gap)}. On track: ${g.onTrack ? 'yes' : 'no'}.`,
    );
    if (Array.isArray(g.steps)) {
      lines.push('Calculation steps: ' + g.steps.map((s) => `${s.label} = ${rupee(s.value)}`).join('; ') + '.');
    }
  }
  if (engineResults.allocation) {
    const a = engineResults.allocation;
    lines.push(`Recommended allocation: ${a.equity}% equity, ${a.debt}% debt, ${a.cash}% cash.`);
  }
  if (engineResults.idleCash) {
    const c = engineResults.idleCash;
    lines.push(
      `Idle cash: balance ${rupee(c.balance)}, emergency buffer ${rupee(c.buffer)}, idle amount ${rupee(c.idleAmount)}, suggested sweep ${rupee(c.suggestedSweep)}.`,
    );
  }
  if (engineResults.tax80c) {
    const t = engineResults.tax80c;
    lines.push(`Section 80C: invested ${rupee(t.invested)} of ${rupee(t.limit)} limit, remaining ${rupee(t.remaining)}.`);
  }
  return lines.join('\n');
}

/**
 * Call Google Gemini to phrase a grounded response.
 * @returns {Promise<string>} response text
 */
async function callGemini({ userMessage, context, engineResults, profile }) {
  const facts = buildFacts(engineResults);
  const userPrompt = [
    profile ? `User profile: risk band "${profile.riskBand || 'moderate'}".` : '',
    context ? `Context from knowledge base:\n${context}` : '',
    facts
      ? `VERIFIED NUMBERS (use ONLY these for any figure you state):\n${facts}`
      : 'No engine numbers are available for this question. Do not state any specific financial figure; answer conceptually or ask a clarifying question.',
    `User says: ${userMessage}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  // Hard timeout so a slow/hung Gemini call falls back to templates instead of
  // freezing the whole advisory turn (critical for a live demo).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
          // gemini-2.5-* are "thinking" models; reasoning tokens otherwise eat the
          // output budget and truncate the reply. We want concise phrasing, so off.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`gemini ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim();
  if (!text) throw new Error('gemini returned empty text');
  return text;
}

/**
 * Generate a response. Uses Gemini when GEMINI_API_KEY is set; otherwise (or on
 * error) falls back to deterministic templates. Numbers always originate from
 * the engine results passed in — the model only phrases them.
 *
 * @returns {Promise<{ text: string, avatarState: string }>}
 */
async function generateResponse(params) {
  if (GEMINI_API_KEY) {
    try {
      const text = await callGemini(params);
      return { text, avatarState: 'speaking' };
    } catch (err) {
      console.error('Gemini call failed, using template fallback:', err.message);
    }
  }
  return generateTemplateResponse(params);
}

/**
 * Deterministic template responder (fallback / offline demo).
 * @returns {{ text: string, avatarState: string }}
 */
function generateTemplateResponse({ userMessage, engineResults, profile }) {
  const message = (userMessage || '').toLowerCase();

  if (/^(hi|hello|hey|namaste)/i.test(message)) {
    return {
      text: `Hello! I'm your WealthOrb advisor. I can help you with goal planning, portfolio review, tax optimization, and more. What would you like to know?`,
      avatarState: 'speaking',
    };
  }

  if (engineResults && engineResults.goalPlan) {
    const gp = engineResults.goalPlan;
    return {
      text: `Based on your goal of ₹${formatMoney(gp.targetToday)} by ${gp.targetDate}, you need a corpus of ₹${formatMoney(gp.requiredCorpus)}. With your current monthly contribution of ₹${formatMoney(gp.monthlyContribution)}, you're projected to reach ₹${formatMoney(gp.projectedCorpus)} - ${gp.onTrack ? "you're on track!" : `leaving a gap of ₹${formatMoney(gp.gap)}. Consider increasing your monthly contribution.`}`,
      avatarState: 'speaking',
    };
  }

  if (engineResults && engineResults.allocation) {
    const alloc = engineResults.allocation;
    return {
      text: `For your ${profile?.riskBand || 'moderate'} risk profile, I recommend: ${alloc.equity}% equity, ${alloc.debt}% debt, and ${alloc.cash}% cash. This balances growth potential with stability.`,
      avatarState: 'speaking',
    };
  }

  if (engineResults && engineResults.idleCash) {
    const ic = engineResults.idleCash;
    return {
      text: `You have ₹${formatMoney(ic.idleAmount)} sitting idle in your savings account. After maintaining a 3-month emergency buffer of ₹${formatMoney(ic.buffer)}, I suggest moving ₹${formatMoney(ic.suggestedSweep)} to a liquid fund for better returns.`,
      avatarState: 'speaking',
    };
  }

  if (engineResults && engineResults.tax80c) {
    const tax = engineResults.tax80c;
    return {
      text: `You have ₹${formatMoney(tax.remaining)} remaining under Section 80C. I recommend investing in an ELSS fund to maximize your tax savings while building long-term wealth.`,
      avatarState: 'speaking',
    };
  }

  if (message.includes('portfolio') || message.includes('holdings')) {
    return {
      text: `Let me review your portfolio. I'll check your current holdings and asset allocation to see if any adjustments are needed.`,
      avatarState: 'thinking',
    };
  }

  if (message.includes('spend') || message.includes('expense')) {
    return {
      text: `I'll analyze your recent transactions to show you where your money is going and identify any patterns.`,
      avatarState: 'thinking',
    };
  }

  return {
    text: `I understand your question. Let me look into your financial data and provide you with accurate information grounded in your profile and holdings.`,
    avatarState: 'thinking',
  };
}

function formatMoney(amount) {
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString('en-IN');
}

module.exports = { generateResponse, generateTemplateResponse, SYSTEM_PROMPT, buildFacts };
