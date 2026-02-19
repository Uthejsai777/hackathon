import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetReports } from '../api/employeeApi';

function Reports() {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await apiGetReports({ token });
                setData(res);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (token) fetchReports();
    }, [token]);

    const handleDownload = (slug) => {
        // Direct browser download — CSV endpoint doesn't need JSON parsing
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        window.open(`${backendUrl}/api/reports/download/${slug}`, '_blank');
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Reports &amp; Analytics</h1></div>
                <p>Loading reports from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Reports &amp; Analytics</h1></div>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Reports &amp; Analytics</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <h3>Total Headcount</h3>
                    <p>{data.total_headcount}</p>
                </div>
                <div className="card">
                    <h3>Active Employees</h3>
                    <p>{data.active_employees}</p>
                </div>
                <div className="card">
                    <h3>Attrition Rate</h3>
                    <p>{data.attrition_rate}%</p>
                </div>
            </div>

            <div className="table-container">
                <h3>Available Reports</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Report Name</th>
                            <th>Description</th>
                            <th>Last Generated</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.reports.map(report => (
                            <tr key={report.slug}>
                                <td>{report.name}</td>
                                <td>{report.description}</td>
                                <td>{report.last_generated}</td>
                                <td>
                                    <button className="btn" onClick={() => handleDownload(report.slug)}>
                                        Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Reports;
