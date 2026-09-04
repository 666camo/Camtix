import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  verifyOtp: async (email, otpCode) => {
    const response = await api.post('/api/auth/verify-otp', { email, otpCode });
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await api.post('/api/auth/resend-otp', { email });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  googleLogin: async (credential) => {
    const response = await api.post('/api/auth/google-login', { credential });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  }
};

export default authService;
