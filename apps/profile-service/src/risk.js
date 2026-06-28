/**
 * Risk assessment module.
 * Computes risk score (0-100) and band from questionnaire answers + behavioral signals.
 */

const RISK_QUESTIONS = [
  { id: 'q1', text: 'What is your age group?', options: { '18-25': 3, '26-35': 5, '36-45': 4, '46-55': 2, '55+': 1 } },
  { id: 'q2', text: 'What is your investment horizon?', options: { 'Less than 1 year': 1, '1-3 years': 2, '3-5 years': 4, '5-10 years': 6, 'More than 10 years': 8 } },
  { id: 'q3', text: 'How would you react to a 20% portfolio drop?', options: { 'Sell everything': 1, 'Sell some': 3, 'Hold': 5, 'Buy more': 8 } },
  { id: 'q4', text: 'What percentage of income can you invest?', options: { 'Less than 10%': 2, '10-20%': 4, '20-30%': 6, 'More than 30%': 8 } },
  { id: 'q5', text: 'Do you have an emergency fund (6+ months)?', options: { 'No': 1, 'Partially': 3, 'Yes, fully funded': 6 } },
  { id: 'q6', text: 'Primary investment goal?', options: { 'Capital preservation': 1, 'Regular income': 3, 'Growth': 6, 'Aggressive growth': 8 } },
  { id: 'q7', text: 'Experience with equity investments?', options: { 'None': 1, 'Limited': 3, 'Moderate': 5, 'Extensive': 7 } },
];

const BAND_THRESHOLDS = [
  { min: 0, max: 30, band: 'conservative' },
  { min: 31, max: 60, band: 'moderate' },
  { min: 61, max: 100, band: 'aggressive' },
];

/**
 * Compute risk score from questionnaire answers.
 * @param {Array<{ qid: string, value: number }>} answers
 * @returns {{ score: number, band: string, validUntil: string }}
 */
function computeRiskScore(answers) {
  let total = 0;
  let maxPossible = 0;

  for (const q of RISK_QUESTIONS) {
    const answer = answers.find((a) => a.qid === q.id);
    if (answer) {
      const maxForQ = Math.max(...Object.values(q.options));
      total += answer.value;
      maxPossible += maxForQ;
    }
  }

  // Normalize to 0-100
  const score = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : 50;
  const band = getBand(score);

  // Valid for 12 months
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return {
    score: Math.min(Math.max(score, 0), 100),
    band,
    validUntil: validUntil.toISOString().split('T')[0],
  };
}

/**
 * Adjust risk score with behavioral signals.
 * @param {number} baseScore - Questionnaire score
 * @param {object} behavioral - { savingsRate, volatility, consistentInvestor }
 * @returns {number} adjusted score
 */
function adjustForBehavior(baseScore, behavioral) {
  let adjustment = 0;

  // High savings rate → slightly more risk tolerant
  if (behavioral.savingsRate > 30) adjustment += 5;
  else if (behavioral.savingsRate < 10) adjustment -= 5;

  // Consistent SIP investor → more experienced
  if (behavioral.consistentInvestor) adjustment += 3;

  // High portfolio volatility → may be overestimating risk tolerance
  if (behavioral.volatility > 20) adjustment -= 3;

  return Math.min(Math.max(baseScore + adjustment, 0), 100);
}

/**
 * Get risk band from score.
 * @param {number} score
 * @returns {string}
 */
function getBand(score) {
  for (const threshold of BAND_THRESHOLDS) {
    if (score >= threshold.min && score <= threshold.max) {
      return threshold.band;
    }
  }
  return 'moderate';
}

/**
 * Validate risk assessment is current.
 * @param {string} validUntil - ISO date string
 * @returns {boolean}
 */
function isRiskAssessmentValid(validUntil) {
  return new Date(validUntil) >= new Date();
}

module.exports = {
  computeRiskScore,
  adjustForBehavior,
  getBand,
  isRiskAssessmentValid,
  RISK_QUESTIONS,
  BAND_THRESHOLDS,
};
