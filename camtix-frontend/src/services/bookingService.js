import api from './api';

const bookingService = {
  getAllBookings: async (params) => {
    const response = await api.get('/api/bookings', { params });
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  patchBooking: async (id, updates) => {
    const response = await api.patch(`/api/bookings/${id}`, updates);
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/api/bookings/${id}`);
    return response.data;
  },

  getBookingsByUserId: async (userId) => {
    const response = await api.get(`/api/bookings/user/${userId}`);
    return response.data;
  }
};

export default bookingService;
