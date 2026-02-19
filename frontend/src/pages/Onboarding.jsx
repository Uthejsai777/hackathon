import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGetOnboarding } from '../api/employeeApi';

function Onboarding() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOnboarding() {
            try {
                const res = await apiGetOnboarding({ token });
                setRecords(res.onboarding || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (token) fetchOnboarding();
    }, [token]);

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Onboarding Checklist</h1></div>
                <p>Loading onboarding data from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Onboarding Checklist</h1></div>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Onboarding Checklist</h1>
                <button className="btn" onClick={() => navigate('/dashboard/add-employee')}>Add New Joiner</button>
            </div>

            <div className="table-container">
                <h3>Pending Onboarding</h3>
                {records.length === 0 ? (
                    <p>No onboarding records found in the database.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Date of Joining</th>
                                <th>Status</th>
                                <th>Docs Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(rec => (
                                <tr key={rec.emp_id}>
                                    <td>{rec.employee}</td>
                                    <td>{rec.role}</td>
                                    <td>{rec.date_of_joining}</td>
                                    <td>
                                        <span className={`status ${rec.status === 'Completed' ? 'green' :
                                                rec.status === 'In Progress' ? 'orange' : 'red'
                                            }`}>
                                            {rec.status}
                                        </span>
                                    </td>
                                    <td>{rec.docs_uploaded}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Onboarding;
