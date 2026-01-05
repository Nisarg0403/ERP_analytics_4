const API_BASE = 'http://127.0.0.1:8000/api/v1';

export const api = {
    getStats: async () => {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        return res.json();
    },

    getAlerts: async (minRisk = 0.4) => {
        const res = await fetch(`${API_BASE}/dashboard/alerts?min_risk=${minRisk}`);
        return res.json();
    },

    async getStudentRecords() {
        const response = await fetch(`${API_BASE}/students/records`);
        return response.json();
    },

    async resetDatabase() {
        // Changed to match backend: ingestion router is at /api/v1, route is /reset
        const response = await fetch(`${API_BASE}/reset`, {
            method: 'DELETE',
        });
        return response.json();
    },

    getStudents: async () => {
        const res = await fetch(`${API_BASE}/students/`);
        return res.json();
    },

    uploadStudents: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload/students`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    uploadMarks: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload/marks`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    uploadMasterData: async (file, scope = 'current') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('scope', scope);
        const res = await fetch(`${API_BASE}/upload/master`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    uploadHistory: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload/history`, {
            method: 'POST',
            body: formData,
        });
        return res.json();
    },

    getTrend: async () => {
        const res = await fetch(`${API_BASE}/dashboard/trend`);
        return res.json();
    },

    importFromUrl: async (url, type) => {
        const res = await fetch(`${API_BASE}/upload/url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, type }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getStudentAnalysis: async (id) => {
        const res = await fetch(`${API_BASE}/analytics/process/${id}`, { method: 'POST' });
        return res.json();
    },

    getGPAAnalytics: async () => {
        const res = await fetch(`${API_BASE}/analytics/gpa`);
        if (!res.ok) throw new Error('Failed to fetch GPA analytics');
        return res.json();
    }
};
