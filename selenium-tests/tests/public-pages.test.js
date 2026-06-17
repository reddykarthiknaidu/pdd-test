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
      const loginLink = await driver.findElement(By.id('login-link'));
      await loginLink.click();
    } catch (e) {
      await driver.get(`${baseUrl}/#/login`);
    }
    // Wait for email and password fields (generic IDs).
    await driver.wait(until.elementLocated(By.id('email')));
    await driver.wait(until.elementLocated(By.id('password')));
    const email = await driver.findElement(By.id('email'));
    const password = await driver.findElement(By.id('password'));
    assert.ok(email, 'Email input should be present');
    assert.ok(password, 'Password input should be present');
    // Optional: perform a dummy login.
    await email.sendKeys('test@example.com');
    await password.sendKeys('secret');
    const loginBtn = await driver.findElement(By.id('login-button')).catch(() => null);
    if (loginBtn) await loginBtn.click();
    // Verify dashboard appears if present.
    const dashboard = await driver.findElement(By.id('dashboard')).catch(() => null);
    if (dashboard) {
      assert.ok(await dashboard.isDisplayed(), 'Dashboard should be visible after login');
    }
  });
});
