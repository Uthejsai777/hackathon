import requests
import os
import sys
import django
from datetime import datetime

# Setup Django to generate a token
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from hackathon.auth import create_signed_session

def verify_add_employee():
    # 1. Generate a valid token
    print("Generating admin session token...")
    payload = {'email': 'admin@example.com', 'display_name': 'Admin User'}
    token, _ = create_signed_session(payload=payload)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    # 2. Define new employee data
    new_employee = {
        "first_name": "Test",
        "last_name": "User",
        "start_date": datetime.now().strftime("%Y-%m-%d"),
        "middle_name": "API"
    }

    print(f"Attempting to add employee: {new_employee}")

    # 3. Send POST request
    # Assuming server is running on localhost:8000
    url = 'http://localhost:8000/api/employees/add'
    
    try:
        response = requests.post(url, json=new_employee, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")

        if response.status_code == 200:
            print("SUCCESS: Employee added.")
        else:
            print("FAILED: Could not add employee.")

    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to localhost:8000. Is the server running?")

if __name__ == "__main__":
    verify_add_employee()
