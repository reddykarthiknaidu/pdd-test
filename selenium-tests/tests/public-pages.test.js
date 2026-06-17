// selenium-tests/tests/public-pages.test.js
// Sample Selenium test for the Tracknova web app

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Public Pages End‑to‑End', function () {
  this.timeout(30000); // 30 seconds per test
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
    // Adjust the base URL as needed
    await driver.get('https://YOUR_USERNAME.github.io/YOUR_REPO');
  });

  after(async function () {
    await driver.quit();
  });

  it('should load the home page and display the heading', async function () {
    const heading = await driver.findElement(By.id('home-heading'));
    const text = await heading.getText();
    assert.strictEqual(text, 'Welcome to Tracknova');
  });

  it('should navigate to login page and allow login', async function () {
    const loginLink = await driver.findElement(By.id('login-link'));
    await loginLink.click();
    await driver.wait(until.urlContains('#/login'), 5000);
    const email = await driver.findElement(By.id('email'));
    const password = await driver.findElement(By.id('password'));
    await email.sendKeys('test@example.com');
    await password.sendKeys('secret');
    const loginBtn = await driver.findElement(By.id('login-button'));
    await loginBtn.click();
    // Wait for dashboard
    await driver.wait(until.elementLocated(By.id('dashboard')),
      10000);
    const dashboard = await driver.findElement(By.id('dashboard'));
    assert.ok(await dashboard.isDisplayed());
  });
});
