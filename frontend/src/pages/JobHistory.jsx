import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetJobHistory } from '../api/employeeApi';

function JobHistory() {
    const { token } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchJobHistory() {
            try {
                const res = await apiGetJobHistory({ token });
                setRecords(res.job_history || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (token) fetchJobHistory();
    }, [token]);

    const promotions = records.filter(r => r.type === 'Promotion').length;
    const currentRoles = records.filter(r => r.end_date === 'Current').length;

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Job History</h1></div>
                <p>Loading job history from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Job History</h1></div>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Job History</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <h3>Total Role Changes</h3>
                    <p>{records.length} Records</p>
                </div>
                <div className="card">
                    <h3>Promotions</h3>
                    <p>{promotions} Records</p>
                </div>
                <div className="card">
                    <h3>Current Active Roles</h3>
                    <p>{currentRoles} Employees</p>
                </div>
            </div>

            <div className="table-container">
                <h3>Employee Job Timeline</h3>
                {records.length === 0 ? (
                    <p>No job history records found in the database.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Previous Role</th>
                                <th>New Role</th>
                                <th>Level</th>
                                <th>Effective Date</th>
                                <th>End Date</th>
                                <th>CTC</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((rec, idx) => (
                                <tr key={`${rec.emp_id}-${idx}`}>
                                    <td>{rec.employee}</td>
                                    <td>{rec.previous_role}</td>
                                    <td>{rec.new_role}</td>
                                    <td>{rec.level}</td>
                                    <td>{rec.effective_date}</td>
                                    <td>{rec.end_date}</td>
                                    <td>₹{Number(rec.ctc).toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className={`status ${rec.type === 'Promotion' ? 'green' : 'orange'}`}>
                                            {rec.type}
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

export default JobHistory;
