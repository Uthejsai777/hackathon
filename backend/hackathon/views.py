import json
import re

from django.http import HttpRequest, JsonResponse
from django.views import View
from django.utils.dateparse import parse_date
from .models import EmpMaster, EmpComplianceTracker, EmpCtcInfo

from .auth import (
    ExternalAuthError,
    create_signed_otp_challenge,
    create_signed_session,
    is_success_response,
    load_signed_otp_challenge,
    load_signed_session,
    post_form_json,
    require_env,
)

SYSTEM_NAME = 'isl'
REGISTER_ROLE = 'isl_user'


def _normalize_phone(raw: str) -> str:
    return re.sub(r'\D+', '', (raw or '').strip())


def _get_bearer_token(request: HttpRequest) -> str | None:
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    prefix = 'Bearer '
    if not auth_header.startswith(prefix):
        return None

    token = auth_header[len(prefix) :].strip()
    return token or None


def _get_session_payload(request: HttpRequest) -> dict | None:
    token = _get_bearer_token(request)
    if not token:
        return None
    try:
        return load_signed_session(token)
    except ExternalAuthError:
        return None


def _json_body(request: HttpRequest) -> dict:
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}


def _external_error_message(result: dict, default: str) -> str:
    return result.get('error') or result.get('message') or default


def _external_success_message(result: dict) -> str | None:
    message = (result.get('message') or result.get('status') or '').strip()
    return message or None


def _post_external_or_error(
    *,
    url_env: str,
    payload: dict[str, str],
    failure_status: int,
    failure_default_message: str,
) -> tuple[dict | None, JsonResponse | None]:
    try:
        url = require_env(url_env)
    except ExternalAuthError as exc:
        return None, JsonResponse({'error': str(exc)}, status=500)

    try:
        result = post_form_json(url=url, payload=payload)
    except ExternalAuthError as exc:
        return None, JsonResponse({'error': str(exc)}, status=502)

    if not is_success_response(result):
        message = _external_error_message(result, failure_default_message)
        return None, JsonResponse({'error': message}, status=failure_status)

    return result, None


class HealthView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        return JsonResponse({'status': 'ok'})


class ApiLoginView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        username_raw = (payload.get('username') or '').strip()
        password = (payload.get('password') or '').strip()

        if not username_raw or not password:
            return JsonResponse({'error': 'Please enter username and password.'}, status=400)

        result, error = _post_external_or_error(
            url_env='LOGIN_THROUGH_PASSWORD_URL',
            payload={
                'email': username_raw,
                'password': password,
                'system_name': SYSTEM_NAME,
            },
            failure_status=401,
            failure_default_message='Invalid username or password.',
        )
        if error:
            return error

        session_payload = {'email': username_raw}
        session_payload.update(result or {})
        raw_token, expires_at = create_signed_session(payload=session_payload)

        return JsonResponse(
            {
                'token': raw_token,
                'expires_at': expires_at.isoformat(),
                'user': {
                    'id': None,
                    'username': username_raw,
                },
            }
        )


class ApiForgotPasswordView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        email = (payload.get('email') or '').strip()
        password = (payload.get('password') or '').strip()

        if not email or not password:
            return JsonResponse({'error': 'Please enter email and password.'}, status=400)

        result, error = _post_external_or_error(
            url_env='FORGET_PASSWORD_URL',
            payload={
                'email': email,
                'password': password,
                'system_name': SYSTEM_NAME,
            },
            failure_status=400,
            failure_default_message='Unable to reset password.',
        )
        if error:
            return error

        return JsonResponse({'ok': True, 'message': _external_success_message(result or {})})


class ApiRegisterView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        display_name = (payload.get('display_name') or '').strip()
        email = (payload.get('email') or '').strip()
        phone_number = _normalize_phone(payload.get('phone_number') or '')
        password = (payload.get('password') or '').strip()

        if not display_name or not email or not phone_number or not password:
            return JsonResponse({'error': 'Please fill all required fields.'}, status=400)

        result, error = _post_external_or_error(
            url_env='REGISTER_URL',
            payload={
                'display_name': display_name,
                'email': email,
                'phone_number': phone_number,
                'password': password,
                'system_name': SYSTEM_NAME,
                'role': REGISTER_ROLE,
            },
            failure_status=400,
            failure_default_message='Unable to create account.',
        )
        if error:
            return error

        return JsonResponse({'ok': True, 'message': _external_success_message(result or {})})


class ApiMeView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        session_payload = _get_session_payload(request)
        if session_payload is None:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        email = (session_payload.get('email') or '').strip() or None

        return JsonResponse(
            {
                'user': {
                    'id': None,
                    'username': email,
                },
                'member': {
                    'id': None,
                    'name': session_payload.get('display_name'),
                    'email': email,
                    'phone': session_payload.get('phone_number'),
                },
            }
        )


