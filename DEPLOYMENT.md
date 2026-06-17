# React Deployment & Selenium E2E Testing Documentation

## 1️⃣ Push Your React Project to GitHub
```bash
# Inside your React project folder

git init
git add .
git commit -m "Initial frontend upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub details.

---
## 2️⃣ Install GitHub Pages Package
```bash
npm install gh-pages --save-dev
```
---
## 3️⃣ Update `package.json`
Add a `homepage` field and deployment scripts:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```
---
## 4️⃣ Deploy to GitHub Pages
```bash
npm run deploy
```
This builds the app, creates a production build, and uploads it to the `gh-pages` branch.
---
## 5️⃣ Enable GitHub Pages (GitHub UI)
1. Open your repository on GitHub.
2. Navigate to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from branch**.
4. Choose **Branch**: `gh-pages`.
5. Click **Save**.
---
## 6️⃣ Access the Live Application
Your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO
```
---
## 7️⃣ Configure React Router for GitHub Pages
Replace `BrowserRouter` with `HashRouter` to avoid 404 errors on refresh:
```tsx
- import { BrowserRouter } from 'react-router-dom';
+ import { HashRouter } from 'react-router-dom';

- <BrowserRouter>
+ <HashRouter>
```
---
## 8️⃣ Re‑build & Re‑deploy After Router Change
```bash
npm run build
npm run deploy
```
---
## 9️⃣ Verify Deployment
- Homepage loads
- Login page works
- Refresh works
- Direct URL access works (e.g., `https://USERNAME.github.io/REPO/#/login`)
---
## 🔟 Add Selenium E2E Testing
### Install dependencies
```bash
npm install selenium-webdriver mocha --save-dev
```
---
## 1️⃣1️⃣ Create Selenium Test Structure
```
frontend/
│
├── selenium-tests/
│   ├── tests/
│   │   └── login.test.js   # example test file
│   └── package.json
```
---
## 1️⃣2️⃣ Add Stable IDs for Automation
Give elements deterministic `id` attributes so Selenium can locate them reliably:
```tsx
<Input id="email" />
<Input id="password" />
<Button id="login-button" />
```
---
## 1️⃣3️⃣ Run Selenium Test Locally
Add a script to `package.json`:
```json
"scripts": {
  "login": "mocha selenium-tests/tests/login.test.js"
}
```
Then execute:
```bash
npm run login
```
---
## 1️⃣4️⃣ Setup GitHub Actions CI
Create `.github/workflows/selenium-login.yml`:
```yaml
name: Selenium Login Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Run Selenium tests
        run: npm run login
```
---
## 1️⃣5️⃣ Automatic CI/CD Testing
Every push triggers the workflow which:
- Installs dependencies
- Runs Selenium E2E tests
- Fails the build if any test fails
---
## 📊 Final Architecture Overview
```
Developer Push → GitHub Repository → GitHub Actions Trigger
    ↓
Selenium E2E Testing → Production Validation
    ↓
Pass / Fail Report
```

---
### 🎉 You now have a fully automated deployment pipeline with end‑to‑end testing!
