/**
 * Layout Renderer & Auto Layout Design System (Frontend)
 * Berbasis langsung dari katalog desain "Base Layout Presentasi.pdf" (One Piece Design Studio)
 * Mengubah layoutId menjadi posisi placeholder konkret dalam format persentase (0-100%).
 */

export const LAYOUT_DEFINITIONS = {
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
};

/**
 * Daftar opsi layout untuk dropdown UI
 */
export const LAYOUT_OPTIONS = [
  // Cover & Penutup
  { value: 'cover-front', label: 'Cover Depan - Terpusat', points: 0, group: 'Cover & Penutup' },
  { value: 'cover-front-editorial', label: 'Cover Depan - Editorial Kiri', points: 0, group: 'Cover & Penutup' },
  { value: 'cover-back', label: 'Cover Belakang - Kontak & Let\'s Connect', points: 0, group: 'Cover & Penutup' },
  { value: 'cover-back-statement', label: 'Cover Belakang - Thank You Masif', points: 0, group: 'Cover & Penutup' },

  // Agenda
  { value: 'table-of-contents', label: 'Daftar Isi - Grid 01-06 Bergaris', points: [3, 4, 5, 6], group: 'Agenda' },

  // Konten 1-2 Poin
  { value: 'one-point', label: '1 Poin - Impact Statement Terpusat', points: 1, group: '1 & 2 Poin' },
  { value: 'one-point-split', label: '1 Poin - Split Kiri & Detail', points: 1, group: '1 & 2 Poin' },
  { value: 'two-points', label: '2 Poin - Kolom Sejajar (A & B)', points: 2, group: '1 & 2 Poin' },
  { value: 'two-points-horizontal', label: '2 Poin - Baris Bergaris (01 / 02)', points: 2, group: '1 & 2 Poin' },

  // Konten 3 Poin
  { value: 'three-points', label: '3 Poin - Tiga Kolom (01, 02, 03)', points: 3, group: '3 Poin' },
  { value: 'three-points-horizontal', label: '3 Poin - Baris Panah (→)', points: 3, group: '3 Poin' },
  { value: 'three-points-timeline', label: '3 Poin - Timeline Berangkai', points: 3, group: '3 Poin' },

  // Konten 4-6 Poin
  { value: 'four-points', label: '4 Poin - Grid 2x2 Kartu Panah', points: 4, group: '4-6 Poin' },
  { value: 'four-points-steps', label: '4 Poin - Step 1, 2, 3, 4', points: 4, group: '4-6 Poin' },
  { value: 'five-points', label: '5 Poin - Kartu (3 Atas + 2 Bawah)', points: 5, group: '4-6 Poin' },
  { value: 'five-points-timeline', label: '5 Poin - Rangkaian 01-05 Horizontal', points: 5, group: '4-6 Poin' },
  { value: 'six-points', label: '6 Poin - Grid 3x2 Kartu Terstruktur', points: 6, group: '4-6 Poin' },
  { value: 'six-points-columns', label: '6 Poin - 2 Kolom x 3 Baris Panah (→)', points: 6, group: '4-6 Poin' },

  // Data & Testimoni
  { value: 'chart', label: 'Chart - Area Grafik & Narasi Metrik', points: [1, 2, 3, 4], group: 'Data & Testimoni' },
  { value: 'chart-stat', label: 'Chart - 3 Cincin Persentase (67%)', points: 3, group: 'Data & Testimoni' },
  { value: 'testimonial-cards', label: 'Testimoni - 3 Kartu Pelanggan (★★★★)', points: 3, group: 'Data & Testimoni' },
  { value: 'testimonial', label: 'Testimoni - Kutipan Visi Besar', points: 1, group: 'Data & Testimoni' },
];

