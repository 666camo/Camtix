import api from './api';

const bookingService = {
  getAllBookings: async () => {
    const response = await api.get('/api/bookings');
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

  getBookingsByUserId: async (userId) => {
    const response = await api.get(`/api/bookings/user/${userId}`);
    return response.data;
  }
};

export default bookingService;
