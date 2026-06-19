// selenium-tests/tests/03-sign-up.test.js
// Sign-Up screen E2E tests: loads, elements, Clerk, container, redirect, E2E landing page button click

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

describe('[SIGN-UP] Sign-Up Screen Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/sign-up`);
    await driver.sleep(4000);
  });

  it('TC021: Navigate to /sign-up — URL contains "sign-up"', async function () {
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-up'), `URL did not contain "sign-up": ${url}`);
  });

  it('TC022: Sign-up page body is visible without crash', async function () {
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Vite error overlay on sign-up page!');
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not displayed on sign-up page');
  });

  it('TC023: Sign-up page data-testid container renders', async function () {
    const containers = await driver.findElements(By.css('[data-testid="page-signup"]'));
    assert.ok(containers.length > 0, 'data-testid="page-signup" container not found');
  });

  it('TC024: Sign-up page has flex centered layout class', async function () {
    const container = await driver.findElement(By.css('[data-testid="page-signup"]'));
    const cls = await container.getAttribute('class');
    assert.ok(cls.includes('flex'), `Container lacks flex class. Classes: "${cls}"`);
  });

  it('TC025: Clerk sign-up component detected in page source', async function () {
    const src = await driver.getPageSource();
    const hasClerk = src.includes('clerk') || src.includes('sign-up') || src.includes('email');
    assert.ok(hasClerk, 'Clerk sign-up component not detected in page source');
  });

  it('TC026: Sign-up page React root has content (not empty)', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 200, `React root appears empty on sign-up page (${html.length} chars)`);
  });

  it('TC027: Sign-up page document.readyState is complete', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', `document.readyState was "${state}" on sign-up`);
  });

  it('TC028: Sign-up page title is non-empty', async function () {
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Page title empty on sign-up page');
  });

  it('TC029: Sign-up page has no placeholder Lorem ipsum text', async function () {
    const src = await driver.getPageSource();
    assert.ok(!src.toLowerCase().includes('lorem ipsum'), 'Lorem ipsum found on sign-up page!');
  });

  it('TC030: Home "Start Tracking" button click reaches sign-up route', async function () {
    await driver.get(BASE);
    await driver.sleep(3000);
    const btn = await driver.findElement(By.css('[data-testid="button-get-started"]'));
    await btn.click();
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-up'), `Expected sign-up URL after click, got: ${url}`);
  });
});
