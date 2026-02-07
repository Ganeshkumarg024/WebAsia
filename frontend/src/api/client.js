import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 30000
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('accessToken');
        // Only add token if it's our API and a token exists
        // This prevents forwarding tokens to external URLs like Cloudinary on redirects
        const isApiUrl = !config.url.startsWith('http') || config.url.startsWith(import.meta.env.VITE_API_URL || 'http://localhost:8080/api');

        if (token && isApiUrl) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        // Only attempt refresh if the request was to our own API
        const isApiUrl = !originalRequest.url.startsWith('http') || originalRequest.url.startsWith(import.meta.env.VITE_API_URL || 'http://localhost:8080/api');

        if (error.response?.status === 401 && !originalRequest._retry && isApiUrl) {
            originalRequest._retry = true;

            try {
                const refreshToken = sessionStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // No refresh token, redirect to login
                    console.warn('No refresh token available, redirecting to login');
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Try to refresh the token
                console.log('Attempting to refresh token...');
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Store new tokens
                sessionStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    sessionStorage.setItem('refreshToken', newRefreshToken);
                }

                console.log('Token refreshed successfully');

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                console.error('Token refresh failed:', refreshError);
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'An error occurred';
            return Promise.reject({
                message: errorMessage,
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject({
                message: 'No response from server. Please check your connection.',
                status: 0
            });
        } else {
            // Something else happened
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0
            });
        }
    }
);

export default apiClient;
