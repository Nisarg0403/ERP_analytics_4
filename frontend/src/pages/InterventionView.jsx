import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AlertCircle, CheckCircle, Clock, BookOpen, UserX, Mail, Calendar } from 'lucide-react';

const InterventionView = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await api.getAlerts();
                setAlerts(data);
            } catch (err) {
                console.error("Failed to fetch alerts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const handleAction = (studentName, action) => {
        alert(`${action} initiated for ${studentName}. System will log this intervention.`);
    };

    if (loading) return <div className="loading">Loading Action Center...</div>;

    return (
        <div className="view-container">
            <h2 className="view-title">Intervention & Action Center</h2>
            <div className="section-desc" style={{ marginBottom: '2rem', maxWidth: '800px' }}>
                <p>
                    A decision-support dashboard logic-checked against <strong>Active Risk Policies</strong>.
                    Use this center to prioritize student interventions based on concrete risk factors.
                </p>
            </div>

            {/* 1. Critical Actions Table */}
            <div className="card" style={{ background: 'var(--bg-card)', padding: '0', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                        <AlertCircle size={20} color="#ef4444" />
                        Students Requiring Immediate Attention
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {alerts.length} Flagged Students
                    </span>
                </div>

                <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '1rem' }}>Student</th>
                                <th style={{ padding: '1rem' }}>Risk Level</th>
                                <th style={{ padding: '1rem' }}>Main Cause (Explainability)</th>
                                <th style={{ padding: '1rem' }}>Recommended Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <CheckCircle size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
                                        <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)' }}>All students are safe.</p>
                                        <p style={{ fontSize: '0.9rem' }}>No critical or warning risks detected.</p>
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((student, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{student.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{student.roll}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: student.risk > 0.7 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: student.risk > 0.7 ? '#ef4444' : '#f59e0b',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                border: `1px solid ${student.risk > 0.7 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                            }}>
                                                {student.status}
                                            </span>
                                            <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Score: {(student.risk * 100).toFixed(0)}%
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                {/* Cause Text */}
                                                <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                                    {student.main_cause || 'General Academic Risk'}
                                                </div>

                                                {/* Visual Indicators */}
                                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', marginTop: '5px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: student.attendance < 75 ? '#ef4444' : '#10b981' }}>
                                                        <Clock size={14} /> Att: {student.attendance}%
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: student.marks < 50 ? '#ef4444' : '#10b981' }}>
                                                        <BookOpen size={14} /> Marks: {student.marks}%
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {student.actions && student.actions.map((action, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleAction(student.name, action)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            background: 'var(--bg-hover)',
                                                            border: '1px solid var(--border)',
                                                            padding: '0.3rem 0.7rem',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                                    >
                                                        {action.includes('Meeting') && <UserX size={13} />}
                                                        {action.includes('Email') && <Mail size={13} />}
                                                        {(action.includes('Class') || action.includes('Study')) && <BookOpen size={13} />}
                                                        {action}
                                                    </button>
                                                ))}
                                                {(!student.actions || student.actions.length === 0) && (
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>None Required</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. Logic Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="#ef4444" /> Attendance Logic
                    </h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                        <li><strong>&lt; 75%:</strong> Triggers "Low Attendance" warning.</li>
                        <li><strong>&lt; 60%:</strong> Triggers "Critical Attendance" & Parent Meeting.</li>
                    </ul>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={18} color="#f59e0b" /> Academic Logic
                    </h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                        <li><strong>&lt; 50%:</strong> Triggers "Low Grades" & Peer Tutoring.</li>
                        <li><strong>&lt; 40%:</strong> Triggers "Academic Failure" & Remedial Classes.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InterventionView;
