import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Movie APIs
export const movieAPI = {
  getMovies: (params) => api.get('/movies', { params }),
  getFeatured: () => api.get('/movies/featured'),
  getById: (id) => api.get(`/movies/${id}`),
  getGenres: () => api.get('/movies/genres'),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`)
};

// Showtime APIs
export const showtimeAPI = {
  getShowtimes: (params) => api.get('/showtimes', { params }),
  getById: (id) => api.get(`/showtimes/${id}`),
  getSeats: (id) => api.get(`/showtimes/${id}/seats`),
  getScreens: () => api.get('/showtimes/screens/all'),
  create: (data) => api.post('/showtimes', data),
  delete: (id) => api.delete(`/showtimes/${id}`)
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getAllAdmin: () => api.get('/bookings/admin/all')
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users')
};

export default api;
