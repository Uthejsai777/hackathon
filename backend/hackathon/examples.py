import os
import django
import sys

# 1. Setup Django Environment (Required for standalone scripts)
# Only necessary if running this file directly from terminal. 
# In views.py, this is already handled.
sys.path.append('.') 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from hackathon.models import EmpMaster, EmpComplianceTracker, EmpBankInfo

def run_examples():
    print("--- Django ORM Usage Examples ---\n")

    # EXAMPLE 1: Fetching all records
    print("1. Fetching all employees:")
    employees = EmpMaster.objects.all()[:5] # Get first 5
    for emp in employees:
        print(f"   - {emp.first_name} {emp.last_name} (ID: {emp.emp_id})")

    # EXAMPLE 2: Filtering records
    print("\n2. Filtering employees (e.g., first_name starts with 'A'):")
    a_employees = EmpMaster.objects.filter(first_name__startswith='A')[:5]
    for emp in a_employees:
        print(f"   - {emp.first_name} {emp.last_name}")

    # EXAMPLE 3: Fetching a single record
    if employees.exists():
        emp_id = employees.first().emp_id
        print(f"\n3. Fetching single employee by ID ({emp_id}):")
        try:
            emp = EmpMaster.objects.get(emp_id=emp_id)
            print(f"   - Found: {emp.first_name} {emp.last_name}")
        except EmpMaster.DoesNotExist:
            print("   - Employee not found")

    # EXAMPLE 4: Working with related data (Foreign Keys)
    # EmpComplianceTracker has a foreign key 'emp' pointing to EmpMaster
    print("\n4. Fetching related compliance data:")
    compliance_records = EmpComplianceTracker.objects.select_related('emp').all()[:5]
    for record in compliance_records:
        print(f"   - Employee: {record.emp.first_name}, Type: {record.comp_type}, Status: {record.status}")

    # EXAMPLE 5: Simple Aggregation
    count = EmpMaster.objects.count()
    print(f"\n5. Total Employee Count: {count}")

if __name__ == "__main__":
    run_examples()
