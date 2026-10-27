import api from './api';

export const pptxService = {
  async generate(payload) {
    // payload: { themeId, customTheme: { title, description }, slideCount, customColors }
    const res = await api.post('/pptx/generate', payload);
    return res.data;
  },

  async getPreview(masterId) {
    const res = await api.get(`/pptx/preview/${masterId}`);
    return res.data;
  },

  async updateSlide(masterId, slideData) {
    const res = await api.put(`/pptx/slide/${masterId}`, slideData);
    return res.data;
  },

  async finalize(masterId, payload = {}) {
    const res = await api.post(`/pptx/finalize/${masterId}`, payload);
    return res.data;
  },

  async download(masterId, fileName, isFinal = false) {
    const res = await api.get(`/pptx/download/${masterId}${isFinal ? '?final=true' : ''}`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'master-ppt.pptx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getHistory() {
    const res = await api.get('/pptx/history');
    return res.data;
  },
};

export const themeService = {
  async getAll() {
    const res = await api.get('/themes');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/themes/${id}`);
    return res.data;
  },

  async getRecommendations(id, customizations = {}) {
    const res = await api.post(`/themes/${id}/recommendations`, customizations);
    return res.data;
  },
};

export const userService = {
  async getProfile() {
    const res = await api.get('/user/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/user/profile', data);
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/user/password', data);
    return res.data;
  },
};
