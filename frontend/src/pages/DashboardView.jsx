import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, TrendingUp, AlertTriangle, GraduationCap, Activity, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardView = ({ onNavigate }) => {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null); // For Modal
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, alertsData, trendRes] = await Promise.all([
                    api.getStats(),
                    api.getAlerts(),
                    api.getTrend()
                ]);
                setStats(statsData);
                setAlerts(alertsData);
                setTrendData(trendRes);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... (rest of code)



    const handleActionClick = (student) => {
        setSelectedStudent(student);
    };

    const closeActionModal = () => {
        setSelectedStudent(null);
    };

    if (loading) return <div className="loading">Loading Analytics...</div>;

    if (error) {
        return (
            <div className="view-container">
                <div className="status-banner error" style={{ background: '#fecaca', color: '#b91c1c', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171' }}>
                    <h3 style={{ margin: 0 }}>Connection Error</h3>
                    <p>{error}</p>
                    <p style={{ fontSize: '0.8rem' }}>Check if backend is running at http://127.0.0.1:8000</p>
                </div>
            </div>
        );
    }

    // Empty State Check
    if (!stats || stats.total_students === 0) {
        return (
            <div className="view-container empty-state-container">
                <div className="empty-card">
                    <h2>👋 Welcome to Insight AI</h2>
                    <p>No student data found. Import a CSV file to generate insights.</p>
                    <button onClick={() => onNavigate && onNavigate('upload')} className="cta-button" style={{ border: 'none', cursor: 'pointer' }}>
                        Go to Data Upload
                    </button>
                    <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#8899a6' }}>
                        (Navigate to <strong>Data Upload</strong> tab)
                    </div>
                </div>
            </div>
        );
    }

    // Aggregation Explanation
    const recordCount = 35; // Derived from context, ideally from API

    // Binning Logic for Pie Chart
    const processGradeDistribution = (dist) => {
        if (!dist) return [];
        const bins = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0 };

        Object.entries(dist).forEach(([grade, count]) => {
            const numLine = parseFloat(grade);
            if (numLine >= 90) bins['A (90-100)'] += count;
            else if (numLine >= 80) bins['B (80-89)'] += count;
            else if (numLine >= 70) bins['C (70-79)'] += count;
            else if (numLine >= 60) bins['D (60-69)'] += count;
            else bins['F (<60)'] += count;
        });

        return Object.keys(bins)
            .filter(key => bins[key] > 0)
            .map((name, index) => ({
                name,
                value: bins[name],
                fill: COLORS[index % COLORS.length]
            }));
    };

    const gradeData = processGradeDistribution(stats.grade_distribution);

    // Fallback if no grades yet
    if (gradeData.length === 0) {
        gradeData.push({ name: 'No Data', value: 1, fill: '#374151' });
    }

    // Safe formatting helper
    const formatPercent = (val) => {
        if (typeof val !== 'number') return '0.0';
        return (val * 100).toFixed(1);
    };

    return (
        <div className="dashboard-view">
            <h2 className="view-title">Executive Overview</h2>

            {/* Data Summary Alert */}
            <div className="status-banner success" style={{ marginBottom: '2rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
                <Activity size={20} />
                <span>
                    <strong>Data Processing Complete:</strong> Analyzed <strong>{stats.total_records || 0} academic records</strong> and consolidated them into <strong>{stats.total_students} unique student profiles</strong>.
                </span>
            </div>

            {/* KPI Cards */}
            {/* KPI Cards */}
            <div className="kpi-grid">
                {/* Card 1: Total Students */}
                <div className="kpi-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="icon-box blue"><Users size={24} /></div>
                    <div>
                        <div className="label">Total Students</div>
                        <div className="value">{stats.total_students}</div>
                        <div className="sub-label">Active profiles analyzed</div>
                    </div>
                </div>

                {/* Card 2: Avg Marks */}
                <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="icon-box green"><GraduationCap size={24} /></div>
                    <div>
                        <div className="label">Avg Marks</div>
                        <div className="value">{stats.average_marks ? stats.average_marks + '%' : '-'}</div>
                        <div className="sub-label">
                            {trendData.length > 1 ? 'Batch Cumulative Average' : 'Current Semester Performance'}
                        </div>
                    </div>
                </div>

                {/* Card 3: Avg Attendance (New) */}
                <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div className="icon-box purple"><CheckCircle size={24} /></div>
                    <div>
                        <div className="label">Avg Attendance</div>
                        <div className="value">{stats.average_attendance ? stats.average_attendance + '%' : '-'}</div>
                        <div className="sub-label">
                            {trendData.length > 1 ? 'Longitudinal Consistency' : 'Current Term Participation'}
                        </div>
                    </div>
                </div>

                {/* Card 4: Dynamic (Subject Alerts vs Declining Trend) */}
                <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="icon-box red">
                        {trendData.length > 1 ? <TrendingUp size={24} style={{ transform: 'scaleY(-1)' }} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                        <div className="label">{trendData.length > 1 ? 'Declining Trends' : 'Subject Alerts'}</div>
                        <div className="value">
                            {trendData.length > 1 ? stats.declining_students : stats.students_with_alerts}
                            <span style={{ fontSize: '1rem', marginLeft: '5px' }}>Students</span>
                        </div>
                        <div className="sub-label" style={{ color: '#f87171' }}>
                            {trendData.length > 1 ? 'Showing performance drop' : 'Requires Remedial Attention'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                {/* Area Chart - Only Show if we have Trend Data (More than 1 point) */}
                {trendData.length > 1 ? (
                    <div className="chart-card">
                        <div style={{ marginBottom: '1rem' }}>
                            <h3>Academic Performance Trend (Batch Avg)</h3>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {trendData.length > 1 ? (
                                    <>
                                        <span>
                                            {trendData[trendData.length - 1].value >= trendData[0].value ?
                                                <span style={{ color: '#10b981', fontWeight: 500 }}>↗ Improving Trend</span> :
                                                <span style={{ color: '#ef4444', fontWeight: 500 }}>↘ Declining Performance</span>}
                                        </span>
                                        <span>•</span>
                                        <span>Monitoring batch-level progression</span>
                                    </>
                                ) : <span>Tracking longitudinal performance</span>}
                            </div>
                        </div>
                        {trendData.length > 0 ? (
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                        <YAxis stroke="#9ca3af" domain={[0, 100]} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                            labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8884d8"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSplit)"
                                            dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4, fill: '#1f2937' }}
                                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : null}
                    </div>
                ) : null}


                {/* Grade Distribution Chart */}
                <div className="chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3>Predicted Grade Distribution</h3>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                {gradeData.some(d => (d.name.includes('D') || d.name.includes('F')) && d.value > 0) ?
                                    "Attention: Some students are in critical bands." :
                                    "Majority of students are performing well."}
                            </div>
                        </div>
                    </div>
                    {gradeData.length > 0 && gradeData[0].name !== 'No Data' ? (
                        <div className="chart-container" style={{ position: 'relative' }}>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={gradeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
                                            const RADIAN = Math.PI / 180;
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                            return (
                                                <text x={x} y={y} fill="var(--text-primary)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
                                                    {value}
                                                </text>
                                            );
                                        }}
                                        labelLine={false}
                                    >
                                        {gradeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value, entry) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginRight: '5px' }}>{value.split(' ')[0]}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Central Label */}
                            <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stats.total_students}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                            No grade data available
                        </div>
                    )}
                </div>
            </div>

            {/* At-Risk Table Section */}
            <div className="table-section">
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '8px' }}>
                            <AlertTriangle size={24} color="#ef4444" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Global Dropout Risk Assessment</h3>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Evaluation based on overall academic and attendance patterns.</p>
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Student</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Roll Number</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Risk Score</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((student, idx) => (
                                <tr key={student.roll} style={{ borderBottom: idx !== alerts.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }} className="hover:bg-gray-800">
                                    <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#fff' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            {student.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.roll}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', width: '80px' }}>
                                                <div style={{
                                                    width: `${Math.max(student.risk * 100, 5)}%`,
                                                    height: '100%',
                                                    background: student.risk > 0.7 ? '#ef4444' : student.risk > 0.4 ? '#f59e0b' : '#10b981',
                                                    borderRadius: '3px',
                                                    transition: 'width 0.5s ease-in-out'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: student.risk > 0.7 ? '#ef4444' : student.risk > 0.4 ? '#f59e0b' : '#10b981' }}>
                                                {formatPercent(student.risk)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {student.risk > 0.7 ? (
                                            <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Critical</span>
                                        ) : student.risk > 0.4 ? (
                                            <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Monitor</span>
                                        ) : (
                                            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Safe</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleActionClick(student)}
                                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#60a5fa'; e.currentTarget.style.color = '#60a5fa' }}
                                            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {alerts.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <CheckCircle size={40} color="#10b981" style={{ opacity: 0.8 }} />
                                            <div>
                                                <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>All Clear!</p>
                                                <p style={{ fontSize: '0.9rem' }}>No students currently flagged for global dropout risk.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Action Modal */}
                {selectedStudent && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>⚠️ Intervention Required</h3>
                            <p><strong>Student:</strong> {selectedStudent.name} ({selectedStudent.roll})</p>
                            <p><strong>Risk Score:</strong> <span className="text-red">{formatPercent(selectedStudent.risk)}%</span></p>

                            <div className="recommendations">
                                <h4>Recommended Actions:</h4>
                                <ul>
                                    <li>📅 Schedule 1-on-1 Remedial Session</li>
                                    <li>📞 Contact Parents regarding attendance</li>
                                    <li>📘 Assign supplementary material for "Big Data"</li>
                                </ul>
                            </div>

                            <div className="modal-actions">
                                <button className="primary-btn" onClick={() => alert("Meeting Scheduled!")}>Schedule Meeting</button>
                                <button className="secondary-btn" onClick={closeActionModal}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;
