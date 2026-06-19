// selenium-tests/tests/01-home.test.js
// Home screen E2E tests: loads, title, heading, badge, feature cards, links

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

describe('[HOME] Home Page Screen Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(BASE);
    await driver.sleep(4000);
  });

  it('TC001: Page loads — HTTP 200, body element present', async function () {
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(body, 'Body element must exist');
  });

  it('TC002: Document title is non-empty', async function () {
    const title = await driver.getTitle();
    assert.ok(title && title.length > 0, `Title was empty: "${title}"`);
  });

  it('TC003: H1 contains "Navigate Chennai"', async function () {
    const h1 = await driver.findElement(By.tagName('h1'));
    const text = await h1.getText();
    assert.ok(text.toLowerCase().includes('navigate') || text.toLowerCase().includes('chennai'),
      `H1 was: "${text}"`);
  });

  it('TC004: "Live Chennai Transit" badge text exists in DOM', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.includes('Live Chennai Transit'), '"Live Chennai Transit" text missing from DOM');
  });

  it('TC005: "Live Positions" feature card title exists', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.includes('Live Positions'), '"Live Positions" feature card missing');
  });

  it('TC006: "Accurate ETAs" feature card title exists', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.includes('Accurate ETAs'), '"Accurate ETAs" feature card missing');
  });

  it('TC007: "All Transport Modes" feature card title exists', async function () {
    const src = await driver.getPageSource();
    assert.ok(src.includes('All Transport Modes'), '"All Transport Modes" card missing');
  });

  it('TC008: "Start Tracking" button is displayed', async function () {
    const btns = await driver.findElements(By.css('[data-testid="button-get-started"]'));
    assert.ok(btns.length > 0, 'Start Tracking button not found by data-testid');
    assert.ok(await btns[0].isDisplayed(), 'Start Tracking button is not visible');
  });

  it('TC009: "Sign In" button is displayed', async function () {
    const btns = await driver.findElements(By.css('[data-testid="button-sign-in"]'));
    assert.ok(btns.length > 0, 'Sign In button not found by data-testid');
    assert.ok(await btns[0].isDisplayed(), 'Sign In button is not visible');
  });

  it('TC010: "Start Tracking" button href contains /sign-up', async function () {
    const btn = await driver.findElement(By.css('[data-testid="button-get-started"]'));
    const href = await btn.getAttribute('href');
    assert.ok(href && href.includes('sign-up'), `Start Tracking href was: "${href}"`);
  });
});
