import subprocess
import sys
import os
from openpyxl import Workbook

def main():
    # Run pytest on the tests directory
    result = subprocess.run([sys.executable, "-m", "pytest", "tests"], capture_output=True, text=True)
    # Prepare Excel report
    wb = Workbook()
    ws = wb.active
    ws.title = "Test Report"
    ws.append(["Test Case", "Status", "Duration (s)", "Error Message"]) 
    status = "PASS" if result.returncode == 0 else "FAIL"
    # Simple placeholder: we don't have per‑test timing, so leave blank
    error_msg = "" if status == "PASS" else result.stdout
    ws.append(["All Tests", status, "", error_msg])
    report_path = os.path.join(os.path.dirname(__file__), "report.xlsx")
    wb.save(report_path)
    print(f"Excel report generated at {report_path}")

if __name__ == "__main__":
    main()
