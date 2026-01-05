import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PredictiveModelsView = () => {
    // Mock data for Model Accuracy
    const modelPerformance = [
        { name: 'Risk Prediction', accuracy: 0.88, precision: 0.85, recall: 0.90 },
        { name: 'Grade Forecasting', accuracy: 0.92, precision: 0.89, recall: 0.94 },
    ];

    return (
        <div className="view-container">
            <h2 className="view-title">Predictive Models</h2>

            <div className="charts-grid">
                <div className="chart-card" style={{ maxWidth: '800px' }}>
                    <h3>Model Performance Metrics</h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        Evaluating the accuracy of our current machine learning models on the validation set.
                    </p>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={modelPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Legend />
                            <Bar dataKey="accuracy" fill="#6366f1" name="Accuracy" />
                            <Bar dataKey="precision" fill="#10b981" name="Precision" />
                            <Bar dataKey="recall" fill="#f59e0b" name="Recall" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Model Information</h3>
                    <div className="model-info">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Risk Prediction Model</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                <strong>Algorithm:</strong> Random Forest Classifier<br />
                                <strong>Features:</strong> Attendance %, Avg Marks, Submission Latency<br />
                                <strong>Status:</strong> <span style={{ color: '#10b981' }}>Active</span>
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Grade Forecasting Model</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                <strong>Algorithm:</strong> Linear Regression<br />
                                <strong>Features:</strong> Mid-term Scores, Attendance, Assignment Grades<br />
                                <strong>Status:</strong> <span style={{ color: '#10b981' }}>Active</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PredictiveModelsView;
