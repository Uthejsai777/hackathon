import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetEmployees, apiGetCompliance } from '../api/employeeApi';

function DashboardHome() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [compliance, setCompliance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [empRes, compRes] = await Promise.all([
                    apiGetEmployees({ token }),
                    apiGetCompliance({ token })
                ]);
                setEmployees(empRes.employees || []);
                setCompliance(compRes.compliance_records || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (token) fetchData();
    }, [token]);

    const totalHeadcount = employees.length;
    const activeCount = employees.filter(e => !e.end_date || e.end_date === 'None').length;
    const exitedCount = totalHeadcount - activeCount;
    const attritionRate = totalHeadcount > 0 ? ((exitedCount / totalHeadcount) * 100).toFixed(1) : '0.0';
    const compliancePending = compliance.filter(c => c.status && c.status.toLowerCase() !== 'verified' && c.status.toLowerCase() !== 'completed').length;
    const complianceVerified = compliance.filter(c => c.status && (c.status.toLowerCase() === 'verified' || c.status.toLowerCase() === 'completed')).length;

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header">
                    <div>
                        <h1>Analytics Dashboard</h1>
                        <div className="header-subtitle">Loading workforce intelligence...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Analytics Dashboard</h1></div>
                <p style={{ color: 'var(--accent-red)' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            {/* ─── Page Header ─── */}
            <div className="header">
                <div>
                    <h1>Analytics Dashboard</h1>
                    <div className="header-subtitle">Workforce Intelligence for HR Leadership</div>
                </div>
                <button className="btn" onClick={() => navigate('/dashboard/add-employee')}>
                    + Add Employee
                </button>
            </div>

            {/* ─── KPI Cards ─── */}
            <div className="card-container">
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>👥</div>
                    <h3>Total Headcount</h3>
                    <div className="card-value">{totalHeadcount}</div>
                </div>

                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)' }}>✓</div>
                    <h3>Active Employees</h3>
                    <div className="card-value">{activeCount}</div>
                </div>

                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-orange)' }}>⚠</div>
                    <h3>Pending Compliance</h3>
                    <div className="card-value">{compliancePending}</div>
                </div>

                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>📊</div>
                    <h3>Attrition Rate</h3>
                    <div className="card-value">{attritionRate}%</div>
                </div>

                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(240,98,146,0.15)', color: 'var(--accent-coral)' }}>📋</div>
                    <h3>Compliance Verified</h3>
                    <div className="card-value">{complianceVerified}</div>
                </div>
            </div>

            {/* ─── Section: Employee Directory ─── */}
            <div className="section-label">Employee Directory</div>

            <div className="table-container">
                <h3>All Employees</h3>
                {employees.length === 0 ? (
                    <p>No employees found in the database.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Emp ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Start Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.emp_id}>
                                    <td>{emp.emp_id}</td>
                                    <td>{emp.first_name}</td>
                                    <td>{emp.last_name}</td>
                                    <td>{emp.start_date}</td>
                                    <td>
                                        <span className={`status ${(!emp.end_date || emp.end_date === 'None') ? 'green' : 'red'}`}>
                                            {(!emp.end_date || emp.end_date === 'None') ? 'Active' : 'Exited'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ─── Section: Compliance ─── */}
            <div className="section-label">Compliance & Document Status</div>

            <div className="table-container">
                <h3>Compliance Records</h3>
                {compliance.length === 0 ? (
                    <p>No compliance records found in the database.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Document Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compliance.map(rec => (
                                <tr key={rec.id}>
                                    <td>{rec.employee}</td>
                                    <td>{rec.type}</td>
                                    <td>
                                        <span className={`status ${rec.status?.toLowerCase() === 'verified' || rec.status?.toLowerCase() === 'completed' ? 'green' :
                                            rec.status?.toLowerCase() === 'pending' ? 'orange' : 'red'
                                            }`}>
                                            {rec.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DashboardHome;
