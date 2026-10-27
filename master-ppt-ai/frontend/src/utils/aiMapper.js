/**
 * AI Result to Slide Mapper - Master PPT AI
 * Memetakan respons AI yang memuat Auto Layout Design System (layoutId & pointCount)
 * ke struktur state slide lengkap dengan koordinat placeholder konkret dan tipografi adaptif.
 */

import { renderLayout, applyLayoutToSlide } from './layoutRenderer';

/**
 * Map AI generation response to slide data structure used across the application
 * @param {Object} aiResult - { slides, designRecommendation }
 * @param {Object} customColors - { primary, secondary, accent } (optional)
 * @returns {Array<Object>} - Array of slide objects ready for preview and export
 */
export function mapAIResultToSlides(aiResult, customColors) {
  const { slides = [], designRecommendation = {} } = aiResult || {};

  const fonts = designRecommendation.fonts || {
    heading: 'Montserrat',
    body: 'Open Sans',
    rationale: 'Kombinasi font profesional dan modern.',
  };

  const colors = designRecommendation.colors || {
    primary: '#2563EB',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    rationale: 'Palet warna seimbang dan harmonis.',
  };

  const themeConfig = {
    fonts,
    colors: {
      primary: customColors?.primary || colors.primary || '#2563EB',
      secondary: customColors?.secondary || colors.secondary || '#1E40AF',
      accent: customColors?.accent || colors.accent || '#F59E0B',
    },
  };

  return slides.map((aiSlide, index) => {
    const slideNumber = aiSlide.slideNumber || index + 1;
    const rawContent = Array.isArray(aiSlide.content) ? aiSlide.content : [];

    // Tentukan layoutId jika belum ada atau default
    let layoutId = aiSlide.layoutId;
    if (!layoutId) {
      if (index === 0 || aiSlide.slideType === 'cover') {
        layoutId = index % 2 === 1 ? 'cover-front-editorial' : 'cover-front';
      } else if (index === slides.length - 1 || aiSlide.slideType === 'closing') {
        layoutId = (slides.length % 2 === 0) ? 'cover-back' : 'cover-back-statement';
      } else if (index === 1 && slides.length >= 4 && (aiSlide.slideType === 'agenda' || /agenda|daftar isi/i.test(aiSlide.title || ''))) {
        layoutId = 'table-of-contents';
      } else if (aiSlide.slideType === 'chart') {
        layoutId = (rawContent.length === 3 && index % 2 === 1) ? 'chart-stat' : 'chart';
      } else if (aiSlide.slideType === 'testimonial') {
        layoutId = (rawContent.length >= 3) ? 'testimonial-cards' : 'testimonial';
      } else if (rawContent.length === 1) {
        layoutId = (index % 2 === 0) ? 'one-point' : 'one-point-split';
      } else if (rawContent.length === 2) {
        layoutId = (index % 2 === 0) ? 'two-points' : 'two-points-horizontal';
      } else if (rawContent.length === 3) {
        const cycle = index % 3;
        layoutId = cycle === 0 ? 'three-points' : cycle === 1 ? 'three-points-horizontal' : 'three-points-timeline';
      } else if (rawContent.length === 4) {
        layoutId = (index % 2 === 0) ? 'four-points' : 'four-points-steps';
      } else if (rawContent.length === 5) {
        layoutId = (index % 2 === 0) ? 'five-points' : 'five-points-timeline';
      } else {
        layoutId = (index % 2 === 0) ? 'six-points' : 'six-points-columns';
      }
    }

    // Bangun placeholder sementara dari aiSlide
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

    // Terapkan layout konkret menggunakan renderer
    return applyLayoutToSlide(baseSlide, layoutId, themeConfig);
  });
}

export default {
  mapAIResultToSlides,
};
