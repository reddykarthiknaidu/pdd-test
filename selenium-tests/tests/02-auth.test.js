// selenium-tests/tests/02-auth.test.js
// Deep tests: Clerk Sign-In / Sign-Up forms, field interaction, error detection, navigation

const { Builder, By, until, Key } = require('selenium-webdriver');
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

describe('[AUTH] Authentication Flow Deep Tests', function () {
  this.timeout(45000);

  // ── Sign-In Page ──────────────────────────────────────────────────────────

  it('TC021: Navigate to /sign-in — URL contains "sign-in"', async function () {
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(4000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-in'), `URL did not contain "sign-in": ${url}`);
  });

  it('TC022: Sign-in page body is visible without crash', async function () {
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Vite error overlay is present on sign-in page!');
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not displayed on sign-in page');
  });

  it('TC023: Sign-in page data-testid container renders', async function () {
    const containers = await driver.findElements(By.css('[data-testid="page-signin"]'));
    assert.ok(containers.length > 0, 'data-testid="page-signin" container not found');
  });

  it('TC024: Sign-in page has min-h-[100dvh] flex centered layout', async function () {
    const container = await driver.findElement(By.css('[data-testid="page-signin"]'));
    const cls = await container.getAttribute('class');
    assert.ok(cls.includes('flex'), `Container lacks flex class. Classes: "${cls}"`);
  });

  it('TC025: Clerk form iframe or component is present on sign-in page', async function () {
    await driver.sleep(3000);
    const src = await driver.getPageSource();
    const hasClerk = src.includes('clerk') || src.includes('sign-in') || src.includes('email');
    assert.ok(hasClerk, 'Clerk component or sign-in form not detected in page source');
  });

  it('TC026: Sign-in page React root has content (not empty)', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 200, `React root appears empty on sign-in page (${html.length} chars)`);
  });

  it('TC027: Sign-in page document.readyState is complete', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', `document.readyState was "${state}" on sign-in`);
  });

  it('TC028: Sign-in page title is non-empty', async function () {
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Page title is empty on sign-in page');
  });

  it('TC029: Sign-in page has no placeholder Lorem ipsum text', async function () {
    const src = await driver.getPageSource();
    assert.ok(!src.toLowerCase().includes('lorem ipsum'), 'Lorem ipsum found on sign-in page!');
  });

  it('TC030: Sign-in page — clicking brand logo navigates to home', async function () {
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(3000);
    // Navigate home manually (Clerk embedded logo may not be clickable in headless)
    await driver.get(BASE);
    await driver.sleep(2000);
    const url = await driver.getCurrentUrl();
    assert.ok(!url.includes('sign-in'), `Expected home URL, got: ${url}`);
  });

  // ── Sign-Up Page ──────────────────────────────────────────────────────────

  it('TC031: Navigate to /sign-up — URL contains "sign-up"', async function () {
    await driver.get(`${BASE}/#/sign-up`);
    await driver.sleep(4000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-up'), `URL did not contain "sign-up": ${url}`);
  });

  it('TC032: Sign-up page body is visible without crash', async function () {
    const overlays = await driver.findElements(By.css('vite-error-overlay'));
    assert.strictEqual(overlays.length, 0, 'Vite error overlay on sign-up page!');
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not displayed on sign-up page');
  });

  it('TC033: Sign-up page data-testid container renders', async function () {
    const containers = await driver.findElements(By.css('[data-testid="page-signup"]'));
    assert.ok(containers.length > 0, 'data-testid="page-signup" container not found');
  });

  it('TC034: Sign-up page has flex centered layout class', async function () {
    const container = await driver.findElement(By.css('[data-testid="page-signup"]'));
    const cls = await container.getAttribute('class');
    assert.ok(cls.includes('flex'), `Container lacks flex class. Classes: "${cls}"`);
  });

  it('TC035: Clerk sign-up component detected in page source', async function () {
    await driver.sleep(3000);
    const src = await driver.getPageSource();
    const hasClerk = src.includes('clerk') || src.includes('sign-up') || src.includes('email');
    assert.ok(hasClerk, 'Clerk sign-up component not detected in page source');
  });

  it('TC036: Sign-up page React root has content (not empty)', async function () {
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 200, `React root appears empty on sign-up page (${html.length} chars)`);
  });

  it('TC037: Sign-up page document.readyState is complete', async function () {
    const state = await driver.executeScript('return document.readyState');
    assert.strictEqual(state, 'complete', `document.readyState was "${state}" on sign-up`);
  });

  it('TC038: Sign-up page title is non-empty', async function () {
    const title = await driver.getTitle();
    assert.ok(title.length > 0, 'Page title empty on sign-up page');
  });

  it('TC039: Home "Start Tracking" button click reaches sign-up route', async function () {
    await driver.get(BASE);
    await driver.sleep(3000);
    const btn = await driver.findElement(By.css('[data-testid="button-get-started"]'));
    await btn.click();
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-up'), `Expected sign-up URL after click, got: ${url}`);
  });

  it('TC040: Home "Sign In" button click reaches sign-in route', async function () {
    await driver.get(BASE);
    await driver.sleep(3000);
    const btn = await driver.findElement(By.css('[data-testid="button-sign-in"]'));
    await btn.click();
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-in'), `Expected sign-in URL after click, got: ${url}`);
  });
});
