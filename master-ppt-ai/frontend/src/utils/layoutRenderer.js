/**
 * Layout Renderer & Auto Layout Design System (Frontend)
 * Berbasis langsung dari katalog desain "Base Layout Presentasi.pdf" (One Piece Design Studio)
 * Mengubah layoutId menjadi posisi placeholder konkret dalam format persentase (0-100%).
 * 
 * Mendukung 189 layout katalog lengkap + 25 template legacy.
 */

import {
  FULL_LAYOUT_CATALOG,
  LAYOUT_ALIASES,
  FULL_LAYOUT_OPTIONS,
  CATEGORY_LABELS,
} from './layoutCatalog.js';

export const BASE_LAYOUT_DEFINITIONS = {
  // === A. COVER DEPAN ===
  'cover-front': {
    layoutId: 'cover-front',
    name: 'Cover Depan - Terpusat',
    recommendedPoints: 0,
    category: 'cover',
    variant: 'centered',
    title: { x: 8, y: 24, w: 84, h: 22, align: 'center' },
    subtitle: { x: 12, y: 49, w: 76, h: 14, align: 'center' },
    presenter: { x: 15, y: 74, w: 70, h: 10, align: 'center' },
    points: [],
  },

  'cover-front-editorial': {
    layoutId: 'cover-front-editorial',
    name: 'Cover Depan - Editorial Kiri',
    recommendedPoints: 0,
    category: 'cover',
    variant: 'editorial',
    title: { x: 6, y: 22, w: 88, h: 32, align: 'left' },
    subtitle: { x: 6, y: 66, w: 50, h: 18, align: 'left' },
    presenter: { x: 62, y: 70, w: 32, h: 14, align: 'right' },
    points: [],
  },

  // === B. DAFTAR ISI / AGENDA ===
  'table-of-contents': {
    layoutId: 'table-of-contents',
    name: 'Daftar Isi - Grid 01-06 Bergaris',
    recommendedPoints: [3, 4, 5, 6],
    category: 'agenda',
    variant: 'grid-lines',
    title: { x: 6, y: 8, w: 88, h: 12, align: 'left' },
    points: [
      { x: 6, y: 26, w: 42, h: 18, number: '01', align: 'left' },
      { x: 52, y: 26, w: 42, h: 18, number: '04', align: 'left' },
      { x: 6, y: 48, w: 42, h: 18, number: '02', align: 'left' },
      { x: 52, y: 48, w: 42, h: 18, number: '05', align: 'left' },
      { x: 6, y: 70, w: 42, h: 18, number: '03', align: 'left' },
      { x: 52, y: 70, w: 42, h: 18, number: '06', align: 'left' },
    ],
  },

  // === C. 1 POIN ===
  'one-point': {
    layoutId: 'one-point',
    name: '1 Poin - Impact Statement Terpusat',
    recommendedPoints: 1,
    category: 'content',
    variant: 'statement',
    title: { x: 8, y: 10, w: 84, h: 12, align: 'left' },
    points: [
      { x: 10, y: 28, w: 80, h: 54, align: 'left', badge: 'quote' },
    ],
  },

  'one-point-split': {
    layoutId: 'one-point-split',
    name: '1 Poin - Split Kiri & Detail',
    recommendedPoints: 1,
    category: 'content',
    variant: 'split',
    title: { x: 6, y: 14, w: 40, h: 28, align: 'left' },
    points: [
      { x: 50, y: 22, w: 44, h: 62, align: 'left' },
    ],
  },

  // === D. 2 POIN ===
  'two-points': {
    layoutId: 'two-points',
    name: '2 Poin - Kolom Sejajar (A & B)',
    recommendedPoints: 2,
    category: 'content',
    variant: 'columns',
    title: { x: 6, y: 8, w: 88, h: 12, align: 'left' },
    points: [
      { x: 6, y: 26, w: 42, h: 58, badge: 'A.', align: 'left' },
      { x: 52, y: 26, w: 42, h: 58, badge: 'B.', align: 'left' },
    ],
  },

  'two-points-horizontal': {
    layoutId: 'two-points-horizontal',
    name: '2 Poin - Baris Horizontal Bergaris',
    recommendedPoints: 2,
    category: 'content',
    variant: 'rows',
    title: { x: 6, y: 8, w: 38, h: 32, align: 'left' },
    points: [
      { x: 48, y: 16, w: 46, h: 34, number: '01.', align: 'left' },
      { x: 48, y: 54, w: 46, h: 36, number: '02.', align: 'left' },
    ],
  },

  // === E. 3 POIN ===
  'three-points': {
    layoutId: 'three-points',
    name: '3 Poin - Tiga Kolom (01, 02, 03)',
    recommendedPoints: 3,
    category: 'content',
    variant: 'columns',
    title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
    points: [
      { x: 5, y: 26, w: 28, h: 58, number: '01', align: 'left' },
      { x: 36, y: 26, w: 28, h: 58, number: '02', align: 'left' },
      { x: 67, y: 26, w: 28, h: 58, number: '03', align: 'left' },
    ],
  },

  'three-points-horizontal': {
    layoutId: 'three-points-horizontal',
    name: '3 Poin - Baris Panah (→)',
    recommendedPoints: 3,
    category: 'content',
    variant: 'rows',
    title: { x: 6, y: 8, w: 38, h: 32, align: 'left' },
    points: [
      { x: 48, y: 12, w: 46, h: 24, badge: 'arrow', align: 'left' },
      { x: 48, y: 40, w: 46, h: 24, badge: 'arrow', align: 'left' },
      { x: 48, y: 68, w: 46, h: 24, badge: 'arrow', align: 'left' },
    ],
  },

  'three-points-timeline': {
    layoutId: 'three-points-timeline',
    name: '3 Poin - Timeline Berangkai',
    recommendedPoints: 3,
    category: 'content',
    variant: 'timeline',
    title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
    points: [
      { x: 5, y: 32, w: 28, h: 52, step: 1, align: 'left' },
      { x: 36, y: 32, w: 28, h: 52, step: 2, align: 'left' },
      { x: 67, y: 32, w: 28, h: 52, step: 3, align: 'left' },
    ],
  },

  // === F. 4 POIN ===
  'four-points': {
    layoutId: 'four-points',
    name: '4 Poin - Grid 2x2 Kartu Panah',
    recommendedPoints: 4,
    category: 'content',
    variant: 'grid',
    title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
    points: [
      { x: 5, y: 24, w: 43, h: 32, badge: 'arrow', align: 'left' },
      { x: 52, y: 24, w: 43, h: 32, badge: 'arrow', align: 'left' },
      { x: 5, y: 60, w: 43, h: 32, badge: 'arrow', align: 'left' },
      { x: 52, y: 60, w: 43, h: 32, badge: 'arrow', align: 'left' },
    ],
  },

  'four-points-steps': {
    layoutId: 'four-points-steps',
    name: '4 Poin - Step 1, 2, 3, 4',
    recommendedPoints: 4,
    category: 'content',
    variant: 'steps',
    title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
    points: [
      { x: 5, y: 20, w: 43, h: 36, stepLabel: 'Step 1', align: 'left' },
      { x: 52, y: 20, w: 43, h: 36, stepLabel: 'Step 2', align: 'left' },
      { x: 5, y: 59, w: 43, h: 36, stepLabel: 'Step 3', align: 'left' },
      { x: 52, y: 59, w: 43, h: 36, stepLabel: 'Step 4', align: 'left' },
    ],
  },

  // === G. 5 POIN ===
  'five-points': {
    layoutId: 'five-points',
    name: '5 Poin - Kartu (3 Atas + 2 Bawah)',
    recommendedPoints: 5,
    category: 'content',
    variant: 'staggered',
    title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
    points: [
      { x: 5, y: 20, w: 28, h: 35, align: 'left' },
      { x: 36, y: 20, w: 28, h: 35, align: 'left' },
      { x: 67, y: 20, w: 28, h: 35, align: 'left' },
      { x: 20, y: 59, w: 28, h: 34, align: 'left' },
      { x: 52, y: 59, w: 28, h: 34, align: 'left' },
    ],
  },

  'five-points-timeline': {
    layoutId: 'five-points-timeline',
    name: '5 Poin - Rangkaian 01-05 Horizontal',
    recommendedPoints: 5,
    category: 'content',
    variant: 'horizontal-sequence',
    title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
    points: [
      { x: 4, y: 28, w: 17, h: 56, number: '01', align: 'left' },
      { x: 23, y: 28, w: 17, h: 56, number: '02', align: 'left' },
      { x: 42, y: 28, w: 17, h: 56, number: '03', align: 'left' },
      { x: 61, y: 28, w: 17, h: 56, number: '04', align: 'left' },
      { x: 80, y: 28, w: 17, h: 56, number: '05', align: 'left' },
    ],
  },

  // === H. 6 POIN ===
  'six-points': {
    layoutId: 'six-points',
    name: '6 Poin - Grid 3x2 Kartu Terstruktur',
    recommendedPoints: 6,
    category: 'content',
    variant: 'grid',
    title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
    points: [
      { x: 5, y: 20, w: 28, h: 35, align: 'left' },
      { x: 36, y: 20, w: 28, h: 35, align: 'left' },
      { x: 67, y: 20, w: 28, h: 35, align: 'left' },
      { x: 5, y: 58, w: 28, h: 35, align: 'left' },
      { x: 36, y: 58, w: 28, h: 35, align: 'left' },
      { x: 67, y: 58, w: 28, h: 35, align: 'left' },
    ],
  },

  'six-points-columns': {
    layoutId: 'six-points-columns',
    name: '6 Poin - 2 Kolom x 3 Baris Bergaris (→)',
    recommendedPoints: 6,
    category: 'content',
    variant: 'two-columns-rows',
    title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
    points: [
      { x: 5, y: 20, w: 43, h: 23, badge: 'arrow', align: 'left' },
      { x: 52, y: 20, w: 43, h: 23, badge: 'arrow', align: 'left' },
      { x: 5, y: 46, w: 43, h: 23, badge: 'arrow', align: 'left' },
      { x: 52, y: 46, w: 43, h: 23, badge: 'arrow', align: 'left' },
      { x: 5, y: 72, w: 43, h: 23, badge: 'arrow', align: 'left' },
      { x: 52, y: 72, w: 43, h: 23, badge: 'arrow', align: 'left' },
    ],
  },

  // === I. CHART & DATA ===
  'chart': {
    layoutId: 'chart',
    name: 'Chart - Area Grafik & Narasi Metrik',
    recommendedPoints: [1, 2, 3, 4],
    category: 'data',
    variant: 'split-chart',
    title: { x: 6, y: 8, w: 88, h: 12, align: 'left' },
    infoArea: { x: 6, y: 25, w: 38, h: 63, align: 'left' },
    chartArea: { x: 47, y: 25, w: 47, h: 63, align: 'center' },
    points: [
      { x: 6, y: 25, w: 38, h: 63, align: 'left' },
    ],
  },

  'chart-stat': {
    layoutId: 'chart-stat',
    name: 'Chart - 3 Cincin Metrik Persentase (67%)',
    recommendedPoints: 3,
    category: 'data',
    variant: 'percentage-rings',
    title: { x: 6, y: 8, w: 88, h: 12, align: 'center' },
    points: [
      { x: 6, y: 26, w: 26, h: 58, stat: '67%', align: 'center' },
      { x: 37, y: 26, w: 26, h: 58, stat: '85%', align: 'center' },
      { x: 68, y: 26, w: 26, h: 58, stat: '94%', align: 'center' },
    ],
  },

  // === J. TESTIMONI ===
  'testimonial-cards': {
    layoutId: 'testimonial-cards',
    name: 'Testimoni - 3 Kartu Pelanggan (★★★★ 4.8/5)',
    recommendedPoints: 3,
    category: 'quote',
    variant: 'cards',
    title: { x: 6, y: 8, w: 88, h: 10, align: 'left' },
    points: [
      { x: 6, y: 22, w: 27, h: 66, rating: '4.8/5', align: 'center' },
      { x: 36, y: 22, w: 27, h: 66, rating: '4.9/5', align: 'center' },
      { x: 66, y: 22, w: 27, h: 66, rating: '4.8/5', align: 'center' },
    ],
  },

  'testimonial': {
    layoutId: 'testimonial',
    name: 'Testimoni - Kutipan Visi Besar',
    recommendedPoints: 1,
    category: 'quote',
    variant: 'single-quote',
    title: { x: 10, y: 10, w: 80, h: 10, align: 'center' },
    quote: { x: 10, y: 26, w: 80, h: 42, align: 'center' },
    author: { x: 15, y: 72, w: 70, h: 16, align: 'center' },
    points: [],
  },

  // === K. COVER BELAKANG / PENUTUP ===
  'cover-back': {
    layoutId: 'cover-back',
    name: 'Cover Belakang - Kontak & Let\'s Connect',
    recommendedPoints: 0,
    category: 'closing',
    variant: 'contact-grid',
    title: { x: 8, y: 26, w: 44, h: 28, align: 'left' },
    subtitle: { x: 8, y: 58, w: 44, h: 20, align: 'left' },
    contact: { x: 55, y: 22, w: 38, h: 62, align: 'left' },
    points: [],
  },

  'cover-back-statement': {
    layoutId: 'cover-back-statement',
    name: 'Cover Belakang - Thank You Masif Terpusat',
    recommendedPoints: 0,
    category: 'closing',
    variant: 'statement',
    title: { x: 10, y: 24, w: 80, h: 26, align: 'center' },
    subtitle: { x: 12, y: 54, w: 76, h: 14, align: 'center' },
    contact: { x: 15, y: 72, w: 70, h: 16, align: 'center' },
    points: [],
  },

  // === L. VARIATIF: COMPARISON, STEPS, IMAGE-TEXT ===
  'comparison': {
    layoutId: 'comparison',
    name: 'Perbandingan (Sebelum vs Sesudah / A vs B)',
    recommendedPoints: 2,
    category: 'content',
    variant: 'comparison',
    title: { x: 6, y: 8, w: 88, h: 10, align: 'left' },
    points: [
      { x: 5, y: 22, w: 43, h: 65, align: 'left' },
      { x: 52, y: 22, w: 43, h: 65, align: 'left' }
    ],
  },

  'steps': {
    layoutId: 'steps',
    name: 'Langkah / Tahapan (Proses 1-4)',
    recommendedPoints: 4,
    category: 'content',
    variant: 'steps',
    title: { x: 6, y: 8, w: 88, h: 10, align: 'left' },
    points: [
      { x: 5, y: 24, w: 20, h: 60, align: 'left' },
      { x: 28, y: 24, w: 20, h: 60, align: 'left' },
      { x: 51, y: 24, w: 20, h: 60, align: 'left' },
      { x: 74, y: 24, w: 20, h: 60, align: 'left' }
    ],
  },

  'image-text': {
    layoutId: 'image-text',
    name: 'Teks + Visual Placeholder',
    recommendedPoints: 1,
    category: 'content',
    variant: 'image-text',
    title: { x: 6, y: 8, w: 88, h: 10, align: 'left' },
    points: [
      { x: 5, y: 22, w: 45, h: 65, align: 'left' },
    ],
  },
};

