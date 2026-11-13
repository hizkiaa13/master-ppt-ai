/**
 * Frontend Slide Content Validator
 * Memvalidasi slide sebelum ekspor PPTX untuk mencegah slide kosong atau dummy text
 */

export const dummyPatterns = [
  /lorem\s+ipsum/i,
  /write\s+a\s+short\s+description/i,
  /write\s+a\s+quick\s+introduction/i,
  /add\s+a\s+main\s+point/i,
  /add\s+a\s+short\s+description/i,
  /your\s+title\s+here/i,
  /title\s+of\s+the\s+presentation/i,
  /title\s+of\s+the\s+inner\s+page/i,
  /write\s+a\s+subtopic/i,
  /write\s+any\s+related\s+idea/i,
  /support\s+it\s+with\s+a\s+brief\s+explanation/i,
  /briefly\s+elaborate/i,
  /presented\s+by/i,
  /add\s+a\s+short\s+description\s+explaining/i,
  /write\s+an\s+original\s+impactful/i,
  /poin\s+strategi\s+\d+\s+untuk\s+implementasi/i,
  /implementasi\s+berkelanjutan/i,
  /penjelasan\s+implementasi\s+rencana\s+kerja/i,
  /fokus\s+utama\s+ke-\d+:\s+penjelasan\s+mendalam/i,
];

/**
 * Cek apakah string merupakan dummy text
 */
export function isDummyText(text, options = {}) {
  if (text === null || text === undefined) return true;
  if (typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed === '') return true;

  if (options.isClosingContact) {
    if (/reallygreatsite/i.test(trimmed) || /situssupercanggih/i.test(trimmed)) {
      return false;
    }
  }

  if (!options.isClosingContact) {
    if (/reallygreatsite/i.test(trimmed) || /situssupercanggih/i.test(trimmed)) {
      return true;
    }
  }

  return dummyPatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Validasi seluruh slide di frontend sebelum ekspor PPTX
 * @param {Array} slides - Array slide objek yang ada di state editor
 * @param {string} userTitle - Judul presentasi
 * @returns {Object} { isValid: boolean, invalidSlides: Array, totalSlides: number }
 */
export function validateSlideDeckBeforeExport(slides, userTitle = '') {
  if (!Array.isArray(slides) || slides.length === 0) {
    return {
      isValid: false,
      totalSlides: 0,
      invalidSlides: [{ slideNumber: 1, reasons: ['Slide deck kosong'] }],
    };
  }

  const invalidSlides = [];

  slides.forEach((slide, idx) => {
    const slideNumber = slide.slideNumber || idx + 1;
    const placeholders = Array.isArray(slide.placeholders) ? slide.placeholders : [];
    const isCover = slide.slideType === 'cover' || idx === 0;
    const isClosing = slide.slideType === 'closing' || idx === slides.length - 1;
    const reasons = [];

    // 1. Cek keberadaan placeholder
    if (placeholders.length === 0) {
      reasons.push('Slide tidak memiliki elemen atau placeholder sama sekali.');
    } else {
      // Cek apakah ada minimal satu placeholder yang memiliki teks terisi
      const textPlaceholders = placeholders.filter((p) => p.type === 'text' || !p.type);
      const filledTextPlaceholders = textPlaceholders.filter((p) => p.content && p.content.trim().length > 0);

      if (filledTextPlaceholders.length === 0) {
        reasons.push('Slide kosong (tidak ada teks di dalam slide ini).');
      }

      // 2. Cek Judul
      const titleP = placeholders.find((p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul'));
      const rawTitle = titleP ? titleP.content : (slide.title || '');

      if (!rawTitle || rawTitle.trim() === '') {
        reasons.push('Judul slide masih kosong.');
      } else if (isDummyText(rawTitle)) {
        reasons.push(`Judul slide mengandung placeholder/dummy text: "${rawTitle}"`);
      }

      // 3. Cek Konten untuk slide non-cover & non-closing
      if (!isCover && !isClosing) {
        const pointPlaceholders = placeholders.filter((p) => p.id?.startsWith('point-') || p.id?.startsWith('info-'));
        if (pointPlaceholders.length === 0 && !placeholders.some(p => p.type === 'image')) {
          reasons.push('Slide tidak memiliki poin pembahasan.');
        } else if (pointPlaceholders.length > 0) {
          const dummyPoints = pointPlaceholders.filter((p) => isDummyText(p.content));
          if (dummyPoints.length === pointPlaceholders.length) {
            reasons.push('Semua poin pembahasan pada slide masih berupa placeholder atau kosong.');
          } else if (dummyPoints.length > 0) {
            reasons.push(`Ada ${dummyPoints.length} poin yang masih berupa dummy text.`);
          }
        }
      }
    }

    if (reasons.length > 0) {
      invalidSlides.push({
        slideNumber,
        slideTitle: slide.title || `Slide ${slideNumber}`,
        reasons,
      });
    }
  });

  return {
    isValid: invalidSlides.length === 0,
    totalSlides: slides.length,
    invalidSlides,
  };
}

export default {
  dummyPatterns,
  isDummyText,
  validateSlideDeckBeforeExport,
};
