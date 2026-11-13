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
    layoutMode: payload.layoutMode || 'auto',
    layoutSelections: payload.layoutSelections || [],
  });
  return response.data;
}

/**
 * Regenerate points for a single slide when layout changes to a higher point count
 * @param {Object} payload - { masterId, slideNumber, currentLayoutId, newLayoutId, slideTitle, slideTheme, outputLanguage, existingContent, newPointCount }
 * @returns {Promise<Object>}
 */
export async function regenerateSlideContent(payload) {
  const response = await api.post('/ai/regenerate-slide', payload);
  return response.data;
}

export default {
  generateAIContent,
  regenerateSlideContent,
};
