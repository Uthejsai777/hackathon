import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetJobHistory } from '../api/employeeApi';

/* ═══ SVG Line Graph Component ═══ */
function SVGLineGraph({ points, labels, color = '#2dd4bf', width = 700, height = 220 }) {
    if (!points.length) return null;
    const pad = { top: 28, right: 24, bottom: 36, left: 60 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;
    const maxY = Math.max(...points, 1);
    const minY = Math.min(...points, 0);
    const rangeY = maxY - minY || 1;

    const coords = points.map((v, i) => ({
        x: pad.left + (i / Math.max(points.length - 1, 1)) * w,
        y: pad.top + h - ((v - minY) / rangeY) * h,
        val: v,
    }));

    const polyline = coords.map(c => `${c.x},${c.y}`).join(' ');
    const areaPath = `M${coords[0].x},${pad.top + h} ${coords.map(c => `L${c.x},${c.y}`).join(' ')} L${coords[coords.length - 1].x},${pad.top + h} Z`;

    // Y-axis gridlines
    const gridLines = 5;
    const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => {
        const val = minY + (rangeY / gridLines) * i;
        const y = pad.top + h - ((val - minY) / rangeY) * h;
        return { val, y };
    });

    return (
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
            {/* Grid + Y labels */}
            {yTicks.map((t, i) => (
                <g key={i}>
                    <line x1={pad.left} y1={t.y} x2={width - pad.right} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <text x={pad.left - 8} y={t.y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                        {t.val >= 100000 ? `${(t.val / 100000).toFixed(1)}L` : t.val.toLocaleString('en-IN')}
                    </text>
                </g>
            ))}

            {/* Gradient fill under line */}
            <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#lineGrad)" />

            {/* Line */}
            <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

            {/* Dots */}
            {coords.map((c, i) => (
                <g key={i}>
                    <circle cx={c.x} cy={c.y} r="4" fill={color} stroke="#1e2235" strokeWidth="2" />
                    <title>{labels?.[i] || ''}: ₹{c.val.toLocaleString('en-IN')}</title>
                </g>
            ))}

            {/* X labels */}
            {coords.map((c, i) => (
                <text key={i} x={c.x} y={height - 6} fill="#94a3b8" fontSize="9" textAnchor="middle">
                    {labels?.[i] || i}
                </text>
            ))}
        </svg>
    );
}

function JobHistory() {
    const { token } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchJobHistory() {
            try {
                const res = await apiGetJobHistory({ token });
                setRecords(res.job_history || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (token) fetchJobHistory();
    }, [token]);

    const promotions = records.filter(r => r.type === 'Promotion').length;
    const currentRoles = records.filter(r => r.end_date === 'Current').length;

    if (loading) {
        return (
            <div className="dashboard-content">
                <div className="header"><div><h1>Job History</h1><div className="header-subtitle">Loading from database...</div></div></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-content">
                <div className="header"><h1>Job History</h1></div>
                <p style={{ color: 'var(--accent-red)' }}>Error: {error}</p>
            </div>
        );
    }

    /* ── CTC Analytics from real MySQL data ── */

    // All CTC values
    const allCtc = records.map(r => Number(r.ctc)).filter(v => v > 0);
    const avgCtc = allCtc.length > 0 ? Math.round(allCtc.reduce((a, b) => a + b, 0) / allCtc.length) : 0;
    const maxCtc = allCtc.length > 0 ? Math.max(...allCtc) : 0;
    const minCtc = allCtc.length > 0 ? Math.min(...allCtc) : 0;
    const uniqueEmps = new Set(records.map(r => r.emp_id)).size;

    // CTC trend by effective_date (sorted chronologically)
    const sorted = [...records].filter(r => r.ctc > 0).sort((a, b) => a.effective_date.localeCompare(b.effective_date));
    // Group by effective_date and compute average CTC per date
    const ctcByDate = {};
    sorted.forEach(r => {
        const d = r.effective_date;
        if (!ctcByDate[d]) ctcByDate[d] = { total: 0, count: 0 };
        ctcByDate[d].total += Number(r.ctc);
        ctcByDate[d].count += 1;
    });
    const trendDates = Object.keys(ctcByDate);
    const trendAvgs = trendDates.map(d => Math.round(ctcByDate[d].total / ctcByDate[d].count));

    // CTC by level
    const ctcByLevel = {};
    records.forEach(r => {
        if (!r.level || !r.ctc) return;
        if (!ctcByLevel[r.level]) ctcByLevel[r.level] = { total: 0, count: 0 };
        ctcByLevel[r.level].total += Number(r.ctc);
        ctcByLevel[r.level].count += 1;
    });
    const levels = Object.keys(ctcByLevel).sort();
    const levelAvgs = levels.map(l => Math.round(ctcByLevel[l].total / ctcByLevel[l].count));

    const formatCtc = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v.toLocaleString('en-IN')}`;

    const card = { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: 24 };
    const hdr = { color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
    const accent = { width: 3, height: 18, background: 'var(--accent-teal)', borderRadius: 2, display: 'inline-block' };
    const live = { fontSize: 9, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '3px 8px', borderRadius: 10, letterSpacing: 1, marginLeft: 'auto', textTransform: 'uppercase' };

    return (
        <div className="dashboard-content">
            <div className="header">
                <div>
                    <h1>Job History</h1>
                    <div className="header-subtitle">CTC Analytics · {records.length} records · {uniqueEmps} employees</div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="card-container">
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>📋</div>
                    <h3>Total Records</h3>
                    <div className="card-value">{records.length}</div>
                </div>
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--accent-green)' }}>💰</div>
                    <h3>Average CTC</h3>
                    <div className="card-value">{formatCtc(avgCtc)}</div>
                </div>
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-orange)' }}>📈</div>
                    <h3>Highest CTC</h3>
                    <div className="card-value">{formatCtc(maxCtc)}</div>
                </div>
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>🔄</div>
                    <h3>Promotions</h3>
                    <div className="card-value">{promotions}</div>
                </div>
                <div className="card">
                    <div className="card-icon" style={{ background: 'rgba(240,98,146,0.15)', color: 'var(--accent-coral)' }}>👥</div>
                    <h3>Employees</h3>
                    <div className="card-value">{uniqueEmps}</div>
                </div>
            </div>

            {/* Line Graphs */}
            <div className="section-label">CTC Analytics · Live Data</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Horizontal Bars: Avg CTC by Role */}
                <div style={card}>
                    <div style={hdr}><span style={accent}></span>Average CTC by Role<span style={live}>LIVE</span></div>
                    {(() => {
                        const ctcByRole = {};
                        records.forEach(r => {
                            if (!r.new_role || !r.ctc) return;
                            if (!ctcByRole[r.new_role]) ctcByRole[r.new_role] = { total: 0, count: 0 };
                            ctcByRole[r.new_role].total += Number(r.ctc);
                            ctcByRole[r.new_role].count += 1;
                        });
                        const roleData = Object.entries(ctcByRole)
                            .map(([role, d]) => ({ role, avg: Math.round(d.total / d.count), count: d.count }))
                            .sort((a, b) => b.avg - a.avg);
                        const maxAvg = roleData.length > 0 ? roleData[0].avg : 1;
                        const barColors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#f06292', '#2dd4bf', '#ef4444', '#6366f1'];
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {roleData.map((r, i) => (
                                    <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 110, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.role}>{r.role}</span>
                                        <div style={{ flex: 1, height: 26, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 6,
                                                width: `${(r.avg / maxAvg) * 100}%`,
                                                background: `linear-gradient(90deg, ${barColors[i % barColors.length]}, ${barColors[i % barColors.length]}88)`,
                                                transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                                                display: 'flex', alignItems: 'center', paddingLeft: 8,
                                            }}>
                                                {(r.avg / maxAvg) > 0.25 && <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{formatCtc(r.avg)}</span>}
                                            </div>
                                            {(r.avg / maxAvg) <= 0.25 && <span style={{ position: 'absolute', left: `calc(${(r.avg / maxAvg) * 100}% + 6px)`, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 600, color: '#f1f5f9' }}>{formatCtc(r.avg)}</span>}
                                        </div>
                                        <span style={{ fontSize: 10, color: '#64748b', minWidth: 20 }}>{r.count}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Line Graph: Avg CTC by Level */}
                <div style={card}>
                    <div style={hdr}><span style={accent}></span>Avg CTC by Level<span style={live}>LIVE</span></div>
                    {levels.length > 1 ? (
                        <SVGLineGraph points={levelAvgs} labels={levels} color="#3b82f6" />
                    ) : (
                        <p style={{ color: '#94a3b8', fontSize: 13 }}>Not enough levels for comparison.</p>
                    )}
                </div>
            </div>

            {/* Job History Table */}
            <div className="section-label">Employee Job Timeline</div>

            <div className="table-container">
                <h3>All Role Changes</h3>
                {records.length === 0 ? (
                    <p>No job history records found in the database.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Previous Role</th>
                                <th>New Role</th>
                                <th>Level</th>
                                <th>Effective Date</th>
                                <th>End Date</th>
                                <th>CTC</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((rec, idx) => (
                                <tr key={`${rec.emp_id}-${idx}`}>
                                    <td>{rec.employee}</td>
                                    <td>{rec.previous_role}</td>
                                    <td>{rec.new_role}</td>
                                    <td>{rec.level}</td>
                                    <td>{rec.effective_date}</td>
                                    <td>{rec.end_date}</td>
                                    <td>₹{Number(rec.ctc).toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className={`status ${rec.type === 'Promotion' ? 'green' : 'orange'}`}>
                                            {rec.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default JobHistory;
