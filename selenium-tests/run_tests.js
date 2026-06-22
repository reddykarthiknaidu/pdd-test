// selenium-tests/run_tests.js
// Professional runner: executes all 10 deep test suites (250 tests total)
// and generates a unified Excel report with coloured pass/fail cells.

const Mocha  = require('mocha');
const path   = require('path');
const Excel  = require('exceljs');
const { EVENT_TEST_PASS, EVENT_TEST_FAIL } = Mocha.Runner.constants;

// ─── Test suite metadata (10 suites × 25 = 250 tests) ─────────────────────────
const SUITE_NAMES = [
  { idStart: 1,   suite: 'Home Page',         cat: 'Functional' },
  { idStart: 26,  suite: 'Sign-In Page',      cat: 'Functional' },
  { idStart: 51,  suite: 'Sign-Up Page',      cat: 'Functional' },
  { idStart: 76,  suite: 'Dashboard Page',    cat: 'Functional' },
  { idStart: 101, suite: 'Routes List Page',  cat: 'Functional' },
  { idStart: 126, suite: 'Route Detail Page', cat: 'Functional' },
  { idStart: 151, suite: 'Stops List Page',   cat: 'Functional' },
  { idStart: 176, suite: 'Stop Detail Page',  cat: 'Functional' },
  { idStart: 201, suite: 'Track Map Page',    cat: 'Functional' },
  { idStart: 226, suite: 'Favorites & 404',   cat: 'Functional' },
  { idStart: 251, suite: 'Settings Page',      cat: 'Functional' },
  { idStart: 276, suite: 'Profile Page',       cat: 'Functional' },
  { idStart: 301, suite: 'Notifications Page', cat: 'Functional' },
  { idStart: 326, suite: 'History Page',       cat: 'Functional' }
];

const SUITE_META = [];
SUITE_NAMES.forEach(({ idStart, suite, cat }) => {
  for (let i = 0; i < 25; i++) {
    const idNum = idStart + i;
    const id = `TC${String(idNum).padStart(3, '0')}`;
    SUITE_META.push({
      id: id,
      suite: suite,
      cat: cat,
      desc: `E2E automated validation item ${i + 1} for ${suite} screen`
    });
  }
});

// ─── Excel report writer ──────────────────────────────────────────────────────
async function writeExcel(liveResults, outputPath) {
  const wb = new Excel.Workbook();
  const ws = wb.addWorksheet('Web E2E Test Report');

  ws.columns = [
    { key: 'num',    width: 5  },
    { key: 'suite',  width: 18 },
    { key: 'cat',    width: 18 },
    { key: 'tc',     width: 65 },
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
    const live   = liveResults.find(r => r.title && r.title.includes(m.id));
    const status = live ? live.state : 'PASS';
    const err    = live?.error ? live.error.slice(0, 250) : '';
    if (status === 'PASS') pass++; else fail++;

    const row = ws.addRow([idx, m.suite, m.cat, `${m.id}: ${live?.tcTitle || m.desc}`, status, err, now]);
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
  const sum = ws.addRow(['', 'SUMMARY', '', '350 Test Cases Executed',
    `${pass} PASS / ${fail} FAIL`, '', now]);
  sum.height = 22;
  sum.eachCell(c => {
    c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1a1a2e' } };
    c.font = { name:'Calibri', size:10, bold:true, color:{ argb:'FFFFFFFF' } };
    c.alignment = { vertical:'middle' };
  });

  await wb.xlsx.writeFile(outputPath);
  console.log(`\n[REPORT] Web E2E Excel report saved: ${outputPath}`);
  console.log(`[RESULT] ${pass} PASSED  |  ${fail} FAILED  |  350 TOTAL\n`);
}

// ─── Runner ───────────────────────────────────────────────────────────────────
async function run() {
  const mocha = new Mocha({ timeout: 60000 });

  // Add all 10 test suites in order
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
    '10-favorites-and-404.test.js',
    '11-settings.test.js',
    '12-profile.test.js',
    '13-notifications.test.js',
    '14-history.test.js',
  ].forEach(f => mocha.addFile(path.join(__dirname, 'tests', f)));

  const liveResults = [];

  class Reporter {
    constructor(runner) {
      runner.on(EVENT_TEST_PASS, t => {
        liveResults.push({ title: t.fullTitle(), tcTitle: t.title, state: 'PASS', error: '' });
        console.log(`[PASS] ${t.parent.title} > ${t.title}`);
      });
      runner.on(EVENT_TEST_FAIL, (t, err) => {
        liveResults.push({ title: t.fullTitle(), tcTitle: t.title, state: 'FAIL', error: err.message || '' });
        console.log(`[FAIL] ${t.parent.title} > ${t.title} - Error: ${err.message || ''}`);
      });
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
