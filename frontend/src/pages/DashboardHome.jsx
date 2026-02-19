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
    const compliancePending = compliance.filter(c => c.status && c.status.toLowerCase() !== 'verified' && c.status.toLowerCase() !== 'completed').length;
    const complianceVerified = compliance.filter(c => c.status && (c.status.toLowerCase() === 'verified' || c.status.toLowerCase() === 'completed')).length;

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>HR Dashboard</h1></div>
                <p>Loading data from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>HR Dashboard</h1></div>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>HR Dashboard</h1>
                <button className="btn" onClick={() => navigate('/dashboard/add-employee')}>Add Employee</button>
            </div>

            {/* Top Cards — real counts from DB */}
            <div className="card-container">
                <div className="card">
                    <h3>Total Headcount</h3>
                    <p>{totalHeadcount} Employees</p>
                </div>

                <div className="card">
                    <h3>Pending Compliance</h3>
                    <p>{compliancePending} Records</p>
                </div>

                <div className="card">
                    <h3>Verified / Completed</h3>
                    <p>{complianceVerified} Records</p>
                </div>

                <div className="card">
                    <h3>Total Compliance</h3>
                    <p>{compliance.length} Records</p>
                </div>
            </div>

            {/* Employee Table — data from emp_master */}
            <div className="table-container">
                <h3>Employee Directory</h3>
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
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.emp_id}>
                                    <td>{emp.emp_id}</td>
                                    <td>{emp.first_name}</td>
                                    <td>{emp.last_name}</td>
                                    <td>{emp.start_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Compliance Table — data from emp_compliance_tracker */}
            <div className="table-container">
                <h3>Compliance &amp; Document Status</h3>
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
