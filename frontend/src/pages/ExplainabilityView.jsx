import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, AlertTriangle, TrendingDown, HelpCircle, CheckCircle, BrainCircuit } from 'lucide-react';

const ExplainabilityView = () => {
    const [studentList, setStudentList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real high-risk students for the example
        const loadExample = async () => {
            try {
                const alerts = await api.getAlerts(0.0);
                if (alerts && alerts.length > 0) {
                    setStudentList(alerts.slice(0, 5)); // Show top 5
                } else {
                    setStudentList([]);
                }
            } catch (err) {
                console.error("Failed to load sample", err);
            } finally {
                setLoading(false);
            }
        };
        loadExample();
    }, []);

    return (
        <div className="view-container">
            <h2 className="view-title">Risk Logic & Explainability</h2>
            <p className="section-desc" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
                We prioritize <strong style={{ color: '#60a5fa' }}>Transparent AI</strong>. Instead of a "black box" prediction, the system uses a weighted heuristic model that mirrors faculty decision-making criteria. This ensures fairness and actionability.
            </p>

            {/* 1. Logic Breakdown */}
            <h3 style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '10px', marginBottom: '1.5rem' }}>1. How Risk Is Calculated</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

                {/* Rule 1: Attendance */}
                <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', color: '#60a5fa' }}>
                            <BookOpen size={24} />
                        </div>
                        <h4 style={{ margin: 0 }}>Attendance Factor</h4>
                    </div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li><strong>Weight:</strong> High (45%)</li>
                        <li><strong>Impact:</strong> Students with attendance <strong>&lt; 60%</strong> trigger an immediate high-risk flag.</li>
                        <li><strong>Logic:</strong> Poor attendance is the leading leading indicator of dropout intent.</li>
                    </ul>
                </div>

                {/* Rule 2: Performance */}
                <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', color: '#f87171' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h4 style={{ margin: 0 }}>Academic Performance</h4>
                    </div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li><strong>Weight:</strong> High (45%)</li>
                        <li><strong>Impact:</strong> Aggregate marks <strong>&lt; 40%</strong> or failing <strong>&gt; 2 subjects</strong> increases risk score exponentially.</li>
                        <li><strong>Logic:</strong> Consistent failure indicates academic struggle.</li>
                    </ul>
                </div>

                {/* Rule 3: Trend */}
                <div className="card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '8px', color: '#a78bfa' }}>
                            <TrendingDown size={24} />
                        </div>
                        <h4 style={{ margin: 0 }}>Longitudinal Trend</h4>
                    </div>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li><strong>Weight:</strong> Moderate (10%)</li>
                        <li><strong>Impact:</strong> A drop in SGPA over <strong>2 consecutive semesters</strong> adds a penalty multiplier.</li>
                        <li><strong>Logic:</strong> Detects "slipping" students who pass but perform worse over time.</li>
                    </ul>
                </div>
            </div>

            {/* 2. Live Example */}
            <h3 style={{ borderLeft: '4px solid #10b981', paddingLeft: '10px', marginBottom: '1.5rem' }}>2. Live Example Calculation</h3>

            {!loading && studentList.length === 0 ? (
                <div style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #4b5563', marginBottom: '3rem' }}>
                    <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>No high-risk students found or no data uploaded.</p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Upload data to see live explainability examples here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                    {studentList.map((student, idx) => (
                        <div key={student.roll} style={{ background: 'var(--bg-hover)', padding: '2rem', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '2rem' }}>

                                {/* Student Profile */}
                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <CheckCircle size={20} color="#10b981" />
                                        Case Study #{idx + 1}: <span style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>{student.name}</span>
                                    </h4>

                                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Current Attendance:</span>
                                            <span style={{ fontWeight: 'bold', color: student.attendance < 75 ? '#ef4444' : '#10b981' }}>
                                                {student.attendance}%
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Avg Marks:</span>
                                            <span style={{ fontWeight: 'bold', color: student.marks < 50 ? '#ef4444' : '#f59e0b' }}>
                                                {student.marks}%
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Trend:</span>
                                            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>Analyze Multi-Sem Data</span>
                                        </div>
                                    </div>
                                </div>

                                {/* The Math */}
                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>The Math:</h4>
                                    <div style={{ fontFamily: 'monospace', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', color: '#10b981', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                                        <div style={{ marginBottom: '5px' }}>Attendance_Penalty {student.attendance < 60 ? '= +40 pts (Critical)' : student.attendance < 75 ? '= +15 pts (Low)' : '= 0 pts'}</div>
                                        <div style={{ marginBottom: '5px' }}>Marks_Penalty      {student.marks < 40 ? '= +30 pts (Critical)' : student.marks < 60 ? '= +15 pts (Median)' : '= 0 pts'}</div>
                                        <div style={{ marginBottom: '10px' }}>Trend_Multiplier   = TBD pts</div>
                                        <div style={{ borderTop: '1px solid #374151', margin: '10px 0' }}></div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            TOTAL RISK SCORE   = {(student.risk * 100).toFixed(0)} / 100
                                        </div>
                                        <div style={{ color: student.risk > 0.7 ? '#ef4444' : student.risk > 0.4 ? '#f59e0b' : '#10b981', marginTop: '5px', fontWeight: 'bold' }}>
                                            STATUS: {student.risk > 0.7 ? "CRITICAL RISK" : student.risk > 0.4 ? "WARNING" : "SAFE"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 3. Future ML */}
            <h3 style={{ borderLeft: '4px solid #6366f1', paddingLeft: '10px', marginBottom: '1.5rem' }}>3. Future Predictive Modeling (Roadmap)</h3>
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                    <div style={{ background: '#6366f1', padding: '12px', borderRadius: '50%', color: '#fff', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }}>
                        <BrainCircuit size={32} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>Transitioning to Deep Learning</h4>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '700px' }}>
                            While the current version uses <strong>Rule-Based Heuristics</strong> for explainability, the architecture is ready for full ML integration.
                        </p>

                        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div>
                                <h5 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Data Requirements</h5>
                                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>3+ Years of historical data with labeled "Dropout" vs "Graduated" outcomes.</p>
                            </div>
                            <div>
                                <h5 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Planned Models</h5>
                                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Random Forest for classification & LSTM for sequential semester forecasting.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ExplainabilityView;
