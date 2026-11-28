/**
 * Topic-Derived Subtopics Generator
 * Menghasilkan judul sub-bab (2-5 kata) dan penjelasan substantif (1 kalimat)
 * yang diturunkan secara dinamis dari kata kunci topik slide & tema presentasi.
 * TIDAK PERNAH menggunakan teks contoh statis (dummy text).
 */

const ID_STOP_WORDS = new Set([
  'dan', 'atau', 'yang', 'untuk', 'pada', 'ke', 'di', 'dari', 'dalam', 'ini', 'itu',
  'adalah', 'sebagai', 'oleh', 'dengan', 'tentang', 'atas', 'bawah', 'secara',
  'slide', 'halaman', 'poin', 'materi', 'topik', 'ringkasan', 'overview', 'bab',
  'studi', 'kasus', 'presentasi', 'fokus', 'strategis', 'pilar', 'fase', 'tahap'
]);

const EN_STOP_WORDS = new Set([
  'and', 'or', 'the', 'for', 'at', 'to', 'in', 'on', 'from', 'with', 'is', 'as',
  'by', 'of', 'this', 'that', 'slide', 'page', 'point', 'points', 'topic', 'overview',
  'chapter', 'case', 'study', 'presentation', 'about', 'strategic', 'pillar', 'phase'
]);

/**
 * Ekstraksi kata kunci yang bermakna dari teks judul/topik
 */
export function extractKeywords(text = '', isEn = false) {
  if (!text || typeof text !== 'string') return [];
  const stopWords = isEn ? EN_STOP_WORDS : ID_STOP_WORDS;
  
  const tokens = text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()));

  // Deduplikasi dengan mempertahankan urutan kemunculan
  const unique = [];
  tokens.forEach((t) => {
    const formatted = t.charAt(0).toUpperCase() + t.slice(1);
    if (!unique.some((u) => u.toLowerCase() === formatted.toLowerCase())) {
      unique.push(formatted);
    }
  });

  return unique;
}

/**
 * Menghasilkan array poin dengan format "[Judul Sub-Bab]: [Penjelasan 1 Kalimat]"
 * berdasarkan kata kunci dari slideTitle dan presentationTopic.
 *
 * @param {Object} params
 * @param {string} params.slideTitle - Judul slide saat ini
 * @param {string} params.presentationTopic - Tema/topik presentasi keseluruhan
 * @param {Array<string>} params.existingPoints - Poin yang sudah ada (dipertahankan)
 * @param {number} params.targetCount - Total jumlah poin yang diinginkan
 * @param {boolean} params.isEn - Bahasa Inggris (true) atau Indonesia (false)
 * @returns {Array<string>} Array poin siap pakai berbobot substantif
 */
