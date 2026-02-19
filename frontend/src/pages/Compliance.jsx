import React from 'react';

function Compliance() {
    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Compliance Dashboard</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <h3>Missing Documents</h3>
                    <p className="text-red">5 Employees</p>
                </div>
                <div className="card">
                    <h3>Expiring (30 Days)</h3>
                    <p className="text-orange">3 Documents</p>
                </div>
                <div className="card">
                    <h3>Expiring (60 Days)</h3>
                    <p>8 Documents</p>
                </div>
            </div>

            <div className="table-container">
                <h3>Document Status</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Document</th>
                            <th>Status</th>
                            <th>Expiry Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Vikram Singh</td>
                            <td>Work Permit</td>
                            <td><span className="status red">Expiring Soon</span></td>
                            <td>2026-03-15</td>
                            <td><button className="btn">Notify</button></td>
                        </tr>
                        <tr>
                            <td>Anjali Rao</td>
                            <td>Passport</td>
                            <td><span className="status orange">Pending Review</span></td>
                            <td>2028-06-12</td>
                            <td><button className="btn">Verify</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Compliance;
