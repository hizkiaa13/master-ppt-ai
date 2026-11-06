/**
 * Content Relevance Validator - Master PPT AI
 * Memvalidasi apakah konten presentasi yang dihasilkan AI benar-benar relevan dengan judul dari pengguna.
 * Mendukung pencocokan dwibahasa (ID <-> EN) secara otomatis.
 */

const DICTIONARY_MAP = {
  // ID -> EN
  'strategi': ['strategy', 'strategic'],
  'pemasaran': ['marketing', 'market'],
  'penjualan': ['sales', 'selling'],
  'bisnis': ['business', 'enterprise'],
  'digital': ['digital'],
  'teknologi': ['technology', 'tech'],
  'produk': ['product'],
  'pelanggan': ['customer', 'client', 'consumer'],
  'rencana': ['plan', 'planning', 'roadmap'],
  'kinerja': ['performance'],
  'manajemen': ['management', 'managing'],
  'keuangan': ['finance', 'financial'],
  'pendidikan': ['education', 'learning', 'training'],
  'kesehatan': ['health', 'healthcare'],
  'transformasi': ['transformation', 'transform'],
  'operasional': ['operations', 'operational'],
  'pengembangan': ['development', 'growth'],
  'kepemimpinan': ['leadership', 'leader'],
  'inovasi': ['innovation', 'innovative'],
  'analisis': ['analysis', 'analytics'],
  'target': ['target', 'goal', 'objective'],
  'riset': ['research'],
  'proyek': ['project'],
  'data': ['data'],
  'kecerdasan': ['intelligence'],
  'buatan': ['artificial'],
  'sistem': ['system'],
  'evaluasi': ['evaluation', 'assessment'],
  'keberlanjutan': ['sustainability', 'sustainable'],
  'komunikasi': ['communication'],
  'eksekusi': ['execution'],
  'pilar': ['pillar', 'foundational'],
  'tahapan': ['steps', 'phases', 'stages'],

  // EN -> ID
  'strategy': ['strategi', 'strategis'],
  'marketing': ['pemasaran', 'pasar'],
  'sales': ['penjualan'],
  'business': ['bisnis', 'usaha'],
  'technology': ['teknologi'],
  'product': ['produk'],
  'customer': ['pelanggan', 'konsumen'],
  'plan': ['rencana', 'perencanaan'],
  'performance': ['kinerja'],
  'management': ['manajemen', 'pengelolaan'],
  'finance': ['keuangan', 'finansial'],
  'education': ['pendidikan', 'pelatihan'],
  'growth': ['pertumbuhan', 'pengembangan'],
  'innovation': ['inovasi'],
  'analysis': ['analisis'],
  'leadership': ['kepemimpinan'],
};

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

  const baseKeywords = (userTitle || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Kembangkan kata kunci dengan padanan kamus dwibahasa
  const expandedKeywords = new Set(baseKeywords);
  baseKeywords.forEach(kw => {
    if (DICTIONARY_MAP[kw]) {
      DICTIONARY_MAP[kw].forEach(synonym => expandedKeywords.add(synonym));
    }
  });

  const keywords = Array.from(expandedKeywords);

  // Fallback jika judul hanya kata sangat pendek (misal "AI", "VR")
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
    isRelevant: relevanceScore >= 50, // Minimal 50% slide memuat kata kunci/padanannya
    relevanceScore,
    relevantSlides,
    totalSlides: aiResult.slides.length,
    keywords,
  };
}

module.exports = {
  validateContentRelevance,
};
