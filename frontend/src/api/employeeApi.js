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
