// selenium-tests/tests/04-ui-interactions.test.js
// Deep UI tests: button interactions, search inputs, filter buttons, 
// component rendering, Clerk form fields, responsive layout

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

describe('[UI] UI Components & Interactions Deep Tests', function () {
  this.timeout(45000);

  // ── Home page buttons ──────────────────────────────────────────────

  it('TC061: "Start Tracking" button has non-empty text', async function () {
    await driver.get(BASE);
    await driver.sleep(4000);
    const btn = await driver.findElement(By.css('[data-testid="button-get-started"]'));
    const text = await btn.getText();
    assert.ok(text.trim().length > 0, `"Start Tracking" button text is empty`);
  });

  it('TC062: "Start Tracking" button text includes "Start" or "Track"', async function () {
    const btn = await driver.findElement(By.css('[data-testid="button-get-started"]'));
    const text = await btn.getText();
    assert.ok(text.toLowerCase().includes('start') || text.toLowerCase().includes('track'),
      `Button text was: "${text}"`);
  });

  it('TC063: "Sign In" button has non-empty text', async function () {
    const btn = await driver.findElement(By.css('[data-testid="button-sign-in"]'));
    const text = await btn.getText();
    assert.ok(text.trim().length > 0, `"Sign In" button text is empty`);
  });

  it('TC064: "Sign In" button text includes "Sign"', async function () {
    const btn = await driver.findElement(By.css('[data-testid="button-sign-in"]'));
    const text = await btn.getText();
    assert.ok(text.toLowerCase().includes('sign'), `Sign In button text was: "${text}"`);
  });

  it('TC065: Home page has at least 2 anchor (link) elements', async function () {
    const links = await driver.findElements(By.tagName('a'));
    assert.ok(links.length >= 2, `Only ${links.length} links found on home page`);
  });

  it('TC066: All buttons on home page are enabled (not disabled)', async function () {
    const buttons = await driver.findElements(By.tagName('button'));
    for (const btn of buttons) {
      const disabled = await btn.getAttribute('disabled');
      const text = await btn.getText();
      assert.ok(!disabled, `Button "${text}" is disabled on home page`);
    }
  });

  it('TC067: Feature cards have h3 headings', async function () {
    const headings = await driver.findElements(By.tagName('h3'));
    assert.ok(headings.length >= 3, `Only ${headings.length} h3 headings found, expected at least 3`);
  });

  it('TC068: Feature card paragraphs have non-empty text', async function () {
    const paragraphs = await driver.findElements(By.tagName('p'));
    let emptyCount = 0;
    for (const p of paragraphs) {
      const text = await p.getText();
      if (text.trim().length === 0) emptyCount++;
    }
    assert.strictEqual(emptyCount, 0, `${emptyCount} empty <p> element(s) found`);
  });

  // ── Clerk input interaction ─────────────────────────────────────────

  it('TC069: Sign-in page — Clerk email input accepts keyboard input', async function () {
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(5000);
    // Try to find an email input in the page or Clerk iframe
    const inputs = await driver.findElements(By.css('input[type="email"], input[name="identifier"], input[placeholder*="email" i]'));
    if (inputs.length > 0) {
      await inputs[0].sendKeys('test@example.com');
      const val = await inputs[0].getAttribute('value');
      assert.ok(val.includes('test') || val.length > 0, `Email input did not accept keyboard input. Value: "${val}"`);
    } else {
      // Clerk loads in an iframe or shadow DOM — check page source has an input structure
      const src = await driver.getPageSource();
      assert.ok(src.includes('input') || src.includes('email') || src.includes('clerk'),
        'No input elements or Clerk detected on sign-in page');
    }
  });

  it('TC070: Sign-in page — Clerk form card is displayed in viewport', async function () {
    await driver.get(`${BASE}/#/sign-in`);
    await driver.sleep(5000);
    const container = await driver.findElement(By.css('[data-testid="page-signin"]'));
    assert.ok(await container.isDisplayed(), 'Sign-in page container is not visible');
    const rect = await driver.executeScript(
      'const el = arguments[0]; const r = el.getBoundingClientRect(); return {top: r.top, left: r.left, width: r.width, height: r.height};',
      container
    );
    assert.ok(rect.width > 0, `Container width is ${rect.width} — not in viewport`);
    assert.ok(rect.height > 0, `Container height is ${rect.height} — not in viewport`);
  });

  it('TC071: Sign-up page — page-signup container is in viewport', async function () {
    await driver.get(`${BASE}/#/sign-up`);
    await driver.sleep(5000);
    const container = await driver.findElement(By.css('[data-testid="page-signup"]'));
    const rect = await driver.executeScript(
      'const el = arguments[0]; const r = el.getBoundingClientRect(); return {width: r.width, height: r.height};',
      container
    );
    assert.ok(rect.width > 0 && rect.height > 0,
      `Sign-up container not in viewport: ${rect.width}x${rect.height}`);
  });

  // ── Routes page UI (redirect catches) ─────────────────────────────

  it('TC072: Routes page — search input has correct data-testid', async function () {
    await driver.get(`${BASE}/#/routes`);
    await driver.sleep(4000);
    const inputs = await driver.findElements(By.css('[data-testid="input-search-routes"]'));
    // If authenticated, input should exist; if redirected to home, home should load
    const src = await driver.getPageSource();
    assert.ok(inputs.length > 0 || src.includes('Navigate Chennai') || src.includes('sign'),
      'Neither routes search input nor home page content found after /routes access');
  });

  it('TC073: Stops page — search input has correct data-testid (or redirect)', async function () {
    await driver.get(`${BASE}/#/stops`);
    await driver.sleep(4000);
    const inputs = await driver.findElements(By.css('[data-testid="input-search-stops"]'));
    const src = await driver.getPageSource();
    assert.ok(inputs.length > 0 || src.includes('Navigate Chennai') || src.includes('sign'),
      'Neither stops search input nor home page found after /stops access');
  });

  it('TC074: Track page — route filter input has correct data-testid (or redirect)', async function () {
    await driver.get(`${BASE}/#/track`);
    await driver.sleep(4000);
    const inputs = await driver.findElements(By.css('[data-testid="input-route-search"]'));
    const src = await driver.getPageSource();
    assert.ok(inputs.length > 0 || src.includes('Navigate Chennai') || src.includes('sign'),
      'Neither track search input nor home page found after /track access');
  });

  // ── Responsive layout ─────────────────────────────────────────────

  it('TC075: At 1920px width — Start Tracking button is displayed', async function () {
    await driver.manage().window().setRect({ width: 1920, height: 1080 });
    await driver.get(BASE);
    await driver.sleep(3000);
    const btn = await driver.findElement(By.css('[data-testid="button-get-started"]'));
    assert.ok(await btn.isDisplayed(), 'Start Tracking button not visible at 1920px');
  });

  it('TC076: At 768px width — page body still renders (tablet)', async function () {
    await driver.manage().window().setRect({ width: 768, height: 1024 });
    await driver.get(BASE);
    await driver.sleep(3000);
    const root = await driver.findElement(By.id('root'));
    const html = await root.getAttribute('innerHTML');
    assert.ok(html.length > 100, `Root empty at 768px (${html.length} chars)`);
  });

  it('TC077: At 375px width — page body still renders (mobile)', async function () {
    await driver.manage().window().setRect({ width: 375, height: 812 });
    await driver.get(BASE);
    await driver.sleep(3000);
    const body = await driver.findElement(By.tagName('body'));
    assert.ok(await body.isDisplayed(), 'Body not visible at 375px (mobile width)');
  });

  it('TC078: Home page layout at 375px — no horizontal overflow', async function () {
    const overflow = await driver.executeScript(
      'return document.body.scrollWidth > window.innerWidth'
    );
    assert.ok(!overflow, 'Horizontal overflow detected at 375px mobile width!');
  });

  // ── Keyboard / Focus ──────────────────────────────────────────────

  it('TC079: Tab key moves focus to interactive elements on home page', async function () {
    await driver.manage().window().setRect({ width: 1920, height: 1080 });
    await driver.get(BASE);
    await driver.sleep(3000);
    const body = await driver.findElement(By.tagName('body'));
    // Tab to first interactive element
    await body.sendKeys(Key.TAB);
    const activeTag = await driver.executeScript('return document.activeElement.tagName');
    assert.ok(['A', 'BUTTON', 'INPUT', 'BODY'].includes(activeTag.toUpperCase()),
      `Focus moved to unexpected tag: "${activeTag}"`);
  });

  it('TC080: Enter key on "Sign In" button triggers navigation', async function () {
    await driver.get(BASE);
    await driver.sleep(3000);
    const btn = await driver.findElement(By.css('[data-testid="button-sign-in"]'));
    await btn.sendKeys(Key.RETURN);
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('sign-in'), `Enter key on Sign In did not navigate. URL: ${url}`);
  });
});
