import React from 'react';

function Onboarding() {
    return (
        <div className="dashboard-content">
            <div className="header">
                <h1>Onboarding Checklist</h1>
                <button className="btn">Add New Joiner</button>
            </div>

            <div className="table-container">
                <h3>Pending Onboarding</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Date of Joining</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rahul Kumar</td>
                            <td>Software Engineer</td>
                            <td>2026-03-01</td>
                            <td><span className="status orange">In Progress</span></td>
                            <td><button className="btn">View Checklist</button></td>
                        </tr>
                        <tr>
                            <td>Sneha Patil</td>
                            <td>UI/UX Designer</td>
                            <td>2026-03-05</td>
                            <td><span className="status red">Not Started</span></td>
                            <td><button className="btn">Start Onboarding</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Onboarding;
