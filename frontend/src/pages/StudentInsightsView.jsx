import React, { useEffect, useState } from 'react';
import { Search, Download, Info, AlertTriangle, Activity } from 'lucide-react';
import { api } from '../services/api';

const StudentInsightsView = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('all');
    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const data = await api.getStudentRecords();
                if (Array.isArray(data)) {
                    setRecords(data);
                } else {
                    console.error("API returned non-array data:", data);
                    setRecords([]);
                }
            } catch (err) {
                console.error("Failed to fetch records", err);
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    // Helper for risk badge
    const getRiskBadge = (score) => {
        if (score === null || score === undefined) return <span className="badge">N/A</span>;
        if (score > 0.7) return <span className="risk-badge high">High</span>;
        if (score > 0.4) return <span className="risk-badge medium">Medium</span>;
        return <span className="risk-badge low" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>Low</span>;
    };

    // Filter Logic
    const filteredRecords = records.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.subject.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filterRisk === 'high') matchesFilter = r.risk_score > 0.7;
        if (filterRisk === 'medium') matchesFilter = r.risk_score > 0.4 && r.risk_score <= 0.7;
        if (filterRisk === 'low') matchesFilter = r.risk_score <= 0.4;

        return matchesSearch && matchesFilter;
    });

    // Helper for subject alert badge
    const getSubjectBadge = (status) => {
        if (status === 'Critical') return <span className="risk-badge high">Critical</span>;
        if (status === 'Warning') return <span className="risk-badge medium">Warning</span>;
        return <span className="risk-badge" style={{ color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>Normal</span>;
    };

    // Helper for grade badge
    const getGradeBadge = (grade) => {
        if (!grade) return <span className="risk-badge" style={{ color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)' }}>N/A</span>;

        const g = grade.toUpperCase();
        if (['O', 'A+', 'A'].includes(g)) return <span className="risk-badge low" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{grade}</span>;
        if (['B+', 'B'].includes(g)) return <span className="risk-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{grade}</span>;
        if (['C', 'P'].includes(g)) return <span className="risk-badge medium" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>{grade}</span>;
        if (['D'].includes(g)) return <span className="risk-badge medium" style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.2)' }}>{grade}</span>;
        if (['F'].includes(g)) return <span className="risk-badge high" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{grade}</span>;

        return <span className="risk-badge" style={{ color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>{grade}</span>;
    };

    if (loading) return <div className="loading">Loading Record Data...</div>;

    if (records.length === 0) {
        return (
            <div className="view-container">
                <h2 className="view-title">Detailed Student Analysis</h2>
                <div className="empty-state-container">
                    <div className="empty-card">
                        <AlertTriangle size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                        <h2>No Data Available</h2>
                        <p>Please upload a Master Data CSV file in the <strong>Data Upload</strong> section to generate insights.</p>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            (Session data is cleared on page reload)
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div className="header-flex">
                <div>
                    <h2 className="view-title" style={{ marginBottom: '0.5rem' }}>Detailed Student Analysis</h2>
                    <div style={{ color: '#94a3b8' }}>
                        Displaying all <strong>{records.length}</strong> academic records.
                        <br />
                        <small>Rows highlighted in <span style={{ color: '#ef4444' }}>Red</span> indicate subject-level failure.</small>
                    </div>
                </div>
                <button
                    className="secondary-btn"
                    onClick={() => setShowInfoModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Info size={18} /> How System Works
                </button>
            </div>

            {/* Controls */}
            <div className="controls-bar" style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div className="search-box" style={{ flex: 2, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search by Name, Roll No, or Subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="file-input"
                        style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box', background: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    />
                </div>

                <div className="filter-box" style={{ flex: 1, minWidth: '150px' }}>
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value)}
                        className="file-input"
                        style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                        <option value="all">All Risk Levels</option>
                        <option value="high">High Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="low">Low Risk</option>
                    </select>
                </div>

                <button className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="data-section" style={{ marginTop: 0 }}>
                <div className="table-container">
                    <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>

                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Semester</th>
                                <th>Subject</th>
                                <th>Credits</th>
                                <th>Marks</th>
                                <th>Grade</th>
                                <th>Attendance</th>
                                <th>Subject Alert</th>
                                <th>Student Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => {
                                const isCritical = record.subject_alert === 'Critical';
                                const rowStyle = isCritical ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : {};

                                return (
                                    <tr key={record.id} style={rowStyle}>
                                        <td>{record.roll_number}</td>
                                        <td>{record.name}</td>
                                        <td>{record.semester}</td>
                                        <td>{record.subject}</td>
                                        <td>{record.credits || 4}</td>
                                        <td style={{ fontWeight: '500' }}>{record.marks} / {record.total_marks}</td>
                                        <td>{getGradeBadge(record.grade)}</td>
                                        <td>{record.attendance}%</td>
                                        <td>{getSubjectBadge(record.subject_alert)}</td>
                                        <td>{getRiskBadge(record.risk_score)}</td>
                                    </tr>
                                );
                            })}
                            {filteredRecords.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="empty-cell">No records found matching filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Showing {filteredRecords.length} of {records.length} records
                </div>
            </div>

            {/* Logic Explanation Modal */}
            {showInfoModal && (
                <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <h3>📊 How Analysis Works</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} /> 1. Subject Alert (Local Risk)
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                                Highlights immediate failure in a specific subject. This does <strong>not</strong> mean the student will drop out, but they need help in this subject.
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                <li><strong style={{ color: '#ef4444' }}>Critical</strong>: Marks &lt; 40 <strong>AND</strong> Attendance &lt; 60%</li>
                                <li><strong style={{ color: '#f59e0b' }}>Warning</strong>: Marks &lt; 50 <strong>OR</strong> Attendance &lt; 65%</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#a78bfa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={16} /> 2. Student Risk (Global Risk)
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                                Predicts the overall probability of a student <strong>dropping out</strong> based on their average performance across all subjects.
                            </p>
                            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                <li><strong>Low Risk</strong>: Avg Attendance &gt; 70% & Avg Marks &gt; 50%</li>
                                <li><strong>High Risk</strong>: Consistent failure across multiple subjects.</li>
                            </ul>
                        </div>

                        <div className="modal-actions">
                            <button className="primary-btn" onClick={() => setShowInfoModal(false)}>Got it</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentInsightsView;
