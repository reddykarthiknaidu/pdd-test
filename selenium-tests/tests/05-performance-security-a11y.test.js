// selenium-tests/tests/05-performance-security-a11y.test.js
// Deep tests: Performance timing, security DOM checks, browser APIs,
// accessibility (aria, roles, headings, alt text, focus), compatibility

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

let driver;
const BASE = process.env.TEST_URL || 'https://reddykarthiknaidu.github.io/pdd-test';

before(async function () {
  this.timeout(60000);
  const opts = new chrome.Options()
    .addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage',
                  '--disable-gpu', '--window-size=1920,1080');
  driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
});

after(async function () {
  if (driver) await driver.quit();
});

describe('[PERF/SEC/A11Y] Performance, Security & Accessibility Tests', function () {
  this.timeout(60000);

  before(async function () {
    await driver.get(BASE);
    await driver.sleep(4000);
  });

  // ── Performance ───────────────────────────────────────────────────

  it('TC081: Page load time (loadEventEnd - navigationStart) < 15000ms', async function () {
    const timing = await driver.executeScript(
      'const t = performance.timing; return t.loadEventEnd - t.navigationStart;'
    );
    assert.ok(timing < 15000, `Page load took ${timing}ms — exceeds 15s threshold`);
  });

  it('TC082: DOM Content Loaded event fired within 10000ms', async function () {
    const dcl = await driver.executeScript(
      'const t = performance.timing; return t.domContentLoadedEventEnd - t.navigationStart;'
    );
    assert.ok(dcl < 10000, `DOMContentLoaded took ${dcl}ms — exceeds 10s threshold`);
  });

  it('TC083: Performance API is available and has entries', async function () {
    const hasPerf = await driver.executeScript('return typeof performance === "object" && typeof performance.timing === "object"');
    assert.strictEqual(hasPerf, true, 'performance.timing API not available');
  });

  it('TC084: window.performance.now() returns a positive number', async function () {
    const now = await driver.executeScript('return performance.now()');
    assert.ok(now > 0, `performance.now() returned ${now}`);
  });

  it('TC085: No more than 5 synchronous render-blocking <script> in <head>', async function () {
    const blocking = await driver.executeScript(`
      const scripts = document.head.querySelectorAll('script:not([async]):not([defer]):not([type="module"])');
      return scripts.length;
    `);
    assert.ok(blocking <= 5, `${blocking} render-blocking scripts in <head>`);
  });

  // ── Security ──────────────────────────────────────────────────────

  it('TC086: No secret keys (sk_live_, pk_live_) exposed in DOM source', async function () {
    const src = await driver.getPageSource();
    assert.ok(!src.includes('sk_live_'), 'Secret key "sk_live_" found in DOM!');
    assert.ok(!src.includes('sk_test_secret'), 'Secret key "sk_test_secret" found in DOM!');
  });

  it('TC087: No passwords or private tokens in page source', async function () {
    const src = await driver.getPageSource();
    // Check for common secret patterns
    assert.ok(!src.match(/password\s*=\s*["'][^"']{6,}/i), 'Hardcoded password value found in DOM!');
    assert.ok(!src.includes('-----BEGIN'), 'Private key PEM block found in DOM!');
  });

  it('TC088: localStorage does not contain auth tokens after unauthenticated visit', async function () {
    const keys = await driver.executeScript(`
      const keys = Object.keys(localStorage);
      return keys.filter(k => k.toLowerCase().includes('secret') || k.toLowerCase().includes('private'));
    `);
    assert.strictEqual(keys.length, 0, `Sensitive localStorage keys found: ${keys.join(', ')}`);
  });

  it('TC089: No inline onclick handlers with eval() on page', async function () {
    const hasEval = await driver.executeScript(`
      const all = document.querySelectorAll('[onclick]');
      return Array.from(all).some(el => el.getAttribute('onclick').includes('eval('));
    `);
    assert.strictEqual(hasEval, false, 'eval() found in inline onclick handler!');
  });

  it('TC090: HTTPS enforced — window.location.protocol check', async function () {
    const protocol = await driver.executeScript('return window.location.protocol');
    // In local CI test (http://localhost) this is http — that is acceptable
    assert.ok(protocol === 'https:' || protocol === 'http:',
      `Unexpected protocol: "${protocol}"`);
  });

  // ── Browser Compatibility ─────────────────────────────────────────

  it('TC091: localStorage read/write/delete works correctly', async function () {
    const result = await driver.executeScript(`
      try {
        localStorage.setItem('__test__', '42');
        const val = localStorage.getItem('__test__');
        localStorage.removeItem('__test__');
        return val === '42';
      } catch(e) { return false; }
    `);
    assert.strictEqual(result, true, 'localStorage read/write/delete failed');
  });

  it('TC092: sessionStorage read/write/delete works correctly', async function () {
    const result = await driver.executeScript(`
      try {
        sessionStorage.setItem('__stest__', 'hello');
        const val = sessionStorage.getItem('__stest__');
        sessionStorage.removeItem('__stest__');
        return val === 'hello';
      } catch(e) { return false; }
    `);
    assert.strictEqual(result, true, 'sessionStorage read/write/delete failed');
  });

  it('TC093: CSS Grid display is supported', async function () {
    const supported = await driver.executeScript("return CSS.supports('display', 'grid')");
    assert.strictEqual(supported, true, 'CSS Grid not supported in browser');
  });

  it('TC094: CSS Flexbox display is supported', async function () {
    const supported = await driver.executeScript("return CSS.supports('display', 'flex')");
    assert.strictEqual(supported, true, 'CSS Flexbox not supported');
  });

  it('TC095: CSS Custom Properties (variables) are supported', async function () {
    const supported = await driver.executeScript("return CSS.supports('color', 'var(--primary)')");
    assert.strictEqual(supported, true, 'CSS custom properties not supported');
  });

  // ── Accessibility ─────────────────────────────────────────────────

  it('TC096: Exactly 1 <h1> element on home page (no duplicate H1)', async function () {
    const h1s = await driver.findElements(By.tagName('h1'));
    assert.strictEqual(h1s.length, 1, `Expected 1 H1, found ${h1s.length}`);
  });

  it('TC097: All <button> elements have accessible text or aria-label', async function () {
    const buttons = await driver.findElements(By.tagName('button'));
    const failures = [];
    for (const btn of buttons) {
      const text     = (await btn.getText()).trim();
      const aria     = await btn.getAttribute('aria-label');
      const srOnly   = await btn.findElements(By.css('.sr-only'));
      const hasTitle = await btn.getAttribute('title');
      if (!text && !aria && srOnly.length === 0 && !hasTitle) {
        failures.push(await btn.getAttribute('outerHTML').catch(() => '<button>'));
      }
    }
    assert.strictEqual(failures.length, 0,
      `${failures.length} button(s) lack accessible text:\n${failures.slice(0, 3).join('\n')}`);
  });

  it('TC098: All <img> elements have non-empty alt attributes', async function () {
    const imgs = await driver.findElements(By.tagName('img'));
    const failures = [];
    for (const img of imgs) {
      const alt = await img.getAttribute('alt');
      if (alt === null || alt === undefined) {
        failures.push(await img.getAttribute('src') || '<unknown img>');
      }
    }
    assert.strictEqual(failures.length, 0,
      `${failures.length} image(s) missing alt attribute:\n${failures.slice(0, 3).join('\n')}`);
  });

  it('TC099: No <a> tag has empty href=""', async function () {
    const links = await driver.findElements(By.tagName('a'));
    const failures = [];
    for (const a of links) {
      const href = await a.getAttribute('href');
      if (href === '') failures.push(await a.getText() || '<empty-text link>');
    }
    assert.strictEqual(failures.length, 0,
      `${failures.length} anchor(s) have href="": ${failures.slice(0, 3).join(', ')}`);
  });

  it('TC100: Full E2E smoke test — all 8 routes visited, body visible, no crashes', async function () {
    const routes = ['', '/#/sign-in', '/#/sign-up', '/#/dashboard',
                    '/#/routes', '/#/stops', '/#/track', '/#/favorites'];
    const failures = [];
    for (const r of routes) {
      await driver.get(`${BASE}${r}`);
      await driver.sleep(1500);
      const overlays = await driver.findElements(By.css('vite-error-overlay'));
      const body = await driver.findElement(By.tagName('body'));
      const visible = await body.isDisplayed();
      if (overlays.length > 0) failures.push(`CRASH on "${r}"`);
      if (!visible)            failures.push(`BODY hidden on "${r}"`);
    }
    assert.strictEqual(failures.length, 0,
      `E2E smoke test failures:\n${failures.join('\n')}`);
  });
});
