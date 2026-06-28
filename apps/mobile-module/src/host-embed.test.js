/**
 * Tests for the Host Embed Harness.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { createHostShell, LIFECYCLE } = require('./host-embed');

function ctx(extra = {}) {
  return { token: 'jwt', customerRef: 'CUST_001', ...extra };
}

describe('createHostShell', () => {
  it('throws without a token', () => {
    assert.throws(() => createHostShell({ customerRef: 'C1' }));
  });

  it('throws without a customerRef', () => {
    assert.throws(() => createHostShell({ token: 'jwt' }));
  });

  it('starts in the created lifecycle', () => {
    assert.strictEqual(createHostShell(ctx()).getLifecycle(), LIFECYCLE.CREATED);
  });

  it('mounts to home by default', () => {
    const shell = createHostShell(ctx());
    assert.strictEqual(shell.mount(), 'home');
    assert.strictEqual(shell.getLifecycle(), LIFECYCLE.MOUNTED);
  });

  it('rejects an unknown mount screen', () => {
    assert.throws(() => createHostShell(ctx()).mount('nope'));
  });

  it('rejects navigate before mount', () => {
    assert.throws(() => createHostShell(ctx()).navigate('goals'));
  });

  it('navigates between screens and bridges to the host', () => {
    const visited = [];
    const shell = createHostShell(ctx({ onNavigate: (s) => visited.push(s) }));
    shell.mount();
    shell.navigate('goals');
    assert.strictEqual(shell.getCurrentScreen(), 'goals');
    assert.deepStrictEqual(visited, ['goals']);
  });

  it('rejects navigating to an unknown screen', () => {
    const shell = createHostShell(ctx());
    shell.mount();
    assert.throws(() => shell.navigate('nope'));
  });

  it('exposes the host session context', () => {
    const shell = createHostShell(ctx({ locale: 'hi-IN', theme: 'dark' }));
    const c = shell.getContext();
    assert.strictEqual(c.token, 'jwt');
    assert.strictEqual(c.customerRef, 'CUST_001');
    assert.strictEqual(c.locale, 'hi-IN');
    assert.strictEqual(c.theme, 'dark');
  });

  it('updates locale at runtime', () => {
    const shell = createHostShell(ctx());
    shell.setLocale('hi-IN');
    assert.strictEqual(shell.getContext().locale, 'hi-IN');
  });

  it('emits lifecycle transitions to the host', () => {
    const events = [];
    const shell = createHostShell(ctx({ onLifecycle: (l) => events.push(l) }));
    shell.mount();
    shell.unmount();
    assert.deepStrictEqual(events, [LIFECYCLE.MOUNTED, LIFECYCLE.UNMOUNTED]);
    assert.strictEqual(shell.getCurrentScreen(), null);
  });
});
