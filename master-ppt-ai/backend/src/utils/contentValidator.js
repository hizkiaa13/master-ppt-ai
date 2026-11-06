/**
 * Content Relevance Validator - Master PPT AI
 * Memvalidasi apakah konten presentasi yang dihasilkan AI benar-benar relevan dengan judul dari pengguna.
 */

const STOP_WORDS = [
  'dan', 'atau', 'untuk', 'dengan', 'yang', 'di', 'ke', 'dari', 'pada', 'dalam',
  'oleh', 'karena', 'tentang', 'adalah', 'sebagai', 'ini', 'itu', 'kami', 'kita',
  'anda', 'saya', 'bisa', 'akan', 'harus', 'dapat', 'lebih', 'sangat', 'secara',
  'the', 'and', 'or', 'for', 'with', 'of', 'in', 'to', 'a', 'an', 'is', 'are',
  'was', 'were', 'by', 'at', 'from', 'about', 'as', 'into', 'our', 'your', 'this',
  'that', 'these', 'those', 'how', 'what', 'why', 'when', 'where', 'who'
];

/**
 * Ekstrak kata kunci penting dari judul presentasi
 * @param {string} title - Judul presentasi
 * @returns {string[]} Array keyword
 */
function extractTitleKeywords(title) {
  if (!title || typeof title !== 'string') return [];
  
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(word => word.length >= 3 && !STOP_WORDS.includes(word));
}

/**
 * Validasi relevansi konten AI terhadap judul user
 * @param {Object} aiResult - Objek hasil AI ({ slides: [...] })
 * @param {string} userTitle - Judul presentasi yang dimasukkan user
 * @param {string} [userDesc] - Deskripsi tambahan (opsional)
 * @returns {Object} { isRelevant, relevanceScore, relevantSlides, totalSlides, keywords }
 */
function validateContentRelevance(aiResult, userTitle, userDesc = '') {
  if (!aiResult || !Array.isArray(aiResult.slides) || aiResult.slides.length === 0) {
    return {
      isRelevant: false,
      relevanceScore: 0,
      relevantSlides: 0,
      totalSlides: 0,
      keywords: [],
    };
  }

  const titleKeywords = extractTitleKeywords(userTitle);
  const descKeywords = extractTitleKeywords(userDesc);
  const allKeywords = [...new Set([...titleKeywords, ...descKeywords])];

  // Jika judul sangat pendek tanpa keyword signifikan (misal "AI"), gunakan seluruh kata lowercase > 1 huruf
  if (allKeywords.length === 0 && userTitle.trim().length > 0) {
    allKeywords.push(userTitle.trim().toLowerCase());
  }

  let relevantSlides = 0;
  const totalSlides = aiResult.slides.length;

  aiResult.slides.forEach((slide, idx) => {
    // Cover dan closing selalu relevan jika judul ada
    if (idx === 0 || idx === totalSlides - 1 || slide.layoutId?.startsWith('cover-')) {
      relevantSlides++;
      return;
    }

    const slideText = [
      slide.title || '',
      slide.subtitle || '',
      Array.isArray(slide.content) ? slide.content.join(' ') : (slide.content || ''),
      slide.description || ''
    ].join(' ').toLowerCase();

    // Cek apakah minimal salah satu kata kunci muncul di slide ini
    const hasKeyword = allKeywords.some(kw => slideText.includes(kw));
    if (hasKeyword) {
      relevantSlides++;
    }
  });

  const relevanceScore = Math.round((relevantSlides / totalSlides) * 100);

  return {
    isRelevant: relevanceScore >= 60,
    relevanceScore,
    relevantSlides,
    totalSlides,
    keywords: allKeywords,
  };
}

module.exports = {
  STOP_WORDS,
  extractTitleKeywords,
  validateContentRelevance,
};