export function calculateFontSize(pointCount, textLength = 0, isTitle = false, layoutId = null) {
  if (layoutId === 'cover-front' || layoutId === 'cover-front-editorial') {
    if (isTitle) return textLength > 60 ? 40 : textLength > 35 ? 44 : 48;
    return textLength > 80 ? 18 : 22;
  }

  if (layoutId === 'cover-back' || layoutId === 'cover-back-statement') {
    if (isTitle) return textLength > 30 ? 40 : 48;
    return 18;
  }

  if (layoutId === 'testimonial' || layoutId === 'testimonial-cards') {
    if (isTitle) return 24;
    return textLength > 120 ? 14 : textLength > 60 ? 16 : 18;
  }

  if (layoutId === 'chart-stat') {
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

  return LAYOUT_DEFINITIONS[layoutId] || LAYOUT_DEFINITIONS['three-points'];
}

export function applyLayoutToSlide(slide, newLayoutId, themeConfig = {}) {
  const layoutDef = renderLayout(newLayoutId);
  const updatedSlide = { ...slide, layoutId: newLayoutId, layout: newLayoutId };

  const existingPlaceholders = slide.placeholders || [];
  const titleP = existingPlaceholders.find((p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul'));
  const subtitleP = existingPlaceholders.find((p) => p.id?.startsWith('subtitle') || p.name?.toLowerCase().includes('subjudul'));

  const contentItems = [];
  existingPlaceholders.forEach((p) => {
    if (!p.id?.startsWith('title') && !p.id?.startsWith('subtitle') && !p.id?.startsWith('presenter') && !p.id?.startsWith('contact') && p.type === 'text') {
      const lines = (p.content || '').split('\n').filter(Boolean);
      lines.forEach((line) => {
        const cleaned = line.replace(/^[•\-\*\d+\.]\s*/, '').trim();
        if (cleaned) contentItems.push(cleaned);
      });
    }
  });

  const fontHeading = themeConfig.fonts?.heading || titleP?.font || 'Montserrat';
  const fontBody = themeConfig.fonts?.body || 'Open Sans';
  const primaryColor = themeConfig.colors?.primary || '#2563EB';
  const secondaryColor = themeConfig.colors?.secondary || '#1E40AF';
  const accentColor = themeConfig.colors?.accent || '#F59E0B';

  const newPlaceholders = [];

  // 1. Cover Depan
  if (newLayoutId === 'cover-front' || newLayoutId === 'cover-front-editorial') {
    const isEditorial = newLayoutId === 'cover-front-editorial';
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: 'Judul Utama',
      content: titleP?.content || slide.title || 'Judul Presentasi',
      font: fontHeading,
      fontSize: calculateFontSize(0, (titleP?.content || '').length, true, newLayoutId),
      color: isEditorial ? '#0F172A' : '#FFFFFF',
      isBold: true,
      align: layoutDef.title.align || 'center',
      lineHeight: 1.15,
      position: { ...layoutDef.title },
    });

    newPlaceholders.push({
      id: `subtitle-${slide.slideNumber}`,
      type: 'text',
      name: 'Subjudul',
      content: subtitleP?.content || slide.subtitle || 'Strategi Komprehensif Berbasis AI',
      font: fontBody,
      fontSize: calculateFontSize(0, 50, false, newLayoutId),
      color: isEditorial ? '#475569' : '#F8FAFC',
      align: layoutDef.subtitle.align || 'center',
      lineHeight: 1.4,
      position: { ...layoutDef.subtitle },
    });

    newPlaceholders.push({
      id: `presenter-${slide.slideNumber}`,
      type: 'text',
      name: 'Presenter Info',
      content: 'Presented by One Piece Studio & Master PPT AI',
      font: fontBody,
      fontSize: 14,
      color: isEditorial ? '#64748B' : '#E2E8F0',
      align: layoutDef.presenter.align || 'center',
      lineHeight: 1.3,
      position: { ...layoutDef.presenter },
    });

    updatedSlide.background = { color: isEditorial ? '#FFFFFF' : primaryColor, type: 'solid' };
    updatedSlide.slideType = 'cover';
    updatedSlide.pointCount = 0;
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 2. Cover Belakang
  if (newLayoutId === 'cover-back' || newLayoutId === 'cover-back-statement') {
    const isStatement = newLayoutId === 'cover-back-statement';
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: 'Judul Penutup',
      content: isStatement ? 'Thank You.' : 'Let\'s Connect With Us',
      font: fontHeading,
      fontSize: isStatement ? 54 : 42,
      color: isStatement ? '#FFFFFF' : '#0F172A',
      isBold: true,
      align: layoutDef.title.align || 'center',
      lineHeight: 1.1,
      position: { ...layoutDef.title },
    });

    newPlaceholders.push({
      id: `subtitle-${slide.slideNumber}`,
      type: 'text',
      name: 'Pesan Penutup',
      content: 'Mari Bekerja Sama Mewujudkan Dampak Nyata',
      font: fontBody,
      fontSize: 18,
      color: isStatement ? accentColor : '#475569',
      align: layoutDef.subtitle.align || 'center',
      lineHeight: 1.4,
      position: { ...layoutDef.subtitle },
    });

    newPlaceholders.push({
      id: `contact-${slide.slideNumber}`,
      type: 'text',
      name: 'Kontak & Tautan',
      content: '📞 +62 812-3456-7890\n✉️ hello@masterpptai.id\n🌐 www.masterpptai.id\n📍 Jakarta, Indonesia',
      font: fontBody,
      fontSize: 14,
      color: isStatement ? '#E2E8F0' : '#334155',
      align: layoutDef.contact.align || 'center',
      lineHeight: 1.5,
      position: { ...layoutDef.contact },
    });

    updatedSlide.background = { color: isStatement ? primaryColor : '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'closing';
    updatedSlide.pointCount = 0;
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 3. Testimoni (Cards vs Single Quote)
  if (newLayoutId === 'testimonial-cards') {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: 'Judul Slide',
      content: titleP?.content || 'Customer Testimonials',
      font: fontHeading,
      fontSize: 28,
      color: '#0F172A',
      isBold: true,
      align: 'left',
      position: { ...layoutDef.title },
    });

    const slots = layoutDef.points;
    const names = ['AARON LOEB', 'ROSA MARIA', 'HANNAH MORALES'];
    slots.forEach((slot, idx) => {
      const quote = contentItems[idx] || 'Solusi ini memberikan efisiensi yang luar biasa bagi pertumbuhan tim kami.';
      newPlaceholders.push({
        id: `point-${slide.slideNumber}-${idx + 1}`,
        type: 'text',
        name: `Testimoni ${idx + 1}`,
        content: `★★★★ ${slot.rating || '4.9/5'}\n\n"${quote}"\n\n— ${names[idx] || `Klien ${idx + 1}`}`,
        font: fontBody,
        fontSize: 14,
        color: '#1E293B',
        align: 'center',
        lineHeight: 1.45,
        badge: 'rating',
        position: { ...slot },
      });
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'testimonial';
    updatedSlide.pointCount = slots.length;
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  if (newLayoutId === 'testimonial') {
    newPlaceholders.push({
      id: `quote-${slide.slideNumber}`,
      type: 'text',
      name: 'Kutipan Testimoni',
      content: `"${contentItems[0] || titleP?.content || 'Inovasi adalah kunci pertumbuhan yang berkelanjutan.'}"`,
      font: fontHeading,
      fontSize: calculateFontSize(1, (contentItems[0] || '').length, false, 'testimonial'),
      color: '#FFFFFF',
      isItalic: true,
      align: 'center',
      lineHeight: 1.5,
      position: { ...layoutDef.quote },
    });

    newPlaceholders.push({
      id: `author-${slide.slideNumber}`,
      type: 'text',
      name: 'Nama & Jabatan',
      content: contentItems[1] || '— Klien Eksekutif / Founder',
      font: fontBody,
      fontSize: 16,
      color: accentColor,
      align: 'center',
      lineHeight: 1.3,
      position: { ...layoutDef.author },
    });

    updatedSlide.background = { color: secondaryColor, type: 'solid' };
    updatedSlide.slideType = 'testimonial';
    updatedSlide.pointCount = 1;
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 4. Chart & Data (Area vs Stat Rings)
  if (newLayoutId === 'chart-stat') {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: 'Judul Slide',
      content: titleP?.content || 'Capaian & Metrik Utama',
      font: fontHeading,
      fontSize: 30,
      color: '#0F172A',
      isBold: true,
      align: 'center',
      position: { ...layoutDef.title },
    });

    const slots = layoutDef.points;
    const defaultStats = ['67%', '85%', '94%'];
    slots.forEach((slot, idx) => {
      const itemDesc = contentItems[idx] || `Pertumbuhan metrik ${idx + 1} meningkat signifikan`;
      newPlaceholders.push({
        id: `point-${slide.slideNumber}-${idx + 1}`,
        type: 'text',
        name: `Statistik ${idx + 1}`,
        content: `${defaultStats[idx] || '80%'}\n\n${itemDesc}`,
        font: fontHeading,
        fontSize: 16,
        color: '#0F172A',
        align: 'center',
        lineHeight: 1.4,
        badge: 'stat',
        position: { ...slot },
      });
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'chart';
    updatedSlide.pointCount = slots.length;
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  if (newLayoutId === 'chart') {
    newPlaceholders.push({
      id: `title-${slide.slideNumber}`,
      type: 'text',
      name: 'Judul Slide',
      content: titleP?.content || 'Analisis & Data Kinerja',
      font: fontHeading,
      fontSize: 30,
      color: '#0F172A',
      isBold: true,
      align: 'left',
      position: { ...layoutDef.title },
    });

    const infoText = contentItems.length > 0
      ? contentItems.map(c => `• ${c}`).join('\n\n')
      : '• Peningkatan efisiensi sebesar +185%\n\n• Pengurangan waktu kerja hingga 65%\n\n• Kepuasan pengguna mencapai 99.4%';

    newPlaceholders.push({
      id: `info-${slide.slideNumber}`,
      type: 'text',
      name: 'Penjelasan Data',
      content: infoText,
      font: fontBody,
      fontSize: calculateFontSize(contentItems.length || 3, infoText.length, false),
      color: '#334155',
      align: 'left',
      lineHeight: 1.5,
      position: { ...layoutDef.infoArea },
    });

    newPlaceholders.push({
      id: `chart-${slide.slideNumber}`,
      type: 'image',
      name: 'Area Grafik / Chart',
      content: null,
      placeholder: 'Area Visual Chart / Grafik Statistik Interaktif',
      position: { ...layoutDef.chartArea },
    });

    updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
    updatedSlide.slideType = 'chart';
    updatedSlide.pointCount = Math.max(1, contentItems.length);
    updatedSlide.placeholders = newPlaceholders;
    return updatedSlide;
  }

  // 5. Layout Standar Poin
  newPlaceholders.push({
    id: `title-${slide.slideNumber}`,
    type: 'text',
    name: 'Judul Slide',
    content: titleP?.content || slide.title || 'Judul Slide',
    font: fontHeading,
    fontSize: calculateFontSize(layoutDef.points?.length || 3, (titleP?.content || '').length, true, newLayoutId),
    color: '#0F172A',
    isBold: true,
    align: layoutDef.title?.align || 'left',
    position: { ...layoutDef.title },
  });

  const slots = layoutDef.points || [];
  slots.forEach((slot, i) => {
    let itemText = contentItems[i];
    if (!itemText) {
      if (newLayoutId === 'table-of-contents') {
        itemText = `Pembahasan Topik Utama ${i + 1}`;
      } else if (slot.stepLabel) {
        itemText = `Penjelasan implementasi rencana kerja ${slot.stepLabel}`;
      } else {
        itemText = `Poin strategi ${i + 1} untuk implementasi berkelanjutan`;
      }
    }

    // Format tampilan teks sesuai desain Base Layout
    let formattedText = itemText;
    if (newLayoutId === 'table-of-contents') {
      formattedText = `${slot.number || `0${i + 1}`}  ${itemText.toUpperCase()}`;
    } else if (slot.badge === 'arrow') {
      formattedText = `→  ${itemText}`;
    } else if (slot.stepLabel) {
      formattedText = `${slot.stepLabel}\n${itemText}`;
    } else if (slot.number) {
      formattedText = `${slot.number}  ${itemText}`;
    } else if (slot.badge) {
      formattedText = `${slot.badge}  ${itemText}`;
    } else if (newLayoutId !== 'one-point' && newLayoutId !== 'one-point-split') {
      formattedText = `• ${itemText}`;
    }

    newPlaceholders.push({
      id: `point-${slide.slideNumber}-${i + 1}`,
      type: 'text',
      name: `Poin ${i + 1}`,
      content: formattedText,
      font: fontBody,
      fontSize: calculateFontSize(slots.length, itemText.length, false, newLayoutId),
      color: '#334155',
      align: slot.align || 'left',
      lineHeight: 1.5,
      badge: slot.badge || (slot.number ? 'number' : slot.stepLabel ? 'step' : undefined),
      number: slot.number,
      stepLabel: slot.stepLabel,
      position: { ...slot },
    });
  });

  updatedSlide.background = { color: '#FFFFFF', type: 'solid' };
  updatedSlide.slideType = newLayoutId === 'table-of-contents' ? 'agenda' : 'content';
  updatedSlide.pointCount = slots.length;
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
