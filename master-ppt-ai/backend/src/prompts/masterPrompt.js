/**
 * Master Prompt Generator for AI PowerPoint Deck Generation
 * Mengintegrasikan Variasi Auto Layout Design System dari Base Layout Presentasi.pdf
 */

function buildMasterPrompt({ title, theme, description, slideCount, customColors }) {
  const colorsText = customColors?.primary
    ? `Jika user sudah memilih warna custom berikut:
Primary: ${customColors.primary}
Secondary: ${customColors.secondary || customColors.primary}
Accent: ${customColors.accent || '#F59E0B'}

Maka gunakan warna tersebut sebagai palet warna utama dan sesuaikan rekomendasi font serta layout dengan warna tersebut.`
    : '';

  return `
Kamu adalah ahli copywriting dan arsitek desain presentasi profesional kelas dunia dengan Auto Layout Design System berbasis katalog "Base Layout Presentasi".

Buatkan konten presentasi PowerPoint komprehensif berdasarkan informasi berikut:

Judul Presentasi: ${title}
Tema: ${theme}
Deskripsi Tambahan: ${description || "Tidak ada"}
Jumlah Slide: ${slideCount}

=== ATURAN PEMILIHAN LAYOUT VARIATIF DARI BASE LAYOUT ===
Setiap slide harus memiliki tata letak yang bervariasi dan dinamis. Jangan memaksakan semua slide memakai pola yang sama. Pilih layoutId yang tepat untuk setiap slide dari katalog berikut:

1. Slide Cover Pembuka (Slide 1):
   - "cover-front" (Cover klasik terpusat) ATAU "cover-front-editorial" (Cover modern editorial kiri)

2. Slide Daftar Isi / Agenda (Slide 2 jika total slide >= 4):
   - "table-of-contents" (Daftar isi 01-06 bergaris elegan)

3. Slide Konten 1 Poin:
   - "one-point" (Impact statement inspiratif terpusat)
   - "one-point-split" (Judul & deskripsi di kiri, uraian fokus di kanan)

4. Slide Konten 2 Poin:
   - "two-points" (Dua kolom sejajar simetris A & B)
   - "two-points-horizontal" (Dua baris bertingkat dengan garis pemisah 01 / 02)

5. Slide Konten 3 Poin:
   - "three-points" (Tiga kolom kartu vertikal 01, 02, 03)
   - "three-points-horizontal" (Tiga baris horizontal dengan penanda panah [→] dan garis pemisah)
   - "three-points-timeline" (Tiga tahapan alur berurutan pada garis timeline)

6. Slide Konten 4 Poin:
   - "four-points" (Grid kartu simetris 2x2 dengan badge panah)
   - "four-points-steps" (Empat kuadran alur bertahap: Step 1, Step 2, Step 3, Step 4)

7. Slide Konten 5 Poin:
   - "five-points" (Lima kartu berjenjang: 3 di atas + 2 di bawah terpusat)
   - "five-points-timeline" (Rangkaian 5 tahapan proses horizontal 01 s/d 05)

8. Slide Konten 6 Poin:
   - "six-points" (Grid 3x2 kartu terstruktur padat)
   - "six-points-columns" (Dua kolom masing-masing berisi 3 baris bergaris panah [→])

9. Slide Data, Grafik, & Metrik Kinerja:
   - "chart" (Visual grafik di kanan dengan narasi sumber data di kiri)
   - "chart-stat" (Tiga kartu cincin persentase capaian kuantitatif seperti 67%, 85%, dsb.)

10. Slide Testimoni & Validasi:
    - "testimonial-cards" (Tiga kartu ulasan pelanggan lengkap dengan rating bintang ★★★★ 4.8/5)
    - "testimonial" (Satu kutipan visi kepemimpinan masif terpusat)

11. Slide Penutup (Slide Terakhir):
    - "cover-back" (Let's Connect & rincian kontak: Phone, Email, Website, Alamat)
    - "cover-back-statement" (Tipografi "Thank You" masif terpusat dengan tautan media)

=== INSTRUKSI STRUKTUR & VARIASI DECK ===
- Variasikan jumlah poin di slide konten (misal ada slide 2 poin, slide 3 poin horizontal, slide chart data, slide 4 poin grid).
- Hindari repetisi layout yang sama di slide yang berurutan.
- Bahasa: Bahasa Indonesia yang berbobot, persuasif, tajam, dan mudah dipahami.

${colorsText}

Balas HANYA dalam format JSON valid tanpa markdown atau teks pengantar dengan format:
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
      "slideType": "${slideCount >= 4 ? 'agenda' : 'content'}",
      "layoutId": "${slideCount >= 4 ? 'table-of-contents' : 'three-points'}",
      "pointCount": ${slideCount >= 4 ? Math.min(slideCount, 5) : 3},
      "title": "${slideCount >= 4 ? 'Daftar Agenda & Pembahasan' : 'Topik Utama'}",
      "subtitle": "Ikhtisar topik...",
      "content": [
        "Poin 1...",
        "Poin 2...",
        "Poin 3..."
      ]
    }
  ],
  "designRecommendation": {
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans",
      "rationale": "Kombinasi font modern dan mudah dibaca."
    },
    "colors": {
      "primary": "#2563EB",
      "secondary": "#1E40AF",
      "accent": "#F59E0B",
      "rationale": "Harmoni palet warna yang seimbang."
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
