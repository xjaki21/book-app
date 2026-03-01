import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
};

// Books API
export const booksAPI = {
  getAll: (params = {}) => api.get('/books', { params }),
  getTrending: () => api.get('/books/trending'),
  getPopular: () => api.get('/books/popular'),
  getRecent: () => api.get('/books/recent'),
  getById: (id, userId) => api.get(`/books/${id}`, { params: { userId: userId || undefined } }),
  create: (bookData) => api.post('/books', bookData),
  update: (id, bookData) => api.put(`/books/${id}`, bookData),
  delete: (id) => api.delete(`/books/${id}`),
  like: (id) => api.post(`/books/${id}/like`),
};

// Chapters API
export const chaptersAPI = {
  getByBookId: (bookId) => api.get(`/chapters/book/${bookId}`),
  getById: (id) => api.get(`/chapters/${id}`),
  create: (bookId, chapterData) => api.post(`/chapters/book/${bookId}`, chapterData),
  update: (id, chapterData) => api.put(`/chapters/${id}`, chapterData),
  delete: (id) => api.delete(`/chapters/${id}`),
  reorder: (bookId, chapters) => api.put(`/chapters/book/${bookId}/reorder`, { chapters }),
};

// Reading List API
export const readingListAPI = {
  getByUserId: (userId, status = '') => 
    api.get(`/reading-list/user/${userId}`, { params: { status: status || undefined } }),
  getStats: (userId) => api.get(`/reading-list/user/${userId}/stats`),
  check: (userId, bookId) => api.get(`/reading-list/check/${userId}/${bookId}`),
  add: (userId, bookId, status = 'planning') => 
    api.post('/reading-list', { userId, bookId, status }),
  update: (id, data) => api.put(`/reading-list/${id}`, data),
  remove: (id) => api.delete(`/reading-list/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadCover: (file) => {
    const formData = new FormData();
    formData.append('cover', file);
    return api.post('/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadPdf: (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Users API
export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
  getBooks: (id) => api.get(`/users/${id}/books`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
};

export default api;