/**
 * Gabungan seluruh layout: 189 layout dari katalog PDF + template legacy
 */
export const LAYOUT_DEFINITIONS = {
  ...BASE_LAYOUT_DEFINITIONS,
  ...FULL_LAYOUT_CATALOG,
};

/**
 * Daftar opsi layout lengkap untuk dropdown UI.
 * Menggabungkan seluruh 189 layout katalog dengan pembagian kategori jelas,
 * serta menyertakan template legacy.
 */
export const LAYOUT_OPTIONS = [
  ...FULL_LAYOUT_OPTIONS,
  // Template Legacy untuk kemudahan akses cepat
  { value: 'cover-front', label: 'Cover Depan - Terpusat (Legacy)', points: 0, group: 'Template Standar' },
  { value: 'cover-back', label: 'Cover Belakang - Kontak (Legacy)', points: 0, group: 'Template Standar' },
  { value: 'table-of-contents', label: 'Daftar Isi - Grid 01-06 (Legacy)', points: [3, 4, 5, 6], group: 'Template Standar' },
  { value: 'one-point', label: '1 Poin - Impact Statement (Legacy)', points: 1, group: 'Template Standar' },
  { value: 'two-points', label: '2 Poin - Kolom Sejajar (Legacy)', points: 2, group: 'Template Standar' },
  { value: 'three-points', label: '3 Poin - Tiga Kolom (Legacy)', points: 3, group: 'Template Standar' },
  { value: 'four-points', label: '4 Poin - Grid 2x2 (Legacy)', points: 4, group: 'Template Standar' },
  { value: 'five-points', label: '5 Poin - Kartu 3+2 (Legacy)', points: 5, group: 'Template Standar' },
  { value: 'six-points', label: '6 Poin - Grid 3x2 (Legacy)', points: 6, group: 'Template Standar' },
  { value: 'chart', label: 'Chart - Grafik & Metrik (Legacy)', points: [1, 2, 3, 4], group: 'Template Standar' },
  { value: 'testimonial-cards', label: 'Testimoni - 3 Kartu (Legacy)', points: 3, group: 'Template Standar' },
  { value: 'comparison', label: 'Perbandingan - 2 Kolom (Legacy)', points: 2, group: 'Template Standar' },
  { value: 'steps', label: 'Langkah / Tahapan (Legacy)', points: 4, group: 'Template Standar' },
  { value: 'image-text', label: 'Teks & Visual (Legacy)', points: 1, group: 'Template Standar' },
];

