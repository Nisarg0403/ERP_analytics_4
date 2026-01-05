import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Calculator, Award, TrendingUp, Info, X, Trash2 } from 'lucide-react';

const GPAView = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('semester');
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getGPAAnalytics();
                setAnalytics(data);
            } catch (err) {
                console.error("Failed to load GPA analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculator State
    const [calcRows, setCalcRows] = useState([
        { subject: 'Subject 1', marks: 85, credits: 4 },
        { subject: 'Subject 2', marks: 72, credits: 4 },
        { subject: 'Subject 3', marks: 65, credits: 3 },
        { subject: 'Subject 4', marks: 90, credits: 1 },
    ]);
    const [calculatedSGPA, setCalculatedSGPA] = useState(null);

    const handleCalcChange = (index, field, value) => {
        const newRows = [...calcRows];
        newRows[index][field] = value;
        setCalcRows(newRows);
    };

    const handleDeleteRow = (index) => {
        if (calcRows.length > 1) {
            const newRows = calcRows.filter((_, i) => i !== index);
            setCalcRows(newRows);
        }
    };

    const calculate = () => {
        let totalPoints = 0;
        let totalCredits = 0;

        calcRows.forEach(row => {
            const marks = parseFloat(row.marks);
            const cr = parseFloat(row.credits);
            let point = 0;
            if (marks >= 90) point = 10;
            else if (marks >= 80) point = 9;
            else if (marks >= 70) point = 8;
            else if (marks >= 60) point = 7;
            else if (marks >= 50) point = 6;
            else if (marks >= 40) point = 5;
            else point = 0;

            totalPoints += point * cr;
            totalCredits += cr;
        });

        if (totalCredits > 0) {
            setCalculatedSGPA((totalPoints / totalCredits).toFixed(2));
        } else {
            setCalculatedSGPA("0.00");
        }
    };

    if (loading) return <div className="loading">Loading Analytics...</div>;

    // Prepare chart data
    const distData = analytics ? Object.keys(analytics.distribution).map(k => ({
        range: k,
        count: analytics.distribution[k]
    })) : [];

    const scatterData = analytics ? analytics.correlation.sgpa.map((val, i) => ({
        x: analytics.correlation.attendance[i],
        y: val,
        z: 1
    })) : [];

    return (
        <div className="view-container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="view-title">GPA Analytics & Tools</h2>
                <button
                    onClick={() => setShowInfo(true)}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--text-primary)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                    title="How is GPA calculated?"
                >
                    <Info size={18} />
                </button>
            </div>

            {/* Info Modal */}
            {showInfo && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px',
                        maxWidth: '500px', width: '90%', position: 'relative',
                        border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <button
                            onClick={() => setShowInfo(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>GPA Calculation Logic</h3>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '0.5rem' }}><strong>Grade Points (10-Point Scale):</strong></p>
                            <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                <li>90-100 Marks: <strong style={{ color: 'var(--text-primary)' }}>10 Points (O)</strong></li>
                                <li>80-89 Marks: <strong style={{ color: 'var(--text-primary)' }}>9 Points (A+)</strong></li>
                                <li>70-79 Marks: <strong style={{ color: 'var(--text-primary)' }}>8 Points (A)</strong></li>
                                <li>60-69 Marks: <strong style={{ color: 'var(--text-primary)' }}>7 Points (B)</strong></li>
                            </ul>
                            <p style={{ marginBottom: '0.5rem' }}><strong>SGPA Formula:</strong></p>
                            <code style={{ background: 'var(--bg-hover)', padding: '0.3rem 0.5rem', borderRadius: '4px', display: 'block', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                                Σ (Grade Point × Credits) / Σ Credits
                            </code>
                            <p>
                                <strong>CGPA:</strong> Average of SGPA across all semesters (Cumulative).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <button
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: activeTab === 'semester' ? '#3b82f6' : 'var(--bg-card)',
                        color: activeTab === 'semester' ? '#fff' : 'var(--text-secondary)',
                        border: activeTab === 'semester' ? 'none' : '1px solid var(--border)',
                        boxShadow: activeTab === 'semester' ? '0 4px 6px -1px rgba(59, 130, 246, 0.5)' : 'none'
                    }}
                    onClick={() => setActiveTab('semester')}
                >
                    <TrendingUp size={16} /> Batch Performance
                </button>
                <button
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: activeTab === 'cumulative' ? '#eab308' : 'var(--bg-card)',
                        color: activeTab === 'cumulative' ? '#fff' : 'var(--text-secondary)',
                        border: activeTab === 'cumulative' ? 'none' : '1px solid var(--border)',
                        boxShadow: activeTab === 'cumulative' ? '0 4px 6px -1px rgba(234, 179, 8, 0.5)' : 'none'
                    }}
                    onClick={() => setActiveTab('cumulative')}
                >
                    <Award size={16} /> Top Performers
                </button>
                <button
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: activeTab === 'calculator' ? '#10b981' : 'var(--bg-card)',
                        color: activeTab === 'calculator' ? '#fff' : 'var(--text-secondary)',
                        border: activeTab === 'calculator' ? 'none' : '1px solid var(--border)',
                        boxShadow: activeTab === 'calculator' ? '0 4px 6px -1px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                    onClick={() => setActiveTab('calculator')}
                >
                    <Calculator size={16} /> GPA Calculator
                </button>
            </div>

            <div className="tab-content" style={{ marginTop: '1.5rem' }}>
                {activeTab === 'semester' && (
                    <div className="dashboard-grid">
                        <div className="kpi-card" style={{ gridColumn: 'span 2', marginBottom: '2rem', padding: '1.5rem 2rem' }}>
                            <h3>SGPA Distribution (Batch)</h3>
                            <div style={{ height: '350px', marginTop: '1.5rem', width: '100%' }}>
                                {distData.some(d => d.count > 0) ? (
                                    <ResponsiveContainer width="99%" height="100%">
                                        <BarChart data={distData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" strokeOpacity={0.3} vertical={false} />
                                            <XAxis dataKey="range" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} allowDecimals={false} tickLine={false} axisLine={false} dx={-10} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: 'var(--text-primary)' }}
                                                cursor={{ fill: 'var(--bg-hover)' }}
                                            />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Students" barSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                                        <p>No GPA data available yet.</p>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Upload Marks with Credits to generate analytics.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="kpi-card" style={{ gridColumn: 'span 2', padding: '1.5rem 2rem' }}>
                            <h3>Performance vs Attendance</h3>
                            <div style={{ height: '350px', marginTop: '1.5rem', width: '100%' }}>
                                {scatterData.length > 0 ? (
                                    <ResponsiveContainer width="99%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--text-secondary)" strokeOpacity={0.3} />
                                            <XAxis type="number" dataKey="x" name="Attendance" unit="%" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} domain={[0, 100]} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis type="number" dataKey="y" name="SGPA" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} domain={[0, 10]} tickLine={false} axisLine={false} dx={-10} />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3', stroke: 'var(--text-muted)' }}
                                                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ color: 'var(--text-primary)' }}
                                            />
                                            <Scatter name="Student Performance" data={scatterData} fill="#10b981" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📉</div>
                                        <p>No Correlation Data.</p>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Need both SGPA & Attendance data.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cumulative' && (
                    <div className="kpi-card">
                        <h3>🏆 Top Performers (Best CGPA)</h3>
                        <table className="data-table" style={{ width: '100%', marginTop: '1rem' }}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Student Name</th>
                                    <th>Roll Number</th>
                                    <th>Cumulative GPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.top_performers.map((student, index) => (
                                    <tr key={student.roll}>
                                        <td>#{index + 1}</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{student.name}</td>
                                        <td>{student.roll}</td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    background: '#fbbf24',
                                                    color: '#000',
                                                    border: 'none',
                                                    fontWeight: 'bold',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {student.cgpa.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'calculator' && (
                    <div className="kpi-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 1fr', gap: '2rem' }}>

                        {/* Inputs Section */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0 }}>🧮 "What-If" Calculator</h3>
                                <button
                                    className="primary-btn"
                                    onClick={() => setCalcRows([...calcRows, { subject: `Subject ${calcRows.length + 1}`, marks: 0, credits: 4 }])}
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                >
                                    + Add Subject
                                </button>
                            </div>

                            <div style={{ background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-hover)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Subject Name</th>
                                            <th style={{ padding: '1rem', fontSize: '0.9rem', width: '140px', color: 'var(--text-secondary)', textAlign: 'center' }}>Expected Marks (100)</th>
                                            <th style={{ padding: '1rem', fontSize: '0.9rem', width: '80px', color: 'var(--text-secondary)', textAlign: 'center' }}>Credits</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calcRows.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.8rem' }}>
                                                    <input
                                                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', width: '100%', padding: '0.5rem', outline: 'none' }}
                                                        value={row.subject}
                                                        onChange={e => handleCalcChange(i, 'subject', e.target.value)}
                                                        placeholder="e.g. Mathematics"
                                                    />
                                                </td>
                                                <td style={{ padding: '0.8rem' }}>
                                                    <input
                                                        type="number"
                                                        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', padding: '0.6rem', textAlign: 'center', outline: 'none' }}
                                                        value={row.marks}
                                                        onChange={e => handleCalcChange(i, 'marks', e.target.value)}
                                                        min="0" max="100"
                                                    />
                                                </td>
                                                <td style={{ padding: '0.8rem' }}>
                                                    <input
                                                        type="number"
                                                        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', width: '100%', padding: '0.6rem', textAlign: 'center', outline: 'none' }}
                                                        value={row.credits}
                                                        onChange={e => handleCalcChange(i, 'credits', e.target.value)}
                                                        min="1"
                                                    />
                                                </td>
                                                <td style={{ padding: '0.8rem', textAlign: 'center' }}>
                                                    {/* Only show delete if more than 1 row */}
                                                    {calcRows.length > 1 && (
                                                        <button
                                                            onClick={() => handleDeleteRow(i)}
                                                            className="secondary-btn"
                                                            style={{
                                                                border: 'none',
                                                                color: 'var(--text-muted)',
                                                                padding: '6px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Remove Subject"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Result Section (Sticky/Fixed Visual) */}
                        <div style={{
                            background: 'var(--bg-card)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            height: 'fit-content'
                        }}>
                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Projected Result</h4>

                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: calculatedSGPA ? '#10b981' : 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {calculatedSGPA || '--'}
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Semantic Grade Point Average</span>

                            <button
                                className="primary-btn"
                                onClick={calculate}
                                style={{ width: '100%', padding: '1rem', fontSize: '1rem', background: '#3b82f6' }}
                            >
                                Calculate SGPA
                            </button>

                            <button
                                style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                                onClick={() => { setCalculatedSGPA(null); setCalcRows([{ subject: 'Subject 1', marks: 0, credits: 4 }]); }}
                            >
                                Reset Calculator
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default GPAView;
