import React from 'react';

function Reports() {
    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Reports & Analytics</h1>
            </div>

            <div className="card-container">
                <div className="card">
                    <h3>Total Headcount</h3>
                    <p>245</p>
                </div>
                <div className="card">
                    <h3>Attrition Rate</h3>
                    <p>4.2%</p>
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
                        <tr>
                            <td>Headcount Report</td>
                            <td>Breakdown by Department & Location</td>
                            <td>2026-02-15</td>
                            <td><button className="btn">Download</button></td>
                        </tr>
                        <tr>
                            <td>Joiners & Leavers</td>
                            <td>Monthly movement tracking</td>
                            <td>2026-02-01</td>
                            <td><button className="btn">Download</button></td>
                        </tr>
                        <tr>
                            <td>CTC Distribution</td>
                            <td>Salary band analysis</td>
                            <td>2026-01-01</td>
                            <td><button className="btn">Download</button></td>
                        </tr>
                        <tr>
                            <td>Compliance Status</td>
                            <td>Audit ready compliance report</td>
                            <td>2026-02-18</td>
                            <td><button className="btn">Download</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Reports;
