# Mobile Appium End‑to‑End Test Suite

## Project structure
```
mobile/appium-tests/
├─ requirements.txt          # Python dependencies
├─ run_tests.py              # Runner that executes tests & creates Excel report
└─ tests/
   └─ login.test.py          # Sample test (add your own tests here)
```

## 1️⃣ Install dependencies (once)
```bash
cd mobile/appium-tests
pip install -r requirements.txt
```

## 2️⃣ Run the tests and generate the Excel report
```bash
python run_tests.py
```
The script will:
- Start an Appium server (make sure Appium is installed globally: `npm i -g appium`).
- Execute all `*.test.py` files using **pytest**.
- Collect each test result (PASS/FAIL, duration, error message).
- Write an `report.xlsx` file in the same folder using **openpyxl**.

## 3️⃣ Sample test (`tests/login.test.py`)
```python
import pytest
from appium import webdriver

@pytest.fixture(scope="function")
def driver():
    caps = {
        "platformName": "Android",
        "deviceName": "Android Emulator",
        "app": "<path‑to‑your‑apk>.apk",
        "automationName": "UiAutomator2",
    }
    driver = webdriver.Remote("http://127.0.0.1:4723/wd/hub", caps)
    yield driver
    driver.quit()

def test_login_flow(driver):
    # Example – locate elements by id (add stable ids to your app)
    email = driver.find_element_by_id("email")
    password = driver.find_element_by_id("password")
    login_btn = driver.find_element_by_id("login-button")

    email.send_keys("test@example.com")
    password.send_keys("secret")
    login_btn.click()

    # Verify dashboard appears (by checking an element)
    assert driver.find_element_by_id("dashboard").is_displayed()
```

## 4️⃣ Excel report format (`report.xlsx`)
| Test Case          | Status | Duration (s) | Error Message |
|--------------------|--------|--------------|---------------|
| test_login_flow    | PASS   | 12.34        |               |
| ...                | FAIL   | 8.11         | AssertionError |

You can open this file in Excel or programmatically analyse it.

---
## How to extend
- Add more test files under `tests/`.
- Use **pytest markers** for grouping.
- Update `run_tests.py` if you need custom configurations.

---
## Integration with CI (GitHub Actions)
The workflow defined in `.github/workflows/testing-pipeline.yml` will automatically:
1. Install Python dependencies.
2. Start Appium server.
3. Run `run_tests.py`.
4. Upload the generated `report.xlsx` as an artifact.

---
> **Tip**: Keep your Android UI elements stable by assigning explicit `android:id` attributes so Appium can locate them reliably.
