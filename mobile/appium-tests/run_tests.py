import subprocess
import sys
import os
import xml.etree.ElementTree as ET
from openpyxl import Workbook

def main():
    # Run pytest on the tests directory with XML reporting
    results_xml = os.path.join(os.path.dirname(__file__), "results.xml")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", f"--junitxml={results_xml}", "tests"],
        capture_output=True,
        text=True
    )
    
    # Prepare Excel report
    wb = Workbook()
    ws = wb.active
    ws.title = "Test Report"
    ws.append(["Test Case", "Status", "Duration (s)", "Error Message"]) 
    
    if os.path.exists(results_xml):
        try:
            tree = ET.parse(results_xml)
            root = tree.getroot()
            for testcase in root.iter('testcase'):
                # Format name nicely
                name = testcase.get('name')
                # extract params if parametrized
                param = testcase.get('name')
                duration = testcase.get('time')
                
                status = "PASS"
                error_msg = ""
                
                failure = testcase.find('failure')
                error = testcase.find('error')
                if failure is not None:
                    status = "FAIL"
                    error_msg = failure.text
                elif error is not None:
                    status = "FAIL"
                    error_msg = error.text
                
                ws.append([name, status, duration, error_msg])
        except Exception as e:
            ws.append(["XML Parsing Error", "FAIL", "0", str(e)])
    else:
        status = "PASS" if result.returncode == 0 else "FAIL"
        ws.append(["All Tests", status, "0", "" if status == "PASS" else result.stdout])

    report_path = os.path.join(os.path.dirname(__file__), "report.xlsx")
    wb.save(report_path)
    print(f"Excel report generated at {report_path}")

if __name__ == "__main__":
    main()
