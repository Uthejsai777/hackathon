import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetReports, apiGetCompliance, apiGetEmployees } from '../api/employeeApi';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#f06292', '#2dd4bf', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

/* ═══ Pure-CSS Bar Chart ═══ */
function CSSBarChart({ data, maxVal }) {
    const max = maxVal || Math.max(...data.map(d => d.value), 1);
    const BAR_AREA_HEIGHT = 200;
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, paddingTop: 8 }}>
            {data.map((d, i) => {
                const barH = Math.max((d.value / max) * BAR_AREA_HEIGHT, 6);
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{d.value}</span>
                        <div style={{
                            width: '100%', maxWidth: 48, borderRadius: '6px 6px 0 0',
                            height: barH,
                            background: `linear-gradient(180deg, ${d.color || COLORS[i % COLORS.length]}, ${d.color || COLORS[i % COLORS.length]}88)`,
                            transition: 'height 0.8s cubic-bezier(.4,0,.2,1)',
                            cursor: 'pointer',
                            boxShadow: `0 0 12px ${d.color || COLORS[i % COLORS.length]}33`,
                        }}
                            title={`${d.label}: ${d.value}`}
                        />
                        <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.2, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ═══ Pure-CSS Donut Chart ═══ */
function CSSDonut({ segments, size = 200 }) {
    const total = segments.reduce((s, d) => s + d.value, 0) || 1;
    let cumulative = 0;
    const gradientParts = [];
    segments.forEach((seg, i) => {
        const start = (cumulative / total) * 360;
        cumulative += seg.value;
        const end = (cumulative / total) * 360;
        gradientParts.push(`${seg.color || COLORS[i % COLORS.length]} ${start}deg ${end}deg`);
    });
    const gradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' }}>
            <div style={{
                width: size, height: size, borderRadius: '50%', background: gradient,
                position: 'relative', flexShrink: 0,
                boxShadow: '0 0 24px rgba(0,0,0,0.3)',
            }}>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: size * 0.6, height: size * 0.6, borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{total}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Total</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: seg.color || COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ color: '#f1f5f9', fontWeight: 600, minWidth: 24 }}>{seg.value}</span>
                        <span>{seg.label}</span>
                        <span style={{ marginLeft: 'auto', color: '#64748b' }}>{((seg.value / total) * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═══ Horizontal Bar Chart ═══ */
function CSSHorizontalBar({ data }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 50, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                    <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                        <div style={{
                            height: '100%', borderRadius: 6,
                            width: `${(d.value / max) * 100}%`,
                            background: `linear-gradient(90deg, ${d.color || COLORS[i % COLORS.length]}, ${d.color || COLORS[i % COLORS.length]}88)`,
                            transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                            display: 'flex', alignItems: 'center', paddingLeft: 10,
                        }}>
                            {(d.value / max) > 0.15 && <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{d.value}</span>}
                        </div>
                        {(d.value / max) <= 0.15 && <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>{d.value}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

function Reports() {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [compliance, setCompliance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [rpt, comp, emp] = await Promise.all([
                    apiGetReports({ token }),
                    apiGetCompliance({ token }),
                    apiGetEmployees({ token }),
                ]);
                setData(rpt);
                setCompliance(comp.compliance_records || []);
                setEmployees(emp.employees || []);
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        }
        if (token) fetchAll();
    }, [token]);

    const handleDownload = (slug) => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        window.open(`${backendUrl}/api/reports/download/${slug}`, '_blank');
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><div><h1>Reports &amp; Analytics</h1><div className="header-subtitle">Fetching live data from database...</div></div></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Reports &amp; Analytics</h1></div>
                <p style={{ color: 'var(--accent-red)' }}>Error: {error}</p>
            </div>
        );
    }

    /* ── Build chart data from real MySQL results ── */

    // Compliance Status counts
    const statusCounts = {};
    compliance.forEach(c => { const s = c.status || 'Unknown'; statusCounts[s] = (statusCounts[s] || 0) + 1; });
    const compStatusData = Object.entries(statusCounts).map(([label, value], i) => ({ label, value, color: COLORS[i] }));

    // Compliance Type counts
    const typeCounts = {};
    compliance.forEach(c => { const t = c.type || 'Other'; typeCounts[t] = (typeCounts[t] || 0) + 1; });
    const compTypeData = Object.entries(typeCounts).map(([label, value], i) => ({ label, value, color: COLORS[i] }));

    // Joining trend by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const joinByMonth = new Array(12).fill(0);
    employees.forEach(e => { if (e.start_date) { const m = new Date(e.start_date).getMonth(); if (!isNaN(m)) joinByMonth[m]++; } });
    const joiningData = months.map((label, i) => ({ label, value: joinByMonth[i], color: '#2dd4bf' }));

    // Workforce split
    const workforceData = [
        { label: 'Active', value: data.active_employees, color: '#22c55e' },
        { label: 'Exited', value: data.exited_employees, color: '#f06292' },
    ];

    const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: 24 };
    const hdr = { color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 };
    const accent = { width: 3, height: 18, background: 'var(--accent-teal)', borderRadius: 2, display: 'inline-block' };
    const live = { fontSize: 9, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 10, letterSpacing: 1, marginLeft: 'auto', textTransform: 'uppercase' };

    return (
        <div className="dashboard-content">
            <div className="header">
                <div>
                    <h1>Reports &amp; Analytics</h1>
                    <div className="header-subtitle">Live data · {employees.length} employees · {compliance.length} compliance records</div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="card-container">
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>👥</div>
                    <h3>Total Headcount</h3>
                    <div className="card-value">{data.total_headcount}</div>
                </div>
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)' }}>✓</div>
                    <h3>Active Employees</h3>
                    <div className="card-value">{data.active_employees}</div>
                </div>
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(240,98,146,0.15)', color: 'var(--accent-coral)' }}>📉</div>
                    <h3>Attrition Rate</h3>
                    <div className="card-value">{data.attrition_rate}%</div>
                </div>
            </div>

            {/* Charts */}
            <div className="section-label">Visual Analytics · Live Data</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Vertical Bar: Compliance Status */}
                <div style={card}>
                    <div style={hdr}><span style={accent}></span>Compliance Status<span style={live}>LIVE</span></div>
                    <CSSBarChart data={compStatusData} />
                </div>

                {/* Donut: Active vs Exited */}
                <div style={card}>
                    <div style={hdr}><span style={accent}></span>Workforce Distribution<span style={live}>LIVE</span></div>
                    <CSSDonut segments={workforceData} size={180} />
                </div>

                {/* Vertical Bar: Joining Trend */}
                <div style={card}>
                    <div style={hdr}><span style={accent}></span>Employee Joining Trend<span style={live}>LIVE</span></div>
                    <CSSBarChart data={joiningData} />
                </div>

                {/* Horizontal Bar: Compliance Document Types */}
                <div style={card}>
                    <div style={hdr}><span style={accent}></span>Document Types<span style={live}>LIVE</span></div>
                    <CSSHorizontalBar data={compTypeData} />
                </div>
            </div>

            {/* Downloads Table */}
            <div className="section-label">Downloadable Reports</div>
            <div className="table-container">
                <h3>Available Reports</h3>
                <table>
                    <thead><tr><th>Report Name</th><th>Description</th><th>Last Generated</th><th>Action</th></tr></thead>
                    <tbody>
                        {data.reports.map(r => (
                            <tr key={r.slug}>
                                <td>{r.name}</td><td>{r.description}</td><td>{r.last_generated}</td>
                                <td><button className="btn" onClick={() => handleDownload(r.slug)}>Download</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Reports;
