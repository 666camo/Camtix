import api from './api';

const userService = {
  getAllUsers: async (params) => {
    let config = {};
    if (typeof params === 'object' && params !== null) {
      config.params = params;
    } else if (params !== undefined) {
      config.params = { page: params };
    }
    const response = await api.get('/api/users', config);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  patchUser: async (id, updates) => {
    const response = await api.patch(`/api/users/${id}`, updates);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
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

  getAllVisitors: async (params) => {
    const response = await api.get('/api/visitors', { params });
    return response.data;
  },

  logVisitor: async (activity) => {
    try {
      const response = await api.post('/api/visitors', { activity });
      return response.data;
    } catch (error) {
      console.error('Failed to log visitor:', error);
      return null;
    }
  },
};

export default userService;