export function generateTopicDerivedSubtopics({
  slideTitle = '',
  presentationTopic = '',
  existingPoints = [],
  targetCount = 3,
  isEn = false,
}) {
  const result = [...(existingPoints || []).filter((p) => p && typeof p === 'string' && p.trim())];
  if (result.length >= targetCount) {
    return result.slice(0, targetCount);
  }

  const needed = targetCount - result.length;

  // Ekstrak kata kunci dari slideTitle dan presentationTopic
  const titleKeywords = extractKeywords(slideTitle, isEn);
  const topicKeywords = extractKeywords(presentationTopic, isEn);
  const combinedKeywords = [...titleKeywords];
  topicKeywords.forEach((kw) => {
    if (!combinedKeywords.some((k) => k.toLowerCase() === kw.toLowerCase())) {
      combinedKeywords.push(kw);
    }
  });

  const kw1 = combinedKeywords[0] || (isEn ? 'Core Initiatives' : 'Inisiatif Utama');
  const kw2 = combinedKeywords[1] || (isEn ? 'Operations' : 'Operasional');
  const kw3 = combinedKeywords[2] || (isEn ? 'Execution' : 'Implementasi');

  const topicPhrase = slideTitle.trim() || presentationTopic.trim() || (isEn ? 'the core objective' : 'objektif utama');

  // Semantic Angle Templates (Variasi sub-bab kontekstual spesifik topik)
  const templatesId = [
    {
      title: `Analisis Kebutuhan ${kw1}`,
      body: `Pemetaan menyeluruh terhadap ekosistem ${topicPhrase} guna mengidentifikasi prioritas dasar dan celah perbaikan.`,
    },
    {
      title: `Penerapan Solusi ${kw2}`,
      body: `Eksekusi terarah pada instrumen ${topicPhrase} guna mempercepat pencapaian target kerja secara terukur.`,
    },
    {
      title: `Pengembangan Mekanisme ${kw1}`,
      body: `Modernisasi alur kerja serta penguatan kapasitas tim dalam menjalankan agenda ${topicPhrase}.`,
    },
    {
      title: `Evaluasi Capaian ${kw3}`,
      body: `Pemantauan indikator kinerja kunci secara berkala guna menjamin kualitas luaran ${topicPhrase}.`,
    },
    {
      title: `Integrasi Alur ${kw1}`,
      body: `Penyelarasan koordinasi lintas fungsi demi efektivitas tata kelola pelaksanaan ${topicPhrase}.`,
    },
    {
      title: `Keberlanjutan Program ${kw2}`,
      body: `Penguatan daya adaptasi jangka panjang untuk mendukung stabilitas dan pertumbuhan ${topicPhrase}.`,
    },
    {
      title: `Mitigasi Kendala ${kw1}`,
      body: `Penerapan protokol pengawasan proaktif guna meminimalkan hambatan operasional pada ${topicPhrase}.`,
    },
    {
      title: `Efisiensi Alokasi ${kw3}`,
      body: `Pemanfaatan sumber daya strategis secara optimal demi memaksimalkan dampak positif ${topicPhrase}.`,
    },
  ];

  const templatesEn = [
    {
      title: `${kw1} Assessment & Scope`,
      body: `Comprehensive diagnostic of the ${topicPhrase} landscape to establish baseline priorities and scope.`,
    },
    {
      title: `${kw2} Solution Deployment`,
      body: `Direct operational execution of ${topicPhrase} initiatives to drive measurable project milestones.`,
    },
    {
      title: `${kw1} Capability Enhancement`,
      body: `Refining functional toolsets and modernizing workflows across the entire ${topicPhrase} lifecycle.`,
    },
    {
      title: `${kw3} Metric Governance`,
      body: `Continuous telemetry and benchmark tracking to guarantee elite quality throughout ${topicPhrase}.`,
    },
    {
      title: `${kw1} Workflow Integration`,
      body: `Synchronizing cross-functional stakeholders to elevate organizational alignment in ${topicPhrase}.`,
    },
    {
      title: `Sustainable ${kw2} Roadmap`,
      body: `Architecting resilient protocols to support prolonged continuity and scalability for ${topicPhrase}.`,
    },
    {
      title: `${kw1} Risk Mitigation`,
      body: `Establishing proactive safeguards to minimize operational bottlenecks across ${topicPhrase}.`,
    },
    {
      title: `${kw3} Resource Efficiency`,
      body: `Optimizing resource distribution to maximize strategic return and agility in ${topicPhrase}.`,
    },
  ];

  const templates = isEn ? templatesEn : templatesId;

  // Hindari duplikasi judul dengan poin yang sudah ada
  const existingLower = result.map((p) => p.toLowerCase());
  let addedCount = 0;
  let idx = 0;

  while (addedCount < needed && idx < templates.length) {
    const candidate = `${templates[idx].title}: ${templates[idx].body}`;
    const candidateTitle = templates[idx].title.toLowerCase();

    const isDuplicate = existingLower.some((p) => p.includes(candidateTitle));
    if (!isDuplicate) {
      result.push(candidate);
      existingLower.push(candidate.toLowerCase());
      addedCount++;
    }
    idx++;
  }

  // Jika masih kurang dari targetCount karena targetCount > templates.length
  while (result.length < targetCount) {
    const n = result.length + 1;
    const extra = isEn
      ? `${kw1} Milestone ${n}: Dedicated operational phase advancing ${topicPhrase}.`
      : `Langkah ${kw1} Bagian ${n}: Pelaksanaan terukur dalam mendukung keberhasilan ${topicPhrase}.`;
    result.push(extra);
  }

  return result.slice(0, targetCount);
}

export default {
  extractKeywords,
  generateTopicDerivedSubtopics,
};
