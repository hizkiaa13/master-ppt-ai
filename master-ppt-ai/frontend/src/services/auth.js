import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    return this.loginWithRetry({ email, password });
  },

  async loginWithRetry(credentials, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await api.post('/auth/login', credentials);
        if (res.data.data?.token) {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
        return res.data;
      } catch (error) {
        lastError = error;
        // Jika status 429 (rate limited), tunggu sebelum retry
        if (error.response?.status === 429 && attempt < maxRetries) {
          const retryAfter = parseInt(error.response.headers['retry-after'], 10) || 3;
          console.warn(`Rate limited. Menunggu ${retryAfter} detik sebelum mencoba lagi...`);
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export const loginWithRetry = authService.loginWithRetry.bind(authService);
