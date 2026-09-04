import api from './api';

const eventService = {
  // ── Events ───────────────────────────────────────────
  getAllEvents: async () => {
    const response = await api.get('/api/events');
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  },

  getEventBySlug: async (slug) => {
    const response = await api.get(`/api/events/slug/${slug}`);
    return response.data;
  },

  searchEvents: async (params) => {
    const response = await api.get('/api/events/search', { params });
    return response.data;
  },

  createEvent: async (data) => {
    const response = await api.post('/api/events', data);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await api.put(`/api/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/api/events/${id}`);
    return response.data;
  },

  // ── Tickets ──────────────────────────────────────────
  getTicketsByEventId: async (eventId) => {
    const response = await api.get(`/api/events/${eventId}/tickets`);
    return response.data;
  },

  getAllTickets: async () => {
    const response = await api.get('/api/tickets');
    return response.data;
  },

  createTicket: async (data) => {
    const response = await api.post('/api/tickets', data);
    return response.data;
  },

  updateTicket: async (id, data) => {
    const response = await api.put(`/api/tickets/${id}`, data);
    return response.data;
  },

  deleteTicket: async (id) => {
    const response = await api.delete(`/api/tickets/${id}`);
    return response.data;
  },
};

export default eventService;
