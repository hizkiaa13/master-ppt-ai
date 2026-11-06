/**
 * Master Prompt Generator for AI PowerPoint Deck Generation
 * Versi Base Master (Hitam & Putih) dengan integrasi Text Toolkit.
 */

const { getPromptFontList, FONT_PAIRINGS } = require('../utils/textToolkit');

function buildMasterPrompt({ title, description, outputLanguage = 'id' }) {
  const fontList = getPromptFontList();
  const langInstruction =
    outputLanguage === 'en'
      ? 'Use professional English for all slide copywriting.'
      : 'Gunakan Bahasa Indonesia yang profesional untuk seluruh copywriting slide.';

  return `Kamu adalah ahli copywriting dan desain presentasi profesional.

Buatkan konten master PowerPoint berdasarkan informasi berikut:
Judul Presentasi: ${title}
Topik/Deskripsi: ${description || "Tidak ada deskripsi tambahan"}
Bahasa Output: ${outputLanguage} (${outputLanguage === 'en' ? 'English' : 'Bahasa Indonesia'})
Jumlah Slide: ditentukan oleh kamu, maksimal 15 slide.

Aturan:
1. Tentukan jumlah slide yang paling sesuai berdasarkan judul dan topik, maksimal 15 slide.
2. Slide pertama harus cover depan (layoutId: "cover-front").
3. Jika total slide >= 4, slide kedua adalah daftar isi (layoutId: "table-of-contents").
4. Slide terakhir harus cover belakang berisi ucapan terima kasih atau call to action (layoutId: "cover-back").
5. Untuk setiap slide, tentukan jumlah poin, lalu pilih layout berdasarkan jumlah poin:
   - 1 poin: one-point
   - 2 poin: two-points
   - 3 poin: three-points
   - 4 poin: four-points
   - 5 poin: five-points
   - 6 poin atau lebih: six-points
   - Slide berisi data/grafik/statistik: chart
   - Slide berisi kutipan/testimoni: testimonial
6. Desain master menggunakan skema hitam dan putih:
   - Background putih (#FFFFFF)
   - Teks hitam (#000000) atau abu gelap (#1F2937 / #4B5563)
   - Tidak menggunakan warna warni
7. Pilih pairing font HANYA dari daftar berikut:
   ${fontList}
8. Jangan memberikan saran tema. Fokus pada copywriting, struktur slide, font, dan layout.
9. ${langInstruction}
10. Balas HANYA dalam format JSON valid tanpa markdown atau teks pengantar.

Format JSON yang wajib diikuti:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "layoutId": "cover-front",
      "pointCount": 0,
      "title": "${title}",
      "subtitle": "Subjudul atau pesan strategis pembuka...",
      "content": []
    },
    {
      "slideNumber": 2,
      "slideType": "agenda",
      "layoutId": "table-of-contents",
      "pointCount": 4,
      "title": "${outputLanguage === 'en' ? 'Table of Contents' : 'Daftar Isi & Agenda'}",
      "subtitle": "Ikhtisar topik...",
      "content": [
        "Poin 1...",
        "Poin 2...",
        "Poin 3...",
        "Poin 4..."
      ]
    }
  ],
  "designRecommendation": {
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans",
      "rationale": "Kombinasi font profesional dan bersih untuk master hitam-putih."
    },
    "layouts": [
      {
        "slideNumber": 1,
        "slideType": "cover",
        "layout": "cover-front",
        "layoutId": "cover-front",
        "pointCount": 0
      }
    ]
  }
}
`;
}

module.exports = {
  buildMasterPrompt,
};
