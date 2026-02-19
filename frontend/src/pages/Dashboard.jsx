import React, { useState } from 'react';
import './Dashboard.css';
import { useAuth } from '../auth/AuthContext';
import { Outlet, NavLink } from 'react-router-dom';

function Dashboard() {
    const { user, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="dashboard-body" onClick={() => setIsDropdownOpen(false)}> {/* Close on background click */}
            <div className="app-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="brand">HRMS Panel</div>
                </div>
                <div
                    className="user-profile"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent closing when clicking the profile itself
                        setIsDropdownOpen(!isDropdownOpen);
                    }}
                >
                    <span className="user-name">{user?.display_name || user?.username || 'User'}</span>
                    <div className="user-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                            stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>

                    {isDropdownOpen && (
                        <div className="user-dropdown">
                            <button className="dropdown-item">Profile</button>
                            <button className="dropdown-item">Settings</button>
                            <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }}></div>
                            <button className="dropdown-item text-red" onClick={signOut}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="layout-wrapper">
                {/* Overlay for mobile */}
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

                <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <ul>
                        <li><NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
                        <li><NavLink to="/dashboard/onboarding" className={({ isActive }) => isActive ? 'active' : ''}>Onboarding</NavLink></li>
                        <li><NavLink to="/dashboard/job-history" className={({ isActive }) => isActive ? 'active' : ''}>Job History</NavLink></li>
                        <li><NavLink to="/dashboard/exit-workflow" className={({ isActive }) => isActive ? 'active' : ''}>Exit Workflow</NavLink></li>
                        <li><NavLink to="/dashboard/compliance" className={({ isActive }) => isActive ? 'active' : ''}>Compliance</NavLink></li>
                        <li><NavLink to="/dashboard/reports" className={({ isActive }) => isActive ? 'active' : ''}>Reports</NavLink></li>
                        <li><NavLink to="/dashboard/add-employee" className={({ isActive }) => isActive ? 'active' : ''}>Add Employee</NavLink></li>
                    </ul>
                </div>

                <div className="main">
                    <Outlet />
                </div>

            </div>
        </div>
    );
}

export default Dashboard;
