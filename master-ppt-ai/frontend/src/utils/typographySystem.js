/**
 * Typography System & Global Tokens - Master PPT AI
 * Mendukung mode Otomatis (seragam seluruh slide) dan Manual (per peran teks)
 * Memastikan konsistensi 100% pada Preview Canvas dan Ekspor PPTX.
 */

export const SAFE_FONTS = [
  { id: 'Inter', label: 'Inter', category: 'Sans-Serif', fallback: 'Arial, sans-serif' },
  { id: 'Poppins', label: 'Poppins', category: 'Sans-Serif', fallback: 'Arial, sans-serif' },
  { id: 'Montserrat', label: 'Montserrat', category: 'Sans-Serif', fallback: 'Helvetica, Arial, sans-serif' },
  { id: 'Lato', label: 'Lato', category: 'Sans-Serif', fallback: 'Arial, sans-serif' },
  { id: 'Open Sans', label: 'Open Sans', category: 'Sans-Serif', fallback: 'Helvetica, Arial, sans-serif' },
  { id: 'Roboto', label: 'Roboto', category: 'Sans-Serif', fallback: 'Arial, sans-serif' },
  { id: 'Source Sans 3', label: 'Source Sans 3', category: 'Sans-Serif', fallback: 'Source Sans Pro, Arial, sans-serif' },
  { id: 'Merriweather', label: 'Merriweather', category: 'Serif', fallback: 'Georgia, serif' },
  { id: 'Playfair Display', label: 'Playfair Display', category: 'Serif', fallback: 'Georgia, serif' },
  { id: 'Arial', label: 'Arial', category: 'Standard', fallback: 'sans-serif' },
];

export const FONT_WEIGHT_OPTIONS = [
  { value: 300, label: 'Light', isBold: false },
  { value: 400, label: 'Regular', isBold: false },
  { value: 500, label: 'Medium', isBold: false },
  { value: 600, label: 'Semibold', isBold: true },
  { value: 700, label: 'Bold', isBold: true },
];

export const TYPOGRAPHY_COLORS = [
  { id: 'black', label: 'Hitam', hex: '#111827' },
  { id: 'dark-gray', label: 'Abu Gelap', hex: '#4B5563' },
  { id: 'gray', label: 'Abu', hex: '#9CA3AF' },
];

export const DEFAULT_TYPOGRAPHY_CONFIG = {
  mode: 'auto', // 'auto' | 'manual'
  fontFamily: 'Inter',
  scale: {
    title: {
      fontFamily: 'Inter',
      size: 32,
      weight: 700,
      lineHeight: 1.2,
      letterSpacing: -0.02,
      color: '#111827',
      align: 'left',
      isBold: true,
    },
    subtitle: {
      fontFamily: 'Inter',
      size: 22,
      weight: 600,
      lineHeight: 1.3,
      letterSpacing: -0.01,
      color: '#4B5563',
      align: 'left',
      isBold: true,
    },
    body: {
      fontFamily: 'Inter',
      size: 16,
      weight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      color: '#4B5563',
      align: 'left',
      isBold: false,
    },
    caption: {
      fontFamily: 'Inter',
      size: 12,
      weight: 400,
      lineHeight: 1.4,
      letterSpacing: 0,
      color: '#9CA3AF',
      align: 'left',
      isBold: false,
    },
  },
};

/**
 * Deteksi peran teks berdasarkan ID atau nama placeholder
 */
export function detectTextRole(placeholder) {
  if (!placeholder) return 'body';
  const id = (placeholder.id || '').toLowerCase();
  const name = (placeholder.name || '').toLowerCase();

  if (id.startsWith('title') || name.includes('judul slide') || name.includes('title')) {
    return 'title';
  }
  if (id.startsWith('subtitle') || name.includes('subjudul') || name.includes('subtitle') || id.includes('headline')) {
    return 'subtitle';
  }
  if (id.startsWith('caption') || id.startsWith('footer') || id.startsWith('presenter') || name.includes('keterangan') || name.includes('caption')) {
    return 'caption';
  }
  return 'body';
}

/**
 * Terapkan token tipografi ke sebuah placeholder.
 * Mengembalikan styling object untuk preview CSS dan PPTX props.
 */
export function resolvePlaceholderTypography(placeholder, typographyConfig, isDarkBg = false) {
  const cfg = typographyConfig || DEFAULT_TYPOGRAPHY_CONFIG;
  const role = detectTextRole(placeholder);
  const roleCfg = cfg.scale?.[role] || DEFAULT_TYPOGRAPHY_CONFIG.scale[role];

  let resolvedFontFamily = cfg.mode === 'auto' ? (cfg.fontFamily || 'Inter') : (roleCfg.fontFamily || cfg.fontFamily || 'Inter');
  let resolvedFontSize = roleCfg.size || 16;
  let resolvedWeight = roleCfg.weight || 400;
  let resolvedLineHeight = roleCfg.lineHeight || 1.4;
  let resolvedLetterSpacing = roleCfg.letterSpacing || 0;
  let resolvedAlign = placeholder.align || roleCfg.align || 'left';
  let resolvedColor = roleCfg.color || '#111827';

  // Override manual per elemen jika ada penanda khusus
  if (cfg.mode === 'manual' && placeholder.customTypographyOverride) {
    if (placeholder.font) resolvedFontFamily = placeholder.font;
    if (placeholder.fontSize) resolvedFontSize = placeholder.fontSize;
    if (placeholder.lineHeight) resolvedLineHeight = placeholder.lineHeight;
    if (placeholder.color) resolvedColor = placeholder.color;
  }

  // Kontras latar belakang gelap jika ada
  if (isDarkBg) {
    if (resolvedColor === '#111827' || resolvedColor === '#000000') {
      resolvedColor = '#FFFFFF';
    } else if (resolvedColor === '#4B5563') {
      resolvedColor = '#E5E7EB';
    }
  }

  const isBold = resolvedWeight >= 600 || !!placeholder.isBold;

  return {
    role,
    fontFamily: resolvedFontFamily,
    fontSize: resolvedFontSize,
    fontWeight: resolvedWeight,
    lineHeight: resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color: resolvedColor,
    align: resolvedAlign,
    isBold,
  };
}

/**
 * Evaluasi variasi ukuran font di seluruh deck untuk peringatan konsistensi manual
 */
export function checkTypographyConsistency(slides, typographyConfig) {
  const warnings = [];
  if (!typographyConfig || typographyConfig.mode !== 'manual') return warnings;

  const fontSizes = new Set();
  const fontFamilies = new Set();

  (slides || []).forEach((slide) => {
    (slide.placeholders || []).forEach((p) => {
      if (p.type === 'text') {
        const resolved = resolvePlaceholderTypography(p, typographyConfig);
        fontSizes.add(resolved.fontSize);
        fontFamilies.add(resolved.fontFamily);
      }
    });
  });

  if (fontSizes.size > 3) {
    warnings.push(`Terdapat ${fontSizes.size} variasi ukuran font yang berbeda. Direkomendasikan maksimal 3 variasi agar hierarki tetap rapi.`);
  }

  if (fontFamilies.size > 2) {
    warnings.push(`Terdapat ${fontFamilies.size} jenis font yang berbeda. Direkomendasikan menggunakan maksimal 1-2 jenis font dalam satu presentasi.`);
  }

  return warnings;
}