export function calculateFontSize(pointCount, textLength = 0, isTitle = false, layoutId = null) {
  if (layoutId?.startsWith('cover-front') || layoutId?.startsWith('cover-p')) {
    if (isTitle) return textLength > 60 ? 40 : textLength > 35 ? 44 : 48;
    return textLength > 80 ? 18 : 22;
  }

  if (layoutId?.startsWith('cover-back') || layoutId?.startsWith('closing-p')) {
    if (isTitle) return textLength > 30 ? 40 : 48;
    return 18;
  }

  if (layoutId?.includes('testimonial') || layoutId?.startsWith('testi-p')) {
    if (isTitle) return 24;
    return textLength > 120 ? 14 : textLength > 60 ? 16 : 18;
  }

  if (layoutId === 'chart-stat' || layoutId === 'chart-p168') {
    if (isTitle) return 28;
    return 15;
  }

  if (isTitle) {
    if (pointCount <= 1) return textLength > 40 ? 32 : 36;
    if (pointCount === 2) return textLength > 40 ? 30 : 34;
    if (pointCount === 3) return textLength > 40 ? 28 : 32;
    if (pointCount === 4) return textLength > 40 ? 26 : 30;
    if (pointCount === 5) return textLength > 40 ? 24 : 28;
    return textLength > 40 ? 24 : 26;
  }

  const count = Math.max(1, Math.min(6, parseInt(pointCount, 10) || 3));
  let baseSize;
  switch (count) {
    case 1: baseSize = 26; break;
    case 2: baseSize = 20; break;
    case 3: baseSize = 17; break;
    case 4: baseSize = 15; break;
    case 5: baseSize = 14; break;
    case 6:
    default: baseSize = 13; break;
  }

  if (textLength > 180) return Math.max(11, baseSize - 3);
  if (textLength > 100) return Math.max(12, baseSize - 2);
  if (textLength > 60) return Math.max(12, baseSize - 1);
  return baseSize;
}

