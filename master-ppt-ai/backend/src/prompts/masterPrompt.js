/**
 * Master Prompt Generator for AI PowerPoint Deck Generation
 * Versi Base Master (Hitam & Putih) dengan Relevansi Ketat & Copywriting Siap Pakai.
 */

const { getPromptFontList } = require('../utils/textToolkit');

/**
 * Buat master prompt dengan instruksi relevansi ketat, few-shot examples, dan anti-drift
 */
function buildMasterPrompt({ title, description, outputLanguage = 'id', slideCount = 5, retryContext = null }) {
  const fontList = getPromptFontList();
  const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);
  const isEn = outputLanguage === 'en';

  const langInstruction = isEn
    ? 'Use professional, natural, and highly polished English for all slide copywriting.'
    : 'Gunakan Bahasa Indonesia profesional, lugas, dan natural untuk seluruh copywriting slide.';

  const retryWarning = retryContext
    ? `\n⚠️ PERINGATAN RE-GENERATE:
HASIL SEBELUMNYA DINILAI TIDAK CUKUP RELEVAN DENGAN JUDUL "${title}".
Pastikan kali ini SEMUA slide dan poin 100% berfokus langsung pada "${title}". JANGAN menyimpang ke topik lain!\n`
    : '';

  return `Kamu adalah ahli copywriting presentasi profesional yang sangat teliti terhadap relevansi konten.
${retryWarning}
TUGAS UTAMA:
Buatkan konten slide PowerPoint yang 100% RELEVAN, SPESIFIK, dan SIAP PAKAI berdasarkan judul berikut:

JUDUL PRESENTASI: "${title}"
TOPIK/DESKRIPSI: "${description || "Fokuskan pada judul presentasi di atas"}"
BAHASA OUTPUT: ${outputLanguage} (${isEn ? 'English' : 'Bahasa Indonesia'})
JUMLAH SLIDE: WAJIB TEPAT ${effectiveSlideCount} slide (tidak boleh lebih atau kurang).

============================================================
ATURAN PALING PENTING - RELEVANSI KONTEN (WAJIB DIPATUHI):
============================================================
1. SEMUA konten slide HARUS berkaitan langsung dengan judul "${title}".
2. JANGAN menghasilkan konten yang tidak ada hubungannya dengan judul.
3. Jika judul tentang "${title}", maka seluruh slide dan poin harus membahas aspek nyata dari "${title}", BUKAN topik lain seperti keberlanjutan, lingkungan, CSR, atau topik acak lain jika tidak diminta.
4. Setiap poin di setiap slide harus menjawab pertanyaan: "Apakah poin ini mendukung langsung judul '${title}'?"
5. Jika sebuah poin tidak relevan dengan judul, JANGAN masukkan.

CONTOH RELEVANSI:
Kasus Judul: "Strategi Pemasaran Digital 2026"
✅ BENAR - Slide tentang:
- "Tren Pemasaran Digital 2026"
- "Target Audiens & Perilaku Konsumen Digital"
- "Kanal Pemasaran Digital Berperforma Tinggi"
- "Strategi Konten & Social Commerce"
- "Pengukuran ROI & Optimasi Konversi Campaign"

❌ SALAH BESAR - Slide tentang:
- "Implementasi Keberlanjutan & Ramah Lingkungan"
- "Daur Ulang Sampah Plastik Kantor"
- "Pengurangan Emisi Karbon"
- Topik generik lain yang tidak ada hubungannya dengan pemasaran digital.

============================================================
ATURAN COPYWRITING SIAP PAKAI:
============================================================
1. Buat konten yang SIAP PAKAI — audiens langsung mengerti dan presenter tidak perlu mengedit atau memikirkan ulang isinya.
2. Setiap poin harus:
   - Spesifik, lugas, dan informatif.
   - Tidak generik atau kosong.
   - Mengandung informasi nyata, taktik, data, atau langkah praktis yang berguna.
   - Mudah dipahami audiens.
3. HINDARI kalimat klise / terlalu umum seperti:
   - ❌ "Penting untuk selalu memperhatikan faktor pendukung."
   - ❌ "Berbagai faktor memengaruhi keberhasilan."
   - ❌ "Ada banyak aspek yang perlu dipertimbangkan secara matang."
4. Gunakan kalimat yang langsung ke intinya dan bermakna:
   - ✅ "Tiga kanal digital dengan ROI tertinggi di 2026: TikTok Ads, Google Performance Max, dan Email Automation."
   - ✅ "Alokasikan 40% anggaran pada akuisisi berbayar dan 30% pada strategi retensi pelanggan berbasis data."

============================================================
ATURAN STRUKTUR & LAYOUT SLIDE:
============================================================
1. Slide 1 (slideNumber: 1): Cover depan (layoutId: "cover-front") — judul + subjudul yang tajam.
2. Slide 2: Jika total slide >= 4, gunakan daftar isi/agenda (layoutId: "table-of-contents").
3. Slide tengah: Konten utama yang runtut dan logis.
4. Slide terakhir (slideNumber: ${effectiveSlideCount}): Kesimpulan atau call to action (layoutId: "cover-back").
5. Variasikan layout! JANGAN gunakan layout yang sama lebih dari 2 kali berturut-turut.
6. Layout yang tersedia:
   - cover-front: Slide pembuka
   - table-of-contents: Daftar isi / agenda
   - one-point: 1 poin utama / statement / kutipan
   - two-points: 2 poin berdampingan
   - three-points: 3 poin kolom
   - four-points: 4 poin grid 2x2
   - five-points: 5 poin terstruktur
   - six-points: 6 poin grid 3x2
   - comparison: Perbandingan 2 hal (sebelum vs sesudah, pro vs kontra)
   - steps: 4 tahapan / langkah proses berurutan
   - chart: Visual data / grafik / statistik kinerja
   - testimonial: Testimoni / kutipan pernyataan
   - image-text: Narasi di satu sisi, visual di sisi lain
   - cover-back: Slide penutup

============================================================
ATURAN TIPOGRAFI & WARNA:
============================================================
- Desain master menggunakan Base Master (Hitam & Putih):
  - Background putih (#FFFFFF)
  - Teks hitam (#000000) dan abu gelap (#1F2937 / #4B5563)
  - Tanpa warna warni
- Pilih pairing font dari daftar berikut:
${fontList}

============================================================
CONTOH FEW-SHOT INPUT & OUTPUT YANG DIHARAPKAN:
============================================================
INPUT:
Judul: "Strategi Pemasaran Digital 2026"
Topik: "Membangun pertumbuhan startup teknologi"
Jumlah Slide: 5
Bahasa: id

OUTPUT JSON VALID:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "layoutId": "cover-front",
      "pointCount": 0,
      "layoutReason": "Slide pembuka dengan judul terarah dan subjudul strategis",
      "title": "Strategi Pemasaran Digital 2026",
      "subtitle": "Akselerasi Pertumbuhan Startup Melalui Kanal Digital Berperforma Tinggi",
      "content": []
    },
    {
      "slideNumber": 2,
      "slideType": "agenda",
      "layoutId": "table-of-contents",
      "pointCount": 4,
      "layoutReason": "Agenda pembahasan menyeluruh tentang pemasaran digital",
      "title": "Agenda Strategis",
      "subtitle": "4 Pilar Pemasaran Digital 2026",
      "content": [
        "01. Dinamika Tren Pemasaran Digital 2026",
        "02. Pemilihan Kanal Digital Prioritas",
        "03. Alokasi Anggaran & Framework Eksekusi",
        "04. Metrik Keberhasilan & Target ROI"
      ]
    },
    {
      "slideNumber": 3,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Menampilkan 3 kanal pemasaran digital dengan potensi konversi terbesar",
      "title": "Kanal Pemasaran Digital Prioritas",
      "subtitle": "Fokus pada kanal dengan efisiensi akuisisi tertinggi",
      "content": [
        "Short-Form Video Ads: TikTok dan Reels menghasilkan engagement 2.4x lebih tinggi dibanding display banner konvensional.",
        "Google Performance Max: Kampanye multi-kanal otomatis berbasis AI yang mengoptimasi bid konversi secara real-time.",
        "Automated Email Funnel: Rangkaian email onboarding terpersonalisasi yang meningkatkan retensi pengguna hingga 35%."
      ]
    },
    {
      "slideNumber": 4,
      "slideType": "content",
      "layoutId": "comparison",
      "pointCount": 2,
      "layoutReason": "Membandingkan efisiensi pendekatan pemasaran lama vs strategi baru 2026",
      "title": "Metode Tradisional vs Strategi Digital 2026",
      "subtitle": "Pergeseran fokus menuju efisiensi biaya dan presisi data",
      "content": [
        "Pendekatan Lama: Menargetkan jangkauan luas tanpa segmentasi mendalam, menghasilkan Customer Acquisition Cost (CAC) tinggi.",
        "Strategi 2026: Personalisasi berbasis machine learning yang menekan CAC hingga 30% dengan target audiens spesifik."
      ]
    },
    {
      "slideNumber": 5,
      "slideType": "closing",
      "layoutId": "cover-back",
      "pointCount": 3,
      "layoutReason": "Slide penutup dengan ajakan kolaborasi dan kontak",
      "title": "Mulai Eksekusi Pemasaran Digital Anda",
      "subtitle": "Diskusikan rencana implementasi pemasaran digital bersama tim ahli kami",
      "content": [
        "Email: growth@pemasarandigital.id",
        "Website: www.pemasarandigital2026.com",
        "Sesi Konsultasi & Audit Strategi Gratis"
      ]
    }
  ],
  "designRecommendation": {
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans",
      "rationale": "Montserrat memberikan ketegasan profesional pada judul, Open Sans sangat mudah dibaca untuk materi strategi."
    },
    "layouts": [
      { "slideNumber": 1, "layoutId": "cover-front", "layoutReason": "Slide pembuka" },
      { "slideNumber": 2, "layoutId": "table-of-contents", "layoutReason": "Agenda terstruktur" },
      { "slideNumber": 3, "layoutId": "three-points", "layoutReason": "3 pilar strategi" },
      { "slideNumber": 4, "layoutId": "comparison", "layoutReason": "Perbandingan metode" },
      { "slideNumber": 5, "layoutId": "cover-back", "layoutReason": "Penutup & kontak" }
    ]
  }
}

============================================================
PERINGATAN KERAS ANTI-DRIFT:
============================================================
- JANGAN menyimpang dari judul "${title}".
- JANGAN menambahkan topik lingkungan/keberlanjutan jika judul tidak memintanya.
- JANGAN menghasilkan teks generik kosong ("faktor penting", "perlu diperhatikan").
- Setiap kalimat dalam konten HARUS spesifik dan informatif untuk audiens "${title}".
- Balas HANYA dengan JSON valid tanpa bungkus markdown (\`\`\`json) atau teks pembuka/penutup.
`;
}

module.exports = {
  buildMasterPrompt,
};
