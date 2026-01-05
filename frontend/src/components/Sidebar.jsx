import React, { useState } from 'react';
import { LayoutDashboard, Users, BarChart3, AlertCircle, Upload, Sun, Moon, TrendingUp as TrendIcon } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'students', label: 'Student Insights', icon: Users },
        { id: 'analytics', label: 'Risk Logic', icon: BarChart3 },
        { id: 'gpa', label: 'GPA Analytics', icon: TrendIcon }, // Need to import TrendIcon or reuse one
        { id: 'alerts', label: 'Intervention & Action', icon: AlertCircle },
        { id: 'upload', label: 'Data Upload', icon: Upload },
    ];

    return (
        <div className="sidebar">
            <div className="logo-container">
                <div className="logo-icon">M4</div>
                <span className="logo-text">Insight AI</span>
            </div>

            <nav className="nav-menu">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="nav-item"
                style={{ marginTop: 'auto', marginBottom: '1rem' }}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className="user-profile">
                <div className="avatar">A</div>
                <div className="user-info">
                    <p className="name">Admin User</p>
                    <p className="role">Principal</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
