import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetCompliance } from '../api/employeeApi';

function Compliance() {
    const { token } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCompliance() {
            try {
                const res = await apiGetCompliance({ token });
                setRecords(res.compliance_records || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (token) fetchCompliance();
    }, [token]);

    const pending = records.filter(r => r.status && r.status.toLowerCase() !== 'verified' && r.status.toLowerCase() !== 'completed').length;
    const verified = records.filter(r => r.status && (r.status.toLowerCase() === 'verified' || r.status.toLowerCase() === 'completed')).length;

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Compliance Dashboard</h1></div>
                <p>Loading compliance data from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Compliance Dashboard</h1></div>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Compliance Dashboard</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <h3>Total Records</h3>
                    <p>{records.length} Documents</p>
                </div>
                <div className="card">
                    <h3>Pending / In Progress</h3>
                    <p className="text-orange">{pending} Documents</p>
                </div>
                <div className="card">
                    <h3>Verified / Completed</h3>
                    <p className="text-green">{verified} Documents</p>
                </div>
            </div>

            <div className="table-container">
                <h3>Document Status</h3>
                {records.length === 0 ? (
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
                            {records.map(rec => (
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

export default Compliance;
