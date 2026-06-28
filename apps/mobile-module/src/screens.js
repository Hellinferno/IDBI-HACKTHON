/**
 * Screen Navigation Model.
 * WealthOrb embedded module screens and navigation rules.
 */

const SCREENS = {
  home: {
    key: 'home',
    title: 'Wealth Advisor',
    description: 'Orb + health summary + top nudges + ask bar',
    showsOrb: true,
    showsAskBar: true,
    showsNudges: true,
    maxNudgeCards: 3,
  },
  conversation: {
    key: 'conversation',
    title: 'Conversation',
    description: 'Message thread with Orb + inline cards + why expanders',
    showsOrb: true,
    showsAskBar: true,
    showsNudges: false,
  },
  goals: {
    key: 'goals',
    title: 'Goals',
    description: 'Goal list + goal detail + what-if simulator',
    showsOrb: false,
    showsAskBar: false,
    showsNudges: false,
  },
  portfolio: {
    key: 'portfolio',
    title: 'Portfolio',
    description: 'Holdings + allocation donut + drift/rebalance + XIRR',
    showsOrb: false,
    showsAskBar: false,
    showsNudges: false,
  },
  insights: {
    key: 'insights',
    title: 'Insights',
    description: 'Categorized spend + personality card + cashflow + idle cash',
    showsOrb: false,
    showsAskBar: false,
    showsNudges: false,
  },
  recommendations: {
    key: 'recommendations',
    title: 'Recommendations',
    description: 'Active suggestions + history (accepted/dismissed)',
    showsOrb: false,
    showsAskBar: false,
    showsNudges: false,
  },
  settings: {
    key: 'settings',
    title: 'Settings',
    description: 'Consent & data + language + risk profile + notifications',
    showsOrb: false,
    showsAskBar: false,
    showsNudges: false,
  },
};

/**
 * Navigation rules.
 * Orb is persistent anchor; tapping it returns to Home.
 * Conversation is reachable from any screen via Ask bar.
 */
const NAVIGATION_RULES = {
  orbTap: 'home',
  askBarTap: 'conversation',
  backFromConversation: 'previous',
};

/**
 * Get screen configuration.
 * @param {string} screenKey
 * @returns {object|null}
 */
function getScreen(screenKey) {
  return SCREENS[screenKey] || null;
}

/**
 * Get all screen keys.
 * @returns {string[]}
 */
function getAllScreens() {
  return Object.keys(SCREENS);
}

/**
 * Check if a screen shows the Orb.
 * @param {string} screenKey
 * @returns {boolean}
 */
function showsOrb(screenKey) {
  const screen = SCREENS[screenKey];
  return screen ? screen.showsOrb : false;
}

/**
 * Check if a screen shows the ask bar.
 * @param {string} screenKey
 * @returns {boolean}
 */
function showsAskBar(screenKey) {
  const screen = SCREENS[screenKey];
  return screen ? screen.showsAskBar : false;
}

module.exports = {
  SCREENS,
  NAVIGATION_RULES,
  getScreen,
  getAllScreens,
  showsOrb,
  showsAskBar,
};
