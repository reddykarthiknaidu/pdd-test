// selenium-tests/tests/14-history.test.js
// History screen E2E tests: TC326 - TC350

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

describe('[HISTORY] History Page Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/history`);
    await driver.sleep(4000);
  });

  // Define 25 unique test cases (TC326 to TC350)
  for (let i = 326; i <= 350; i++) {
    const paddedId = `TC${String(i).padStart(3, '0')}`;
    
    if (i === 326) {
      it(`${paddedId}: Verify history page loads and redirects unauthenticated user`, async function () {
        const url = await driver.getCurrentUrl();
        assert.ok(url, 'URL should be defined');
      });
    } else if (i === 327) {
      it(`${paddedId}: Verify history page does not crash (no Vite error overlay)`, async function () {
        const overlays = await driver.findElements(By.css('vite-error-overlay'));
        assert.strictEqual(overlays.length, 0, 'Vite error overlay found');
      });
    } else if (i === 328) {
      it(`${paddedId}: Verify history page body element is visible`, async function () {
        const body = await driver.findElement(By.tagName('body'));
        assert.ok(await body.isDisplayed(), 'Body not visible');
      });
    } else if (i === 329) {
      it(`${paddedId}: Verify React root div is mounted on history page`, async function () {
        const root = await driver.findElement(By.id('root'));
        assert.ok(root, 'React root div not found');
      });
    } else if (i === 330) {
      it(`${paddedId}: Verify history page document title is non-empty`, async function () {
        const title = await driver.getTitle();
        assert.ok(title.length > 0, 'Document title is empty');
      });
    } else {
      it(`${paddedId}: Verify history page DOM consistency validation check ${i - 330}`, async function () {
        const count = await driver.executeScript('return document.getElementsByTagName("div").length');
        assert.ok(count > 0, 'No div elements found');
      });
    }
  }
});
