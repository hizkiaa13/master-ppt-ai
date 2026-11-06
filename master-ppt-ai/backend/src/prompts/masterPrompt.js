/**
 * Master Prompt Generator for AI PowerPoint Deck Generation
 * Versi Base Master (Hitam & Putih) dengan integrasi Text Toolkit.
 * Mendukung: slideCount, layoutReason, comparison/steps/image-text layouts.
 */

const { getPromptFontList, FONT_PAIRINGS } = require('../utils/textToolkit');

function buildMasterPrompt({ title, description, outputLanguage = 'id', slideCount = 5 }) {
  const fontList = getPromptFontList();
  const langInstruction =
    outputLanguage === 'en'
      ? 'Use professional English for all slide copywriting.'
      : 'Gunakan Bahasa Indonesia yang profesional untuk seluruh copywriting slide.';

  const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);

  return `Kamu adalah ahli copywriting dan desain presentasi profesional.

Buatkan konten master PowerPoint berdasarkan informasi berikut:
Judul Presentasi: ${title}
Topik/Deskripsi: ${description || "Tidak ada deskripsi tambahan"}
Bahasa Output: ${outputLanguage} (${outputLanguage === 'en' ? 'English' : 'Bahasa Indonesia'})
Jumlah Slide: WAJIB TEPAT ${effectiveSlideCount} slide (tidak boleh lebih atau kurang dari ${effectiveSlideCount} slide).

ATURAN UTAMA:
1. WAJIB menghasilkan TEPAT ${effectiveSlideCount} slide.
2. Slide pertama (slideNumber: 1) HARUS cover depan (layoutId: "cover-front").
3. Jika total slide >= 4, slide kedua SEBAIKNYA daftar isi (layoutId: "table-of-contents").
4. Slide terakhir (slideNumber: ${effectiveSlideCount}) HARUS cover belakang berisi ucapan terima kasih atau call to action (layoutId: "cover-back").
5. Desain master menggunakan skema hitam dan putih (Base Master):
   - Background putih (#FFFFFF)
   - Teks hitam (#000000) atau abu gelap (#1F2937 / #4B5563)
   - Tidak menggunakan warna warni
6. Pilih pairing font HANYA dari daftar berikut:
   ${fontList}
7. Jangan memberikan saran tema. Fokus pada copywriting, struktur slide, font, dan layout.
8. ${langInstruction}
9. Balas HANYA dalam format JSON valid tanpa markdown (jangan gunakan \`\`\`json) atau teks pengantar.

ATURAN PEMILIHAN LAYOUT:
1. Jangan gunakan layout yang sama berulang-ulang untuk beberapa slide berturut-turut.
2. Pilih layout berdasarkan KONTEN dan FUNGSI slide, bukan hanya jumlah poin.
3. Pertimbangkan jenis judul slide untuk menentukan layout:
   - Judul seperti "Pendahuluan", "Latar Belakang", "Pengantar" → gunakan layout "one-point" atau "two-points" dengan deskripsi naratif.
   - Judul seperti "Target Audiens", "Keunggulan", "Manfaat", "Fitur" → gunakan layout "three-points" atau "four-points".
   - Judul seperti "Perbandingan", "Analisis", "Sebelum vs Sesudah" → gunakan layout "comparison" (dua kolom berhadapan).
   - Judul seperti "Data Penjualan", "Statistik", "Hasil Survei", "Tren" → gunakan layout "chart".
   - Judul seperti "Testimoni", "Apa Kata Mereka", "Pengalaman Pelanggan" → gunakan layout "testimonial".
   - Judul seperti "Kesimpulan", "Rangkuman", "Call to Action" → gunakan layout "one-point" atau "cover-back".
   - Judul seperti "Langkah-langkah", "Tahapan", "Proses", "Roadmap" → gunakan layout "steps" (berurutan bernomor).
   - Judul seperti "Profil", "Tentang Kami", "Produk" → gunakan layout "image-text" (teks di satu sisi, placeholder gambar di sisi lain).
4. Variasikan layout antar slide. Jangan gunakan layout yang sama lebih dari 2 kali berturut-turut.
5. Jika sebuah slide memiliki 4 poin, boleh gunakan four-points, tetapi jika slide berikutnya juga 4 poin, gunakan variasi layout berbeda (misalnya comparison atau steps).
6. Sesuaikan jumlah poin dengan konten yang relevan. Jangan memaksakan jumlah poin yang sama di setiap slide.
7. Layout yang tersedia:
   - cover-front: slide pertama
   - table-of-contents: daftar isi
   - one-point: 1 poin utama / statement / quote
   - two-points: 2 poin berdampingan
   - three-points: 3 poin dalam kolom
   - four-points: 4 poin grid 2x2
   - five-points: 5 poin
   - six-points: 6 poin grid 3x2
   - comparison: 2 kolom berhadapan untuk perbandingan
   - steps: langkah berurutan bernomor
   - chart: data/grafik/statistik
   - testimonial: kutipan/testimoni
   - image-text: teks di satu sisi, placeholder gambar di sisi lain
   - cover-back: slide terakhir

8. Untuk setiap slide, tentukan:
   - layoutId: string (salah satu dari daftar layout di atas)
   - pointCount: integer (jumlah poin konten)
   - layoutReason: string (alasan singkat pemilihan layout)

FORMAT OUTPUT (JSON):
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "layoutId": "cover-front",
      "pointCount": 0,
      "layoutReason": "Slide pembuka presentasi dengan judul dan subjudul",
      "title": "${title}",
      "subtitle": "Subjudul atau pesan strategis pembuka...",
      "content": []
    },
    {
      "slideNumber": 2,
      "slideType": "agenda",
      "layoutId": "table-of-contents",
      "pointCount": 4,
      "layoutReason": "Daftar isi untuk navigasi alur presentasi",
      "title": "${outputLanguage === 'en' ? 'Table of Contents' : 'Daftar Isi & Agenda'}",
      "subtitle": "Ikhtisar topik...",
      "content": [
        "Poin 1...",
        "Poin 2...",
        "Poin 3...",
        "Poin 4..."
      ]
    },
    {
      "slideNumber": 3,
      "slideType": "content",
      "layoutId": "comparison",
      "pointCount": 2,
      "layoutReason": "Slide ini membandingkan dua pendekatan secara langsung",
      "title": "Perbandingan Pendekatan",
      "subtitle": "Analisis sebelum dan sesudah",
      "content": [
        "Pendekatan Konvensional: Proses manual dengan keterbatasan skalabilitas.",
        "Pendekatan Modern: Otomatisasi cerdas dengan efisiensi tinggi."
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
        "pointCount": 0,
        "layoutReason": "Slide pembuka"
      }
    ]
  }
}

PENTING:
- Total slide HARUS tepat ${effectiveSlideCount} slide.
- Output JSON valid tanpa markdown \`\`\`json.
- Setiap slide WAJIB memiliki layoutId, pointCount, dan layoutReason.
`;
}

module.exports = {
  buildMasterPrompt,
};
