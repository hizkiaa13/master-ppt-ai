/**
 * Auto-Select Layout Engine - Master PPT AI
 * Memilih tata letak (layout) secara cerdas dan variatif dari katalog 189 layout.
 * Mendukung: comparison, steps, image-text, chart, testimonial + validasi variasi.
 * 
 * Menggunakan layoutCatalog.js (189 layout dari Base Layout Presentasi.pdf)
 * dengan fallback ke layoutTemplates.js (25 layout legacy).
 */

let CATALOG_AVAILABLE = false;
let getCatalogLayoutsByCategory, getCatalogLayoutById, getRandomLayoutForPoints, ALL_CATALOG_LAYOUTS;

try {
  const catalog = require('./layoutCatalog');
  getCatalogLayoutsByCategory = catalog.getLayoutsByCategory;
  getCatalogLayoutById = catalog.getLayoutById;
  getRandomLayoutForPoints = catalog.getRandomLayoutForPoints;
  ALL_CATALOG_LAYOUTS = catalog.getAllLayouts();
  CATALOG_AVAILABLE = true;
} catch (e) {
  // Fallback to legacy templates if catalog not yet built
  console.warn('layoutCatalog.js not found, using legacy layoutTemplates.js');
}

const { LAYOUT_TEMPLATES } = require('./layoutTemplates');

// ═══════════════════════════════════════════════════════════════
// KEYWORD DICTIONARIES
// ═══════════════════════════════════════════════════════════════

const CHART_KEYWORDS = [
  'grafik', 'chart', 'statistik', 'persentase', 'data', 'metrik',
  'pertumbuhan', 'kinerja', 'kpi', 'roi', 'analisis data', 'target capaian',
  'growth', 'angka', 'diagram', 'perbandingan angka', 'rasio', 'metrik kinerja',
  'tren', 'trend', 'survei', 'survey', 'hasil survei', 'penjualan', 'sales'
];

const TESTIMONIAL_KEYWORDS = [
  'testimoni', 'kutipan', 'quote', 'pendapat', 'review', 'kata mereka',
  'umpan balik', 'ulasan klien', 'visi pemimpin', 'prinsip', 'customer',
  'klien kami', 'pengalaman pelanggan', 'apa kata mereka', 'testimonial'
];

const COMPARISON_KEYWORDS = [
  'perbandingan', 'comparison', 'vs', 'versus', 'dibanding', 'sebelum',
  'sesudah', 'before', 'after', 'pro kontra', 'kelebihan kekurangan',
  'tradisional vs', 'lama vs baru', 'analisis perbandingan'
];

const STEPS_KEYWORDS = [
  'langkah', 'tahapan', 'proses', 'roadmap', 'timeline', 'alur',
  'step', 'fase', 'phase', 'milestone', 'cara', 'prosedur',
  'workflow', 'implementasi', 'strategi pelaksanaan'
];

const IMAGE_TEXT_KEYWORDS = [
  'profil', 'profile', 'produk', 'product', 'visual', 'gambar',
  'foto', 'image', 'pengenalan', 'tentang kami', 'about us',
  'company profile', 'brand', 'showcase'
];

const INTRO_KEYWORDS = [
  'pendahuluan', 'pengantar', 'latar belakang', 'introduction',
  'overview', 'gambaran umum', 'konteks', 'background'
];

const CONCLUSION_KEYWORDS = [
  'kesimpulan', 'rangkuman', 'ringkasan', 'call to action',
  'conclusion', 'summary', 'penutup', 'rekomendasi akhir', 'next steps'
];

