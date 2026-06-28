/**
 * Localization.
 * English + Hindi string catalog for the embedded module UI chrome
 * (screen titles, actions, orb state labels, generic disclaimer).
 * Conversation content itself is localized by the orchestrator.
 */

const STRINGS = {
  'en-IN': {
    'screen.home': 'Wealth Advisor',
    'screen.conversation': 'Conversation',
    'screen.goals': 'Goals',
    'screen.portfolio': 'Portfolio',
    'screen.insights': 'Insights',
    'screen.recommendations': 'Recommendations',
    'screen.settings': 'Settings',
    'action.ask': 'Ask',
    'action.accept': 'Accept',
    'action.dismiss': 'Dismiss',
    'action.why': 'Why?',
    'orb.idle': 'Idle',
    'orb.listening': 'Listening',
    'orb.thinking': 'Thinking',
    'orb.speaking': 'Speaking',
    'orb.alert': 'Attention needed',
    'orb.celebrate': 'Goal reached',
    'disclaimer.generic': 'This is guidance, not a guaranteed outcome. Mutual funds are subject to market risks.',
  },
  'hi-IN': {
    'screen.home': 'वेल्थ सलाहकार',
    'screen.conversation': 'बातचीत',
    'screen.goals': 'लक्ष्य',
    'screen.portfolio': 'पोर्टफोलियो',
    'screen.insights': 'जानकारी',
    'screen.recommendations': 'सिफारिशें',
    'screen.settings': 'सेटिंग्स',
    'action.ask': 'पूछें',
    'action.accept': 'स्वीकारें',
    'action.dismiss': 'खारिज करें',
    'action.why': 'क्यों?',
    'orb.idle': 'निष्क्रिय',
    'orb.listening': 'सुन रहा है',
    'orb.thinking': 'सोच रहा है',
    'orb.speaking': 'बोल रहा है',
    'orb.alert': 'ध्यान देने की आवश्यकता',
    'orb.celebrate': 'लक्ष्य पूरा हुआ',
    'disclaimer.generic': 'यह मार्गदर्शन है, गारंटीशुदा परिणाम नहीं। म्यूचुअल फंड बाजार जोखिमों के अधीन हैं।',
  },
};

const DEFAULT_LOCALE = 'en-IN';

/**
 * Translate a key, falling back to English then to the raw key.
 * @param {string} key
 * @param {string} [locale]
 * @returns {string}
 */
function t(key, locale = DEFAULT_LOCALE) {
  const table = STRINGS[locale] || STRINGS[DEFAULT_LOCALE];
  return table[key] ?? STRINGS[DEFAULT_LOCALE][key] ?? key;
}

/**
 * Create a locale-bound translator.
 * @param {object} [opts]
 * @param {string} [opts.locale]
 * @returns {object}
 */
function createI18n({ locale = DEFAULT_LOCALE } = {}) {
  let current = STRINGS[locale] ? locale : DEFAULT_LOCALE;
  return {
    t: (key) => t(key, current),
    setLocale: (next) => {
      if (STRINGS[next]) current = next;
      return current;
    },
    getLocale: () => current,
    available: () => Object.keys(STRINGS),
  };
}

module.exports = { STRINGS, DEFAULT_LOCALE, t, createI18n };
