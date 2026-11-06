/**
 * Text Toolkit - Master PPT AI (Frontend)
 * Komponen tipografi dan aturan hierarki teks untuk Base Master Hitam & Putih.
 */

export const SUPPORTED_FONTS = [
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

export const FONT_PAIRINGS = [
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

export const FONT_SIZE_RULES = {
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

export const TEXT_FORMATTING_RULES = {
  styles: ['bold', 'italic', 'underline'],
  alignments: [
    { value: 'left', tooltip: 'Rata Kiri (Ctrl+L)' },
    { value: 'center', tooltip: 'Rata Tengah (Ctrl+E)' },
    { value: 'right', tooltip: 'Rata Kanan (Ctrl+R)' },
    { value: 'justify', tooltip: 'Justify (Ctrl+J)' },
  ],
  lineHeights: [1.0, 1.2, 1.5, 1.8, 2.0],
  // Skema warna teks terbatas hitam-putih
  allowedColors: [
    { label: 'Hitam', hex: '#000000' },
    { label: 'Abu Gelap', hex: '#4B5563' },
    { label: 'Abu', hex: '#6B7280' },
  ],
  fontSizes: [14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 54],
};

export const BASE_BW_COLOR_SCHEME = {
  background: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#4B5563',
  border: '#E5E7EB',
  accent: '#000000',
};

export default {
  SUPPORTED_FONTS,
  FONT_PAIRINGS,
  FONT_SIZE_RULES,
  TEXT_FORMATTING_RULES,
  BASE_BW_COLOR_SCHEME,
};
