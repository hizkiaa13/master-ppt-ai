import api from './api';

/**
 * Generate presentation content and design recommendations using AI (Base Master Hitam-Putih)
 * @param {Object} payload - { title, description, outputLanguage }
 * @returns {Promise<Object>} - API response containing slides and designRecommendation
 */
export async function generateAIContent(payload) {
  const response = await api.post('/ai/generate', {
    title: payload.title,
    description: payload.description,
    outputLanguage: payload.outputLanguage || 'id',
    slideCount: payload.slideCount || 5,
  });
  return response.data;
}

export default {
  generateAIContent,
};
