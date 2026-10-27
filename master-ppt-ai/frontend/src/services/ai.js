import api from './api';

/**
 * Generate presentation content and design recommendations using AI
 * @param {Object} payload - { title, theme, description, slideCount, customColors }
 * @returns {Promise<Object>} - API response containing slides and designRecommendation
 */
export async function generateAIContent(payload) {
  const response = await api.post('/ai/generate', payload);
  return response.data;
}

export default {
  generateAIContent,
};
