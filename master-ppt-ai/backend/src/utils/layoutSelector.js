/**
 * Auto-Select Layout Engine - Master PPT AI
 * Memilih tata letak (layout) secara cerdas dan variatif.
 * Mendukung: comparison, steps, image-text, chart, testimonial + validasi variasi.
 */

const { LAYOUT_TEMPLATES } = require('./layoutTemplates');

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

/**
 * Memilih layout otomatis yang variatif berdasarkan posisi, tipe, judul, dan jumlah poin
 */
function selectLayout(slide, totalSlides = 5, index = 0) {
  const slideNum = slide.slideNumber || index + 1;
  const isFirstSlide = slideNum === 1 || index === 0;
  const isLastSlide = slideNum === totalSlides || (totalSlides > 1 && index === totalSlides - 1);
  const isSecondSlide = slideNum === 2 || index === 1;

  // 1. Slide Pertama (Cover Depan)
  if (isFirstSlide || slide.slideType === 'cover' || slide.slideType === 'cover-front') {
    return (index % 2 === 1) ? 'cover-front-editorial' : 'cover-front';
  }

  // 2. Slide Terakhir (Cover Belakang)
  if (isLastSlide || slide.slideType === 'closing' || slide.slideType === 'cover-back') {
    return (totalSlides % 2 === 0) ? 'cover-back' : 'cover-back-statement';
  }

  // 3. Slide Kedua (Daftar Isi / Agenda jika total slide >= 4)
  if (isSecondSlide && totalSlides >= 4 && (slide.slideType === 'agenda' || /agenda|daftar isi|ikhtisar|topik|table of contents/i.test(slide.title || ''))) {
    return 'table-of-contents';
  }

  // 4. Deteksi berdasarkan judul - COMPARISON
  if (isComparisonCandidate(slide)) {
    return 'comparison';
  }

  // 5. Deteksi berdasarkan judul - STEPS
  if (isStepsCandidate(slide)) {
    return 'steps';
  }

  // 6. Deteksi berdasarkan judul - IMAGE-TEXT
  if (isImageTextCandidate(slide)) {
    return 'image-text';
  }

  // 7. Deteksi Chart & Data
  if (slide.slideType === 'chart' || isChartCandidate(slide)) {
    const pCount = getPointCount(slide);
    return (pCount === 3 && index % 2 === 1) ? 'chart-stat' : 'chart';
  }

  // 8. Deteksi Testimoni
  if (slide.slideType === 'testimonial' || isTestimonialCandidate(slide)) {
    const pCount = getPointCount(slide);
    return (pCount >= 3) ? 'testimonial-cards' : 'testimonial';
  }

  // 9. Deteksi Intro/Pendahuluan → one-point
  if (isIntroCandidate(slide)) {
    return (index % 2 === 0) ? 'one-point' : 'one-point-split';
  }

  // 10. Deteksi Kesimpulan → one-point
  if (isConclusionCandidate(slide)) {
    return 'one-point';
  }

  // 11. Deteksi multi-point keywords → three/four-points
  if (isMultiPointCandidate(slide)) {
    const pCount = getPointCount(slide);
    if (pCount >= 4) return (index % 2 === 0) ? 'four-points' : 'four-points-steps';
    if (pCount === 3) return (index % 2 === 0) ? 'three-points' : 'three-points-horizontal';
    return 'three-points';
  }

  // 12. Pemilihan Berbasis Jumlah Poin dengan Variasi
  const rawPointCount = getPointCount(slide);

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

  if (layoutId.startsWith('cover-front')) return 'Slide pembuka presentasi';
  if (layoutId.startsWith('cover-back')) return 'Slide penutup presentasi';
  if (layoutId === 'table-of-contents') return 'Daftar isi untuk navigasi presentasi';
  if (layoutId === 'comparison') return `Slide ini membandingkan dua hal: "${slide.title}"`;
  if (layoutId === 'steps') return `Slide ini menampilkan tahapan/proses: "${slide.title}"`;
  if (layoutId === 'image-text') return `Slide ini menampilkan konten visual: "${slide.title}"`;
  if (layoutId.includes('chart')) return `Slide ini menampilkan data/statistik: "${slide.title}"`;
  if (layoutId.includes('testimonial')) return `Slide ini menampilkan testimoni/kutipan`;

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
  LAYOUT_TEMPLATES,
};
