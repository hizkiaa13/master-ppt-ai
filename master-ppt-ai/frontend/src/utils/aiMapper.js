/**
 * AI Mapper - Maps AI-generated content to slide format for the editor
 * Preserves layoutId, layoutReason, pointCount from AI response
 * Supports 189 extended catalog layouts + 25 legacy layouts
 */

import { applyLayoutToSlide, LAYOUT_DEFINITIONS } from './layoutRenderer.js';
import { FULL_LAYOUT_CATALOG, getLayoutById, LAYOUT_ALIASES } from './layoutCatalog.js';

/**
 * Check if a layoutId exists in either definitions or full catalog
 */
function isValidLayoutId(layoutId) {
  if (LAYOUT_DEFINITIONS[layoutId]) return true;
  if (FULL_LAYOUT_CATALOG && FULL_LAYOUT_CATALOG[layoutId]) return true;
  if (LAYOUT_ALIASES && LAYOUT_ALIASES[layoutId]) return true;
  return false;
}

/**
 * Resolve layoutId to valid registered layout
 */
function resolveLayout(layoutId) {
  if (LAYOUT_DEFINITIONS[layoutId]) return layoutId;
  if (LAYOUT_ALIASES[layoutId]) return LAYOUT_ALIASES[layoutId];
  return null;
}

/**
 * Map AI result to slides array for the editor
 * @param {Object} aiResult - The AI result object { slides, designRecommendation }
 * @returns {Array} Mapped slides array ready for the editor
 */
export function mapAIResultToSlides(aiResult) {
  if (!aiResult) return [];

  const slides = aiResult.slides || [];
  const designRec = aiResult.designRecommendation || {};
  const fonts = designRec.fonts || {};
  const layoutsInfo = designRec.layouts || [];

  if (!Array.isArray(slides) || slides.length === 0) {
    console.warn('No slides found in AI result');
    return [];
  }

  const totalSlides = slides.length;

  return slides.map((slide, index) => {
    const slideNumber = slide.slideNumber || index + 1;
    const isFirst = index === 0;
    const isLast = index === totalSlides - 1;

    // Determine slideType
    let slideType = slide.slideType || 'content';
    if (isFirst && !slide.slideType) slideType = 'cover';
    if (isLast && !slide.slideType) slideType = 'closing';

    // Determine layoutId - prefer AI's choice, then infer
    let layoutId = slide.layoutId || '';
    let originalCatalogLayoutId = layoutId; // preserve original for metadata
    
    if (!layoutId) {
      if (isFirst || slideType === 'cover') {
        layoutId = 'cover-front';
      } else if (isLast || slideType === 'closing') {
        layoutId = 'cover-back';
      } else if (slideType === 'agenda' || /daftar isi|agenda|table of contents/i.test(slide.title || '')) {
        layoutId = 'table-of-contents';
      } else if (slideType === 'chart') {
        layoutId = 'chart';
      } else if (slideType === 'testimonial') {
        layoutId = 'testimonial';
      } else {
        // Based on content count
        const content = Array.isArray(slide.content) ? slide.content : [];
        const pCount = content.length;
        if (pCount <= 1) layoutId = 'one-point';
        else if (pCount === 2) layoutId = 'two-points';
        else if (pCount === 3) layoutId = 'three-points';
        else if (pCount === 4) layoutId = 'four-points';
        else if (pCount === 5) layoutId = 'five-points';
        else layoutId = 'six-points';
      }
    }

    // Resolve layout for rendering - support all 189 catalog layouts + aliases
    let renderLayoutId = layoutId;
    if (!LAYOUT_DEFINITIONS[renderLayoutId]) {
      if (LAYOUT_ALIASES[renderLayoutId] && LAYOUT_DEFINITIONS[LAYOUT_ALIASES[renderLayoutId]]) {
        renderLayoutId = LAYOUT_ALIASES[renderLayoutId];
      } else {
        const fallbackMap = {
          'cover-front-editorial': 'cover-front',
          'cover-back-statement': 'cover-back',
          'one-point-split': 'one-point',
          'two-points-horizontal': 'two-points',
          'three-points-horizontal': 'three-points',
          'three-points-timeline': 'three-points',
          'four-points-steps': 'four-points',
          'five-points-timeline': 'five-points',
          'six-points-columns': 'six-points',
          'chart-stat': 'chart',
          'testimonial-cards': 'testimonial',
        };
        renderLayoutId = fallbackMap[renderLayoutId] || 'three-points';
      }
    }
    layoutId = renderLayoutId;

    // Build theme config for applyLayoutToSlide
    const themeConfig = {
      primary: '#000000',
      secondary: '#1F2937',
      accent: '#000000',
      bg: '#FFFFFF',
      fonts: {
        heading: fonts.heading || 'Montserrat',
        body: fonts.body || 'Open Sans',
      },
    };

    // Build temp slide for applyLayoutToSlide
    const tempSlide = {
      slideNumber,
      slideType,
      layoutId,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      content: Array.isArray(slide.content) ? slide.content : [],
      pointCount: slide.pointCount || (Array.isArray(slide.content) ? slide.content.length : 0),
      layoutReason: slide.layoutReason || '',
    };

    // Apply layout to get placeholders
    const applied = applyLayoutToSlide(tempSlide, layoutId, themeConfig);

    return {
      ...applied,
      slideNumber,
      slideType,
      layoutId,
      catalogLayoutId: originalCatalogLayoutId, // preserve original catalog ID
      pointCount: tempSlide.pointCount,
      layoutReason: slide.layoutReason || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      content: tempSlide.content,
      rawAIData: slide,
    };
  });
}

export default { mapAIResultToSlides };
