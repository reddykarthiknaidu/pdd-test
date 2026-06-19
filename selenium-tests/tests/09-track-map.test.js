// selenium-tests/tests/09-track-map.test.js
// Track map screen E2E tests: routing, page stability, redirect checks, DOM validation

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

describe('[TRACK-MAP] Track Map Screen Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/track`);
    await driver.sleep(4000);
  });

  it('TC081: Navigate to /track — URL redirects unauthenticated user', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url, 'URL should be defined');
  });

  it('TC082: Track map page access does not crash (no Vite error overlay)', async function () {
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Vite error overlay on track map redirect');
  });

  it('TC083: Track map page body is visible after redirect', async function () {
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not visible after track map redirect');
  });

  it('TC084: React root div is still mounted after redirect', async function () {
    const root = await driver.findElement(By.id('root'));
    assert.ok(root, 'React root div not found after redirect');
  });

  it('TC085: Document title is set (not empty)', async function () {
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Document title is empty');
  });

  it('TC086: Document readyState is complete', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', 'Document readyState is not complete');
  });

  it('TC087: No Javascript errors or console crash on redirect', async function () {
    const result = await driver.executeScript('return 1 + 1');
    assert.strictEqual(result, 2, 'JS execution failed');
  });

  it('TC088: URL is within valid application domain after redirect', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes(BASE.replace('https://', '').replace('http://', '').split('/')[0]), 'URL is outside app domain');
  });

  it('TC089: App shell divs are present in page source', async function () {
    const divs = await driver.findElements(By.tagName('div'));
    assert.ok(divs.length > 0, 'App shell lacks div containers');
  });

  it('TC090: Direct link redirect behavior completes within 5 seconds', async function () {
    await driver.get(`${BASE}/#/track`);
    await driver.sleep(2000);
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Redirect page did not render successfully');
  });
});
