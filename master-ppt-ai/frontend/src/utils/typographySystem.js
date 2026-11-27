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

export const DEFAULT_SPACING_CONFIG = {
  lineHeightBody: 1.5,
  lineHeightTitle: 1.2,
  gapBetweenPoints: 16,
  gapTitleToBody: 8,
  gapBetweenParagraphs: 8,
  cardPadding: 16,
};

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
  spacing: DEFAULT_SPACING_CONFIG,
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

/**
 * Resolusi konfigurasi spacing global
 */
export function resolveSpacingConfig(typographyConfig) {
  const base = typographyConfig?.spacing || DEFAULT_SPACING_CONFIG;
  const bodyLineHeight = typographyConfig?.scale?.body?.lineHeight || base.lineHeightBody || 1.5;
  const titleLineHeight = typographyConfig?.scale?.title?.lineHeight || base.lineHeightTitle || 1.2;

  return {
    lineHeightBody: bodyLineHeight,
    lineHeightTitle: titleLineHeight,
    gapBetweenPoints: base.gapBetweenPoints !== undefined ? base.gapBetweenPoints : 16,
    gapTitleToBody: base.gapTitleToBody !== undefined ? base.gapTitleToBody : 8,
    gapBetweenParagraphs: base.gapBetweenParagraphs !== undefined ? base.gapBetweenParagraphs : 8,
    cardPadding: base.cardPadding !== undefined ? base.cardPadding : 16,
  };
}

/**
 * Kelompokkan placeholder kartu poin berdasarkan baris vertikal (koordinat Y serupa)
 */
export function groupPlaceholdersByRow(pointPlaceholders, yTolerance = 7) {
  const sorted = [...pointPlaceholders].sort((a, b) => {
    const yA = parseFloat(a.position?.y) || 0;
    const yB = parseFloat(b.position?.y) || 0;
    return yA - yB;
  });

  const rows = [];
  sorted.forEach((p) => {
    const y = parseFloat(p.position?.y) || 0;
    const matchingRow = rows.find((r) => Math.abs(r.y - y) <= yTolerance);
    if (matchingRow) {
      matchingRow.items.push(p);
      matchingRow.y = matchingRow.items.reduce((sum, item) => sum + (parseFloat(item.position?.y) || 0), 0) / matchingRow.items.length;
    } else {
      rows.push({ y, items: [p] });
    }
  });

  rows.forEach((r) => {
    r.items.sort((a, b) => (parseFloat(a.position?.x) || 0) - (parseFloat(b.position?.x) || 0));
  });

  return rows;
}

/**
 * Menghitung perkiraan tinggi kebutuhan kartu poin dalam satuan persentase slide (0-100%).
 * Berdasarkan panjang teks, ukuran font, padding kartu, line height, dan badge aksesoris.
 */
export function estimateCardHeightPercent(placeholder, typographyConfig, canvasWidth = 960, canvasHeight = 540) {
  const typo = resolvePlaceholderTypography(placeholder, typographyConfig);
  const spacing = resolveSpacingConfig(typographyConfig);

  const cardWPercent = parseFloat(placeholder.position?.w) || 30;
  const cardWPx = (cardWPercent / 100) * canvasWidth;
  // Area bersih teks di dalam kartu (dikurangi padding kiri dan kanan)
  const usableWidthPx = Math.max(80, cardWPx - (spacing.cardPadding * 2));

  const fontSize = typo.fontSize || 16;
  const lineHeightPx = fontSize * (spacing.lineHeightBody || 1.5);

  // Estimasi karakter per baris (lebar rata-rata karakter proporsional ~ 0.52 * fontSize)
  const charsPerLine = Math.max(12, Math.floor(usableWidthPx / (fontSize * 0.52)));

  // Hitung jumlah baris dari teks (memperhitungkan paragraf dan wrapping)
  const content = (placeholder.content || '').trim();
  const paragraphs = content ? content.split(/\n+/) : [''];

  let totalLines = 0;
  paragraphs.forEach((p) => {
    const pTrim = p.trim();
    if (!pTrim) {
      totalLines += 1;
    } else {
      const wrappedLines = Math.max(1, Math.ceil(pTrim.length / charsPerLine));
      totalLines += wrappedLines;
    }
  });

  // Tinggi teks murni + gap antar paragraf
  const textHeightPx = (totalLines * lineHeightPx) + Math.max(0, (paragraphs.length - 1) * spacing.gapBetweenParagraphs);

  // Tambahan tinggi untuk badge/header (arrow, rating, stepLabel, stat, number)
  let headerHeightPx = 0;
  if (placeholder.badge === 'arrow' || placeholder.stepLabel || placeholder.number) {
    headerHeightPx = 22 + spacing.gapTitleToBody;
  } else if (placeholder.badge === 'stat') {
    headerHeightPx = 48 + spacing.gapTitleToBody;
  } else if (placeholder.badge === 'rating') {
    headerHeightPx = 40 + spacing.gapTitleToBody;
  }

  // Total tinggi dalam pixel (termasuk padding atas & bawah)
  const totalHeightPx = textHeightPx + headerHeightPx + (spacing.cardPadding * 2);

  // Konversi ke persentase slide height
  const percentH = (totalHeightPx / canvasHeight) * 100;
  return Math.round(percentH * 10) / 10;
}

/**
 * Samakan tinggi kartu poin yang berada dalam satu baris (row-equalized heights).
 * Mengembalikan array placeholders baru dengan tinggi yang setara per baris,
 * disejajarkan dari atas (top alignment) tanpa kartu pendek yang menggantung.
 */
export function equalizePointCardHeights(placeholders = [], typographyConfig = null, layoutId = '', canvasWidth = 960, canvasHeight = 540) {
  if (!Array.isArray(placeholders) || placeholders.length === 0) return placeholders;

  // Jangan sentuh layout khusus non-grid card
  if (layoutId === 'table-of-contents' || layoutId.startsWith('agenda-') || layoutId === 'cover-front' || layoutId === 'cover-back' || layoutId === 'one-point') {
    return placeholders;
  }

  const pointPlaceholders = placeholders.filter((p) => p.id?.startsWith('point-') && p.type === 'text');
  if (pointPlaceholders.length <= 1) return placeholders;

  const rows = groupPlaceholdersByRow(pointPlaceholders);
  const rowHeightMap = new Map();

  const isMultiRow = rows.length > 1;

  rows.forEach((row) => {
    let maxNeededH = 0;
    let minRowY = 100;

    row.items.forEach((item) => {
      const existingH = parseFloat(item.position?.h) || 20;
      const existingY = parseFloat(item.position?.y) || 20;
      minRowY = Math.min(minRowY, existingY);

      const neededH = estimateCardHeightPercent(item, typographyConfig, canvasWidth, canvasHeight);
      maxNeededH = Math.max(maxNeededH, existingH, neededH);
    });

    const maxAllowedH = isMultiRow ? 36 : 65;
    const finalH = Math.min(maxAllowedH, Math.max(20, maxNeededH));

    row.items.forEach((item) => {
      rowHeightMap.set(item.id, { h: finalH, y: minRowY });
    });
  });

  return placeholders.map((p) => {
    if (rowHeightMap.has(p.id)) {
      const { h, y } = rowHeightMap.get(p.id);
      return {
        ...p,
        position: {
          ...p.position,
          h,
          y,
        },
      };
    }
    return p;
  });
}