export function renderLayout(slideOrLayoutId) {
  const layoutId = typeof slideOrLayoutId === 'string'
    ? slideOrLayoutId
    : (slideOrLayoutId?.layoutId || slideOrLayoutId?.layout || 'three-points');

  if (LAYOUT_DEFINITIONS[layoutId]) return LAYOUT_DEFINITIONS[layoutId];
  if (LAYOUT_ALIASES[layoutId] && LAYOUT_DEFINITIONS[LAYOUT_ALIASES[layoutId]]) {
    return LAYOUT_DEFINITIONS[LAYOUT_ALIASES[layoutId]];
  }
  return LAYOUT_DEFINITIONS['three-points'];
}

export function applyLayoutToSlide(slide, newLayoutId, themeConfig = {}) {
  const layoutDef = renderLayout(newLayoutId);
  const updatedSlide = { ...slide, layoutId: newLayoutId, layout: newLayoutId };

  // Deteksi bahasa output (ID vs EN)
  const isEn = (
    slide.outputLanguage === 'en' ||
    slide.language === 'en' ||
    themeConfig.outputLanguage === 'en' ||
    themeConfig.language === 'en'
  );

  const existingPlaceholders = slide.placeholders || [];
  const titleP = existingPlaceholders.find((p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul'));
  const subtitleP = existingPlaceholders.find((p) => p.id?.startsWith('subtitle') || p.name?.toLowerCase().includes('subjudul'));

  const contentItems = [];

  // PRIORITAS 1: Ambil dari slide.content jika ada data (misal saat inisialisasi AI dari mapper)
  if (Array.isArray(slide.content) && slide.content.length > 0) {
    slide.content.forEach((item) => {
      if (typeof item === 'string') {
        const cleaned = item
          .replace(/^[•\-\*]\s*/, '')
          .replace(/^(\d{1,2}\.|\b0\d\b)\s*/, '')
          .trim();
        if (cleaned) contentItems.push(cleaned);
      } else if (item && typeof item === 'object') {
        const text = item.text || item.content || item.title || item.description || '';
        const cleaned = text
          .replace(/^[•\-\*]\s*/, '')
          .replace(/^(\d{1,2}\.|\b0\d\b)\s*/, '')
          .trim();
        if (cleaned) contentItems.push(cleaned);
      }
    });
  }

  // PRIORITAS 2: Jika slide.content belum ada atau kosong, ambil dari existingPlaceholders (saat user ganti layout di editor preview)
  if (contentItems.length === 0) {
    existingPlaceholders.forEach((p) => {
      if (!p.id?.startsWith('title') && !p.id?.startsWith('subtitle') && !p.id?.startsWith('presenter') && !p.id?.startsWith('contact') && p.type === 'text') {
        const lines = (p.content || '').split('\n').filter(Boolean);
        lines.forEach((line) => {
          const cleaned = line
            .replace(/^[•\-\*]\s*/, '')
            .replace(/^(\d{1,2}\.|\b0\d\b)\s*/, '')
            .trim();
          if (cleaned) contentItems.push(cleaned);
        });
      }
    });
  }

  // FILTER PENGAMAN: Jika ada teks template lama seperti "implementasi berkelanjutan", buang dan utamakan isi asli
  const hasLegacyTemplate = contentItems.some((item) =>
    item.toLowerCase().includes('implementasi berkelanjutan') ||
    item.toLowerCase().includes('implementasi rencana kerja')
  );
  if (hasLegacyTemplate && Array.isArray(slide.content) && slide.content.length > 0) {
    const freshItems = [];
    slide.content.forEach((item) => {
      if (typeof item === 'string') {
        const cleaned = item
          .replace(/^[•\-\*]\s*/, '')
          .replace(/^(\d{1,2}\.|\b0\d\b)\s*/, '')
          .trim();
        if (cleaned && !cleaned.toLowerCase().includes('implementasi berkelanjutan')) {
          freshItems.push(cleaned);
        }
      }
    });
    if (freshItems.length > 0) {
      contentItems.splice(0, contentItems.length, ...freshItems);
    }
  }

  const fontHeading = themeConfig.fonts?.heading || titleP?.font || 'Montserrat';
  const fontBody = themeConfig.fonts?.body || 'Open Sans';

  const newPlaceholders = [];

  // 1. Cover Depan (Base Master: Background Putih, Teks Hitam & Abu)
  const isCover = newLayoutId === 'cover-front' || newLayoutId === 'cover-front-editorial' || newLayoutId.startsWith('cover-p');
  if (isCover) {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Main Title' : 'Judul Utama',
      content: titleP?.content || slide.title || (isEn ? 'Presentation Title' : 'Judul Presentasi'),
      font: fontHeading,
      fontSize: calculateFontSize(0, (titleP?.content || '').length, true, newLayoutId),
      color: '#000000',
      isBold: true,
      align: layoutDef.title?.align || 'center',
      lineHeight: 1.15,
      position: { ...(layoutDef.title || { x: 8, y: 24, w: 84, h: 22, align: 'center' }) },
    });

    if (layoutDef.subtitle) {
      newPlaceholders.push({
        id: `subtitle-${slide.slideNumber}`,
        type: 'text',
        name: isEn ? 'Subtitle' : 'Subjudul',
        content: subtitleP?.content || slide.subtitle || (isEn ? 'Strategic Executive Framework' : 'Master Presentasi Berbasis AI'),
        font: fontBody,
        fontSize: calculateFontSize(0, 50, false, newLayoutId),
        color: '#4B5563',
        align: layoutDef.subtitle.align || 'center',
        lineHeight: 1.4,
        position: { ...layoutDef.subtitle },
      });
    }

    if (layoutDef.presenter) {
      newPlaceholders.push({
        id: `presenter-${slide.slideNumber}`,
        type: 'text',
        name: isEn ? 'Presenter Info' : 'Presenter Info',
        content: isEn ? 'Master PPT AI — Executive Master (Black & White)' : 'Master PPT AI — Base Master (Hitam & Putih)',
        font: fontBody,
        fontSize: 14,
        color: '#6B7280',
        align: layoutDef.presenter.align || 'center',
        lineHeight: 1.3,
        position: { ...layoutDef.presenter },
      });
    }

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'cover';
    updatedSlide.pointCount = 0;
    updatedSlide.outputLanguage = isEn ? 'en' : 'id';
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 2. Cover Belakang (Base Master: Background Putih, Teks Hitam & Abu)
  const isClosing = newLayoutId === 'cover-back' || newLayoutId === 'cover-back-statement' || newLayoutId.startsWith('closing-p');
  if (isClosing) {
    const isStatement = newLayoutId === 'cover-back-statement' || newLayoutId === 'closing-p180' || newLayoutId === 'closing-p186' || newLayoutId === 'closing-p188';
    const defaultTitle = isEn
      ? (isStatement ? 'Thank You' : 'Let\'s Connect')
      : (isStatement ? 'Terima Kasih' : 'Let\'s Connect');

    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Closing Title' : 'Judul Penutup',
      content: titleP?.content || defaultTitle,
      font: fontHeading,
      fontSize: isStatement ? 48 : 40,
      color: '#000000',
      isBold: true,
      align: layoutDef.title?.align || 'center',
      lineHeight: 1.1,
      position: { ...(layoutDef.title || { x: 10, y: 24, w: 80, h: 26, align: 'center' }) },
    });

    if (layoutDef.subtitle) {
      newPlaceholders.push({
        id: `subtitle-${slide.slideNumber}`,
        type: 'text',
        name: isEn ? 'Closing Message' : 'Pesan Penutup',
        content: subtitleP?.content || (isEn ? 'Open for Strategic Collaboration & Inquiries' : 'Kolaborasi & Diskusi Terbuka'),
        font: fontBody,
        fontSize: 18,
        color: '#4B5563',
        align: layoutDef.subtitle.align || 'center',
        lineHeight: 1.4,
        position: { ...layoutDef.subtitle },
      });
    }

    if (layoutDef.contact) {
      const defaultContact = isEn
        ? '📞 123-456-7890\n✉️ hello@reallygreatsite.com\n🌐 www.reallygreatsite.com\n📍 123 Anywhere St., Any City'
        : '📞 62-819-9977-3020\n✉️ halo@situssupercanggih.co.id\n🌐 www.situssupercanggih.co.id\n📍 Jl. Mangga Muda 17A, Cilandak, Jakarta Selatan 12310';

      newPlaceholders.push({
        id: `contact-${slide.slideNumber}`,
        type: 'text',
        name: isEn ? 'Contact Info' : 'Kontak & Tautan',
        content: defaultContact,
        font: fontBody,
        fontSize: 14,
        color: '#4B5563',
        align: layoutDef.contact.align || 'center',
        lineHeight: 1.5,
        position: { ...layoutDef.contact },
      });
    }

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'closing';
    updatedSlide.pointCount = 0;
    updatedSlide.outputLanguage = isEn ? 'en' : 'id';
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 3. Testimoni (Base Master: Background Putih, Teks Hitam & Abu)
  const isTestimonialCards = newLayoutId === 'testimonial-cards' || newLayoutId === 'testi-p173' || newLayoutId === 'testi-p174' || newLayoutId === 'testi-p175';
  if (isTestimonialCards) {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Slide Title' : 'Judul Slide',
      content: titleP?.content || (isEn ? 'Client Testimonials' : 'Testimoni Pelanggan'),
      font: fontHeading,
      fontSize: 28,
      color: '#000000',
      isBold: true,
      align: 'left',
      position: { ...layoutDef.title },
    });

    const slots = layoutDef.points;
    const names = isEn ? ['AARON LOEB', 'ROSA MARIA', 'HANNAH MORALES'] : ['Adinda Fitria', 'Baskara Lim', 'Cindy Savira'];
    slots.forEach((slot, idx) => {
      const defaultQuote = isEn
        ? 'This framework delivered extraordinary efficiency and accelerated our core milestones.'
        : 'Solusi ini memberikan efisiensi yang luar biasa bagi pertumbuhan tim kami.';
      const quote = contentItems[idx] || defaultQuote;
      const clientLabel = isEn ? `Client ${idx + 1}` : `Klien ${idx + 1}`;
      newPlaceholders.push({
        id: `point-${slide.slideNumber}-${idx + 1}`,
        type: 'text',
        name: isEn ? `Testimonial ${idx + 1}` : `Testimoni ${idx + 1}`,
        content: `★★★★ ${slot.rating || '4.9/5'}\n\n"${quote}"\n\n— ${names[idx] || clientLabel}`,
        font: fontBody,
        fontSize: 14,
        color: '#1F2937',
        align: 'center',
        lineHeight: 1.45,
        badge: 'rating',
        position: { ...slot },
      });
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'testimonial';
    updatedSlide.pointCount = slots.length;
    updatedSlide.outputLanguage = isEn ? 'en' : 'id';
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  const isTestimonialSingle = newLayoutId === 'testimonial' || newLayoutId === 'testi-p176' || newLayoutId === 'testi-p178';
  if (isTestimonialSingle) {
    const defaultQuote = isEn
      ? 'Strategic innovation is the ultimate foundation for sustainable growth.'
      : 'Inovasi adalah kunci pertumbuhan yang berkelanjutan.';

    newPlaceholders.push({
      id: `quote-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Quote' : 'Kutipan Testimoni',
      content: `"${contentItems[0] || titleP?.content || defaultQuote}"`,
      font: fontHeading,
      fontSize: calculateFontSize(1, (contentItems[0] || '').length, false, 'testimonial'),
      color: '#000000',
      isItalic: true,
      align: 'center',
      lineHeight: 1.5,
      position: { ...(layoutDef.quote || { x: 10, y: 26, w: 80, h: 42, align: 'center' }) },
    });

    newPlaceholders.push({
      id: `author-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Author & Role' : 'Nama & Jabatan',
      content: contentItems[1] || (isEn ? '— Executive Leader / Managing Director' : '— Klien Eksekutif / Founder'),
      font: fontBody,
      fontSize: 16,
      color: '#4B5563',
      align: 'center',
      lineHeight: 1.3,
      position: { ...(layoutDef.author || { x: 15, y: 72, w: 70, h: 16, align: 'center' }) },
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'testimonial';
    updatedSlide.pointCount = 1;
    updatedSlide.outputLanguage = isEn ? 'en' : 'id';
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 4. Chart & Data (Area vs Stat Rings)
  const isChartStat = newLayoutId === 'chart-stat' || newLayoutId === 'chart-p168';
  if (isChartStat) {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Slide Title' : 'Judul Slide',
      content: titleP?.content || (isEn ? 'Key Metrics & Performance' : 'Capaian & Metrik Utama'),
      font: fontHeading,
      fontSize: 30,
      color: '#000000',
      isBold: true,
      align: 'center',
      position: { ...layoutDef.title },
    });

    const slots = layoutDef.points;
    const defaultStats = ['67%', '85%', '94%'];
    slots.forEach((slot, idx) => {
      const defaultDesc = isEn ? `Significant growth in primary KPI metric ${idx + 1}` : `Pertumbuhan metrik ${idx + 1} meningkat signifikan`;
      const itemDesc = contentItems[idx] || defaultDesc;
      newPlaceholders.push({
        id: `point-${slide.slideNumber}-${idx + 1}`,
        type: 'text',
        name: isEn ? `Statistic ${idx + 1}` : `Statistik ${idx + 1}`,
        content: `${defaultStats[idx] || '80%'}\n\n${itemDesc}`,
        font: fontHeading,
        fontSize: 16,
        color: '#1F2937',
        align: 'center',
        lineHeight: 1.4,
        badge: 'stat',
        position: { ...slot },
      });
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'chart';
    updatedSlide.pointCount = slots.length;
    updatedSlide.outputLanguage = isEn ? 'en' : 'id';
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  const isChartArea = newLayoutId === 'chart' || (newLayoutId.startsWith('chart-p') && newLayoutId !== 'chart-p168');
  if (isChartArea) {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Slide Title' : 'Judul Slide',
      content: titleP?.content || (isEn ? 'Performance Analytics & Metrics' : 'Analisis & Data Kinerja'),
      font: fontHeading,
      fontSize: 30,
      color: '#000000',
      isBold: true,
      align: 'left',
      position: { ...layoutDef.title },
    });

    const defaultInfo = isEn
      ? '• Efficiency improvement sustained at +185%\n\n• Operational turnaround time reduced by 65%\n\n• Overall user satisfaction rating reached 99.4%'
      : '• Peningkatan efisiensi sebesar +185%\n\n• Pengurangan waktu kerja hingga 65%\n\n• Kepuasan pengguna mencapai 99.4%';

    const infoText = contentItems.length > 0
      ? contentItems.map(c => `• ${c}`).join('\n\n')
      : defaultInfo;

    newPlaceholders.push({
      id: `info-${slide.slideNumber}`,
      type: 'text',
      name: isEn ? 'Data Analysis' : 'Penjelasan Data',
      content: infoText,
      font: fontBody,
      fontSize: calculateFontSize(contentItems.length || 3, infoText.length, false),
      color: '#4B5563',
      align: 'left',
      lineHeight: 1.5,
      position: { ...(layoutDef.infoArea || { x: 6, y: 25, w: 38, h: 63, align: 'left' }) },
    });

    newPlaceholders.push({
      id: `chart-${slide.slideNumber}`,
      type: 'image',
      name: isEn ? 'Chart Visual Area' : 'Area Grafik / Chart',
      content: null,
      placeholder: isEn ? 'Visual Chart Area / Black-and-White Metric Graph' : 'Area Visual Chart / Grafik Statistik Hitam-Putih',
      position: { ...(layoutDef.chartArea || { x: 47, y: 25, w: 47, h: 63, align: 'center' }) },
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'chart';
    updatedSlide.pointCount = Math.max(1, contentItems.length);
    updatedSlide.outputLanguage = isEn ? 'en' : 'id';
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 5. Layout Standar Poin
  newPlaceholders.push({
    id: `title-${slide.slideNumber}`,
    type: 'text',
    name: isEn ? 'Slide Title' : 'Judul Slide',
    content: titleP?.content || slide.title || (isEn ? 'Slide Title' : 'Judul Slide'),
    font: fontHeading,
    fontSize: calculateFontSize(layoutDef.points?.length || 3, (titleP?.content || '').length, true, newLayoutId),
    color: '#000000',
    isBold: true,
    align: layoutDef.title?.align || 'left',
    position: { ...layoutDef.title },
  });

  const slots = layoutDef.points || [];
  const slideContext = titleP?.content || slide.title || (isEn ? 'Core Topic' : 'Materi Slide');

  slots.forEach((slot, i) => {
    let itemText = contentItems[i];
    if (!itemText) {
      if (newLayoutId === 'table-of-contents' || newLayoutId.startsWith('agenda-')) {
        itemText = isEn
          ? `Discussion on ${slideContext} — Part ${i + 1}`
          : `Pembahasan ${slideContext} Bagian ${i + 1}`;
      } else if (slot.stepLabel) {
        itemText = isEn
          ? `Phase ${slot.stepLabel}: Actionable execution driving ${slideContext}`
          : `Tahap ${slot.stepLabel}: Pelaksanaan konkret dalam mendukung ${slideContext}`;
      } else {
        itemText = isEn
          ? `Core Pillar ${i + 1}: In-depth strategic focus on ${slideContext}`
          : `Fokus utama ke-${i + 1}: Penjelasan mendalam mengenai ${slideContext}`;
      }
    }

    // Format tampilan teks sesuai desain Base Layout
    let formattedText = itemText;
    if (newLayoutId === 'table-of-contents' || newLayoutId.startsWith('agenda-')) {
      formattedText = `${slot.number || `0${i + 1}`}  ${itemText.toUpperCase()}`;
    } else if (slot.badge === 'arrow') {
      formattedText = `→  ${itemText}`;
    } else if (slot.stepLabel) {
      formattedText = `${slot.stepLabel}\n${itemText}`;
    } else if (slot.number) {
      formattedText = itemText;
    } else if (slot.badge) {
      formattedText = `${slot.badge}  ${itemText}`;
    } else if (newLayoutId === 'comparison') {
      const colLabel = isEn
        ? (i === 0 ? 'CONVENTIONAL APPROACH / OPTION A' : 'TRANSFORMATIONAL STRATEGY / OPTION B')
        : (i === 0 ? 'KONDISI SEBELUM / PENDEKATAN A' : 'KONDISI SESUDAH / PENDEKATAN B');
      formattedText = `${colLabel}\n\n${itemText}`;
    } else if (newLayoutId !== 'one-point' && newLayoutId !== 'one-point-split') {
      formattedText = itemText;
    }

    newPlaceholders.push({
      id: `point-${slide.slideNumber}-${i + 1}`,
      type: 'text',
      name: isEn ? `Point ${i + 1}` : `Poin ${i + 1}`,
      content: formattedText,
      font: fontBody,
      fontSize: calculateFontSize(slots.length, itemText.length, false, newLayoutId),
      color: '#1F2937',
      align: slot.align || 'left',
      lineHeight: 1.5,
      badge: slot.badge || (slot.number ? 'number' : slot.stepLabel ? 'step' : undefined),
      number: slot.number,
      stepLabel: slot.stepLabel,
      position: { ...slot },
    });
  });

  if (newLayoutId === 'image-text') {
    newPlaceholders.push({
      id: `image-${slide.slideNumber}`,
      type: 'image',
      name: isEn ? 'Visual / Image Area' : 'Area Gambar / Visual',
      content: null,
      placeholder: isEn ? 'Visual / Graphic / Diagram Area (B&W)' : 'Area Visual / Foto / Diagram Hitam-Putih',
      position: { x: 55, y: 22, w: 40, h: 65 },
    });
  }

  updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
  updatedSlide.slideType = (newLayoutId === 'table-of-contents' || newLayoutId.startsWith('agenda-')) ? 'agenda' : 'content';
  updatedSlide.pointCount = slots.length;
  updatedSlide.outputLanguage = isEn ? 'en' : 'id';
  updatedSlide.placeholders = newPlaceholders;
  return updatedSlide;
}

export default {
  LAYOUT_DEFINITIONS,
  LAYOUT_OPTIONS,
  calculateFontSize,
  renderLayout,
  applyLayoutToSlide,
};
