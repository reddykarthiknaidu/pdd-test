// selenium-tests/tests/public-pages.test.js
// Updated Selenium test for the Tracknova web app – uses headless Chrome and dynamic URLs.

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Public Pages End‑to‑End', function () {
  this.timeout(30000); // 30 seconds per test
  let driver;
  const baseUrl = process.env.TEST_URL || 'https://reddykarthiknaidu.github.io/tracknova';

  before(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Use the target URL
    await driver.get(baseUrl);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should load the home page and have a visible title', async function () {
    const title = await driver.getTitle();
    assert.ok(title && title.length > 0, 'Page title should not be empty');
    assert.ok(/Tracknova/i.test(title), 'Title should contain "Tracknova"');
  });

  it('should navigate to login page and display login form', async function () {
    try {
      const loginLink = await driver.findElement(By.id('login-button'));
      await loginLink.click();
    } catch (e) {
      await driver.get(`${baseUrl}/#/sign-in`);
    }
    // Wait for Clerk's sign in form to load (class typically used by clerk: cl-signIn-root)
    const signInRoot = await driver.wait(until.elementLocated(By.className('cl-signIn-root')), 15000);
    assert.ok(signInRoot, 'Clerk sign-in root should be present');
    
    // Verify url contains sign-in
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('sign-in'), 'URL should contain sign-in');
  });
});