class ApiLogoutView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        return JsonResponse({'ok': True})


class ApiOtpRequestView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        channel = (payload.get('channel') or '').strip().lower()
        phone = _normalize_phone(payload.get('phone') or payload.get('username') or '')
        email = (payload.get('email') or payload.get('username') or '').strip()

        if channel not in {'whatsapp', 'email'}:
            return JsonResponse({'error': 'Invalid OTP channel.'}, status=400)

        if channel == 'whatsapp' and not phone:
            return JsonResponse({'error': 'Please enter mobile number.'}, status=400)
        if channel == 'email' and not email:
            return JsonResponse({'error': 'Please enter email id.'}, status=400)

        identifier = email if channel == 'email' else phone
        result, error = _post_external_or_error(
            url_env='SEND_OTP_URL',
            payload={
                'email': identifier,
                'type': channel,
                'system_name': SYSTEM_NAME,
            },
            failure_status=400,
            failure_default_message='Unable to request key',
        )
        if error:
            return error

        challenge_id, expires_at = create_signed_otp_challenge(email=identifier, channel=channel)
        return JsonResponse({'challenge_id': challenge_id, 'expires_at': expires_at.isoformat()})


class ApiOtpVerifyView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        challenge_id = payload.get('challenge_id')
        otp = (payload.get('otp') or '').strip()

        if not challenge_id or not otp:
            return JsonResponse({'error': 'Please enter OTP.'}, status=400)

        try:
            otp_payload = load_signed_otp_challenge(str(challenge_id))
        except ExternalAuthError as exc:
            return JsonResponse({'error': str(exc)}, status=401)

        email = (otp_payload.get('email') or '').strip()
        result, error = _post_external_or_error(
            url_env='VERIFY_OTP_URL',
            payload={
                'email': email,
                'otp': otp,
                'system_name': SYSTEM_NAME,
            },
            failure_status=401,
            failure_default_message='Invalid or expired OTP.',
        )
        if error:
            return error

        session_payload = {'email': email}
        session_payload.update(result or {})
        raw_token, expires_at = create_signed_session(payload=session_payload)

        return JsonResponse(
            {
                'token': raw_token,
                'expires_at': expires_at.isoformat(),
                'user': {'id': None, 'username': email},
            }
        )


class EmployeeListView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        # Example: Fetch all employees
        employees = EmpMaster.objects.all().values(
            'emp_id', 'first_name', 'last_name', 'start_date'
        )
        return JsonResponse({'employees': list(employees)})


class ComplianceListView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        # Example: Fetch compliance records with related employee info
        records = EmpComplianceTracker.objects.select_related('emp').all()
        data = []
        for record in records:
            data.append({
                'id': record.emp_compliance_tracker_id,
                'employee': f"{record.emp.first_name} {record.emp.last_name}",
                'type': record.comp_type,
                'status': record.status,
            })
        return JsonResponse({'compliance_records': data})


class ApiAddEmployeeView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        first_name = (payload.get('first_name') or '').strip()
        last_name = (payload.get('last_name') or '').strip()
        # Default to today if not provided, or ensure required
        start_date_str = payload.get('start_date')
        
        if not first_name or not last_name or not start_date_str:
             return JsonResponse({'error': 'First Name, Last Name, and Start Date are required.'}, status=400)

        start_date = parse_date(start_date_str)
        if not start_date:
            return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        # Handle ID generation if DB isn't Auto-Increment
        # For now, we try to let DB handle it. If it fails, we might need to fetch max ID.
        # However, typically 'primary_key=True' implies we might want to let DB handle it.
        # If DB is not auto-increment, we need to manually set it.
        # Let's try to find the max ID and increment + 1 just in case, or try insert.
        # To be safe given 'managed=False' and typical legacy DBs:
        last_emp = EmpMaster.objects.order_by('-emp_id').first()
        new_id = (last_emp.emp_id + 1) if last_emp else 1

        try:
            emp = EmpMaster.objects.create(
                emp_id=new_id, 
                first_name=first_name,
                last_name=last_name,
                start_date=start_date,
                middle_name=payload.get('middle_name'),
                end_date=parse_date(payload.get('end_date')) if payload.get('end_date') else None
            )
        except Exception as e:
             return JsonResponse({'error': str(e)}, status=500)

        return JsonResponse({'ok': True, 'message': 'Employee added successfully', 'emp_id': emp.emp_id})


