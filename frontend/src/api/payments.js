import apiClient from './client';

export const paymentsAPI = {
    // Create payment intent
    createPayment: async (data) => {
        const response = await apiClient.post('/payments', data);
        return response.data;
    },

    // Verify payment
    verifyPayment: async (paymentId, paymentDetails) => {
        const response = await apiClient.post(`/payments/${paymentId}/verify`, paymentDetails);
        return response.data;
    },

    // Get payment by ID
    getPayment: async (id) => {
        const response = await apiClient.get(`/payments/${id}`);
        return response.data;
    },

    // Get payment history
    getPaymentHistory: async (params = {}) => {
        const response = await apiClient.get('/payments', { params });
        return response.data;
    },

    // Download invoice
    downloadInvoice: async (paymentId) => {
        const response = await apiClient.get(`/payments/${paymentId}/invoice`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${paymentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response.data;
    },

    // Get payment methods
    getPaymentMethods: async () => {
        const response = await apiClient.get('/payments/methods');
        return response.data;
    },

    // Add payment method
    addPaymentMethod: async (methodData) => {
        const response = await apiClient.post('/payments/methods', methodData);
        return response.data;
    },

    // Delete payment method
    deletePaymentMethod: async (methodId) => {
        const response = await apiClient.delete(`/payments/methods/${methodId}`);
        return response.data;
    },

    // Set default payment method
    setDefaultPaymentMethod: async (methodId) => {
        const response = await apiClient.put(`/payments/methods/${methodId}/default`);
        return response.data;
    },
};

export default paymentsAPI;
