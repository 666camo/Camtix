import api from './api';

const paymentService = {
  getPaymentMethods: async () => {
    const response = await api.get('/api/payment-methods', {
      params: { activeOnly: true }
    });
    return response.data;
  },

  getAllPaymentMethodsAdmin: async (params) => {
    const response = await api.get('/api/payment-methods', {
      params: { activeOnly: false, ...params }
    });
    return response.data;
  },

  getPaymentMethodById: async (id) => {
    const response = await api.get(`/api/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (data) => {
    const response = await api.post('/api/payment-methods', data);
    return response.data;
  },

  updatePaymentMethod: async (id, data) => {
    const response = await api.put(`/api/payment-methods/${id}`, data);
    return response.data;
  },

  patchPaymentMethod: async (id, updates) => {
    const response = await api.patch(`/api/payment-methods/${id}`, updates);
    return response.data;
  },

  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/api/payment-methods/${id}`);
    return response.data;
  },

  getPaymentByBookingId: async (bookingId) => {
    const response = await api.get(`/api/payments/booking/${bookingId}`);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await api.post('/api/payments', paymentData);
    return response.data;
  },

  uploadPaymentProof: async (paymentId, paymentProof) => {
    const response = await api.put(`/api/payments/${paymentId}/upload-proof`, { paymentProof });
    return response.data;
  },

  resendETicketEmail: async (bookingId) => {
    const response = await api.post(`/api/payments/${bookingId}/resend-ticket`);
    return response.data;
  },

  // ── Admin ────────────────────────────────────────────────────────
  getAllPayments: async (params) => {
    const response = await api.get('/api/payments', { params });
    return response.data;
  },

  verifyPayment: async (id, adminNote = '') => {
    const response = await api.put(`/api/payments/${id}/verify`, { adminNote });
    return response.data;
  },

  rejectPayment: async (id, adminNote) => {
    const response = await api.put(`/api/payments/${id}/reject`, { adminNote });
    return response.data;
  },
};

export default paymentService;
