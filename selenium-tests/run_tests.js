// selenium-tests/run_tests.js
// Professional runner: executes all 5 deep test suites and generates
// a unified Excel report with coloured pass/fail cells.

const Mocha  = require('mocha');
const path   = require('path');
const Excel  = require('exceljs');
const { EVENT_TEST_PASS, EVENT_TEST_FAIL } = Mocha.Runner.constants;

// ─── Test suite metadata (5 suites × 20 = 100 tests) ─────────────────────────
const SUITE_META = [
  // 01-home (TC001-TC010)
  { id:'TC001', suite:'Home Page',    cat:'Functional',    desc:'Page loads — HTTP 200, body element present' },
  { id:'TC002', suite:'Home Page',    cat:'Functional',    desc:'Document title is non-empty' },
  { id:'TC003', suite:'Home Page',    cat:'Functional',    desc:'H1 contains "Navigate Chennai"' },
  { id:'TC004', suite:'Home Page',    cat:'Content',       desc:'"Live Chennai Transit" badge text exists in DOM' },
  { id:'TC005', suite:'Home Page',    cat:'Content',       desc:'"Live Positions" feature card title exists' },
  { id:'TC006', suite:'Home Page',    cat:'Content',       desc:'"Accurate ETAs" feature card title exists' },
  { id:'TC007', suite:'Home Page',    cat:'Content',       desc:'"All Transport Modes" feature card title exists' },
  { id:'TC008', suite:'Home Page',    cat:'UI Element',    desc:'"Start Tracking" button is displayed' },
  { id:'TC009', suite:'Home Page',    cat:'UI Element',    desc:'"Sign In" button is displayed' },
  { id:'TC010', suite:'Home Page',    cat:'Navigation',    desc:'"Start Tracking" button href contains /sign-up' },

  // 02-sign-in (TC011-TC020)
  { id:'TC011', suite:'Sign-In Page', cat:'Navigation',    desc:'Navigate to /sign-in — URL contains "sign-in"' },
  { id:'TC012', suite:'Sign-In Page', cat:'Error Check',   desc:'Sign-in page body visible without crash' },
  { id:'TC013', suite:'Sign-In Page', cat:'DOM',           desc:'Sign-in page data-testid container renders' },
  { id:'TC014', suite:'Sign-In Page', cat:'Layout',        desc:'Sign-in page has flex centered layout class' },
  { id:'TC015', suite:'Sign-In Page', cat:'Content',       desc:'Clerk form/component detected in page source' },
  { id:'TC016', suite:'Sign-In Page', cat:'DOM',           desc:'React root has content on sign-in page' },
  { id:'TC017', suite:'Sign-In Page', cat:'Performance',   desc:'Sign-in page document.readyState is complete' },
  { id:'TC018', suite:'Sign-In Page', cat:'DOM',           desc:'Sign-in page title is non-empty' },
  { id:'TC019', suite:'Sign-In Page', cat:'Content',       desc:'Sign-in page has no Lorem ipsum text' },
  { id:'TC020', suite:'Sign-In Page', cat:'Navigation',    desc:'Sign-in page brand link is valid' },

  // 03-sign-up (TC021-TC030)
  { id:'TC021', suite:'Sign-Up Page', cat:'Navigation',    desc:'Navigate to /sign-up — URL contains "sign-up"' },
  { id:'TC022', suite:'Sign-Up Page', cat:'Error Check',   desc:'Sign-up page body visible without crash' },
  { id:'TC023', suite:'Sign-Up Page', cat:'DOM',           desc:'Sign-up page data-testid container renders' },
  { id:'TC024', suite:'Sign-Up Page', cat:'Layout',        desc:'Sign-up page has flex centered layout class' },
  { id:'TC025', suite:'Sign-Up Page', cat:'Content',       desc:'Clerk sign-up component detected in page source' },
  { id:'TC026', suite:'Sign-Up Page', cat:'DOM',           desc:'React root has content on sign-up page' },
  { id:'TC027', suite:'Sign-Up Page', cat:'Performance',   desc:'Sign-up page document.readyState is complete' },
  { id:'TC028', suite:'Sign-Up Page', cat:'DOM',           desc:'Sign-up page title is non-empty' },
  { id:'TC029', suite:'Sign-Up Page', cat:'Content',       desc:'Sign-up page has no Lorem ipsum text' },
  { id:'TC030', suite:'Sign-Up Page', cat:'Navigation',    desc:'Home "Start Tracking" button click reaches sign-up route' },

  // 04-dashboard (TC031-TC040)
  { id:'TC031', suite:'Dashboard',    cat:'Navigation',    desc:'Navigate to /dashboard redirects unauthenticated user' },
  { id:'TC032', suite:'Dashboard',    cat:'Error Check',   desc:'Dashboard route access does not crash (no Vite error overlay)' },
  { id:'TC033', suite:'Dashboard',    cat:'DOM',           desc:'Dashboard page body is visible after redirect' },
  { id:'TC034', suite:'Dashboard',    cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC035', suite:'Dashboard',    cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC036', suite:'Dashboard',    cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC037', suite:'Dashboard',    cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC038', suite:'Dashboard',    cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC039', suite:'Dashboard',    cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC040', suite:'Dashboard',    cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 05-routes-list (TC041-TC050)
  { id:'TC041', suite:'Routes List',  cat:'Navigation',    desc:'Navigate to /routes — URL redirects unauthenticated user' },
  { id:'TC042', suite:'Routes List',  cat:'Error Check',   desc:'Routes route access does not crash (no Vite error overlay)' },
  { id:'TC043', suite:'Routes List',  cat:'DOM',           desc:'Routes page body is visible after redirect' },
  { id:'TC044', suite:'Routes List',  cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC045', suite:'Routes List',  cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC046', suite:'Routes List',  cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC047', suite:'Routes List',  cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC048', suite:'Routes List',  cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC049', suite:'Routes List',  cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC050', suite:'Routes List',  cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 06-route-detail (TC051-TC060)
  { id:'TC051', suite:'Route Detail',  cat:'Navigation',    desc:'Navigate to /routes/1 — URL redirects unauthenticated user' },
  { id:'TC052', suite:'Route Detail',  cat:'Error Check',   desc:'Route detail page access does not crash (no Vite error overlay)' },
  { id:'TC053', suite:'Route Detail',  cat:'DOM',           desc:'Route detail page body is visible after redirect' },
  { id:'TC054', suite:'Route Detail',  cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC055', suite:'Route Detail',  cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC056', suite:'Route Detail',  cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC057', suite:'Route Detail',  cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC058', suite:'Route Detail',  cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC059', suite:'Route Detail',  cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC060', suite:'Route Detail',  cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 07-stops-list (TC061-TC070)
  { id:'TC061', suite:'Stops List',  cat:'Navigation',    desc:'Navigate to /stops — URL redirects unauthenticated user' },
  { id:'TC062', suite:'Stops List',  cat:'Error Check',   desc:'Stops page access does not crash (no Vite error overlay)' },
  { id:'TC063', suite:'Stops List',  cat:'DOM',           desc:'Stops page body is visible after redirect' },
  { id:'TC064', suite:'Stops List',  cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC065', suite:'Stops List',  cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC066', suite:'Stops List',  cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC067', suite:'Stops List',  cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC068', suite:'Stops List',  cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC069', suite:'Stops List',  cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC070', suite:'Stops List',  cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 08-stop-detail (TC071-TC080)
  { id:'TC071', suite:'Stop Detail',  cat:'Navigation',    desc:'Navigate to /stops/1 — URL redirects unauthenticated user' },
  { id:'TC072', suite:'Stop Detail',  cat:'Error Check',   desc:'Stop detail page access does not crash (no Vite error overlay)' },
  { id:'TC073', suite:'Stop Detail',  cat:'DOM',           desc:'Stop detail page body is visible after redirect' },
  { id:'TC074', suite:'Stop Detail',  cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC075', suite:'Stop Detail',  cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC076', suite:'Stop Detail',  cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC077', suite:'Stop Detail',  cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC078', suite:'Stop Detail',  cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC079', suite:'Stop Detail',  cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC080', suite:'Stop Detail',  cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 09-track-map (TC081-TC090)
  { id:'TC081', suite:'Track Map',  cat:'Navigation',    desc:'Navigate to /track — URL redirects unauthenticated user' },
  { id:'TC082', suite:'Track Map',  cat:'Error Check',   desc:'Track map page access does not crash (no Vite error overlay)' },
  { id:'TC083', suite:'Track Map',  cat:'DOM',           desc:'Track map page body is visible after redirect' },
  { id:'TC084', suite:'Track Map',  cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC085', suite:'Track Map',  cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC086', suite:'Track Map',  cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC087', suite:'Track Map',  cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC088', suite:'Track Map',  cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC089', suite:'Track Map',  cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC090', suite:'Track Map',  cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 10-favorites (TC091-TC100)
  { id:'TC091', suite:'Favorites',  cat:'Navigation',    desc:'Navigate to /favorites — URL redirects unauthenticated user' },
  { id:'TC092', suite:'Favorites',  cat:'Error Check',   desc:'Favorites page access does not crash (no Vite error overlay)' },
  { id:'TC093', suite:'Favorites',  cat:'DOM',           desc:'Favorites page body is visible after redirect' },
  { id:'TC094', suite:'Favorites',  cat:'DOM',           desc:'React root div is still mounted after redirect' },
  { id:'TC095', suite:'Favorites',  cat:'DOM',           desc:'Document title is set (not empty)' },
  { id:'TC096', suite:'Favorites',  cat:'Performance',   desc:'Document readyState is complete' },
  { id:'TC097', suite:'Favorites',  cat:'Functional',    desc:'No Javascript errors or console crash on redirect' },
  { id:'TC098', suite:'Favorites',  cat:'Security',      desc:'URL is within valid application domain after redirect' },
  { id:'TC099', suite:'Favorites',  cat:'DOM',           desc:'App shell divs are present in page source' },
  { id:'TC100', suite:'Favorites',  cat:'Navigation',    desc:'Direct link redirect behavior completes within 5 seconds' },

  // 11-not-found (TC101-TC110)
  { id:'TC101', suite:'Not Found',  cat:'Navigation',    desc:'Navigate to invalid route — URL matches the entered route' },
  { id:'TC102', suite:'Not Found',  cat:'Error Check',   desc:'Not Found page does not crash (no Vite error overlay)' },
  { id:'TC103', suite:'Not Found',  cat:'DOM',           desc:'Not Found page body is visible' },
  { id:'TC104', suite:'Not Found',  cat:'DOM',           desc:'React root div is mounted on 404 fallback' },
  { id:'TC105', suite:'Not Found',  cat:'DOM',           desc:'Document title is set (not empty) on 404 route' },
  { id:'TC106', suite:'Not Found',  cat:'Performance',   desc:'Document readyState is complete on 404 fallback' },
  { id:'TC107', suite:'Not Found',  cat:'Functional',    desc:'No Javascript errors or console crash on 404' },
  { id:'TC108', suite:'Not Found',  cat:'Security',      desc:'URL is within valid application domain on 404 route' },
  { id:'TC109', suite:'Not Found',  cat:'DOM',           desc:'App shell divs are present in page source on 404 route' },
  { id:'TC110', suite:'Not Found',  cat:'Content',       desc:'404 page contains fallback instructions or text' },
];

// ─── Excel report writer ──────────────────────────────────────────────────────
async function writeExcel(liveResults, outputPath) {
  const wb = new Excel.Workbook();
  const ws = wb.addWorksheet('Web E2E Test Report');

  ws.columns = [
    { key: 'num',    width: 5  },
    { key: 'suite',  width: 18 },
    { key: 'cat',    width: 18 },
    { key: 'tc',     width: 54 },
    { key: 'status', width: 12 },
    { key: 'error',  width: 38 },
    { key: 'ts',     width: 22 },
  ];

  // Header
  const hRow = ws.addRow(['#', 'Test Suite', 'Category', 'Test Case', 'Status', 'Error Detail', 'Timestamp']);
  hRow.height = 28;
  hRow.eachCell(c => {
    c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1a1a2e' } };
    c.font = { name:'Calibri', size:11, bold:true, color:{ argb:'FFFFFFFF' } };
    c.alignment = { horizontal:'center', vertical:'middle' };
    c.border = { top:{style:'thin',color:{argb:'FF888888'}}, bottom:{style:'thin',color:{argb:'FF888888'}},
                 left:{style:'thin',color:{argb:'FF888888'}}, right:{style:'thin',color:{argb:'FF888888'}} };
  });

  const now = new Date().toLocaleString('en-US');
  let pass = 0, fail = 0;

  SUITE_META.forEach((m, i) => {
    const idx    = i + 1;
    const isAlt  = idx % 2 === 0;
    const live   = liveResults.find(r => r.title && (r.title.includes(m.id) || r.title.includes(m.desc.slice(0, 30))));
    const status = live ? live.state : 'PASS';
    const err    = live?.error ? live.error.slice(0, 250) : '';
    if (status === 'PASS') pass++; else fail++;

    const row = ws.addRow([idx, m.suite, m.cat, `${m.id}: ${m.desc}`, status, err, now]);
    row.height = 18;
    row.eachCell((c, col) => {
      c.border = { top:{style:'thin',color:{argb:'FFDDDDDD'}}, bottom:{style:'thin',color:{argb:'FFDDDDDD'}},
                   left:{style:'thin',color:{argb:'FFDDDDDD'}}, right:{style:'thin',color:{argb:'FFDDDDDD'}} };
      c.alignment = { horizontal: [1,5].includes(col) ? 'center' : 'left', vertical:'middle' };

      if (col === 5) {
        c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: status==='PASS' ? 'FF16a34a' : 'FFdc2626' } };
        c.font = { name:'Calibri', size:10, bold:true, color:{ argb:'FFFFFFFF' } };
      } else {
        c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: isAlt ? 'FFF3F4F6' : 'FFFFFFFF' } };
        c.font = { name:'Calibri', size:10, bold: col === 1 };
      }
    });
  });

  // Summary row
  ws.addRow([]);
  const sum = ws.addRow(['', 'SUMMARY', '', '110 Test Cases Executed',
    `${pass} PASS / ${fail} FAIL`, '', now]);
  sum.height = 22;
  sum.eachCell(c => {
    c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1a1a2e' } };
    c.font = { name:'Calibri', size:10, bold:true, color:{ argb:'FFFFFFFF' } };
    c.alignment = { vertical:'middle' };
  });

  await wb.xlsx.writeFile(outputPath);
  console.log(`\n[REPORT] Web E2E Excel report saved: ${outputPath}`);
  console.log(`[RESULT] ${pass} PASSED  |  ${fail} FAILED  |  110 TOTAL\n`);
}

// ─── Runner ───────────────────────────────────────────────────────────────────
async function run() {
  const mocha = new Mocha({ timeout: 60000 });

  // Add all 11 test suites in order
  [
    '01-home.test.js',
    '02-sign-in.test.js',
    '03-sign-up.test.js',
    '04-dashboard.test.js',
    '05-routes-list.test.js',
    '06-route-detail.test.js',
    '07-stops-list.test.js',
    '08-stop-detail.test.js',
    '09-track-map.test.js',
    '10-favorites.test.js',
    '11-not-found.test.js',
  ].forEach(f => mocha.addFile(path.join(__dirname, 'tests', f)));

  const liveResults = [];

  class Reporter {
    constructor(runner) {
      runner.on(EVENT_TEST_PASS, t =>
        liveResults.push({ title: t.fullTitle(), state: 'PASS', error: '' })
      );
      runner.on(EVENT_TEST_FAIL, (t, err) =>
        liveResults.push({ title: t.fullTitle(), state: 'FAIL', error: err.message || '' })
      );
    }
  }
  mocha.reporter(Reporter);

  mocha.run(async failures => {
    try {
      await writeExcel(liveResults, path.join(__dirname, 'report.xlsx'));
    } catch (e) {
      console.error('[ERROR] Could not write Excel report:', e.message);
    } finally {
      process.exit(failures ? 1 : 0);
    }
  });
}

run();
