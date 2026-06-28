/**
 * WealthOrb Mobile Module.
 * Embeddable module for the host bank mobile app.
 * Screens, Orb renderer wiring, audio I/O, what-if simulator, cards UI,
 * host-embed harness, localization, and accessibility.
 */

const { CARD_TYPES, createNudgeCard, createRecommendationCard, createGoalCard, createChartCard, createExplainerCard, createInsightCard, validateCard } = require('./components');
const { SCREENS, NAVIGATION_RULES, getScreen, getAllScreens, showsOrb, showsAskBar } = require('./screens');
const { createApiClient } = require('./api-client');
const { createWsClient, SERVER_EVENTS } = require('./ws-client');
const { createSttController, createTtsController, createDefaultAmplitudeTracker, DEFAULT_STT_CONFIG, DEFAULT_TTS_CONFIG } = require('./audio-io');
const { createWhatIfSimulator, SLIDER_BOUNDS, clampSlider } = require('./whatif');
const { createHostShell, LIFECYCLE } = require('./host-embed');
const { STRINGS, DEFAULT_LOCALE, t, createI18n } = require('./i18n');
const { MIN_TAP_TARGET, ORB_STATE_POLITENESS, orbStateLabel, orbLiveRegion, cardA11yLabel, screenA11yLabel, applyReducedMotion, meetsTapTarget } = require('./a11y');

module.exports = {
  // Components
  CARD_TYPES,
  createNudgeCard,
  createRecommendationCard,
  createGoalCard,
  createChartCard,
  createExplainerCard,
  createInsightCard,
  validateCard,

  // Screens
  SCREENS,
  NAVIGATION_RULES,
  getScreen,
  getAllScreens,
  showsOrb,
  showsAskBar,

  // API
  createApiClient,

  // WebSocket
  createWsClient,
  SERVER_EVENTS,

  // Audio I/O (STT capture + TTS playback + orb pulse)
  createSttController,
  createTtsController,
  createDefaultAmplitudeTracker,
  DEFAULT_STT_CONFIG,
  DEFAULT_TTS_CONFIG,

  // What-if simulator
  createWhatIfSimulator,
  SLIDER_BOUNDS,
  clampSlider,

  // Host embed harness
  createHostShell,
  LIFECYCLE,

  // Localization
  STRINGS,
  DEFAULT_LOCALE,
  t,
  createI18n,

  // Accessibility
  MIN_TAP_TARGET,
  ORB_STATE_POLITENESS,
  orbStateLabel,
  orbLiveRegion,
  cardA11yLabel,
  screenA11yLabel,
  applyReducedMotion,
  meetsTapTarget,
};
