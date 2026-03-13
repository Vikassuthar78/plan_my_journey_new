import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          localStorage.setItem('access_token', res.data.access_token);
          originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
          return API(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  signup: (data) => API.post('/auth/signup', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Customer
export const customerAPI = {
  getDashboard: () => API.get('/customer/dashboard'),
  getTrips: (params) => API.get('/customer/trips', { params }),
  getTripDetail: (id) => API.get(`/customer/trips/${id}`),
  createTrip: (data) => API.post('/customer/trips', data),
  updateTrip: (id, data) => API.put(`/customer/trips/${id}`, data),
  addReview: (id, data) => API.post(`/customer/trips/${id}/review`, data),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getCustomers: (params) => API.get('/admin/customers', { params }),
  getGuides: (params) => API.get('/admin/guides', { params }),
  getAllBookings: (params) => API.get('/admin/bookings', { params }),
  getAllTrips: (params) => API.get('/admin/trips', { params }),
  assignGuide: (tripId, guideId) => API.put(`/admin/trips/${tripId}/assign-guide`, { guide_id: guideId }),
  updateTripStatus: (tripId, status) => API.put(`/admin/trips/${tripId}/status`, { status }),
  cancelBooking: (id, reason) => API.put(`/admin/bookings/${id}/cancel`, { reason }),
  processRefund: (id, amount) => API.post(`/admin/bookings/${id}/refund`, { amount }),
  // Destinations CRUD
  getDestinations: (params) => API.get('/admin/destinations', { params }),
  createDestination: (data) => API.post('/admin/destinations', data),
  updateDestination: (id, data) => API.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id) => API.delete(`/admin/destinations/${id}`),
  // Cities CRUD
  getCities: (params) => API.get('/admin/cities', { params }),
  createCity: (data) => API.post('/admin/cities', data),
  updateCity: (id, data) => API.put(`/admin/cities/${id}`, data),
  deleteCity: (id) => API.delete(`/admin/cities/${id}`),
  // Attractions CRUD
  getAttractions: (params) => API.get('/admin/attractions', { params }),
  createAttraction: (data) => API.post('/admin/attractions', data),
  updateAttraction: (id, data) => API.put(`/admin/attractions/${id}`, data),
  deleteAttraction: (id) => API.delete(`/admin/attractions/${id}`),
  // Hotels CRUD
  getHotels: (params) => API.get('/admin/hotels', { params }),
  createHotel: (data) => API.post('/admin/hotels', data),
  updateHotel: (id, data) => API.put(`/admin/hotels/${id}`, data),
  deleteHotel: (id) => API.delete(`/admin/hotels/${id}`),
  getAuditLogs: (params) => API.get('/admin/audit-logs', { params }),
};

// Guide
export const guideAPI = {
  getDashboard: () => API.get('/guide/dashboard'),
  getTrips: (params) => API.get('/guide/trips', { params }),
  getTripDetail: (id) => API.get(`/guide/trips/${id}`),
  updateTripStatus: (id, status) => API.put(`/guide/trips/${id}/status`, { status }),
  reportIssue: (id, data) => API.post(`/guide/trips/${id}/report-issue`, data),
  getNotifications: () => API.get('/guide/notifications'),
  getSchedule: () => API.get('/guide/schedule'),
  markNotificationsRead: (ids) => API.put('/guide/notifications/read', ids ? { ids } : {}),
};

// Destinations
export const destinationsAPI = {
  getStates: () => API.get('/destinations/states'),
  getCities: (stateId) => API.get(`/destinations/states/${stateId}/cities`),
  getAttractions: (cityId, params) => API.get(`/destinations/cities/${cityId}/attractions`, { params }),
  getHotels: (cityId, params) => API.get(`/destinations/cities/${cityId}/hotels`, { params }),
  search: (q) => API.get('/destinations/search', { params: { q } }),
};

// Bookings
export const bookingsAPI = {
  create: (data) => API.post('/bookings/', data),
  getById: (id) => API.get(`/bookings/${id}`),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
};

// Payments
export const paymentsAPI = {
  process: (data) => API.post('/payments/process', data),
  history: () => API.get('/payments/history'),
  getById: (id) => API.get(`/payments/${id}`),
};

export default API;
