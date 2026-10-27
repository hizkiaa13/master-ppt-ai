import api from './api';

/**
 * Draft API service - handles all communication with /api/drafts endpoints
 */
export const draftService = {
  /**
   * Create a new draft
   */
  create: async (data) => {
    const response = await api.post('/drafts', data);
    return response.data;
  },

  /**
   * Get all drafts for the current user
   */
  getAll: async () => {
    const response = await api.get('/drafts');
    return response.data;
  },

  /**
   * Get a single draft by ID (includes full slide data)
   */
  getById: async (id) => {
    const response = await api.get(`/drafts/${id}`);
    return response.data;
  },

  /**
   * Update an existing draft
   */
  update: async (id, data) => {
    const response = await api.put(`/drafts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a draft
   */
  delete: async (id) => {
    const response = await api.delete(`/drafts/${id}`);
    return response.data;
  },

  /**
   * Resume draft
   */
  resume: async (id) => {
    const response = await api.post(`/drafts/${id}/resume`);
    return response.data;
  },

  /**
   * Save draft - creates new if no id, updates if id provided
   */
  save: async (id, data) => {
    if (id) {
      return draftService.update(id, data);
    }
    return draftService.create(data);
  },
};

// Named exports matching requirement signatures
export const saveDraft = (id, data) => draftService.save(id, data);
export const getDrafts = () => draftService.getAll();
export const getDraftById = (id) => draftService.getById(id);
export const deleteDraft = (id) => draftService.delete(id);
export const resumeDraft = (id) => draftService.resume(id);
export default draftService;
