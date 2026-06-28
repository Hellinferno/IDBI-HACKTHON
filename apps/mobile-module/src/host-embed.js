/**
 * Host Embed Harness.
 * Mounts the WealthOrb module inside the host bank app shell.
 * The host provides session context (token, customerRef, locale, theme);
 * the module exposes a navigation + lifecycle bridge back to the host.
 */

const { getAllScreens } = require('./screens');

const LIFECYCLE = { CREATED: 'created', MOUNTED: 'mounted', UNMOUNTED: 'unmounted' };

/**
 * Create a host shell harness for the embedded module.
 * @param {object} opts
 * @param {string} opts.token - JWT from the host bank session
 * @param {string} opts.customerRef - bank customer reference
 * @param {string} [opts.locale]
 * @param {string} [opts.theme]
 * @param {Function} [opts.onNavigate] - host navigation bridge
 * @param {Function} [opts.onLifecycle] - host lifecycle bridge
 * @returns {object}
 */
function createHostShell({ token, customerRef, locale = 'en-IN', theme = 'light', onNavigate = () => {}, onLifecycle = () => {} } = {}) {
  if (!token) throw new Error('host token required');
  if (!customerRef) throw new Error('customerRef required');

  let lifecycle = LIFECYCLE.CREATED;
  let currentScreen = null;
  const context = { token, customerRef, locale, theme };

  function mount(rootScreen = 'home') {
    if (!getAllScreens().includes(rootScreen)) {
      throw new Error(`Unknown screen: ${rootScreen}`);
    }
    lifecycle = LIFECYCLE.MOUNTED;
    currentScreen = rootScreen;
    onLifecycle(lifecycle);
    return currentScreen;
  }

  function navigate(screenKey) {
    if (lifecycle !== LIFECYCLE.MOUNTED) throw new Error('navigate before mount');
    if (!getAllScreens().includes(screenKey)) {
      throw new Error(`Unknown screen: ${screenKey}`);
    }
    currentScreen = screenKey;
    onNavigate(screenKey);
    return currentScreen;
  }

  function unmount() {
    lifecycle = LIFECYCLE.UNMOUNTED;
    currentScreen = null;
    onLifecycle(lifecycle);
  }

  function getContext() {
    return { ...context };
  }

  function setLocale(next) {
    context.locale = next;
    return context.locale;
  }

  return {
    mount,
    navigate,
    unmount,
    getContext,
    setLocale,
    getLifecycle: () => lifecycle,
    getCurrentScreen: () => currentScreen,
  };
}

module.exports = { createHostShell, LIFECYCLE };
