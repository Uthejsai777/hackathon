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

    const resetIdleTimer = useCallback(() => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        if (fadeTimer.current) clearTimeout(fadeTimer.current);
        setIsFading(false);
        idleTimer.current = setTimeout(() => {
            setIsFading(true);
            fadeTimer.current = setTimeout(() => { signOut(); }, FADE_DURATION_MS);
        }, IDLE_TIMEOUT_MS);
    }, [signOut]);

    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        const handler = () => resetIdleTimer();
        events.forEach(e => window.addEventListener(e, handler));
        resetIdleTimer();
        return () => {
            events.forEach(e => window.removeEventListener(e, handler));
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (fadeTimer.current) clearTimeout(fadeTimer.current);
        };
    }, [resetIdleTimer]);

    return (
        <div
            className="dashboard-body"
            onClick={() => setIsDropdownOpen(false)}
            style={{
                opacity: isFading ? 0 : 1,
                transition: isFading ? `opacity ${FADE_DURATION_MS}ms ease` : 'opacity 0.15s ease',
            }}
        >
            {isFading && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 20, fontWeight: 600,
                }}>
                    Session expiring due to inactivity...
                </div>
            )}

            {/* ─── Header ─── */}
            <div className="app-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 22, height: 22 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="brand-logo">S</div>
                    <div className="brand">Station-S</div>
                </div>
                <div className="user-profile" onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}>
                    <span className="user-name">{user?.display_name || user?.username || 'User'}</span>
                    <div className="user-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18, height: 18 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    {isDropdownOpen && (
                        <div className="user-dropdown">
                            <button className="dropdown-item">Profile</button>
                            <button className="dropdown-item">Settings</button>
                            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>
                            <button className="dropdown-item text-red" onClick={signOut}>Logout</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Layout ─── */}
            <div className="layout-wrapper">
                {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

                <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <ul>
                        <li>
                            <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                                Dashboard
                            </NavLink>
                        </li>
                        {/* <li>
                            <NavLink to="/dashboard/employees" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                </svg>
                                Employees
                            </NavLink>
                        </li> */}
                    </ul>

                    <div className="sidebar-label">Lifecycle</div>
                    <ul>
                        <li>
                            <NavLink to="/dashboard/onboarding" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                </svg>
                                Onboarding
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/job-history" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                                </svg>
                                Job History
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/exit-workflow" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                Exit Workflow
                            </NavLink>
                        </li>
                    </ul>

                    <div className="sidebar-label">Compliance</div>
                    <ul>
                        <li>
                            <NavLink to="/dashboard/compliance" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                                Compliance
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                                Reports
                            </NavLink>
                        </li>
                    </ul>

                    <div className="sidebar-label">Actions</div>
                    <ul>
                        <li>
                            <NavLink to="/dashboard/add-employee" className={({ isActive }) => isActive ? 'active' : ''}>
                                <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Add Employee
                            </NavLink>
                        </li>
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