class OnboardingListView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        employees = list(EmpMaster.objects.all())
        # Bulk-fetch all CTC and compliance records (2 queries instead of 2*N)
        all_ctc = list(EmpCtcInfo.objects.all().order_by('-start_of_ctc'))
        all_compliance = list(EmpComplianceTracker.objects.all())

        # Build lookup dicts
        ctc_by_emp = {}
        for c in all_ctc:
            ctc_by_emp.setdefault(c.emp_id, []).append(c)
        comp_by_emp = {}
        for c in all_compliance:
            comp_by_emp.setdefault(c.emp_id, []).append(c)

        data = []
        for emp in employees:
            ctc_list = ctc_by_emp.get(emp.emp_id, [])
            # Pick active (no end_of_ctc) or latest
            ctc = next((c for c in ctc_list if c.end_of_ctc is None), ctc_list[0] if ctc_list else None)
            role = ctc.ext_title if ctc else 'N/A'

            records = comp_by_emp.get(emp.emp_id, [])
            total = len(records)
            verified = sum(1 for r in records if r.status in ('Verified', 'Completed'))

            if total == 0:
                status, docs_done, docs_total = 'Not Started', 0, 0
            elif verified == total:
                status, docs_done, docs_total = 'Completed', verified, total
            else:
                status, docs_done, docs_total = 'In Progress', verified, total

            data.append({
                'emp_id': emp.emp_id,
                'employee': f"{emp.first_name} {emp.last_name}",
                'role': role,
                'date_of_joining': str(emp.start_date),
                'status': status,
                'docs_uploaded': f"{docs_done} / {docs_total}",
            })

        return JsonResponse({'onboarding': data})


class JobHistoryListView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        employees = {e.emp_id: e for e in EmpMaster.objects.all()}
        # Single query for all CTC records
        all_ctc = list(EmpCtcInfo.objects.all().order_by('emp_id', 'start_of_ctc'))

        ctc_by_emp = {}
        for c in all_ctc:
            ctc_by_emp.setdefault(c.emp_id, []).append(c)

        data = []
        for emp_id, ctc_list in ctc_by_emp.items():
            emp = employees.get(emp_id)
            if not emp:
                continue
            name = f"{emp.first_name} {emp.last_name}"
            prev_title = None
            for ctc in ctc_list:
                change_type = 'Initial' if prev_title is None else 'Promotion'
                data.append({
                    'emp_id': emp_id,
                    'employee': name,
                    'previous_role': prev_title or '—',
                    'new_role': ctc.ext_title,
                    'level': f"L{ctc.main_level}{ctc.sub_level}",
                    'effective_date': str(ctc.start_of_ctc),
                    'end_date': str(ctc.end_of_ctc) if ctc.end_of_ctc else 'Current',
                    'ctc': ctc.ctc_amt,
                    'type': change_type,
                })
                prev_title = ctc.ext_title

        data.sort(key=lambda x: x['effective_date'], reverse=True)
        return JsonResponse({'job_history': data})


class ExitWorkflowListView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        from datetime import date
        today = date.today()

        exiting = list(EmpMaster.objects.exclude(end_date__isnull=True))
        if not exiting:
            return JsonResponse({'exit_requests': [], 'completed_exits': []})

        emp_ids = [e.emp_id for e in exiting]
        # Bulk-fetch CTC and compliance for exiting employees only
        all_ctc = list(EmpCtcInfo.objects.filter(emp_id__in=emp_ids).order_by('-start_of_ctc'))
        all_comp = list(EmpComplianceTracker.objects.filter(emp_id__in=emp_ids))

        ctc_by_emp = {}
        for c in all_ctc:
            ctc_by_emp.setdefault(c.emp_id, []).append(c)
        comp_by_emp = {}
        for c in all_comp:
            comp_by_emp.setdefault(c.emp_id, []).append(c)

        exit_requests = []
        completed_exits = []

        for emp in exiting:
            ctc_list = ctc_by_emp.get(emp.emp_id, [])
            ctc = next((c for c in ctc_list if c.end_of_ctc is None), ctc_list[0] if ctc_list else None)
            role = ctc.ext_title if ctc else 'N/A'

            records = comp_by_emp.get(emp.emp_id, [])
            total = len(records)
            verified = sum(1 for r in records if r.status in ('Verified', 'Completed'))

            if emp.end_date >= today:
                exit_requests.append({
                    'emp_id': emp.emp_id,
                    'employee': f"{emp.first_name} {emp.last_name}",
                    'role': role,
                    'resignation_date': str(emp.start_date),
                    'last_working_day': str(emp.end_date),
                    'status': 'Notice Period',
                })
            else:
                clearance = 'Cleared' if (total > 0 and verified == total) else 'Pending'
                completed_exits.append({
                    'emp_id': emp.emp_id,
                    'employee': f"{emp.first_name} {emp.last_name}",
                    'role': role,
                    'last_working_day': str(emp.end_date),
                    'clearance_status': clearance,
                })

        return JsonResponse({
            'exit_requests': exit_requests,
            'completed_exits': completed_exits,
        })


