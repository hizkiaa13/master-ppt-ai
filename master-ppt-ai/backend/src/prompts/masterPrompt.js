/**
 * Master Prompt Generator for AI PowerPoint Deck Generation
 * Versi Base Master (Hitam & Putih) dengan Relevansi Ketat & Dukungan Penuh Multi-Bahasa (ID & EN).
 * Mendukung Auto AI Mode & Manual Layout Mode.
 */

const { getPromptFontList } = require('../utils/textToolkit');
const { getPromptToolkitText } = require('../utils/placeholderToolkit');

/**
 * Format layout selections for prompt
 */
function formatLayoutSelections(layoutSelections) {
  if (!Array.isArray(layoutSelections) || layoutSelections.length === 0) return '';
  return layoutSelections
    .map((item, idx) => `Slide ${item.slideNumber || idx + 1}: ${item.layoutId}`)
    .join('\n');
}

/**
 * Prompt AI untuk menjamin 100% relevansi materi slide dengan judul dan bahasa yang tepat
 */
function buildMasterPrompt({
  title,
  description,
  outputLanguage = 'id',
  slideCount = 5,
  retryContext = false,
  layoutMode = 'auto',
  layoutSelections = [],
}) {
  const fontList = getPromptFontList();
  const toolkitText = getPromptToolkitText(outputLanguage);
  const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);
  const isEn = (outputLanguage || 'id').toLowerCase() === 'en';
  const isManual = layoutMode === 'manual' && Array.isArray(layoutSelections) && layoutSelections.length > 0;

  const retryInstruction = retryContext
    ? (isEn
        ? `\n⚠️ STRICT REGENERATE WARNING:
THE PREVIOUS OUTPUT DRIFTED, CONTAINED DUMMY TEXT, OR WAS NOT SUFFICIENTLY RELEVANT TO "${title}".
Re-generate content that is 100% focused on "${title}". Do NOT deviate from the topic and do NOT use any dummy text or placeholder!\n`
        : `\n⚠️ PERINGATAN KERAS REGENERATE:
HASIL SEBELUMNYA TIDAK RELEVAN, MENGANDUNG DUMMY TEXT, ATAU MENYIMPANG DARI JUDUL "${title}".
Judul user adalah "${title}". Buat ulang konten yang 100% membahas "${title}". DILARANG KERAS menggunakan dummy text atau kalimat template kosong!\n`)
    : '';

  // ════════════════════════════════════════════════════════════════
  // PROMPT UNTUK BAHASA INGGRIS (100% English prompt & examples)
  // ════════════════════════════════════════════════════════════════
  if (isEn) {
    const manualLayoutInstruction = isManual
      ? `
CRITICAL DIRECTIVE - MANUAL LAYOUT MODE ACTIVE:
The user has MANUALLY PRE-SELECTED the layout for each slide. You MUST strictly generate copywriting matching these layouts:
USER SELECTED LAYOUTS:
${formatLayoutSelections(layoutSelections)}

RULES FOR MANUAL LAYOUT:
1. RESPECT THE USER'S LAYOUT CHOICES. DO NOT change, alter, or replace any layoutId.
2. Adapt the number of bullet points to each layout:
   - one-point / point1-*: exactly 1 strong statement/point
   - two-points / point2-* / comparison: exactly 2 points
   - three-points / point3-*: exactly 3 points
   - four-points / point4-* / steps: exactly 4 points
   - five-points / point5-*: exactly 5 points
   - six-points / point6-*: exactly 6 points
   - chart / chart-stat: 2-3 metric explanations
   - testimonial: 1 impactful testimonial quote + persona attribution
   - cover / closing: 0 points
`
      : '';

    return `You are an elite executive presentation copywriter and deck strategist.
${retryInstruction}
CRITICAL LANGUAGE DIRECTIVE:
⚠️ THE OUTPUT LANGUAGE IS STRICTLY ENGLISH (en).
ALL slide titles, subtitles, bullet points, explanations, metrics, and layout reasons MUST BE WRITTEN 100% IN PROFESSIONAL ENGLISH.
DO NOT use Indonesian words anywhere in the slides!

PRIMARY TASK:
Create a ready-to-present PowerPoint slide deck that is 100% RELEVANT and HIGHLY SPECIFIC to the user's title.

PRESENTATION TITLE: ${title}
TOPIC / DESCRIPTION: ${description || 'Focus tightly on the presentation title above'}
OUTPUT LANGUAGE: English (en) - ALL SLIDES IN ENGLISH
NUMBER OF SLIDES: ${effectiveSlideCount}
LAYOUT MODE: ${layoutMode.toUpperCase()}
${manualLayoutInstruction}

CRITICAL RULE - TOPICAL RELEVANCE & NO DUMMY TEXT:
1. EVERY slide and bullet point MUST relate directly to "${title}".
2. STRICTLY FORBIDDEN: "Lorem ipsum", "Your Title Here", "Write a short description", "Add a main point", "Write a subtopic", or generic filler phrases.
3. Every point must answer: "Does this directly support the presentation goal for '${title}'?"

COPYWRITING & SUBSTANTIVE EXPLANATION RULES:
1. PROVIDE SPECIFIC, ACTIONABLE DETAILS:
   - Every point MUST explain concrete substance (what it is, how it works, and its tangible benefit).
   - STRICTLY FORBIDDEN: Empty template phrases like "Strategy point 1 for sustainable implementation".
   - Required format for each point: "[Subtopic Name]: [Concrete 1-2 sentence explanation delivering real information]".
   - Correct examples:
     * "Short-Form Video Engine: Produce high-velocity vertical reels on TikTok and Instagram to maximize organic reach and brand discoverability."
     * "Automated Lead Nurturing: Implement multi-stage email funnels tailored to user behavior, boosting repeat conversions by up to 25%."
2. The deck must be 100% READY TO USE — the audience should gain immediate, clear insights without editing.

${
  !isManual
    ? `SLIDE DECK STRUCTURE:
1. Slide 1: Cover slide — compelling title + subtitle (layoutId: "cover-p04" or "cover-front").
2. Slide 2: Table of Contents / Agenda if total slides >= 4 (layoutId: "agenda-p20" or "table-of-contents").
3. Middle Slides: Core strategic content in logical sequence (choose from 1-6 points, comparison, steps, chart, or testimonial layouts).
4. Last Slide: Conclusion / Call to Action / Contact (layoutId: "closing-p180" or "cover-back").
5. Each content slide must have 2-5 high-value points.

AVAILABLE LAYOUTS (189 studio layouts):
- 1 point: point1-p25 to point1-p46, one-point
- 2 points: point2-p48 to point2-p87, two-points, comparison
- 3 points: point3-p89 to point3-p128, three-points
- 4 points: point4-p130 to point4-p144, four-points, steps
- 5 points: point5-p146 to point5-p154, five-points
- 6 points: point6-p156 to point6-p161, six-points
- Chart/Data: chart-p163 to chart-p171, chart, chart-stat
- Testimonial: testi-p173 to testi-p178, testimonial
- Cover: cover-p04 to cover-p18, cover-front
- Closing: closing-p180 to closing-p202, cover-back`
    : ''
}

AVAILABLE FONT PAIRINGS:
${fontList}

PLACEHOLDER DATA TOOLKIT (MANDATORY WHEN USING NAMES/CONTACTS):
Use strictly official placeholder data from the toolkit below (do NOT invent names, phones, or addresses):
${toolkitText}

EXAMPLE INPUT:
Title: "${title}"
Language: en
Slide Count: 5

EXPECTED JSON OUTPUT STRUCTURE (MUST BE 100% IN ENGLISH):
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "layoutId": "cover-front",
      "pointCount": 0,
      "layoutReason": "Opening slide featuring the primary title and executive subtitle",
      "title": "${title}",
      "subtitle": "Strategic Framework and Execution Roadmap",
      "content": []
    },
    {
      "slideNumber": 2,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Key strategic pillars and core drivers",
      "title": "Core Strategic Drivers",
      "content": [
        "Audience Segmentation: Precise demographic and behavioral clustering to tailor targeted value propositions.",
        "Omnichannel Orchestration: Seamless integration across digital channels ensuring consistent messaging and brand trust.",
        "Performance Optimization: Continuous metric tracking and iterative refinement to maximize operational ROI."
      ]
    },
    {
      "slideNumber": 3,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Implementation methodology and tactical execution",
      "title": "Tactical Execution Plan",
      "content": [
        "Rapid Prototyping: Launch iterative test sprints to validate hypotheses before committing full-scale budget.",
        "Workflow Automation: Deploy smart toolchains to streamline repetitive operational tasks and minimize friction.",
        "Feedback Synthesis: Aggregate user telemetry and direct sentiment to guide subsequent sprint milestones."
      ]
    },
    {
      "slideNumber": 4,
      "slideType": "content",
      "layoutId": "two-points",
      "pointCount": 2,
      "layoutReason": "Key success metrics and measurable benchmarks",
      "title": "Key Performance Indicators",
      "content": [
        "Target Efficiency Gain: Achieve 35% reduction in cycle time within the initial 90 days of execution.",
        "Net Conversion Lift: Target a sustained 3.0x return on investment across core programmatic initiatives."
      ]
    },
    {
      "slideNumber": 5,
      "slideType": "closing",
      "layoutId": "cover-back",
      "pointCount": 0,
      "layoutReason": "Closing slide with call to action and contact details",
      "title": "Initiate Your Transformation",
      "subtitle": "Open for strategic partnership and technical inquiries",
      "content": []
    }
  ],
  "designRecommendation": {
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans",
      "rationale": "Montserrat provides commanding structure for headings, while Open Sans delivers optimal readability for body copy."
    },
    "layouts": [
      {"slideNumber": 1, "layoutId": "cover-front"},
      {"slideNumber": 2, "layoutId": "three-points"},
      {"slideNumber": 3, "layoutId": "three-points"},
      {"slideNumber": 4, "layoutId": "two-points"},
      {"slideNumber": 5, "layoutId": "cover-back"}
    ]
  }
}

REMEMBER: Output MUST be 100% in English! Reply ONLY with valid JSON (no markdown fences, no raw text).
`;
  }

  // ════════════════════════════════════════════════════════════════
  // PROMPT UNTUK BAHASA INDONESIA (Default)
  // ════════════════════════════════════════════════════════════════
  const manualLayoutInstructionId = isManual
    ? `
PETUNJUK KRUSIAL - MODE SUSUN LAYOUT SENDIRI (MANUAL LAYOUT):
User telah MEMILIH SENDIRI layout untuk setiap slide. Tugas Anda adalah HANYA membuat copywriting konten yang cocok persis dengan layout tersebut:
LAYOUT YANG SUDAH DIPILIH USER:
${formatLayoutSelections(layoutSelections)}

ATURAN MODE MANUAL:
1. HORMATI PILIHAN USER. JANGAN PERNAH mengubah, mengganti, atau memilih ulang layoutId yang sudah ditentukan.
2. Sesuaikan JUMLAH POIN konten dengan layout masing-masing:
   - one-point / point1-*: tepat 1 poin/kalimat pernyataan kuat
   - two-points / point2-* / comparison: tepat 2 poin pembahasan
   - three-points / point3-*: tepat 3 poin pembahasan
   - four-points / point4-* / steps: tepat 4 poin pembahasan
   - five-points / point5-*: tepat 5 poin pembahasan
   - six-points / point6-*: tepat 6 poin pembahasan
   - chart / chart-stat: 2-3 poin penjelasan capaian metrik
   - testimonial: 1 testimoni berdampak + atribusi profil
   - cover / closing: 0 poin (hanya judul/subjudul)
`
    : '';

  return `Kamu adalah ahli copywriting presentasi profesional yang sangat teliti terhadap relevansi konten.
${retryInstruction}
TUGAS UTAMA:
Buatkan konten slide PowerPoint yang 100% RELEVAN dan SPESIFIK dengan judul yang diberikan user dalam BAHASA INDONESIA.

JUDUL PRESENTASI: ${title}
TOPIK/DESKRIPSI: ${description || 'Fokuskan pada judul presentasi di atas'}
BAHASA OUTPUT: Bahasa Indonesia (id)
JUMLAH SLIDE: ${effectiveSlideCount}
MODE LAYOUT: ${layoutMode.toUpperCase()}
${manualLayoutInstructionId}

ATURAN PALING PENTING - RELEVANSI KONTEN & BEBAS DUMMY TEXT:

1. SEMUA konten slide HARUS berkaitan langsung dengan judul presentasi "${title}".
2. DILARANG KERAS menggunakan dummy text seperti "Lorem ipsum", "Your Title Here", "Write a short description", "Add a main point", "Write a subtopic", "Poin strategi 1 untuk implementasi berkelanjutan", atau template kosong lainnya!
3. Jika judul tentang "${title}", maka semua slide harus membahas "${title}", BUKAN topik lain yang tidak diminta.
4. Setiap poin di setiap slide harus menjawab: "Apakah poin ini menjelaskan substansi nyata yang mendukung judul '${title}'?"

ATURAN COPYWRITING & PENJELASAN SETIAP POIN:

1. JELASKAN SESUAI ISI DAN SUBSTANSI TOPIK:
   - Setiap poin HARUS menjelaskan substansi materi secara nyata, mendalam, dan informatif (apa isinya, bagaimana cara kerjanya, atau apa manfaatnya).
   - Format penulisan setiap poin: "[Nama Poin/Subtopik]: [Penjelasan konkret 1-2 kalimat yang menjelaskan isi sebenarnya secara tuntas]".
   - Contoh format poin yang benar:
     * "Pelatihan Pembuatan Konten: Program bimbingan intensif memproduksi video pendek di TikTok dan Reels dengan hook menarik untuk memperluas jangkauan organik."
     * "Optimasi Kampanye Berbayar: Setup dan manajemen iklan Google Performance Max dengan penargetan audiens berbasis data riil konversi."
     * "Integrasi CRM & Email Funnel: Otomasi alur komunikasi lead nurturing untuk meningkatkan retensi dan konversi repeat order hingga 25%."

2. Buat konten yang SIAP PAKAI - user tidak perlu mengedit atau memikirkan ulang isi materi.
3. Hindari kalimat terlalu umum seperti "Penting untuk diperhatikan", "Berbagai faktor memengaruhi".
4. Gunakan kalimat yang langsung ke intinya dan padat informasi nyata.

${
  !isManual
    ? `ATURAN STRUKTUR SLIDE:
