import apiClient from './client';

export const filesAPI = {
    // Upload file with progress tracking
    uploadFile: async (file, metadata = {}, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        // Add metadata
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        const response = await apiClient.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data;
    },

    // Upload multiple files
    uploadMultipleFiles: async (files, metadata = {}, onProgress) => {
        const formData = new FormData();

        files.forEach(file => {
            formData.append('files', file);
        });

        // Add metadata
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        const response = await apiClient.post('/files/upload-multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
        });

        return response.data;
    },

    // Get file by ID
    getFile: async (id) => {
        const response = await apiClient.get(`/files/${id}`);
        return response.data;
    },

    // Download file
    downloadFile: async (id, filename) => {
        const response = await apiClient.get(`/files/${id}/download`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || 'download');
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response.data;
    },

    // Get signed URL for file
    getFileUrl: async (id) => {
        const response = await apiClient.get(`/files/${id}/url`);
        return response.data;
    },

    // Delete file
    deleteFile: async (id) => {
        const response = await apiClient.delete(`/files/${id}`);
        return response.data;
    },

    // Get user's files
    getFiles: async (params = {}) => {
        const response = await apiClient.get('/files', { params });
        return response.data;
    },
};

export default filesAPI;
