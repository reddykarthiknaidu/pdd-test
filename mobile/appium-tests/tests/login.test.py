# Sample Appium test for Android app
import pytest
from appium import webdriver

@pytest.fixture(scope="function")
def driver():
    caps = {
        "platformName": "Android",
        "deviceName": "Android Emulator",
        "app": "<path-to-your-apk>.apk",
        "automationName": "UiAutomator2",
    }
    driver = webdriver.Remote("http://127.0.0.1:4723/wd/hub", caps)
    yield driver
    driver.quit()

def test_login_flow(driver):
    email = driver.find_element_by_id("email")
    password = driver.find_element_by_id("password")
    login_btn = driver.find_element_by_id("login-button")
    email.send_keys("test@example.com")
    password.send_keys("secret")
    login_btn.click()
    assert driver.find_element_by_id("dashboard").is_displayed()
