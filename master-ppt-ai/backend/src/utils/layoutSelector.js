/**
 * Auto-Select Layout Engine - Master PPT AI
 * Memilih tata letak (layout) secara cerdas dan variatif berbasis "Base Layout Presentasi.pdf"
 */

const { LAYOUT_TEMPLATES } = require('./layoutTemplates');

const CHART_KEYWORDS = [
  'grafik', 'chart', 'statistik', 'persentase', 'data', 'metrik',
  'pertumbuhan', 'kinerja', 'kpi', 'roi', 'analisis data', 'target capaian',
  'growth', 'angka', 'diagram', 'perbandingan angka', 'rasio', 'metrik kinerja'
];

const TESTIMONIAL_KEYWORDS = [
  'testimoni', 'kutipan', 'quote', 'pendapat', 'review', 'kata mereka',
  'umpan balik', 'ulasan klien', 'visi pemimpin', 'prinsip', 'customer', 'klien kami'
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

function isChartCandidate(slide) {
  const allText = [
    slide.title || '',
    slide.subtitle || '',
    Array.isArray(slide.content) ? slide.content.join(' ') : (slide.content || ''),
    slide.description || ''
  ].join(' ').toLowerCase();

  const hasKeyword = CHART_KEYWORDS.some(kw => allText.includes(kw));
  const hasNumericPattern = /(\d+[\.,]?\d*%\b|\+\d+[\.,]?\d*%|\b\d+[\.,]?\d*x\b)/i.test(allText);

  return hasKeyword || hasNumericPattern;
}

function isTestimonialCandidate(slide) {
  const allText = [
    slide.title || '',
    slide.subtitle || '',
    Array.isArray(slide.content) ? slide.content.join(' ') : (slide.content || '')
  ].join(' ').toLowerCase();

  const hasQuotes = /["'“”«»]/.test(allText);
  const hasKeyword = TESTIMONIAL_KEYWORDS.some(kw => allText.includes(kw));

  return hasKeyword || (hasQuotes && allText.length < 250);
}

/**
 * Memilih layout otomatis yang variatif berdasarkan posisi, tipe, dan jumlah poin
 * Menggunakan variasi katalog Base Layout agar deck tidak monoton
 * @param {Object} slide 
 * @param {number} totalSlides 
 * @param {number} index 
 * @returns {string} layoutId
 */
function selectLayout(slide, totalSlides = 5, index = 0) {
  const slideNum = slide.slideNumber || index + 1;
  const isFirstSlide = slideNum === 1 || index === 0;
  const isLastSlide = slideNum === totalSlides || (totalSlides > 1 && index === totalSlides - 1);
  const isSecondSlide = slideNum === 2 || index === 1;

  // 1. Slide Pertama (Cover Depan)
  if (isFirstSlide || slide.slideType === 'cover' || slide.slideType === 'cover-front') {
    // Variasi: jika tema bebas/kreatif atau index ganjil gunakan editorial
    return (index % 2 === 1) ? 'cover-front-editorial' : 'cover-front';
  }

  // 2. Slide Terakhir (Cover Belakang)
  if (isLastSlide || slide.slideType === 'closing' || slide.slideType === 'cover-back') {
    // Variasi: Kontak grid vs Thank you masif terpusat
    return (totalSlides % 2 === 0) ? 'cover-back' : 'cover-back-statement';
  }

  // 3. Slide Kedua (Daftar Isi / Agenda jika total slide >= 4)
  if (isSecondSlide && totalSlides >= 4 && (slide.slideType === 'agenda' || /agenda|daftar isi|ikhtisar|topik/i.test(slide.title || ''))) {
    return 'table-of-contents';
  }

  // 4. Deteksi Chart & Data
  if (slide.slideType === 'chart' || isChartCandidate(slide)) {
    const pCount = getPointCount(slide);
    // Jika tepat 3 poin data/persentase, gunakan chart-stat (3 cincin persentase 67%)
    return (pCount === 3 && index % 2 === 1) ? 'chart-stat' : 'chart';
  }

  // 5. Deteksi Testimoni
  if (slide.slideType === 'testimonial' || isTestimonialCandidate(slide)) {
    const pCount = getPointCount(slide);
    return (pCount >= 3) ? 'testimonial-cards' : 'testimonial';
  }

  // 6. Pemilihan Berbasis Jumlah Poin dengan Variasi Katalog Base Layout
  const rawPointCount = getPointCount(slide);

  // 1 Poin: Impact Statement vs Split Kiri
  if (rawPointCount <= 1) {
    return (index % 2 === 0) ? 'one-point' : 'one-point-split';
  }

  // 2 Poin: Kolom Sejajar (A & B) vs Baris Horizontal Bergaris (01 / 02)
  if (rawPointCount === 2) {
    return (index % 2 === 0) ? 'two-points' : 'two-points-horizontal';
  }

  // 3 Poin: Tiga Kolom (01-03) vs Baris Panah (→) vs Timeline Berangkai
  if (rawPointCount === 3) {
    const cycle = index % 3;
    if (cycle === 0) return 'three-points';
    if (cycle === 1) return 'three-points-horizontal';
    return 'three-points-timeline';
  }

  // 4 Poin: Grid 2x2 Kartu Panah vs Step 1-4
  if (rawPointCount === 4) {
    return (index % 2 === 0) ? 'four-points' : 'four-points-steps';
  }

  // 5 Poin: Kartu (3 Atas + 2 Bawah) vs Rangkaian Timeline 01-05
  if (rawPointCount === 5) {
    return (index % 2 === 0) ? 'five-points' : 'five-points-timeline';
  }

  // 6 Poin atau lebih: Grid 3x2 Kartu vs 2 Kolom x 3 Baris Panah Bergaris
  return (index % 2 === 0) ? 'six-points' : 'six-points-columns';
}

function normalizePoints(points) {
  if (!Array.isArray(points)) return [];
  if (points.length <= 6) return points;

  const firstFive = points.slice(0, 5);
  const remaining = points.slice(5).join('; ');
  return [...firstFive, `Rangkuman: ${remaining}`];
}

module.exports = {
  selectLayout,
  getPointCount,
  isChartCandidate,
  isTestimonialCandidate,
  normalizePoints,
  LAYOUT_TEMPLATES,
};
