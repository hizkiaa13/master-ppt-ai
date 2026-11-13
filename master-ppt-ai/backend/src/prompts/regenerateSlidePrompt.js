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
1. Retain the core meaning of the ${existingContent.length} existing points.
2. Generate ${neededCount} NEW substantive, highly relevant bullet points that directly expand on "${slideTitle}" and "${slideTheme}".
3. STRICT PROHIBITIONS:
   - NEVER use placeholder or dummy text such as "Lorem ipsum", "Write a short description", "Add a main point", "Your Title Here", "Reallygreatsite", "Title of the Presentation".
   - Every point MUST provide concrete, concise, executive-level business value (1-2 sentences per point).
   - ALL output text must be strictly in English.

RETURN FORMAT:
Return ONLY a valid JSON object without markdown formatting, code fences, or additional explanation:
{
  "title": "${slideTitle || 'Key Insights'}",
  "points": [
    "Point 1 (retained or polished)",
    "Point 2 (retained or polished)",
    "New Point 3...",
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
1. Pertahankan makna inti dari ${existingContent.length} poin yang sudah ada.
2. Buat ${neededCount} poin BARU yang relevan, faktual, mendalam, dan selaras dengan topik "${slideTitle}" dan "${slideTheme}".
3. LARANGAN KERAS:
   - DILARANG menggunakan dummy text seperti "Lorem ipsum", "Write a short description", "Add a main point", "Your Title Here", "situssupercanggih", "Title of the Presentation".
   - Setiap poin HARUS menyajikan nilai bisnis atau gagasan nyata yang ringkas dan profesional (1-2 kalimat per poin).
   - Seluruh teks HARUS dalam Bahasa Indonesia yang formal dan lugas.

FORMAT RETURN:
Kembalikan HANYA format JSON valid tanpa format markdown, code fence, atau penjelasan lain:
{
  "title": "${slideTitle || 'Poin Kunci'}",
  "points": [
    "Poin 1 (dipertahankan/disempurnakan)",
    "Poin 2 (dipertahankan/disempurnakan)",
    "Poin Baru 3...",
    "..."
  ]
}
Catatan: Array "points" HARUS berisi tepat ${newPointCount} item.`;
}

module.exports = {
  buildRegenerateSlidePrompt,
};

