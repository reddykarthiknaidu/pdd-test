// selenium-tests/run_tests.js
const Mocha = require('mocha');
const path = require('path');
const Excel = require('exceljs');

async function run() {
  const mocha = new Mocha({ timeout: 60000 });
  mocha.addFile(path.join(__dirname, 'tests', 'public-pages.test.js'));
  const failures = await new Promise(resolve => mocha.run(resolve));

  // Collect results via a simple reporter (Mocha's JSON reporter could be used)
  // For brevity, we will assume test files write their own JSON results to ./results.json
  const fs = require('fs');
  const resultsPath = path.join(__dirname, 'results.json');
  let results = [];
  if (fs.existsSync(resultsPath)) {
    results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  }

  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('Test Report');
  sheet.columns = [
    { header: 'Test Case', key: 'test', width: 30 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Duration (s)', key: 'duration', width: 15 },
    { header: 'Error Message', key: 'error', width: 40 },
  ];
  results.forEach(r => {
    sheet.addRow({ test: r.title, status: r.state, duration: (r.duration/1000).toFixed(2), error: r.err || '' });
  });
  await workbook.xlsx.writeFile(path.join(__dirname, 'report.xlsx'));
  console.log('Excel report generated at selenium-tests/report.xlsx');
  process.exit(failures);
}

run();
