import React from 'react';

function ExitWorkflow() {
    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Exit Workflow</h1>
                <button className="btn">Initiate Exit</button>
            </div>

            <div className="table-container">
                <h3>Exit Requests</h3>
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
                        <tr>
                            <td>Vikram Singh</td>
                            <td>Product Manager</td>
                            <td>2026-01-20</td>
                            <td>2026-03-20</td>
                            <td><span className="status orange">Notice Period</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="table-container">
                <h3>Completed Exits</h3>
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
                        <tr>
                            <td>John Doe</td>
                            <td>DevOps Engineer</td>
                            <td>2026-01-31</td>
                            <td><span className="status green">Cleared</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ExitWorkflow;