1. Slide 1: Cover depan - judul + subjudul yang menarik (layoutId: "cover-p04" atau "cover-front").
2. Slide 2: Daftar isi/agenda jika total slide >= 4 (layoutId: "agenda-p20" atau "table-of-contents").
3. Slide tengah: konten utama yang runtut dan logis.
4. Slide terakhir: kesimpulan atau call to action (layoutId: "closing-p180" atau "cover-back").
5. Setiap content slide berisi 2-5 poin yang spesifik.

PILIHAN LAYOUT (189 variasi katalog):
- 1 poin: point1-p25 s/d point1-p46, one-point
- 2 poin: point2-p48 s/d point2-p87, two-points, comparison
- 3 poin: point3-p89 s/d point3-p128, three-points
- 4 poin: point4-p130 s/d point4-p144, four-points, steps
- 5 poin: point5-p146 s/d point5-p154, five-points
- 6 poin: point6-p156 s/d point6-p161, six-points
- Data/statistik: chart-p163 s/d chart-p171, chart, chart-stat
- Testimoni: testi-p173 s/d testi-p178, testimonial
- Slide pertama: cover-p04 s/d cover-p18, cover-front
- Slide terakhir: closing-p180 s/d closing-p202, cover-back`
    : ''
}

FONT PAIRING TERSEDIA:
${fontList}

ATURAN PLACEHOLDER DATA (WAJIB):
Ketika konten slide memerlukan nama orang, tempat, alamat, nomor telepon, email, website, atau entitas lainnya, WAJIB menggunakan data placeholder dari Text Toolkit berikut:
${toolkitText}

CONTOH INPUT:
Judul: "${title}"
Bahasa: id
Jumlah Slide: 5

CONTOH OUTPUT YANG DIHARAPKAN:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "layoutId": "cover-front",
      "pointCount": 0,
      "layoutReason": "Slide pembuka presentasi",
      "title": "${title}",
      "subtitle": "Panduan Strategis dan Kerangka Implementasi",
      "content": []
    },
    {
      "slideNumber": 2,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Menjelaskan 3 pilar utama",
      "title": "Pilar Utama Pelaksanaan",
      "content": [
        "Fokus Prioritas: Mengarahkan sumber daya pada inisiatif bernilai dampak tertinggi untuk akselerasi hasil nyata.",
        "Standarisasi Mutu: Memastikan konsistensi kualitas eksekusi di setiap alur kerja operasional tim.",
        "Pemantauan Metrik: Evaluasi berkala berbasis data akurat untuk penyesuaian taktik operasional secara adaptif."
      ]
    },
    {
      "slideNumber": 3,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Menjelaskan langkah eksekusi taktis",
      "title": "Langkah Eksekusi Taktis",
      "content": [
        "Uji Coba Cepat: Menjalankan sprint pengujian hipotesis awal sebelum mengalokasikan anggaran penuh.",
        "Otomasi Alur Kerja: Mengintegrasikan sistem pendukung untuk memangkas waktu pengerjaan repetitif.",
        "Evaluasi Hasil: Mengumpulkan data langsung dari lapangan guna menentukan arah perbaikan berkala."
      ]
    },
    {
      "slideNumber": 4,
      "slideType": "content",
      "layoutId": "two-points",
      "pointCount": 2,
      "layoutReason": "Menjelaskan metrik keberhasilan utama",
      "title": "Indikator Keberhasilan",
      "content": [
        "Target Efisiensi Waktu: Mengurangi durasi siklus kerja sebesar 35% dalam 90 hari pertama.",
        "Rasio Pengembalian Investasi: Mencapai target ROI minimal 3.0x pada inisiatif program utama."
      ]
    },
    {
      "slideNumber": 5,
      "slideType": "conclusion",
      "layoutId": "cover-back",
      "pointCount": 0,
      "layoutReason": "Slide penutup dan call to action",
      "title": "Mulai Langkah Transformasi Anda",
      "subtitle": "Konsultasikan implementasi strategis untuk hasil yang terukur",
      "content": []
    }
  ],
  "designRecommendation": {
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans",
      "rationale": "Montserrat profesional untuk heading, Open Sans mudah dibaca untuk body"
    },
    "layouts": [
      {"slideNumber": 1, "layoutId": "cover-front"},
      {"slideNumber": 2, "layoutId": "three-points"},
      {"slideNumber": 3, "layoutId": "three-points"},
      {"slideNumber": 4, "layoutId": "two-points"},
      {"slideNumber": 5, "layoutId": "cover-back"}
    ]
  }
}

PERHATIKAN: Semua konten 100% relevan dengan judul "${title}", bebas dummy text, dan siap pakai tanpa perlu revisi.
Balas HANYA dalam format JSON valid tanpa tanda markdown (\`\`\`json).
`;
}

