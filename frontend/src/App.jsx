import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import StudentInsightsView from './pages/StudentInsightsView';
import ExplainabilityView from './pages/ExplainabilityView';
import InterventionView from './pages/InterventionView';
import ImportView from './pages/ImportView';
import { api } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';

import GPAView from './pages/GPAView';

// Temporary Placeholders for Views
const Placeholder = ({ title }) => (
    <div className="view-container">
        <h2 className="view-title">{title}</h2>
        <div className="empty-state">
            <p>Module loaded. Content coming soon.</p>
        </div>
    </div>
);

const App = () => {
    const [currTab, setCurrTab] = useState('dashboard');

    // Theme Management
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Clear data on page reload/open
    // Clear data on page reload/open logic removed for persistence
    // useEffect(() => {
    //     const initSession = async () => {
    //         try {
    //             await api.resetDatabase();
    //             console.log('Session initialized: Database cleared');
    //         } catch (err) {
    //             console.error('Failed to reset session:', err);
    //         }
    //     };
    //     initSession();
    // }, []);

    const renderContent = () => {
        switch (currTab) {
            case 'dashboard': return <DashboardView onNavigate={setCurrTab} />;
            case 'students': return <StudentInsightsView />;
            case 'analytics': return <ExplainabilityView />;
            case 'alerts': return <InterventionView />;
            case 'gpa': return <GPAView />;
            case 'upload': return <ImportView />;
            case 'settings': return <Placeholder title="Settings" />;
            default: return <Placeholder title="Overview" />;
        }
    };

    return (
        <ErrorBoundary>
            <div className="main-layout">
                <Sidebar activeTab={currTab} setActiveTab={setCurrTab} theme={theme} toggleTheme={toggleTheme} />
                <main className="content-area">
                    {renderContent()}
                </main>
            </div>
        </ErrorBoundary>
    );
}

export default App;