class ReportsView(View):
    """Live stats for the Reports & Analytics page."""
    def get(self, request: HttpRequest) -> JsonResponse:
        from datetime import date
        total = EmpMaster.objects.count()
        exited = EmpMaster.objects.exclude(end_date__isnull=True).count()
        attrition = round((exited / total * 100), 1) if total > 0 else 0
        active = total - exited
        today = date.today().isoformat()
        return JsonResponse({
            'total_headcount': total,
            'active_employees': active,
            'exited_employees': exited,
            'attrition_rate': attrition,
            'reports': [
                {'name': 'Headcount Report', 'description': 'Breakdown by Level & Role', 'slug': 'headcount', 'last_generated': today},
                {'name': 'Joiners & Leavers', 'description': 'Monthly movement tracking', 'slug': 'joiners-leavers', 'last_generated': today},
                {'name': 'CTC Distribution', 'description': 'Salary band analysis', 'slug': 'ctc', 'last_generated': today},
                {'name': 'Compliance Status', 'description': 'Audit ready compliance report', 'slug': 'compliance', 'last_generated': today},
            ],
        })


class ReportDownloadView(View):
    """Generate CSV reports from live database data."""
    def get(self, request: HttpRequest, slug: str) -> JsonResponse:
        import csv
        from django.http import HttpResponse as DjangoHttpResponse

        if slug == 'headcount':
            response = DjangoHttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="headcount_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Emp ID', 'First Name', 'Last Name', 'Role', 'Level', 'Start Date', 'End Date', 'Status'])
            employees = list(EmpMaster.objects.all())
            all_ctc = list(EmpCtcInfo.objects.all().order_by('-start_of_ctc'))
            ctc_by_emp = {}
            for c in all_ctc:
                ctc_by_emp.setdefault(c.emp_id, []).append(c)
            for emp in employees:
                ctc_list = ctc_by_emp.get(emp.emp_id, [])
                ctc = next((c for c in ctc_list if c.end_of_ctc is None), ctc_list[0] if ctc_list else None)
                role = ctc.ext_title if ctc else 'N/A'
                level = f"L{ctc.main_level}{ctc.sub_level}" if ctc else 'N/A'
                status = 'Active' if emp.end_date is None else 'Exited'
                writer.writerow([emp.emp_id, emp.first_name, emp.last_name, role, level, emp.start_date, emp.end_date or '', status])
            return response

        elif slug == 'joiners-leavers':
            response = DjangoHttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="joiners_leavers_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Emp ID', 'Name', 'Type', 'Date'])
            for emp in EmpMaster.objects.all().order_by('-start_date'):
                writer.writerow([emp.emp_id, f"{emp.first_name} {emp.last_name}", 'Joiner', emp.start_date])
            for emp in EmpMaster.objects.exclude(end_date__isnull=True).order_by('-end_date'):
                writer.writerow([emp.emp_id, f"{emp.first_name} {emp.last_name}", 'Leaver', emp.end_date])
            return response

        elif slug == 'ctc':
            response = DjangoHttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="ctc_distribution_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Emp ID', 'Name', 'Role', 'Level', 'CTC Amount', 'Start Date', 'End Date'])
            for ctc in EmpCtcInfo.objects.select_related('emp').all().order_by('-ctc_amt'):
                writer.writerow([ctc.emp_id, f"{ctc.emp.first_name} {ctc.emp.last_name}", ctc.ext_title,
                                 f"L{ctc.main_level}{ctc.sub_level}", ctc.ctc_amt, ctc.start_of_ctc, ctc.end_of_ctc or 'Current'])
            return response

        elif slug == 'compliance':
            response = DjangoHttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="compliance_status_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Emp ID', 'Name', 'Compliance Type', 'Status', 'Document URL'])
            for c in EmpComplianceTracker.objects.select_related('emp').all():
                writer.writerow([c.emp_id, f"{c.emp.first_name} {c.emp.last_name}", c.comp_type, c.status, c.doc_url or ''])
            return response

        else:
            return JsonResponse({'error': f'Unknown report: {slug}'}, status=404)


class InitiateExitView(View):
    """Set end_date on an employee to initiate exit."""
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        emp_id = payload.get('emp_id')
        end_date_str = payload.get('end_date')

        if not emp_id or not end_date_str:
            return JsonResponse({'error': 'emp_id and end_date are required.'}, status=400)

        end_date = parse_date(end_date_str)
        if not end_date:
            return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        try:
            emp = EmpMaster.objects.get(emp_id=emp_id)
        except EmpMaster.DoesNotExist:
            return JsonResponse({'error': f'Employee {emp_id} not found.'}, status=404)

        emp.end_date = end_date
        emp.save()
        return JsonResponse({'ok': True, 'message': f'Exit initiated for {emp.first_name} {emp.last_name}. Last working day: {end_date}'})
