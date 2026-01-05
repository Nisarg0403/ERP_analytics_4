import React, { useState } from 'react';
import { Upload, Link, CheckCircle, AlertCircle, FileText, History } from 'lucide-react';
import { api } from '../services/api';

const ImportView = () => {
    // Mode State
    const [analysisMode, setAnalysisMode] = useState(null); // 'current' or 'multi'

    // Upload State
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [masterFile, setMasterFile] = useState(null);

    const handleFileChange = (e) => {
        setMasterFile(e.target.files[0]);
        setStatus({ type: '', message: '' });
    };

    const handleMasterUpload = async () => {
        if (!masterFile || !analysisMode) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Pass scope to API
            const res = await api.uploadMasterData(masterFile, analysisMode);
            setStatus({ type: 'success', message: res.message });
        } catch (err) {
            setStatus({ type: 'error', message: err.message || "Upload failed" });
        } finally {
            setLoading(false);
        }
    };

    // Mode Selection Screen
    if (!analysisMode) {
        return (
            <div className="view-container">
                <h2 className="view-title">Choose Analysis Scope</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                    {/* Mode 1: Current Semester */}
                    <div
                        className="mode-card"
                        onClick={() => setAnalysisMode('current')}
                        style={{
                            background: 'var(--bg-card)',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                            <FileText size={40} className="icon-blue" style={{ color: '#3b82f6' }} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Current Semester Insight</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Analyze the current academic snapshot. Upload a single semester's master data to identify at-risk students and immediate interventions.
                        </p>
                    </div>

                    {/* Mode 2: Multi-Semester */}
                    <div
                        className="mode-card"
                        onClick={() => setAnalysisMode('multi')}
                        style={{
                            background: 'var(--bg-card)',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                        <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                            <History size={40} className="icon-purple" style={{ color: '#7c3aed' }} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>Multi-Semester Trends</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Enable longitudinal analysis. Uses all history to detect performance trends, grade progression, and long-term risk patterns.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const handleReset = async () => {
        if (window.confirm("Are you sure? This will DELETE ALL student and risk data.")) {
            try {
                setLoading(true);
                await api.resetDatabase();
                setStatus({ type: 'success', message: 'System Reset: All data cleared.' });
                setAnalysisMode(null); // Return to scope selection
            } catch (err) {
                setStatus({ type: 'error', message: "Reset failed" });
            } finally {
                setLoading(false);
            }
        }
    };

    // Upload Screen
    return (
        <div className="view-container">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', justifyContent: 'space-between' }}>
                <button
                    onClick={() => { setAnalysisMode(null); setStatus({ type: '', message: '' }); setMasterFile(null); }}
                    style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.9rem', padding: 0 }}
                >
                    &larr; Change Analysis Scope
                </button>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`badge ${analysisMode === 'current' ? 'blue' : 'purple'}`} style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                        {analysisMode === 'current' ? 'Scope: Latest Sem' : 'Scope: All Records'}
                    </span>
                    <button
                        onClick={handleReset}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', height: '30px', padding: '0 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                        Reset Data
                    </button>
                </div>
            </div>

            <h2 className="view-title">
                {analysisMode === 'current' ? 'Current Semester Import' : 'Multi-Semester Trend Import'}
            </h2>

            <div className="import-grid" style={{ maxWidth: '800px' }}>
                <div className="import-card">
                    <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        {analysisMode === 'current' ? <FileText size={24} className="icon-blue" /> : <History size={24} className="icon-purple" />}
                        <h3 style={{ margin: 0 }}>Master Data Upload (CSV)</h3>
                    </div>

                    <p className="card-desc" style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        Upload the comprehensive student CSV. The system will process it based on the <strong>{analysisMode === 'current' ? 'Current Semester' : 'Multi-Semester'}</strong> scope.
                    </p>

                    {status.message && (
                        <div className={`status-banner ${status.type}`} style={{ marginBottom: '1.5rem' }}>
                            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{status.message}</span>
                        </div>
                    )}

                    <div className="requirements" style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                        <strong>Required Columns:</strong> roll_number, name, email, course, semester, subject_name, marks_obtained, total_marks, attendance_percentage
                        {analysisMode === 'current' && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>, subject_credits</span>}
                        {analysisMode === 'multi' && <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>, cgpa</span>}
                    </div>

                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                    </div>

                    <button
                        className="upload-btn primary"
                        style={{ background: analysisMode === 'multi' ? '#7c3aed' : undefined, marginTop: '1rem', width: '100%', padding: '0.8rem' }}
                        onClick={handleMasterUpload}
                        disabled={loading || !masterFile}
                    >
                        {loading ? 'Processing Analysis...' : `Analyze ${analysisMode === 'current' ? 'Snapshot' : 'Trends'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ImportView;
