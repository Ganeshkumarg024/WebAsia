import apiClient from './client';

export const designerAPI = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        const response = await apiClient.get('/designer/dashboard/stats');
        return response.data;
    },

    // Get my tasks
    getMyTasks: async (params = {}) => {
        const response = await apiClient.get('/designer/tasks', { params });
        return response.data;
    },

    // Get task by ID
    getTaskById: async (id) => {
        const response = await apiClient.get(`/designer/tasks/${id}`);
        return response.data;
    },

    // Start task
    startTask: async (id) => {
        const response = await apiClient.post(`/designer/tasks/${id}/start`);
        return response.data;
    },

    // Submit for review
    submitForReview: async (id, notes) => {
        const response = await apiClient.post(`/designer/tasks/${id}/submit`, { notes });
        return response.data;
    },

    // Update task status
    updateTaskStatus: async (id, status, notes = null) => {
        const response = await apiClient.patch(`/designer/tasks/${id}/status`, { status, notes });
        return response.data;
    },

    // Get task statistics
    getTaskStats: async () => {
        const response = await apiClient.get('/designer/stats');
        return response.data;
    },

    // Get analytics
    getAnalytics: async (period = 'month') => {
        const response = await apiClient.get('/designer/analytics', { params: { period } });
        return response.data;
    },

    // Upload design files
    uploadDesignFiles: async (requestId, files, fileType = 'draft') => {
        const formData = new FormData();
        formData.append('requestId', requestId);
        formData.append('fileType', fileType);

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const response = await apiClient.post('/files/bulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default designerAPI;
