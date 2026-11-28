/**
 * Prompt khusus untuk generate ulang poin-poin slide saat user mengganti layout dengan kapasitas poin lebih banyak.
 * Mempertahankan poin yang sudah ada dan menghasilkan poin baru yang relevan dengan tema dan judul slide.
 */
function buildRegenerateSlidePrompt({
  slideTitle,
  slideTheme,
  currentLayoutId,
  newLayoutId,
  outputLanguage = 'id',
  existingContent = [],
  newPointCount = 3,
}) {
  const isEn = (outputLanguage || 'id').toLowerCase() === 'en';
  const existingFormatted = (existingContent || [])
    .filter((p) => p && typeof p === 'string' && p.trim())
    .map((p, i) => `${i + 1}. "${p.trim()}"`)
    .join('\n');

  const neededCount = Math.max(0, newPointCount - (existingContent || []).length);

  if (isEn) {
    return `You are an expert executive presentation consultant and master copywriter.
A user has changed the slide layout from '${currentLayoutId || 'current'}' to '${newLayoutId || 'new'}'.
The new layout requires exactly ${newPointCount} distinct, substantive bullet points.

SLIDE CONTEXT:
- Presentation / Slide Topic: "${slideTheme || slideTitle || 'Strategic Overview'}"
- Slide Title: "${slideTitle || 'Key Insights'}"
- Existing Content Points (${existingContent.length} points):
${existingFormatted || '(None yet)'}

TASK:
1. Retain the core meaning and existing sub-headings of the ${existingContent.length} existing points.
2. Generate ${neededCount} NEW substantive, highly relevant points that directly expand on "${slideTitle}" and "${slideTheme}".
3. SUB-HEADING & FORMAT RULES:
   - Each point MUST strictly follow the format: "Sub-Heading Title: Explanatory sentence."
   - The "Sub-Heading Title" before the colon MUST be concise (2 to 5 words) and explicitly reflect the slide's specific subject matter.
   - The explanatory sentence after the colon MUST provide 1 substantive, high-value sentence elaborating on that specific sub-heading.
   - Across the slide, sub-headings must be complementary and never duplicate or rephrase the same idea.
4. STRICT PROHIBITIONS:
   - NEVER use generic placeholder or dummy text such as "Strategic Alignment", "Execution Standardization", "Continuous Optimization", "Performance Optimization", "Lorem ipsum", "Write a short description", "Add a main point", "Your Title Here", "Title of the Presentation".
   - Sub-headings MUST NOT be generic business clichés; they must be tailored specifically to "${slideTitle}".
   - ALL output text must be strictly in English.

RETURN FORMAT:
Return ONLY a valid JSON object without markdown formatting, code fences, or additional explanation:
{
  "title": "${slideTitle || 'Key Insights'}",
  "points": [
    "Retained Sub-Heading: Retained or polished explanation.",
    "New Sub-Heading: Concrete 1-sentence value statement.",
    "..."
  ]
}
Note: The "points" array MUST have exactly ${newPointCount} items.`;
  }

  return `Anda adalah konsultan presentasi eksekutif dan copywriter profesional.
Pengguna telah mengubah layout slide dari '${currentLayoutId || 'layout lama'}' ke '${newLayoutId || 'layout baru'}'.
Layout baru ini membutuhkan tepat ${newPointCount} poin konten yang substantif, padat, dan berbobot.

KONTEKS SLIDE:
- Tema / Topik Presentasi: "${slideTheme || slideTitle || 'Ringkasan Strategis'}"
- Judul Slide: "${slideTitle || 'Poin Kunci'}"
- Poin Konten yang Sudah Ada (${existingContent.length} poin):
${existingFormatted || '(Belum ada poin)'}

TUGAS:
1. Pertahankan makna inti serta judul sub-bab dari ${existingContent.length} poin yang sudah ada.
2. Buat ${neededCount} poin BARU yang relevan, faktual, mendalam, dan selaras dengan topik "${slideTitle}" dan "${slideTheme}".
3. ATURAN JUDUL SUB-BAB & FORMAT POIN:
   - Setiap poin HARUS mengikuti format: "Judul Sub-Bab: Penjelasan substantif 1 kalimat."
   - "Judul Sub-Bab" sebelum tanda titik dua HARUS singkat (2 sampai 5 kata) dan mencerminkan topik spesifik slide ini.
   - Penjelasan setelah titik dua HARUS terdiri dari 1 kalimat substantif bernilai tinggi yang memperjelas sub-bab tersebut.
   - Antar sub-bab dalam satu slide tidak boleh duplikat atau terlalu mirip maknanya.
4. LARANGAN KERAS:
   - DILARANG menggunakan teks contoh generik seperti "Penyelarasan Strategis", "Standarisasi Pelaksanaan", "Optimalisasi Berkelanjutan", "Optimasi Kerja", "Optimalisasi Kinerja", "Standarisasi Operasional", "Lorem ipsum", "Write a short description", "Add a main point", "Your Title Here", "situssupercanggih", "Title of the Presentation".
   - Judul sub-bab tidak boleh berupa frasa generik lepas konteks; wajib berhubungan langsung dengan materi "${slideTitle}".
   - Seluruh teks HARUS dalam Bahasa Indonesia yang formal dan lugas.

FORMAT RETURN:
Kembalikan HANYA format JSON valid tanpa format markdown, code fence, atau penjelasan lain:
{
  "title": "${slideTitle || 'Poin Kunci'}",
  "points": [
    "Sub-Bab Lama: Penjelasan poin lama yang dipertahankan.",
    "Sub-Bab Baru: Penjelasan konkret 1 kalimat relevan.",
    "..."
  ]
}
Catatan: Array "points" HARUS berisi tepat ${newPointCount} item.`;
}

module.exports = {
  buildRegenerateSlidePrompt,
};

