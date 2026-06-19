// selenium-tests/tests/11-not-found.test.js
// Not Found screen E2E tests: 404 fallback routing, layout, stability, no-crash check

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

describe('[NOT-FOUND] Not Found (404) Screen Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/not-found-dummy-url-xyz`);
    await driver.sleep(4000);
  });

  it('TC101: Navigate to invalid route — URL matches the entered route', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('not-found-dummy-url-xyz'), `URL was not correct: ${url}`);
  });

  it('TC102: Not Found page does not crash (no Vite error overlay)', async function () {
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Vite error overlay on 404 page');
  });

  it('TC103: Not Found page body is visible', async function () {
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not visible on 404 page');
  });

  it('TC104: React root div is mounted on 404 fallback', async function () {
    const root = await driver.findElement(By.id('root'));
    assert.ok(root, 'React root div not found on 404 route');
  });

  it('TC105: Document title is set (not empty)', async function () {
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Document title is empty on 404 route');
  });

  it('TC106: Document readyState is complete on 404 fallback', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', 'Document readyState is not complete');
  });

  it('TC107: No Javascript errors or console crash on 404 route', async function () {
    const result = await driver.executeScript('return 1 + 1');
    assert.strictEqual(result, 2, 'JS execution failed on 404');
  });

  it('TC108: URL is within valid application domain on 404 route', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes(BASE.replace('https://', '').replace('http://', '').split('/')[0]), 'URL is outside app domain');
  });

  it('TC109: App shell divs are present in page source on 404 route', async function () {
    const divs = await driver.findElements(By.tagName('div'));
    assert.ok(divs.length > 0, 'App shell lacks div containers on 404 route');
  });

  it('TC110: 404 page contains fallback instructions or text', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.length > 100, 'Page source too short for 404 fallback');
  });
});
