# 📚 Full Setup Guide for **pdd‑test**

## 🎯 Project Overview
The **pdd‑test** repository contains:
- A **React** frontend (`frontend/`) deployed to **GitHub Pages**.
- **Selenium** end‑to‑end tests for the web UI (`selenium-tests/`).
- **Appium** tests for the Android mobile app (`mobile/appium-tests/`).
- A **GitHub Actions** workflow that runs both test suites on every push and publishes **Excel** reports as artifacts.

---

## 📦 Prerequisites
| Tool | Version |
|------|---------|
| **Node.js** | 20.x |
| **npm** | latest (comes with Node) |
| **Python** | 3.13 |
| **pip** | latest |
| **Appium** | installed globally (`npm i -g appium`) |
| **Chrome/Chromedriver** | compatible with your Chrome version |
| **Git** | any recent version |

---

## 🛠️ Local Development Setup
### 1. Clone the repo (if you haven't already)
```bash
git clone https://github.com/reddykarthiknaidu/pdd-test.git
cd pdd-test
```
### 2. Install Selenium (Node) dependencies
```bash
cd selenium-tests
npm ci
```
### 3. Install Appium (Python) dependencies
```bash
cd ../mobile/appium-tests
python -m pip install --upgrade pip
pip install -r requirements.txt
```
### 4. Verify the test runners work locally
- **Web tests** (produces `selenium-tests/report.xlsx`):
  ```bash
  cd ../../selenium-tests
  node run_tests.js
  ```
- **Mobile tests** (produces `mobile/appium-tests/report.xlsx`):
  ```bash
  cd ../mobile/appium-tests
  python run_tests.py
  ```
Both commands generate an Excel file summarising PASS/FAIL, duration, and any error messages.

---

## 🚀 Deploying the React Frontend to GitHub Pages
The steps are documented in **`DEPLOYMENT.md`**, but the short version is:
1. **Initialize & push** the repo (already done).
2. **Add `gh-pages` package**:
   ```bash
   npm install gh-pages --save-dev
   ```
3. **Update `frontend/package.json`** – add a `homepage` field and the `predeploy`/`deploy` scripts (see `DEPLOYMENT.md`).
4. **Deploy**:
   ```bash
   cd frontend
   npm run deploy
   ```
5. **Enable GitHub Pages** in the repo Settings → Pages → *Source*: `Deploy from branch` → `gh-pages`.
6. Your site will be reachable at `https://YOUR_USERNAME.github.io/YOUR_REPO`.

---

## ✅ Selenium (Web) Test Suite
- **Location:** `selenium-tests/`
- **Test runner:** `node run_tests.js`
- **Sample test:** `tests/public-pages.test.js`
- **Key patterns:**
  - Uses stable `id` attributes (`home-heading`, `login-link`, `email`, `password`, `login-button`, `dashboard`).
  - Falls back to URL hash navigation if an element is missing.
- **Report:** `selenium-tests/report.xlsx` (uploaded as a GitHub Actions artifact).

---

## 📱 Appium (Mobile) Test Suite
- **Location:** `mobile/appium-tests/`
- **Test runner:** `python run_tests.py`
- **Sample test:** `tests/login.test.py`
- **Capabilities (example):**
  ```python
  caps = {
      "platformName": "Android",
      "deviceName": "Android Emulator",
      "app": "<path‑to‑your‑apk>.apk",
      "automationName": "UiAutomator2",
  }
  ```
- **Report:** `mobile/appium-tests/report.xlsx` (uploaded as a GitHub Actions artifact).

---

## 🤖 GitHub Actions CI/CD Workflow
File: `.github/workflows/testing-pipeline.yml`
```yaml
name: Test & Deploy Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      # Node (Selenium)
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install npm dependencies
        working-directory: ./selenium-tests
        run: npm ci

      # Python (Appium)
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - name: Install Python dependencies
        working-directory: ./mobile/appium-tests
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # Global Appium server
      - name: Install global Appium
        run: npm i -g appium
      - name: Start Appium server
        run: |
          appium &
          echo "APPIUM_PID=$!" >> $GITHUB_ENV

      # Run tests
      - name: Run Appium tests
        working-directory: ./mobile/appium-tests
        run: python run_tests.py

      - name: Run Selenium tests
        working-directory: ./selenium-tests
        run: node run_tests.js

      # Upload reports
      - name: Upload Mobile report
        uses: actions/upload-artifact@v4
        with:
          name: mobile-report
          path: ./mobile/appium-tests/report.xlsx
      - name: Upload Selenium report
        uses: actions/upload-artifact@v4
        with:
          name: selenium-report
          path: ./selenium-tests/report.xlsx
```
**What the workflow does:**
1. Checks out the code.
2. Sets up Node 20 and Python 3.13.
3. Installs npm & pip dependencies.
4. Installs and starts the Appium server.
5. Executes both test suites.
6. Uploads the generated Excel reports as artifacts.

---

## 📊 Excel Report Format
| Column | Description |
|--------|-------------|
| **Test Case** | Name of the test function/method |
| **Status** | `PASS` or `FAIL` |
| **Duration (s)** | Execution time in seconds |
| **Error Message** | Stack trace or assertion message (if any) |

Both the mobile and web reports follow this schema, making it easy to aggregate results in a dashboard or CI overview.

---

## 🛡️ Next Steps / Customisation
- **Add more UI IDs** in the React components (e.g., `id="home-heading"`).
- **Extend the test suites** with additional scenarios (search, map interaction, etc.).
- **Add a status badge** to the README:
  ```markdown
  ![CI Status](https://github.com/reddykarthiknaidu/pdd-test/actions/workflows/testing-pipeline.yml/badge.svg)
  ```
- **Integrate with external reporting tools** (e.g., Slack notifications) by extending the workflow.

---

## 📌 Quick Checklist
- [ ] Verify `homepage` field in `frontend/package.json` is correct.
- [ ] Ensure all stable `id` attributes exist in the React components.
- [ ] Run `npm run deploy` to publish the site.
- [ ] Run `npm run test` (or the Node runner) and `python run_tests.py` locally.
- [ ] Push changes – the GitHub Actions run should succeed and upload the Excel reports.

---

**You now have a single source of truth that documents the entire lifecycle of the project – from local development to CI/CD and reporting.**

Feel free to ask for any additional tweaks (e.g., adding a Dockerfile, customizing the Excel layout, or setting up a nightly schedule).
