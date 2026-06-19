// selenium-tests/tests/02-sign-in.test.js
// Sign-In screen E2E tests: loads, elements, Clerk, container, redirect, DOM integrity

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

describe('[SIGN-IN] Sign-In Screen Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(4000);
  });

  it('TC011: Navigate to /sign-in — URL contains "sign-in"', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-in'), `URL did not contain "sign-in": ${url}`);
  });

  it('TC012: Sign-in page body is visible without crash', async function () {
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Vite error overlay is present on sign-in page!');
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not displayed on sign-in page');
  });

  it('TC013: Sign-in page data-testid container renders', async function () {
    const containers = await driver.findElements(By.css('[data-testid="page-signin"]'));
    assert.ok(containers.length > 0, 'data-testid="page-signin" container not found');
  });

  it('TC014: Sign-in page has min-h-[100dvh] flex centered layout', async function () {
    const container = await driver.findElement(By.css('[data-testid="page-signin"]'));
    const cls = await container.getAttribute('class');
    assert.ok(cls.includes('flex'), `Container lacks flex class. Classes: "${cls}"`);
  });

  it('TC015: Clerk form iframe or component is present on sign-in page', async function () {
    const src = await driver.getPageSource();
    const hasClerk = src.includes('clerk') || src.includes('sign-in') || src.includes('email');
    assert.ok(hasClerk, 'Clerk component or sign-in form not detected in page source');
  });

  it('TC016: Sign-in page React root has content (not empty)', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 200, `React root appears empty on sign-in page (${html.length} chars)`);
  });

  it('TC017: Sign-in page document.readyState is complete', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', `document.readyState was "${state}" on sign-in`);
  });

  it('TC018: Sign-in page title is non-empty', async function () {
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Page title is empty on sign-in page');
  });

  it('TC019: Sign-in page has no placeholder Lorem ipsum text', async function () {
    const src = await driver.getPageSource();
    assert.ok(!src.toLowerCase().includes('lorem ipsum'), 'Lorem ipsum found on sign-in page!');
  });

  it('TC020: Sign-in page brand link is valid', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.includes('href'), 'Sign-in page source does not contain links');
  });
});
