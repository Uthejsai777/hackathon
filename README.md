**Kindly use the following credentials and update them in the backend .env file**

DB_NAME=team12
DB_USER=team12
DB_PASSWORD= 0e4523430c29
DB_HOST= internship-league.cvuouqwaej9d.ap-south-1.rds.amazonaws.com
DB_PORT= 3306

**Database Definition for an Employee Management System**\

**Tables and Fields:**

**• Emp_Bank_Info**

  - Emp Id
  - Bank Acct No
  - IFSC Code
  - Branch Name
  - Bank Name

**• EMP_Master**

  - Emp Id
  - Fname
  - Mname
  - Lname
  - Start Date
  - End Date

**• Emp_CTC_Info**

  - Emp Id
  - Int Title
  - Ext Title
  - Main Level
  - Sub Level
  - Start of CTC
  - End of CTC
  - CTC Amt

**• Emp_Reg_Info**

  - Emp Id
  - PAN
  - Aadhaar
  - UAN / EPF Acct No
  - ESI

**• Emp_Compliance_Track**

  - Emp Id
  - Comp Type
  - Status
  - Doc URL


**Use Cases to be implemented using the above tables and fields**

**Core employee management**

    •	Employee CRUD (create, update, exit/disable)
    •	Employee directory with search/filter (dept, location, manager, status)
    •	Employee profile view (master + IDs + bank + CTC timeline)

**HR lifecycle workflows**

    •	Onboarding checklist tracking + document collection
    •	Job/role changes with effective dates (job history)
    •	Exit workflow (last working day, clearances, final docs)

**Compliance & documents**

    •	Document upload + verification + expiry tracking
    •	Compliance dashboard (missing docs, expiring docs in next 30/60 days)
    •	Alerts/reminders for renewals and pending verifications

**Reporting & analytics**

    •	Headcount report (dept/location/employment type)
    •	Joiners/leavers report by month
    •	CTC/level distribution report (from Emp_CTC_Info)
    •	Compliance status report (by type/status)


