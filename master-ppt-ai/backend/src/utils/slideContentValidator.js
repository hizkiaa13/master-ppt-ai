/**
 * Slide Content Validator
 * Memvalidasi konten slide sebelum ekspor PPTX dan setelah generasi AI
 * Memastikan tidak ada slide kosong, dummy text, atau placeholder generik
 */

const dummyPatterns = [
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
 * Cek apakah sebuah teks tergolong dummy text atau kosong
 */
function isDummyText(text, options = {}) {
  if (text === null || text === undefined) return true;
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed === "") return true;

  // Izinkan website / email resmi jika dalam konteks kontak slide penutup
  if (options.isClosingContact) {
    if (/reallygreatsite/i.test(trimmed) || /situssupercanggih/i.test(trimmed)) {
      return false;
    }
  }

  // Khusus check Reallygreatsite / situssupercanggih di luar contact
  if (!options.isClosingContact) {
    if (/reallygreatsite/i.test(trimmed) || /situssupercanggih/i.test(trimmed)) {
      return true;
    }
  }

  return dummyPatterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Validasi konten semua slide
 * @param {Array} slides - Array objek slide
 * @param {string} userTitle - Judul presentasi dari user
 * @param {string} outputLanguage - 'id' atau 'en'
 * @returns {Object} { isValid: boolean, invalidSlides: Array, totalSlides: number }
 */
function validateSlideContent(slides, userTitle = "", outputLanguage = "id") {
  if (!Array.isArray(slides) || slides.length === 0) {
    return {
      isValid: false,
      totalSlides: 0,
      invalidSlides: [
        {
          slideNumber: 1,
          reason: "Deck slide kosong, tidak ada slide yang ditemukan",
        },
      ],
    };
  }

  const invalidSlides = [];

  slides.forEach((slide, idx) => {
    const slideNumber = slide.slideNumber || idx + 1;
    const slideType = (slide.slideType || "").toLowerCase();
    const isCover = slideType === "cover" || idx === 0;
    const isClosing = slideType === "closing" || slideType === "conclusion" || idx === slides.length - 1;

    const reasons = [];

    // 1. Cek Judul Slide
    const title = slide.title || "";
    if (!title || typeof title !== "string" || title.trim() === "") {
      reasons.push("Judul slide kosong");
    } else if (isDummyText(title)) {
      reasons.push(`Judul slide mengandung dummy text: "${title}"`);
    }

    // 2. Cek Konten Slide (untuk slide non-cover & non-closing)
    if (!isCover && !isClosing) {
      const content = slide.content;
      if (!content || !Array.isArray(content) || content.length === 0) {
        reasons.push("Slide konten tidak memiliki poin pembahasan (content array kosong)");
      } else {
        const dummyItems = content.filter((item) => isDummyText(item));
        if (dummyItems.length === content.length) {
          reasons.push("Semua poin konten pada slide berisi dummy text atau kosong");
        } else if (dummyItems.length > 0) {
          reasons.push(`Terdapat ${dummyItems.length} poin konten yang masih berupa dummy text`);
        }
      }
    }

    // 3. Cek Cover & Closing
    if (isCover) {
      if (!slide.title || isDummyText(slide.title)) {
        reasons.push("Slide cover tidak memiliki judul utama yang valid");
      }
    }

    if (isClosing) {
      if (!slide.title || isDummyText(slide.title)) {
        reasons.push("Slide penutup tidak memiliki judul penutup yang valid");
      }
    }

    if (reasons.length > 0) {
      invalidSlides.push({
        slideNumber,
        slideType,
        layoutId: slide.layoutId,
        title: slide.title,
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

module.exports = {
  dummyPatterns,
  isDummyText,
  validateSlideContent,
};
