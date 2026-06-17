// selenium-tests/tests/03-navigation.test.js
// Deep routing tests: hash routing, protected redirects, 404, back/forward, all app routes

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

describe('[NAV] Routing & Navigation Deep Tests', function () {
  this.timeout(45000);

  it('TC041: Root URL (/) loads and body is visible', async function () {
    await driver.get(BASE);
    await driver.sleep(3000);
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not visible on root URL');
  });

  it('TC042: Root URL — React #root div is mounted', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 100, `Root div empty on home page (${html.length} chars)`);
  });

  it('TC043: /#/sign-in — URL updates to contain "sign-in"', async function () {
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-in'), `Expected sign-in in URL, got: ${url}`);
  });

  it('TC044: /#/sign-up — URL updates to contain "sign-up"', async function () {
    await driver.get(`${BASE}/#/sign-up`);
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-up'), `Expected sign-up in URL, got: ${url}`);
  });

  it('TC045: /#/dashboard — redirects unauthenticated user (no crash)', async function () {
    await driver.get(`${BASE}/#/dashboard`);
    await driver.sleep(4000);
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Crash overlay active on /dashboard for unauth user');
  });

  it('TC046: /#/dashboard — body still renders after redirect', async function () {
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not visible after dashboard redirect');
  });

  it('TC047: /#/routes — redirects unauthenticated user (no crash)', async function () {
    await driver.get(`${BASE}/#/routes`);
    await driver.sleep(4000);
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Crash overlay on /routes for unauth user');
  });

  it('TC048: /#/routes — page source is not empty after redirect', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.length > 500, `Page source too short after /routes redirect: ${src.length}`);
  });

  it('TC049: /#/stops — redirects unauthenticated user (no crash)', async function () {
    await driver.get(`${BASE}/#/stops`);
    await driver.sleep(4000);
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Crash overlay on /stops for unauth user');
  });

  it('TC050: /#/stops — React root still has content', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 100, `Root empty after /stops redirect (${html.length} chars)`);
  });

  it('TC051: /#/track — redirects unauthenticated user (no crash)', async function () {
    await driver.get(`${BASE}/#/track`);
    await driver.sleep(4000);
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Crash on /track for unauth user');
  });

  it('TC052: /#/favorites — redirects unauthenticated user (no crash)', async function () {
    await driver.get(`${BASE}/#/favorites`);
    await driver.sleep(4000);
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Crash on /favorites for unauth user');
  });

  it('TC053: /#/nonexistent-route — 404 fallback renders (no crash)', async function () {
    await driver.get(`${BASE}/#/this-route-definitely-does-not-exist`);
    await driver.sleep(3000);
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Crash overlay on invalid route');
  });

  it('TC054: /#/nonexistent-route — React root has some content (not blank)', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 50, `Root appears blank on 404 route (${html.length} chars)`);
  });

  it('TC055: Browser back() from sign-in returns to prior page', async function () {
    await driver.get(BASE);
    await driver.sleep(2000);
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(2000);
    await driver.navigate().back();
    await driver.sleep(2000);
    const url = await driver.getCurrentUrl();
    // Should be back at base or some previous URL — not stuck on sign-in
    assert.ok(url === BASE || url === `${BASE}/` || !url.includes('sign-in'),
      `Back navigation failed — still on: ${url}`);
  });

  it('TC056: Browser forward() after back() returns to sign-in', async function () {
    await driver.navigate().forward();
    await driver.sleep(2000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-in'), `Forward navigation failed — URL: ${url}`);
  });

  it('TC057: Navigating all 8 app routes in sequence produces no crashes', async function () {
    const routes = ['', '/#/sign-in', '/#/sign-up', '/#/dashboard',
                    '/#/routes', '/#/stops', '/#/track', '/#/favorites'];
    for (const r of routes) {
      await driver.get(`${BASE}${r}`);
      await driver.sleep(1500);
      const overlays = await driver.findElements(By.css('vite-error-overlay'));
      assert.strictEqual(overlays.length, 0, `Crash overlay on route "${r}"`);
    }
  });

  it('TC058: After full route cycle, readyState is "complete"', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', `readyState was "${state}" after route cycle`);
  });

  it('TC059: Reloading the home page preserves body content', async function () {
    await driver.get(BASE);
    await driver.sleep(3000);
    await driver.navigate().refresh();
    await driver.sleep(3000);
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 100, 'Root empty after page reload');
  });

  it('TC060: Direct deep-link to /#/sign-up loads without blank screen', async function () {
    await driver.get(`${BASE}/#/sign-up`);
    await driver.sleep(4000);
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 100, `Blank screen on direct deep-link to sign-up (${html.length} chars)`);
  });
});
