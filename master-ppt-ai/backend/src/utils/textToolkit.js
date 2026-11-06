/**
 * Text Toolkit - Master PPT AI
 * Komponen tipografi dan aturan hierarki teks untuk Base Master Hitam & Putih.
 */

// A. Daftar Font yang Didukung
const SUPPORTED_FONTS = [
  'Montserrat',
  'Open Sans',
  'Poppins',
  'Lato',
  'Roboto',
  'Playfair Display',
  'Source Sans Pro',
  'Oswald',
  'Raleway',
  'Merriweather',
];

// B. Aturan Pairing Font (Minimal 10 kombinasi untuk master hitam-putih)
const FONT_PAIRINGS = [
  {
    heading: 'Montserrat',
    body: 'Open Sans',
    rationale: 'Kombinasi modern, bersih, dan profesional dengan keterbacaan tinggi untuk presentasi korporat.',
  },
  {
    heading: 'Poppins',
    body: 'Lato',
    rationale: 'Kesan geometris bersahabat berpadu dengan kehangatan sans-serif klasik untuk topik bisnis dan teknologi.',
  },
  {
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    rationale: 'Kontras tajam antara serif editorial elegan dan sans-serif netral untuk tema formal dan pemikiran strategis.',
  },
  {
    heading: 'Oswald',
    body: 'Roboto',
    rationale: 'Tipografi judul berkarakter tegas dan tegap diimbangi oleh body text fungsional yang nyaman dipindai.',
  },
  {
    heading: 'Raleway',
    body: 'Merriweather',
    rationale: 'Gaya modern geometris berpadu dengan serif berbobot tinggi untuk presentasi literatur, opini, atau analisis mendalam.',
  },
  {
    heading: 'Roboto',
    body: 'Open Sans',
    rationale: 'Dua font sans-serif berstandar global yang memberikan tampilan bersih, netral, dan sangat terstruktur.',
  },
  {
    heading: 'Montserrat',
    body: 'Lato',
    rationale: 'Karakter kokoh pada judul dan kenyamanan baca optimal pada isi slide untuk proposal dan laporan eksekutif.',
  },
  {
    heading: 'Poppins',
    body: 'Source Sans Pro',
    rationale: 'Desain minimalis kontemporer dengan proporsi huruf proporsional yang rapi di layar monitor.',
  },
  {
    heading: 'Oswald',
    body: 'Open Sans',
    rationale: 'Judul berbobot kuat menarik atensi seketika, didukung isi teks yang jernih dan mudah dicerna cepat.',
  },
  {
    heading: 'Raleway',
    body: 'Roboto',
    rationale: 'Kesan anggun dan canggih pada headline berpadu dengan kesederhanaan teks teknis yang presisi.',
  },
];

// C. Aturan Ukuran Font berdasarkan Jenis Slide
const FONT_SIZE_RULES = {
  cover: {
    title: { min: 40, max: 54, default: 48 },
    subtitle: { min: 18, max: 24, default: 20 },
  },
  agenda: {
    title: { min: 32, max: 40, default: 36 },
    content: { min: 18, max: 24, default: 20 },
  },
  'one-point': {
    title: { min: 32, max: 40, default: 36 },
    content: { min: 24, max: 32, default: 28 },
  },
  'two-points': {
    title: { min: 30, max: 36, default: 32 },
    content: { min: 20, max: 26, default: 22 },
  },
  'three-points': {
    title: { min: 28, max: 34, default: 30 },
    content: { min: 18, max: 24, default: 20 },
  },
  'four-points': {
    title: { min: 26, max: 32, default: 28 },
    content: { min: 16, max: 22, default: 18 },
  },
  'five-points': {
    title: { min: 24, max: 30, default: 26 },
    content: { min: 15, max: 20, default: 16 },
  },
  'six-points': {
    title: { min: 24, max: 28, default: 24 },
    content: { min: 14, max: 18, default: 15 },
  },
  chart: {
    title: { min: 28, max: 34, default: 30 },
    content: { min: 16, max: 20, default: 16 },
  },
  testimonial: {
    title: { min: 28, max: 40, default: 32 },
    content: { min: 16, max: 20, default: 16 },
  },
  closing: {
    title: { min: 36, max: 48, default: 44 },
    content: { min: 16, max: 20, default: 18 },
  },
};

