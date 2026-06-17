// selenium-tests/run_tests.js
const Mocha = require('mocha');
const path = require('path');
const Excel = require('exceljs');

const {
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL
} = Mocha.Runner.constants;

// Custom reporter class to collect results in-memory
class ExcelReporter {
  constructor(runner, resultsArray) {
    runner.on(EVENT_TEST_PASS, (test) => {
      resultsArray.push({
        title: test.fullTitle(),
        state: 'PASS',
        duration: (test.duration / 1000).toFixed(2),
        error: ''
      });
    });

    runner.on(EVENT_TEST_FAIL, (test, err) => {
      resultsArray.push({
        title: test.fullTitle(),
        state: 'FAIL',
        duration: test.duration ? (test.duration / 1000).toFixed(2) : '0.00',
        error: err.message || 'Unknown Error'
      });
    });
  }
}

async function run() {
  const mocha = new Mocha({ timeout: 60000 });
  mocha.addFile(path.join(__dirname, 'tests', 'public-pages.test.js'));

  // Shared array to collect test results
  const results = [];

  // Register the custom reporter and pass the shared results array
  mocha.reporter(ExcelReporter, results);

  mocha.run(async (failures) => {
    try {
      const workbook = new Excel.Workbook();
      const sheet = workbook.addWorksheet('Test Report');
      sheet.columns = [
        { header: 'Test Case', key: 'test', width: 50 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Duration (s)', key: 'duration', width: 15 },
        { header: 'Error Message', key: 'error', width: 50 },
      ];

      results.forEach(r => {
        sheet.addRow({ 
          test: r.title, 
          status: r.state, 
          duration: r.duration, 
          error: r.error 
        });
      });

      await workbook.xlsx.writeFile(path.join(__dirname, 'report.xlsx'));
      console.log('Excel report generated at selenium-tests/report.xlsx');
    } catch (e) {
      console.error('Failed to write Excel report:', e);
    } finally {
      process.exit(failures);
    }
  });
}

run();