const MULTI_POINT_KEYWORDS = [
  'keunggulan', 'manfaat', 'fitur', 'benefit', 'advantage',
  'target audiens', 'strategi', 'solusi', 'pilar', 'komponen'
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getPointCount(slide) {
  if (!slide) return 0;
  if (Array.isArray(slide.content)) {
    return slide.content.filter(Boolean).length;
  }
  if (Array.isArray(slide.points)) {
    return slide.points.filter(Boolean).length;
  }
  if (typeof slide.content === 'string') {
    const lines = slide.content.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.length;
  }
  return 0;
}

function matchesKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function isChartCandidate(slide) {
  const allText = [
    slide.title || '',
    slide.subtitle || '',
    Array.isArray(slide.content) ? slide.content.join(' ') : (slide.content || ''),
    slide.description || ''
  ].join(' ');
  return matchesKeywords(allText, CHART_KEYWORDS);
}

function isTestimonialCandidate(slide) {
  const allText = [
    slide.title || '',
    slide.subtitle || '',
    Array.isArray(slide.content) ? slide.content.join(' ') : (slide.content || '')
  ].join(' ');
  return matchesKeywords(allText, TESTIMONIAL_KEYWORDS);
}

function isComparisonCandidate(slide) {
  const title = slide.title || '';
  return matchesKeywords(title, COMPARISON_KEYWORDS);
}

function isStepsCandidate(slide) {
  const title = slide.title || '';
  return matchesKeywords(title, STEPS_KEYWORDS);
}

function isImageTextCandidate(slide) {
  const title = slide.title || '';
  return matchesKeywords(title, IMAGE_TEXT_KEYWORDS);
}

function isIntroCandidate(slide) {
  const title = slide.title || '';
  return matchesKeywords(title, INTRO_KEYWORDS);
}

function isConclusionCandidate(slide) {
  const title = slide.title || '';
  return matchesKeywords(title, CONCLUSION_KEYWORDS);
}

function isMultiPointCandidate(slide) {
  const title = slide.title || '';
  return matchesKeywords(title, MULTI_POINT_KEYWORDS);
}

// ═══════════════════════════════════════════════════════════════
// RANDOM PICKER FROM CATALOG
// ═══════════════════════════════════════════════════════════════

/**
 * Track layout usage per presentation to prevent repeated layouts.
 */
const _usedLayouts = new Set();

function resetLayoutUsage() {
  _usedLayouts.clear();
}

/**
 * Pick a random layout from the catalog for a given category.
 * Avoids repeating layouts already used in this presentation session.
 */
function pickFromCatalog(category, index = 0) {
  if (!CATALOG_AVAILABLE || !getCatalogLayoutsByCategory) return null;

  const layouts = getCatalogLayoutsByCategory(category);
  if (!layouts || layouts.length === 0) return null;

  // Filter out already-used layouts
  const available = layouts.filter(l => !_usedLayouts.has(l.layoutId));
  
  // If all have been used, reset and allow any
  const pool = available.length > 0 ? available : layouts;
  
  // Use index-based rotation + randomness for variety
  const seed = (index * 7 + 13) % pool.length; // deterministic but varied
  const selected = pool[seed];
  
  if (selected) {
    _usedLayouts.add(selected.layoutId);
    return selected.layoutId;
  }
  
  return null;
}

/**
 * Pick from catalog based on point count with variety
 */
function pickByPointCount(pointCount, index = 0) {
  if (!CATALOG_AVAILABLE || !getRandomLayoutForPoints) return null;
  
  // Map point counts to catalog categories
  const categoryMap = {
    1: 'content',  // point1-pXX
    2: 'content',  // point2-pXX
    3: 'content',  // point3-pXX
    4: 'content',  // point4-pXX
    5: 'content',  // point5-pXX
    6: 'content',  // point6-pXX
  };

  // Try to get a layout from the catalog matching exact point count
  const result = getRandomLayoutForPoints(pointCount, index);
  if (result) {
    _usedLayouts.add(result);
    return result;
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN LAYOUT SELECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Memilih layout otomatis yang variatif berdasarkan posisi, tipe, judul, dan jumlah poin.
 * Menggunakan katalog 189 layout jika tersedia, fallback ke 25 layout legacy.
 */
function selectLayout(slide, totalSlides = 5, index = 0) {
  const slideNum = slide.slideNumber || index + 1;
  const isFirstSlide = slideNum === 1 || index === 0;
  const isLastSlide = slideNum === totalSlides || (totalSlides > 1 && index === totalSlides - 1);
  const isSecondSlide = slideNum === 2 || index === 1;

  // 1. Slide Pertama (Cover Depan) → dari katalog cover
  if (isFirstSlide || slide.slideType === 'cover' || slide.slideType === 'cover-front') {
    const catalogPick = pickFromCatalog('cover', index);
    if (catalogPick) return catalogPick;
    return (index % 2 === 1) ? 'cover-front-editorial' : 'cover-front';
  }

  // 2. Slide Terakhir (Cover Belakang) → dari katalog closing
  if (isLastSlide || slide.slideType === 'closing' || slide.slideType === 'cover-back') {
    const catalogPick = pickFromCatalog('closing', index);
    if (catalogPick) return catalogPick;
    return (totalSlides % 2 === 0) ? 'cover-back' : 'cover-back-statement';
  }

  // 3. Slide Kedua (Daftar Isi / Agenda jika total slide >= 4)
  if (isSecondSlide && totalSlides >= 4 && (slide.slideType === 'agenda' || /agenda|daftar isi|ikhtisar|topik|table of contents/i.test(slide.title || ''))) {
    const catalogPick = pickFromCatalog('agenda', index);
    if (catalogPick) return catalogPick;
    return 'table-of-contents';
  }

  // 4. Deteksi berdasarkan judul - COMPARISON
  if (isComparisonCandidate(slide)) {
    // Comparison → use 2-point layouts
    const catalogPick = pickByPointCount(2, index);
    if (catalogPick) return catalogPick;
    return 'comparison';
  }

  // 5. Deteksi berdasarkan judul - STEPS
  if (isStepsCandidate(slide)) {
    const catalogPick = pickByPointCount(4, index);
    if (catalogPick) return catalogPick;
    return 'steps';
  }

  // 6. Deteksi berdasarkan judul - IMAGE-TEXT
  if (isImageTextCandidate(slide)) {
    const catalogPick = pickByPointCount(1, index);
    if (catalogPick) return catalogPick;
    return 'image-text';
  }

  // 7. Deteksi Chart & Data
  if (slide.slideType === 'chart' || isChartCandidate(slide)) {
    const catalogPick = pickFromCatalog('data', index);
    if (catalogPick) return catalogPick;
    const pCount = getPointCount(slide);
    return (pCount === 3 && index % 2 === 1) ? 'chart-stat' : 'chart';
  }

  // 8. Deteksi Testimoni
  if (slide.slideType === 'testimonial' || isTestimonialCandidate(slide)) {
    const catalogPick = pickFromCatalog('quote', index);
    if (catalogPick) return catalogPick;
    const pCount = getPointCount(slide);
    return (pCount >= 3) ? 'testimonial-cards' : 'testimonial';
  }

  // 9. Deteksi Intro/Pendahuluan → one-point
  if (isIntroCandidate(slide)) {
    const catalogPick = pickByPointCount(1, index);
    if (catalogPick) return catalogPick;
    return (index % 2 === 0) ? 'one-point' : 'one-point-split';
  }

  // 10. Deteksi Kesimpulan → one-point
  if (isConclusionCandidate(slide)) {
    const catalogPick = pickByPointCount(1, index);
    if (catalogPick) return catalogPick;
    return 'one-point';
  }

  // 11. Deteksi multi-point keywords → three/four-points
  if (isMultiPointCandidate(slide)) {
    const pCount = getPointCount(slide);
    const catalogPick = pickByPointCount(pCount || 3, index);
    if (catalogPick) return catalogPick;
    if (pCount >= 4) return (index % 2 === 0) ? 'four-points' : 'four-points-steps';
    if (pCount === 3) return (index % 2 === 0) ? 'three-points' : 'three-points-horizontal';
    return 'three-points';
  }

  // 12. Pemilihan Berbasis Jumlah Poin dengan Variasi dari Katalog
  const rawPointCount = getPointCount(slide);

  // Try catalog first
  const catalogPick = pickByPointCount(rawPointCount || 3, index);
  if (catalogPick) return catalogPick;

  // Fallback to legacy layouts
  if (rawPointCount <= 1) {
    return (index % 2 === 0) ? 'one-point' : 'one-point-split';
  }
  if (rawPointCount === 2) {
    return (index % 2 === 0) ? 'two-points' : 'two-points-horizontal';
  }
  if (rawPointCount === 3) {
    const cycle = index % 3;
    if (cycle === 0) return 'three-points';
    if (cycle === 1) return 'three-points-horizontal';
    return 'three-points-timeline';
  }
  if (rawPointCount === 4) {
    return (index % 2 === 0) ? 'four-points' : 'four-points-steps';
  }
  if (rawPointCount === 5) {
    return (index % 2 === 0) ? 'five-points' : 'five-points-timeline';
  }

  return (index % 2 === 0) ? 'six-points' : 'six-points-columns';
}

function normalizePoints(points) {
  if (!Array.isArray(points)) return [];
  if (points.length <= 6) return points;
  const firstFive = points.slice(0, 5);
  const remaining = points.slice(5).join('; ');
  return [...firstFive, `Rangkuman: ${remaining}`];
}

/**
 * Validasi variasi layout berturut-turut.
 * Jika 3 slide berturut-turut memiliki layoutId yang sama, ganti layout slide ke-3.
 */
function validateConsecutiveLayouts(slides) {
  if (!Array.isArray(slides) || slides.length < 3) return slides;

  const alternativeLayouts = {
    'one-point': 'one-point-split',
    'one-point-split': 'one-point',
    'two-points': 'two-points-horizontal',
    'two-points-horizontal': 'two-points',
    'three-points': 'three-points-horizontal',
    'three-points-horizontal': 'three-points-timeline',
    'three-points-timeline': 'three-points',
    'four-points': 'four-points-steps',
    'four-points-steps': 'four-points',
    'five-points': 'five-points-timeline',
    'five-points-timeline': 'five-points',
    'six-points': 'six-points-columns',
    'six-points-columns': 'six-points',
    'chart': 'chart-stat',
    'chart-stat': 'chart',
    'testimonial': 'testimonial-cards',
    'testimonial-cards': 'testimonial',
    'comparison': 'two-points',
    'steps': 'four-points-steps',
    'image-text': 'one-point-split',
  };

  const result = [...slides];

  for (let i = 2; i < result.length; i++) {
    const prev2 = result[i - 2].layoutId;
    const prev1 = result[i - 1].layoutId;
    const current = result[i].layoutId;

    if (prev2 === prev1 && prev1 === current) {
      // Try catalog variant first
      if (CATALOG_AVAILABLE) {
        const pCount = getPointCount(result[i]);
        const catalogAlt = pickByPointCount(pCount || 3, i + 10); // offset index for variety
        if (catalogAlt && catalogAlt !== current) {
          result[i] = { ...result[i], layoutId: catalogAlt, layoutReason: `Layout diubah ke "${catalogAlt}" untuk variasi (3 berturut-turut terdeteksi)` };
          continue;
        }
      }
      
      const alt = alternativeLayouts[current];
      if (alt) {
        result[i] = { ...result[i], layoutId: alt, layoutReason: `Layout diubah dari "${current}" ke "${alt}" untuk variasi (3 berturut-turut terdeteksi)` };
      }
    }
  }

  return result;
}

/**
 * Generate layoutReason berdasarkan konteks
 */
function generateLayoutReason(slide, layoutId) {
  const title = (slide.title || '').toLowerCase();

  if (layoutId.startsWith('cover-front') || layoutId.startsWith('cover-p')) return 'Slide pembuka presentasi';
  if (layoutId.startsWith('cover-back') || layoutId.startsWith('closing-p')) return 'Slide penutup presentasi';
  if (layoutId === 'table-of-contents' || layoutId.startsWith('agenda-p')) return 'Daftar isi untuk navigasi presentasi';
  if (layoutId === 'comparison') return `Slide ini membandingkan dua hal: "${slide.title}"`;
  if (layoutId === 'steps') return `Slide ini menampilkan tahapan/proses: "${slide.title}"`;
  if (layoutId === 'image-text') return `Slide ini menampilkan konten visual: "${slide.title}"`;
  if (layoutId.includes('chart') || layoutId.startsWith('chart-p')) return `Slide ini menampilkan data/statistik: "${slide.title}"`;
  if (layoutId.includes('testimonial') || layoutId.startsWith('testi-p')) return `Slide ini menampilkan testimoni/kutipan`;

  const pCount = getPointCount(slide);
  return `Layout ${layoutId} dipilih karena slide memiliki ${pCount} poin konten`;
}

module.exports = {
  selectLayout,
  getPointCount,
  isChartCandidate,
  isTestimonialCandidate,
  isComparisonCandidate,
  isStepsCandidate,
  isImageTextCandidate,
  normalizePoints,
  validateConsecutiveLayouts,
  generateLayoutReason,
  resetLayoutUsage,
  LAYOUT_TEMPLATES,
  CATALOG_AVAILABLE,
};
