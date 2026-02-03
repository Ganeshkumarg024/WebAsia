import apiClient from './client';

export const requestFilesAPI = {
    // Upload single file
    uploadFile: async (requestId, file, fileCategory = 'other', fileType = 'other') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileCategory', fileCategory);
        formData.append('fileType', fileType);

        const response = await apiClient.post(
            `/request-files/request/${requestId}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    // Upload multiple files
    uploadMultipleFiles: async (requestId, files, fileCategory = 'other', fileType = 'other') => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('fileCategory', fileCategory);
        formData.append('fileType', fileType);

        const response = await apiClient.post(
            `/request-files/request/${requestId}/upload-multiple`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    },

    // Get files for a request
    getRequestFiles: async (requestId, params = {}) => {
        const response = await apiClient.get(`/request-files/request/${requestId}`, {
            params
        });
        return response.data;
    },

    // Download file
    downloadFile: async (fileId) => {
        const response = await apiClient.get(`/request-files/${fileId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Delete file
    deleteFile: async (fileId) => {
        const response = await apiClient.delete(`/request-files/${fileId}`);
        return response.data;
    }
};

export default requestFilesAPI;
