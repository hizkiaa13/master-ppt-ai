/**
 * Content Relevance Validator - Master PPT AI
 * Memvalidasi apakah konten presentasi yang dihasilkan AI benar-benar relevan dengan judul dari pengguna.
 */

function validateContentRelevance(aiResult, userTitle) {
  const stopWords = [
    'dan', 'atau', 'untuk', 'dengan', 'yang', 'di', 'ke', 'dari', 'pada', 'dalam',
    'oleh', 'karena', 'tentang', 'adalah', 'sebagai', 'ini', 'itu', 'kami', 'kita',
    'anda', 'saya', 'bisa', 'akan', 'harus', 'dapat', 'lebih', 'sangat', 'secara',
    'the', 'and', 'or', 'for', 'with', 'of', 'in', 'to', 'a', 'an', 'is', 'are',
    'was', 'were', 'by', 'at', 'from', 'about', 'as', 'into', 'our', 'your', 'this',
    'that', 'these', 'those', 'how', 'what', 'why', 'when', 'where', 'who'
  ];

  if (!aiResult || !Array.isArray(aiResult.slides) || aiResult.slides.length === 0) {
    return {
      isRelevant: false,
      relevanceScore: 0,
      relevantSlides: 0,
      totalSlides: 0,
    };
  }

  const keywords = (userTitle || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(word => word.length > 3 && !stopWords.includes(word));

  // Fallback jika judul hanya kata pendek (misal "AI", "SEO")
  if (keywords.length === 0 && (userTitle || '').trim().length > 0) {
    keywords.push((userTitle || '').trim().toLowerCase());
  }

  let relevantSlides = 0;

  aiResult.slides.forEach(slide => {
    const slideText = JSON.stringify(slide).toLowerCase();
    const hasKeyword = keywords.some(keyword => slideText.includes(keyword));
    if (hasKeyword) relevantSlides++;
  });

  const relevanceScore = Math.round((relevantSlides / aiResult.slides.length) * 100);

  return {
    isRelevant: relevanceScore >= 60,
    relevanceScore,
    relevantSlides,
    totalSlides: aiResult.slides.length,
    keywords,
  };
}

module.exports = {
  validateContentRelevance,
};
