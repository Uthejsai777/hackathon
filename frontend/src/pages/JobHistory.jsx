import React from 'react';

function JobHistory() {
    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Job History</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <h3>Recent Promotions</h3>
                    <p>3 This Month</p>
                </div>
                <div className="card">
                    <h3>Role Changes</h3>
                    <p>5 pending approval</p>
                </div>
            </div>

            <div className="table-container">
                <h3>Employee Job Timeline</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Previous Role</th>
                            <th>New Role</th>
                            <th>Effective Date</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Amit Verma</td>
                            <td>Junior Developer</td>
                            <td>Senior Developer</td>
                            <td>2026-01-15</td>
                            <td><span className="status green">Promotion</span></td>
                        </tr>
                        <tr>
                            <td>Priya Singh</td>
                            <td>HR Intern</td>
                            <td>HR Executive</td>
                            <td>2026-02-01</td>
                            <td><span className="status green">Conversion</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default JobHistory;
