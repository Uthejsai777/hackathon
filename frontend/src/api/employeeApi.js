import { httpJson } from './http.js'

export function apiGetEmployees({ token }) {
    return httpJson('/api/employees', {
        method: 'GET',
        token,
    })
}

export function apiAddEmployee({ token, employee }) {
    return httpJson('/api/employees/add', {
        method: 'POST',
        token,
        body: employee,
    })
}

export function apiGetCompliance({ token }) {
    return httpJson('/api/compliance', {
        method: 'GET',
        token,
    })
}

export function apiGetOnboarding({ token }) {
    return httpJson('/api/onboarding', {
        method: 'GET',
        token,
    })
}

export function apiGetJobHistory({ token }) {
    return httpJson('/api/job-history', {
        method: 'GET',
        token,
    })
}

export function apiGetExitWorkflow({ token }) {
    return httpJson('/api/exit-workflow', {
        method: 'GET',
        token,
    })
}

export function apiGetReports({ token }) {
    return httpJson('/api/reports', {
        method: 'GET',
        token,
    })
}

export function apiInitiateExit({ token, emp_id, end_date }) {
    return httpJson('/api/initiate-exit', {
        method: 'POST',
        token,
        body: { emp_id, end_date },
    })
}