/**
 * Prompt khusus retry untuk satu slide yang bermasalah / dummy
 */
function buildSingleSlideRetryPrompt({
  slideNumber,
  layoutId = 'three-points',
  currentTitle = '',
  userTitle = '',
  userDescription = '',
  outputLanguage = 'id',
  reasons = [],
}) {
  const isEn = (outputLanguage || 'id').toLowerCase() === 'en';
  const reasonText = reasons.join(', ');

  if (isEn) {
    return `You are an executive presentation copywriter.
CRITICAL TASK: REGENERATE SINGLE SLIDE CONTENT.
Slide ${slideNumber} with title "${currentTitle || 'Untitled'}" and layout "${layoutId}" was INVALID because: ${reasonText || 'It contained dummy text or was empty'}.

Make a complete, professional replacement object for Slide ${slideNumber} that is 100% RELEVANT to the presentation title "${userTitle}" and topic "${userDescription}".
DO NOT use placeholder or dummy text (NO "Lorem ipsum", NO "Your Title Here", NO "Write a short description", NO "Poin strategi X").
Format of each bullet point: "[Subtopic Name]: [Concrete 1-2 sentence informative explanation]".

Reply ONLY with a single JSON object matching this schema:
{
  "slideNumber": ${slideNumber},
  "slideType": "${slideNumber === 1 ? 'cover' : 'content'}",
  "layoutId": "${layoutId}",
  "pointCount": 3,
  "layoutReason": "Concrete focus supporting ${userTitle}",
  "title": "Specific Informative Title",
  "subtitle": "Insightful subtitle if applicable",
  "content": [
    "Subtopic 1: Clear, informative explanation without filler.",
    "Subtopic 2: Concrete mechanism and measurable value.",
    "Subtopic 3: Actionable takeaway or strategic execution."
  ]
}
`;
  }

  return `Kamu adalah ahli copywriting presentasi profesional.
TUGAS KHUSUS: PERBAIKI DAN BUAT ULANG KONTEN SATU SLIDE.
Slide ${slideNumber} dengan judul "${currentTitle || 'Tanpa Judul'}" dan layout "${layoutId}" TIDAK VALID karena: ${reasonText || 'Berisi dummy text atau kosong'}.

Buatkan objek pengganti lengkap yang profesional untuk Slide ${slideNumber} yang 100% RELEVAN dengan judul presentasi "${userTitle}" dan topik "${userDescription}".
DILARANG KERAS menggunakan placeholder atau dummy text (JANGAN "Lorem ipsum", JANGAN "Your Title Here", JANGAN "Poin strategi X untuk implementasi berkelanjutan", JANGAN "Penjelasan rencana kerja").
Format setiap poin: "[Nama Subtopik]: [Penjelasan konkret 1-2 kalimat informatif mengenai substansi materi]".

Balas HANYA dengan SATU objek JSON valid sesuai format ini:
{
  "slideNumber": ${slideNumber},
  "slideType": "${slideNumber === 1 ? 'cover' : 'content'}",
  "layoutId": "${layoutId}",
  "pointCount": 3,
  "layoutReason": "Penjelasan mendalam yang mendukung ${userTitle}",
  "title": "Judul Subtopik Spesifik & Nyata",
  "subtitle": "Subjudul penjelasan jika relevan",
  "content": [
    "Pilar Pertama: Penjelasan konkret dan nyata tanpa kalimat template.",
    "Pilar Kedua: Mekanisme teknis atau operasional yang informatif.",
    "Pilar Ketiga: Dampak terukur dan langkah aksi yang jelas."
  ]
}
`;
}

module.exports = {
  buildMasterPrompt,
  buildSingleSlideRetryPrompt,
  formatLayoutSelections,
};
