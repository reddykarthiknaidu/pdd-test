// selenium-tests/run_tests.js
const Mocha = require('mocha');
const path = require('path');
const Excel = require('exceljs');

const {
  EVENT_RUN_END,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL
} = Mocha.Runner.constants;

// Custom reporter to collect results and write Excel file
class ExcelReporter {
  constructor(runner) {
    this.results = [];

    runner.on(EVENT_TEST_PASS, (test) => {
      this.results.push({
        title: test.fullTitle(),
        state: 'PASS',
        duration: (test.duration / 1000).toFixed(2),
        error: ''
      });
    });

    runner.on(EVENT_TEST_FAIL, (test, err) => {
      this.results.push({
        title: test.fullTitle(),
        state: 'FAIL',
        duration: test.duration ? (test.duration / 1000).toFixed(2) : '0.00',
        error: err.message || 'Unknown Error'
      });
    });

    runner.on(EVENT_RUN_END, async () => {
      try {
        const workbook = new Excel.Workbook();
        const sheet = workbook.addWorksheet('Test Report');
        sheet.columns = [
          { header: 'Test Case', key: 'test', width: 50 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Duration (s)', key: 'duration', width: 15 },
          { header: 'Error Message', key: 'error', width: 50 },
        ];

        this.results.forEach(r => {
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
      }
    });
  }
}

async function run() {
  const mocha = new Mocha({
    timeout: 60000,
    reporter: ExcelReporter
  });
  mocha.addFile(path.join(__dirname, 'tests', 'public-pages.test.js'));

  mocha.run((failures) => {
    process.exit(failures);
  });
}

run();
