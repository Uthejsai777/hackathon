import React from 'react';

function DashboardHome() {
    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>HR Dashboard</h1>
                <button className="btn">Add Employee</button>
            </div>

            {/* Top Cards */}
            <div className="card-container">
                <div className="card">
                    <h3>Total Headcount</h3>
                    <p>245 Employees</p>
                </div>

                <div className="card">
                    <h3>Pending Verifications</h3>
                    <p>12 Documents</p>
                </div>

                <div className="card">
                    <h3>Expiring in 30 Days</h3>
                    <p>7 Documents</p>
                </div>

                <div className="card">
                    <h3>This Month Joiners</h3>
                    <p>9 Employees</p>
                </div>
            </div>

            {/* Onboarding Table */}
            <div className="table-container">
                <h3>Onboarding Checklist</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Checklist Status</th>
                            <th>Docs Uploaded</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rahul Kumar</td>
                            <td>Software Engineer</td>
                            <td><span className="status orange">In Progress</span></td>
                            <td>4 / 6</td>
                        </tr>
                        <tr>
                            <td>Anita Sharma</td>
                            <td>HR Executive</td>
                            <td><span className="status green">Completed</span></td>
                            <td>6 / 6</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Compliance Dashboard */}
            <div className="table-container">
                <h3>Compliance & Document Status</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Document Type</th>
                            <th>Status</th>
                            <th>Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rahul Kumar</td>
                            <td>ID Proof</td>
                            <td><span className="status green">Verified</span></td>
                            <td>--</td>
                        </tr>
                        <tr>
                            <td>Vikram Singh</td>
                            <td>Work Permit</td>
                            <td><span class="status red">Expiring Soon</span></td>
                            <td>15 March 2026</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Reports Section */}
            <div className="table-container">
                <h3>Reports Overview</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Report Name</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Headcount Report</td>
                            <td>Department / Location / Employment Type</td>
                            <td><button className="btn">View</button></td>
                        </tr>
                        <tr>
                            <td>Joiners & Leavers</td>
                            <td>Monthly Tracking</td>
                            <td><button class="btn">View</button></td>
                        </tr>
                        <tr>
                            <td>CTC Distribution</td>
                            <td>Salary Level Analysis</td>
                            <td><button class="btn">View</button></td>
                        </tr>
                        <tr>
                            <td>Compliance Status</td>
                            <td>By Type / Status</td>
                            <td><button class="btn">View</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardHome;
