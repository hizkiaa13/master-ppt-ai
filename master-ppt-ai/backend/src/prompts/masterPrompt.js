/**
 * Master Prompt Generator for AI PowerPoint Deck Generation
 * Versi Base Master (Hitam & Putih) dengan Relevansi Ketat & Copywriting Siap Pakai.
 */

const { getPromptFontList } = require('../utils/textToolkit');
const { getPromptToolkitText } = require('../utils/placeholderToolkit');

/**
 * Ganti total prompt AI untuk menjamin 100% relevansi materi slide dengan judul
 */
function buildMasterPrompt({ title, description, outputLanguage = 'id', slideCount = 5, retryContext = false }) {
  const fontList = getPromptFontList();
  const toolkitText = getPromptToolkitText(outputLanguage);
  const effectiveSlideCount = Math.min(Math.max(parseInt(slideCount) || 5, 1), 15);

  const retryInstruction = retryContext
    ? `\n⚠️ PERINGATAN KERAS REGENERATE:
HASIL SEBELUMNYA TIDAK RELEVAN DENGAN JUDUL "${title}".
Judul user adalah "${title}". Buat ulang konten yang 100% membahas "${title}". Jangan menyimpang dari judul sama sekali!\n`
    : '';

  return `Kamu adalah ahli copywriting presentasi profesional yang sangat teliti terhadap relevansi konten.
${retryInstruction}
TUGAS UTAMA:
Buatkan konten slide PowerPoint yang 100% RELEVAN dan SPESIFIK dengan judul yang diberikan user.

JUDUL PRESENTASI: ${title}
TOPIK/DESKRIPSI: ${description || 'Fokuskan pada judul presentasi di atas'}
BAHASA OUTPUT: ${outputLanguage}
JUMLAH SLIDE: ${effectiveSlideCount}

ATURAN PALING PENTING - RELEVANSI KONTEN:

1. SEMUA konten slide HARUS berkaitan langsung dengan judul presentasi "${title}".
2. JANGAN menghasilkan konten yang tidak ada hubungannya dengan judul.
3. Jika judul tentang "${title}", maka semua slide harus membahas "${title}", BUKAN topik lain seperti keberlanjutan, lingkungan, CSR, atau topik tidak relevan lainnya.
4. Setiap poin di setiap slide harus menjawab pertanyaan: "Apakah poin ini mendukung judul presentasi?"
5. Jika sebuah poin tidak relevan dengan judul, JANGAN masukkan.

CONTOH RELEVANSI:

Judul: "Strategi Pemasaran Digital 2026"

BENAR - Slide tentang:
- Tren Pemasaran Digital 2026
- Target Audiens Digital
- Kanal Pemasaran Digital Efektif
- Strategi Konten Media Sosial
- Pengukuran ROI Pemasaran Digital

SALAH - Slide tentang:
- Implementasi Keberlanjutan
- Dampak Lingkungan
- Teknologi Hijau
- Topik lain yang tidak ada hubungannya dengan pemasaran digital

ATURAN COPYWRITING & PENJELASAN SETIAP POIN:

1. JELASKAN SESUAI ISI DAN SUBSTANSI TOPIK:
   - Setiap poin HARUS menjelaskan substansi materi secara nyata, mendalam, dan informatif (apa isinya, bagaimana cara kerjanya, atau apa manfaatnya).
   - DILARANG KERAS menggunakan teks template kosong atau kalimat abstrak seperti "Poin strategi X untuk implementasi berkelanjutan", "Program bagian 1", atau semacamnya!
   - Format penulisan setiap poin: "[Nama Poin/Subtopik]: [Penjelasan konkret 1-2 kalimat yang menjelaskan isi sebenarnya secara tuntas]".
   - Contoh format poin yang benar:
     * "Pelatihan Pembuatan Konten: Program bimbingan intensif memproduksi video pendek di TikTok dan Reels dengan hook menarik untuk memperluas jangkauan organik."
     * "Optimasi Kampanye Berbayar: Setup dan manajemen iklan Google Performance Max dengan penargetan audiens berbasis data riil konversi."
     * "Integrasi CRM & Email Funnel: Otomasi alur komunikasi lead nurturing untuk meningkatkan retensi dan konversi repeat order hingga 25%."

2. Buat konten yang SIAP PAKAI - user tidak perlu mengedit atau memikirkan ulang isi materi.
3. Setiap poin harus:
   - Spesifik dan informatif sesuai topik "${title}".
   - Tidak generik atau kosong.
   - Mengandung informasi nyata yang berguna bagi audiens.
   - Mudah dipahami saat dibaca di layar slide.
4. Hindari kalimat terlalu umum seperti:
   - "Penting untuk diperhatikan"
   - "Berbagai faktor memengaruhi"
   - "Ada banyak aspek yang perlu dipertimbangkan"
   - "Implementasi berkelanjutan untuk jangka panjang" (jika bukan presentasi tentang keberlanjutan)
5. Gunakan kalimat yang langsung ke intinya dan padat informasi nyata.

ATURAN STRUKTUR SLIDE:

1. Slide 1: Cover depan - judul + subjudul yang menarik (layoutId: "cover-front").
2. Slide 2: Daftar isi/agenda jika total slide >= 4 (layoutId: "table-of-contents").
3. Slide tengah: konten utama yang runtut dan logis.
4. Slide terakhir: kesimpulan atau call to action (layoutId: "cover-back").
5. Setiap content slide berisi 3-5 poin yang spesifik.

ATURAN BAHASA:
- Jika outputLanguage = "id", gunakan Bahasa Indonesia profesional dan natural.
- Jika outputLanguage = "en", gunakan English profesional dan natural.

ATURAN LAYOUT:
Pilih layout berdasarkan konten dan jumlah poin. Tersedia 189 variasi layout dari katalog "Base Layout Presentasi" (One Piece Design Studio).

LAYOUT UTAMA (legacy, selalu tersedia):
- 1 poin: one-point, one-point-split
- 2 poin: two-points, two-points-horizontal
- 3 poin: three-points, three-points-horizontal, three-points-timeline
- 4 poin: four-points, four-points-steps
- 5 poin: five-points, five-points-timeline
- 6 poin: six-points, six-points-columns
- Perbandingan: comparison
- Langkah/tahapan: steps
- Data/statistik: chart, chart-stat
- Testimoni: testimonial, testimonial-cards
- Slide pertama: cover-front, cover-front-editorial
- Slide terakhir: cover-back, cover-back-statement

LAYOUT KATALOG EXTENDED (189 variasi):
- Cover Depan: cover-p04 s/d cover-p18 (15 varian)
- Daftar Isi: agenda-p20 s/d agenda-p23 (4 varian)
- 1 Poin: point1-p25 s/d point1-p46 (22 varian)
- 2 Poin: point2-p48 s/d point2-p87 (40 varian)
- 3 Poin: point3-p89 s/d point3-p128 (40 varian)
- 4 Poin: point4-p130 s/d point4-p144 (15 varian)
- 5 Poin: point5-p146 s/d point5-p154 (9 varian)
- 6 Poin: point6-p156 s/d point6-p161 (6 varian)
- Chart: chart-p163 s/d chart-p171 (9 varian)
- Testimoni: testi-p173 s/d testi-p178 (6 varian)
- Cover Belakang: closing-p180 s/d closing-p202 (23 varian)

Pilih layout yang paling sesuai dengan konten slide. Variasikan layout agar tidak monoton.
Jangan gunakan layout yang sama lebih dari 2 kali berturut-turut.

FONT PAIRING TERSEDIA:
${fontList}

ATURAN PLACEHOLDER DATA (WAJIB):

Ketika konten slide memerlukan nama orang, nama tempat, alamat, nomor telepon, nomor rekening, email, website, media sosial, nama perusahaan, nama sekolah, atau entitas lainnya, WAJIB menggunakan data placeholder dari Text Toolkit berikut:

${toolkitText}

ATURAN KERAS PLACEHOLDER:
- DILARANG mengarang nama orang, alamat, nomor telepon, nomor rekening, email, website, atau entitas lain di luar toolkit ini.
- DILARANG menggunakan nama orang nyata, alamat nyata, atau nomor nyata.
- Jika konten membutuhkan alamat Indonesia, WAJIB gunakan persis: Jl. Mangga Muda 17A, Cilandak, Jakarta Selatan 12310
- Jika konten membutuhkan alamat internasional, WAJIB gunakan persis: 123 Anywhere St., Any City
- Pilih nama perusahaan/sekolah sesuai kategori bisnis yang relevan dengan konten slide.
- Pilih nama orang sesuai bahasa output (Indonesia/English).
- Jika melanggar aturan ini, output dianggap GAGAL dan akan di-retry.

PERINGATAN KERAS:
- JANGAN menyimpang dari judul yang diberikan.
- JANGAN menambahkan topik yang tidak diminta user.
- JANGAN menghasilkan konten generik yang bisa berlaku untuk topik apa pun.
- Setiap kata dalam konten harus mendukung judul presentasi.
- Jika ragu apakah sebuah poin relevan, JANGAN masukkan.
- Jika Anda menghasilkan konten yang tidak relevan dengan judul, itu dianggap GAGAL.
- Prioritas utama Anda adalah RELEVANSI, bukan kreativitas berlebihan.

CONTOH INPUT:
Judul: "Strategi Pemasaran Digital 2026"
Topik: "Untuk klien startup teknologi"
Jumlah Slide: 5
Bahasa: id

CONTOH OUTPUT YANG DIHARAPKAN:
{
  "slides": [
    {
      "slideNumber": 1,
      "slideType": "cover",
      "layoutId": "cover-front",
      "pointCount": 0,
      "layoutReason": "Slide pembuka presentasi",
      "title": "Strategi Pemasaran Digital 2026",
      "subtitle": "Membangun Pertumbuhan Startup Melalui Kanal Digital",
      "content": []
    },
    {
      "slideNumber": 2,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Menjelaskan tren utama pemasaran digital 2026",
      "title": "Tren Pemasaran Digital 2026",
      "content": [
        "Short-Form Video: Format vertikal di TikTok dan Reels mendominasi engagement audiens dengan retensi 2x lipat dibanding konten statis.",
        "Personalisasi Berbasis AI: Algoritma machine learning menyesuaikan pesan iklan secara real-time dan meningkatkan rasio konversi hingga 30%.",
        "Social Commerce Terintegrasi: Pengalaman checkout langsung di dalam platform media sosial yang memangkas friksi alur transaksi pelanggan."
      ]
    },
    {
      "slideNumber": 3,
      "slideType": "content",
      "layoutId": "three-points",
      "pointCount": 3,
      "layoutReason": "Menjelaskan 3 kanal digital prioritas",
      "title": "Kanal Pemasaran Prioritas",
      "content": [
        "TikTok Ads: Membangun brand awareness cepat dan menjangkau generasi muda melalui storytelling kreatif dan interaktif.",
        "Google Performance Max: Mengoptimalkan perolehan prospek dan konversi penjualan di seluruh ekosistem Search, Maps, dan YouTube.",
        "Email Marketing Automation: Mengirimkan urutan pesan terpersonalisasi guna mendidik prospek baru dan memaksimalkan repeat purchase."
      ]
    },
    {
      "slideNumber": 4,
      "slideType": "content",
      "layoutId": "two-points",
      "pointCount": 2,
      "layoutReason": "Menjelaskan metrik keberhasilan utama",
      "title": "Metrik Keberhasilan",
      "content": [
        "ROAS (Return on Ad Spend) minimal 3x untuk campaign yang sehat",
        "Customer Acquisition Cost (CAC) turun 20% dalam 6 bulan pertama"
      ]
    },
    {
      "slideNumber": 5,
      "slideType": "conclusion",
      "layoutId": "cover-back",
      "pointCount": 0,
      "layoutReason": "Slide penutup dan call to action",
      "title": "Mulai Transformasi Digital Anda",
      "subtitle": "Konsultasikan strategi pemasaran digital untuk startup Anda",
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

PERHATIKAN: Semua konten 100% relevan dengan judul "${title}" dan siap pakai tanpa perlu revisi.
Balas HANYA dalam format JSON valid tanpa tanda markdown (\`\`\`json).
`;
}

module.exports = {
  buildMasterPrompt,
};
