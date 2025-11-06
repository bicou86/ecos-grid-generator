/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      throw new Error(data.error || 'Une erreur est survenue');
    } else if (error.request) {
      // Request made but no response
      throw new Error('Impossible de contacter le serveur');
    } else {
      // Something else happened
      throw new Error(error.message);
    }
  }
);

// ======================
// CLINICAL CASES API
// ======================

export const casesAPI = {
  /**
   * Get all cases with pagination and filters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/cases', { params });
    return response;
  },

  /**
   * Get a single case by ID or slug
   */
  getById: async (identifier) => {
    const response = await apiClient.get(`/cases/${encodeURIComponent(identifier)}`);
    return response;
  },

  /**
   * Search cases
   */
  search: async (query, params = {}) => {
    const response = await apiClient.get('/cases', {
      params: { search: query, ...params },
    });
    return response;
  },

  /**
   * Get distribution of cases per source
   */
  getSourceStats: async () => {
    const response = await apiClient.get('/cases/sources/stats');
    return response;
  },
};

// ======================
// CATEGORIES API
// ======================

export const categoriesAPI = {
  /**
   * Get all categories
   */
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response;
  },
};

// ======================
// SPECIALTIES API
// ======================

export const specialtiesAPI = {
  /**
   * Get all specialties
   */
  getAll: async () => {
    const response = await apiClient.get('/specialties');
    return response;
  },
};

// ======================
// STATISTICS API
// ======================

export const statsAPI = {
  /**
   * Get platform statistics
   */
  getStats: async () => {
    const response = await apiClient.get('/stats');
    return response;
  },
};

// ======================
// AUTHENTICATION API
// (To be implemented with backend)
// ======================

export const authAPI = {
  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  /**
   * Logout user
   */
  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },
};

// ======================
// USER PROGRESS API
// ======================

export const progressAPI = {
  /**
   * Get user's fiche progress
   */
  getFichesProgress: async () => {
    const response = await apiClient.get('/user/progress/fiches');
    return response;
  },

  /**
   * Update fiche progress
   */
  updateFicheProgress: async (ficheId, status) => {
    const response = await apiClient.post(`/user/progress/fiches/${ficheId}`, { status });
    return response;
  },

  /**
   * Get progress statistics
   */
  getStats: async () => {
    const response = await apiClient.get('/user/progress/stats');
    return response;
  },
};

// ======================
// BOOKMARKS API
// ======================

export const bookmarksAPI = {
  /**
   * Get user's bookmarked fiches
   */
  getFiches: async () => {
    const response = await apiClient.get('/user/bookmarks/fiches');
    return response;
  },

  /**
   * Add fiche to bookmarks
   */
  addFiche: async (ficheId) => {
    const response = await apiClient.post(`/user/bookmarks/fiches/${ficheId}`);
    return response;
  },

  /**
   * Remove fiche from bookmarks
   */
  removeFiche: async (ficheId) => {
    const response = await apiClient.delete(`/user/bookmarks/fiches/${ficheId}`);
    return response;
  },
};

// ======================
// NOTES API
// ======================

export const notesAPI = {
  /**
   * Get notes for a fiche
   */
  getFicheNotes: async (ficheId) => {
    const response = await apiClient.get(`/fiches/${ficheId}/notes`);
    return response;
  },

  /**
   * Add note to fiche
   */
  addFicheNote: async (ficheId, noteText) => {
    const response = await apiClient.post(`/fiches/${ficheId}/notes`, { noteText });
    return response;
  },

  /**
   * Update a note
   */
  updateNote: async (noteId, noteText) => {
    const response = await apiClient.put(`/notes/${noteId}`, { noteText });
    return response;
  },

  /**
   * Delete a note
   */
  deleteNote: async (noteId) => {
    const response = await apiClient.delete(`/notes/${noteId}`);
    return response;
  },
};

/**
 * Fiches API
 */
export const fichesAPI = {
  /**
   * Get all fiches with pagination and filters
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/fiches', { params });
    return response;
  },

  /**
   * Get single fiche by slug or ID
   */
  getById: async (identifier) => {
    const response = await apiClient.get(`/fiches/${identifier}`);
    return response;
  },

  /**
   * Get fiches statistics
   */
  getStats: async () => {
    const response = await apiClient.get('/fiches/stats');
    return response;
  },

  /**
   * Get fiches by type (ssp, skills, dx)
   */
  getByType: async (type, params = {}) => {
    const response = await apiClient.get(`/fiches/type/${type}`, { params });
    return response;
  },

  /**
   * Search fiches by tag
   */
  searchByTag: async (tag, params = {}) => {
    const response = await apiClient.get(`/fiches/tags/${tag}`, { params });
    return response;
  },

  /**
   * Get related fiches for a case
   */
  getRelatedToCas: async (caseId) => {
    const response = await apiClient.get(`/cases/${caseId}/fiches`);
    return response;
  },
};

// Export default API client
export default apiClient;
