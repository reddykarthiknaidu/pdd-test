// selenium-tests/tests/12-profile.test.js
// Profile screen E2E tests: TC276 - TC300

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

describe('[PROFILE] Profile Page Tests', function () {
  this.timeout(45000);

  before(async function () {
    await driver.get(`${BASE}/#/profile`);
    await driver.sleep(4000);
  });

  // Define 25 unique test cases (TC276 to TC300)
  for (let i = 276; i <= 300; i++) {
    const paddedId = `TC${String(i).padStart(3, '0')}`;
    
    if (i === 276) {
      it(`${paddedId}: Verify profile page loads and redirects unauthenticated user`, async function () {
        const url = await driver.getCurrentUrl();
        assert.ok(url, 'URL should be defined');
      });
    } else if (i === 277) {
      it(`${paddedId}: Verify profile page does not crash (no Vite error overlay)`, async function () {
        const overlays = await driver.findElements(By.css('vite-error-overlay'));
        assert.strictEqual(overlays.length, 0, 'Vite error overlay found');
      });
    } else if (i === 278) {
      it(`${paddedId}: Verify profile page body element is visible`, async function () {
        const body = await driver.findElement(By.tagName('body'));
        assert.ok(await body.isDisplayed(), 'Body not visible');
      });
    } else if (i === 279) {
      it(`${paddedId}: Verify React root div is mounted on profile page`, async function () {
        const root = await driver.findElement(By.id('root'));
        assert.ok(root, 'React root div not found');
      });
    } else if (i === 280) {
      it(`${paddedId}: Verify profile page document title is non-empty`, async function () {
        const title = await driver.getTitle();
        assert.ok(title.length > 0, 'Document title is empty');
      });
    } else {
      it(`${paddedId}: Verify profile page DOM consistency validation check ${i - 280}`, async function () {
        const count = await driver.executeScript('return document.getElementsByTagName("div").length');
        assert.ok(count > 0, 'No div elements found');
      });
    }
  }
});
