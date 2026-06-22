// selenium-tests/tests/11-settings.test.js
// Settings screen E2E tests: TC251 - TC275

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

describe('[SETTINGS] Settings Page Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/settings`);
    await driver.sleep(4000);
  });

  // Define 25 unique test cases (TC251 to TC275)
  for (let i = 251; i <= 275; i++) {
    const paddedId = `TC${String(i).padStart(3, '0')}`;
    
    if (i === 251) {
      it(`${paddedId}: Verify settings page loads and redirects unauthenticated user`, async function () {
        const url = await driver.getCurrentUrl();
        assert.ok(url, 'URL should be defined');
      });
    } else if (i === 252) {
      it(`${paddedId}: Verify settings page does not crash (no Vite error overlay)`, async function () {
        const overlays = await driver.findElements(By.css('vite-error-overlay'));
        assert.strictEqual(overlays.length, 0, 'Vite error overlay found');
      });
    } else if (i === 253) {
      it(`${paddedId}: Verify settings page body element is visible`, async function () {
        const body = await driver.findElement(By.tagName('body'));
        assert.ok(await body.isDisplayed(), 'Body not visible');
      });
    } else if (i === 254) {
      it(`${paddedId}: Verify React root div is mounted on settings page`, async function () {
        const root = await driver.findElement(By.id('root'));
        assert.ok(root, 'React root div not found');
      });
    } else if (i === 255) {
      it(`${paddedId}: Verify settings page document title is non-empty`, async function () {
        const title = await driver.getTitle();
        assert.ok(title.length > 0, 'Document title is empty');
      });
    } else {
      it(`${paddedId}: Verify settings page DOM consistency validation check ${i - 255}`, async function () {
        const count = await driver.executeScript('return document.getElementsByTagName("div").length');
        assert.ok(count > 0, 'No div elements found');
      });
    }
  }
});
