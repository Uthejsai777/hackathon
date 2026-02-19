import os

content = """from django.db import models


class EmpBankInfo(models.Model):
    emp_bank_id = models.PositiveIntegerField(primary_key=True)
    emp = models.ForeignKey('EmpMaster', models.DO_NOTHING)
    bank_acct_no = models.CharField(unique=True, max_length=20)
    ifsc_code = models.CharField(max_length=11)
    branch_name = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'emp_bank_info'


class EmpComplianceTracker(models.Model):
    emp_compliance_tracker_id = models.PositiveIntegerField(primary_key=True)
    emp = models.ForeignKey('EmpMaster', models.DO_NOTHING)
    comp_type = models.CharField(max_length=60)
    status = models.CharField(max_length=20)
    doc_url = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'emp_compliance_tracker'


class EmpCtcInfo(models.Model):
    emp_ctc_id = models.PositiveIntegerField(primary_key=True)
    emp = models.ForeignKey('EmpMaster', models.DO_NOTHING)
    int_title = models.CharField(max_length=30)
    ext_title = models.CharField(max_length=60)
    main_level = models.PositiveIntegerField()
    sub_level = models.CharField(max_length=1)
    start_of_ctc = models.DateField()
    end_of_ctc = models.DateField(blank=True, null=True)
    ctc_amt = models.PositiveIntegerField()

    class Meta:
        managed = False
        db_table = 'emp_ctc_info'


class EmpMaster(models.Model):
    emp_id = models.PositiveIntegerField(primary_key=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'emp_master'


class EmpRegInfo(models.Model):
    emp_reg_info_id = models.PositiveIntegerField(primary_key=True)
    emp = models.OneToOneField(EmpMaster, models.DO_NOTHING)
    pan = models.CharField(unique=True, max_length=10)
    aadhaar = models.CharField(unique=True, max_length=12)
    uan_epf_acctno = models.CharField(unique=True, max_length=20)
    esi = models.CharField(unique=True, max_length=25)

    class Meta:
        managed = False
        db_table = 'emp_reg_info'
"""

file_path = os.path.join('hackathon', 'models.py')
if os.path.exists(file_path):
    os.remove(file_path)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully wrote {file_path} with UTF-8 encoding.")
