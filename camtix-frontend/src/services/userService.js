import api from './api';

const userService = {
  getAllUsers: async (page, size) => {
    let url = '/api/users';
    if (page !== undefined && size !== undefined) {
      url += `?page=${page}&size=${size}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  banUser: async (id) => {
    const response = await api.put(`/api/users/${id}/ban`);
    return response.data;
  },

  unbanUser: async (id) => {
    const response = await api.put(`/api/users/${id}/unban`);
    return response.data;
  },

  getAllVisitors: async () => {
    const response = await api.get('/api/visitors');
    return response.data;
  },

  logVisitor: async (activity) => {
    try {
      const response = await api.post('/api/visitors', { activity });
      return response.data;
    } catch (error) {
      console.error('Failed to log visitor:', error);
      // Fail silently to not disrupt user experience
      return null;
    }
  },
};

export default userService;
