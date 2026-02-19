import os
import django
from pathlib import Path

# Setup Django environment manually
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import sys
sys.path.append('.') # Add current directory to path so backend module is found

django.setup()

from hackathon.models import EmpMaster, EmpComplianceTracker

def verify_data():
    print("--- Database Verification ---")
    
    try:
        # Check EmpMaster
        emp_count = EmpMaster.objects.count()
        print(f"EmpMaster Row Count: {emp_count}")
        
        if emp_count > 0:
            latest_emp = EmpMaster.objects.last()
            print(f"Latest Employee: {latest_emp.first_name} {latest_emp.last_name} (ID: {latest_emp.emp_id})")
        
        # Check EmpComplianceTracker
        comp_count = EmpComplianceTracker.objects.count()
        print(f"Compliance Records: {comp_count}")

    except Exception as e:
        print(f"Error querying database: {e}")

if __name__ == "__main__":
    verify_data()
