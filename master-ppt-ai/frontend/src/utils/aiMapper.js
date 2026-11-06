/**
 * AI Result to Slide Mapper - Master PPT AI
 * Memetakan respons AI untuk Base Master Hitam & Putih.
 */

import { renderLayout, applyLayoutToSlide } from './layoutRenderer';

/**
 * Map AI generation response to slide data structure for Base Master (Hitam & Putih)
 * @param {Object} aiResult - { slides, designRecommendation }
 * @returns {Array<Object>} - Array of slide objects ready for preview and export
 */
export function mapAIResultToSlides(aiResult) {
  const { slides = [], designRecommendation = {} } = aiResult || {};

  const fonts = designRecommendation.fonts || {
    heading: 'Montserrat',
    body: 'Open Sans',
    rationale: 'Kombinasi font profesional dan elegan untuk master hitam-putih.',
  };

  const themeConfig = {
    fonts,
    colors: {
      primary: '#000000',
      secondary: '#1F2937',
      accent: '#000000',
    },
  };

  return slides.map((aiSlide, index) => {
    const slideNumber = aiSlide.slideNumber || index + 1;
    const rawContent = Array.isArray(aiSlide.content) ? aiSlide.content : [];

    // Tentukan layoutId jika belum ada
    let layoutId = aiSlide.layoutId;
    if (!layoutId) {
      if (index === 0 || aiSlide.slideType === 'cover') {
        layoutId = 'cover-front';
      } else if (index === slides.length - 1 || aiSlide.slideType === 'closing') {
        layoutId = 'cover-back';
      } else if (index === 1 && slides.length >= 4 && (aiSlide.slideType === 'agenda' || /agenda|daftar isi|table of contents/i.test(aiSlide.title || ''))) {
        layoutId = 'table-of-contents';
      } else if (aiSlide.slideType === 'chart') {
        layoutId = 'chart';
      } else if (aiSlide.slideType === 'testimonial') {
        layoutId = 'testimonial';
      } else if (rawContent.length === 1) {
        layoutId = 'one-point';
      } else if (rawContent.length === 2) {
        layoutId = 'two-points';
      } else if (rawContent.length === 3) {
        layoutId = 'three-points';
      } else if (rawContent.length === 4) {
        layoutId = 'four-points';
      } else if (rawContent.length === 5) {
        layoutId = 'five-points';
      } else {
        layoutId = 'six-points';
      }
    }

    const tempPlaceholders = [
      {
        id: `title-${slideNumber}`,
        type: 'text',
        name: 'Judul Slide',
        content: aiSlide.title || (index === 0 ? 'Judul Presentasi' : `Slide ${slideNumber}`),
      },
    ];

    if (aiSlide.subtitle) {
      tempPlaceholders.push({
        id: `subtitle-${slideNumber}`,
        type: 'text',
        name: 'Subjudul',
        content: aiSlide.subtitle,
      });
    }

    rawContent.forEach((cText, pIdx) => {
      tempPlaceholders.push({
        id: `point-${slideNumber}-${pIdx + 1}`,
        type: 'text',
        name: `Poin ${pIdx + 1}`,
        content: cText,
      });
    });

    const baseSlide = {
      slideNumber,
      slideType: aiSlide.slideType || 'content',
      layoutId,
      layout: layoutId,
      name: `${renderLayout(layoutId)?.name || layoutId} - ${aiSlide.title || `Slide ${slideNumber}`}`,
      placeholders: tempPlaceholders,
      background: { color: '#FFFFFF', type: 'solid' },
    };

    return applyLayoutToSlide(baseSlide, layoutId, themeConfig);
  });
}

export default {
  mapAIResultToSlides,
};
