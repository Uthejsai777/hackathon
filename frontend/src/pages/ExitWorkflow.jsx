import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetExitWorkflow, apiGetEmployees, apiInitiateExit } from '../api/employeeApi';

function ExitWorkflow() {
    const { token } = useAuth();
    const [exitRequests, setExitRequests] = useState([]);
    const [completedExits, setCompletedExits] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initiate Exit form state
    const [showForm, setShowForm] = useState(false);
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitMsg, setSubmitMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function fetchData() {
        try {
            const [exitRes, empRes] = await Promise.all([
                apiGetExitWorkflow({ token }),
                apiGetEmployees({ token }),
            ]);
            setExitRequests(exitRes.exit_requests || []);
            setCompletedExits(exitRes.completed_exits || []);
            setEmployees(empRes.employees || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleInitiateExit = async (e) => {
        e.preventDefault();
        if (!selectedEmpId || !endDate) return;
        setSubmitting(true);
        setSubmitMsg('');
        try {
            const res = await apiInitiateExit({ token, emp_id: Number(selectedEmpId), end_date: endDate });
            setSubmitMsg(res.message);
            setShowForm(false);
            setSelectedEmpId('');
            setEndDate('');
            // Refresh the exit data
            setLoading(true);
            await fetchData();
        } catch (err) {
            setSubmitMsg('Error: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter active employees (no end_date) for the dropdown
    const activeEmployees = employees.filter(emp => !emp.end_date || emp.end_date === 'None');

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Exit Workflow</h1></div>
                <p>Loading exit workflow data from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Exit Workflow</h1></div>
                <p style={{ color: 'red' }}>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Exit Workflow</h1>
                <button className="btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Initiate Exit'}
                </button>
            </div>

            {submitMsg && (
                <p style={{ color: submitMsg.startsWith('Error') ? 'red' : '#27ae60', fontWeight: 600, marginBottom: 12 }}>
                    {submitMsg}
                </p>
            )}

            {showForm && (
                <div className="table-container" style={{ marginBottom: 16 }}>
                    <h3>Initiate Employee Exit</h3>
                    <form onSubmit={handleInitiateExit} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap', padding: '12px 0' }}>
                        <div className="form-group">
                            <label>Select Employee</label>
                            <select className="form-control" value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)} required>
                                <option value="">-- Select --</option>
                                {activeEmployees.map(emp => (
                                    <option key={emp.emp_id} value={emp.emp_id}>
                                        {emp.first_name} {emp.last_name} (ID: {emp.emp_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Last Working Day</label>
                            <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn" disabled={submitting} style={{ height: 40 }}>
                            {submitting ? 'Processing...' : 'Confirm Exit'}
                        </button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <h3>Exit Requests</h3>
                {exitRequests.length === 0 ? (
                    <p>No pending exit requests found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Resignation Date</th>
                                <th>Last Working Day</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exitRequests.map(rec => (
                                <tr key={rec.emp_id}>
                                    <td>{rec.employee}</td>
                                    <td>{rec.role}</td>
                                    <td>{rec.resignation_date}</td>
                                    <td>{rec.last_working_day}</td>
                                    <td><span className="status orange">{rec.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="table-container">
                <h3>Completed Exits</h3>
                {completedExits.length === 0 ? (
                    <p>No completed exits found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Last Working Day</th>
                                <th>Clearance Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {completedExits.map(rec => (
                                <tr key={rec.emp_id}>
                                    <td>{rec.employee}</td>
                                    <td>{rec.role}</td>
                                    <td>{rec.last_working_day}</td>
                                    <td>
                                        <span className={`status ${rec.clearance_status === 'Cleared' ? 'green' : 'red'}`}>
                                            {rec.clearance_status}
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

export default ExitWorkflow;