// D. Aturan Format Teks
const TEXT_FORMATTING_RULES = {
  styles: ['bold', 'italic', 'underline'],
  alignments: ['left', 'center', 'right', 'justify'],
  lineHeights: [1.0, 1.2, 1.5, 1.8, 2.0],
  // Warna teks terbatas skema hitam-putih
  allowedColors: [
    { label: 'Hitam', hex: '#000000' },
    { label: 'Abu Gelap', hex: '#4B5563' },
    { label: 'Abu', hex: '#6B7280' },
  ],
};

// E. Aturan Hierarki Teks untuk Master Hitam & Putih
const TEXT_HIERARCHY_RULES = {
  heading: {
    fontWeight: 'bold',
    color: '#000000',
    description: 'Heading utama: bold, ukuran besar, warna hitam pekat',
  },
  subheading: {
    fontWeight: '600', // semi-bold / medium
    color: '#4B5563',
    description: 'Subheading: semi-bold atau medium, warna abu gelap',
  },
  body: {
    fontWeight: 'normal',
    color: '#1F2937',
    description: 'Body text: regular, warna abu gelap/hitam',
  },
  caption: {
    fontWeight: 'normal',
    color: '#6B7280',
    description: 'Caption/keterangan: ukuran kecil, warna abu-abu',
  },
};

// Skema Warna Base Master Tetap (Fixed Black & White)
const BASE_BW_COLOR_SCHEME = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#4B5563',
  border: '#E5E7EB',
  accent: '#000000',
};

/**
 * Validasi apakah font termasuk dalam daftar font yang didukung
 */
function isValidFont(fontName) {
  if (!fontName) return false;
  return SUPPORTED_FONTS.some((f) => f.toLowerCase() === fontName.trim().toLowerCase());
}

/**
 * Dapatkan pairing font secara acak atau pairing default
 */
function getRandomPairing() {
  const idx = Math.floor(Math.random() * FONT_PAIRINGS.length);
  return FONT_PAIRINGS[idx];
}

/**
 * Format string daftar font untuk disematkan dalam prompt AI
 */
function getPromptFontList() {
  return FONT_PAIRINGS.map(
    (p, i) => `${i + 1}. Heading: "${p.heading}" + Body: "${p.body}" (${p.rationale})`
  ).join('\n   ');
}

/**
 * Hitung ukuran font berdasarkan jenis slide / layout dan panjang teks
 */
function getFontSizeForSlide(slideTypeOrLayout, isTitle = false, textLength = 0) {
  let key = 'three-points';
  const rawKey = (slideTypeOrLayout || '').toLowerCase();

  if (rawKey.includes('cover-front') || rawKey === 'cover') {
    key = 'cover';
  } else if (rawKey.includes('cover-back') || rawKey === 'closing') {
    key = 'closing';
  } else if (rawKey.includes('table-of-contents') || rawKey === 'agenda') {
    key = 'agenda';
  } else if (rawKey.includes('chart')) {
    key = 'chart';
  } else if (rawKey.includes('testimonial')) {
    key = 'testimonial';
  } else if (rawKey.includes('one-point') || rawKey === '1') {
    key = 'one-point';
  } else if (rawKey.includes('two-points') || rawKey === '2') {
    key = 'two-points';
  } else if (rawKey.includes('three-points') || rawKey === '3') {
    key = 'three-points';
  } else if (rawKey.includes('four-points') || rawKey === '4') {
    key = 'four-points';
  } else if (rawKey.includes('five-points') || rawKey === '5') {
    key = 'five-points';
  } else if (rawKey.includes('six-points') || rawKey === '6') {
    key = 'six-points';
  }

  const rule = FONT_SIZE_RULES[key] || FONT_SIZE_RULES['three-points'];
  const target = isTitle ? rule.title : rule.content;

  if (textLength > 100) return target.min;
  if (textLength > 50) return Math.round((target.min + target.max) / 2);
  return target.default || target.max;
}

module.exports = {
  SUPPORTED_FONTS,
  FONT_PAIRINGS,
  FONT_SIZE_RULES,
  TEXT_FORMATTING_RULES,
  TEXT_HIERARCHY_RULES,
  BASE_BW_COLOR_SCHEME,
  isValidFont,
  getRandomPairing,
  getPromptFontList,
  getFontSizeForSlide,
};
