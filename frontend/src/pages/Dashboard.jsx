import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Dashboard.css';
import { useAuth } from '../auth/AuthContext';
import { Outlet, NavLink } from 'react-router-dom';

const IDLE_TIMEOUT_MS = 600000;  // 10 minutes of inactivity
const FADE_DURATION_MS = 1500;   // 1.5-second fade-out

function Dashboard() {
    const { user, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFading, setIsFading] = useState(false);

    const idleTimer = useRef(null);
    const fadeTimer = useRef(null);

    // ── Idle timeout logic ──────────────────────────────────
    // Resets the idle timer whenever the user interacts with the page.
    // After IDLE_TIMEOUT_MS of no interaction, starts a fade-out.
    // After the fade completes, calls signOut() to log the user out.
    const resetIdleTimer = useCallback(() => {
        // Cancel any pending timers
        if (idleTimer.current) clearTimeout(idleTimer.current);
        if (fadeTimer.current) clearTimeout(fadeTimer.current);

        // If we were fading, cancel it
        setIsFading(false);

        // Start a new idle countdown
        idleTimer.current = setTimeout(() => {
            // No interaction for 10 seconds → begin fade-out
            setIsFading(true);

            // After fade animation completes → log out
            fadeTimer.current = setTimeout(() => {
                signOut();
            }, FADE_DURATION_MS);
        }, IDLE_TIMEOUT_MS);
    }, [signOut]);

    useEffect(() => {
        // Events that count as "user activity"
        const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => resetIdleTimer();

        // Attach listeners
        activityEvents.forEach(evt => window.addEventListener(evt, handleActivity));

        // Start initial timer
        resetIdleTimer();

        return () => {
            // Cleanup on unmount
            activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (fadeTimer.current) clearTimeout(fadeTimer.current);
        };
    }, [resetIdleTimer]);
    // ────────────────────────────────────────────────────────

    return (
        <div
            className="dashboard-body"
            onClick={() => setIsDropdownOpen(false)}
            style={{
                opacity: isFading ? 0 : 1,
                transition: isFading ? `opacity ${FADE_DURATION_MS}ms ease` : 'opacity 0.15s ease',
            }}
        >
            {/* Idle warning overlay */}
            {isFading && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 22, fontWeight: 600,
                    pointerEvents: 'all',
                }}>
                    Session expiring due to inactivity...
                </div>
            )}

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
