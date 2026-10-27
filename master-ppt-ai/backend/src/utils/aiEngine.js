/**
 * AI Recommendation Engine & Dynamic Slide Generator
 * Rule-based contextual AI system for PowerPoint Master Deck generation
 */

const fontDatabase = require('./fontDatabase');
const { colorDatabase, themeDefaultColors } = require('./colorDatabase');
const layoutDatabase = require('./layoutDatabase');

// Theme key mapping
const THEME_MAP = {
  bisnis: 'bisnis',
  business: 'bisnis',
  edukasi: 'edukasi',
  education: 'edukasi',
  kreatif: 'kreatif',
  creative: 'kreatif',
  minimalis: 'minimalis',
  minimal: 'minimalis',
  teknologi: 'teknologi',
  technology: 'teknologi',
  tech: 'teknologi',
  'tema bebas': 'bebas',
  bebas: 'bebas',
  custom: 'bebas',
};

const THEME_TO_CATEGORY = {
  bisnis: 'professional',
  edukasi: 'education',
  kreatif: 'creative',
  minimalis: 'minimal',
  teknologi: 'technology',
  bebas: 'custom',
};

function normalizeTheme(themeName) {
  if (!themeName) return 'bisnis';
  const normalized = themeName.toLowerCase().trim();
  return THEME_MAP[normalized] || 'bisnis';
}

function getFontRecommendation(themeKey) {
  const category = THEME_TO_CATEGORY[themeKey] || 'professional';
  const fonts = fontDatabase[category] || fontDatabase.professional;
  
  if (!fonts || fonts.length === 0) {
    return {
      heading: 'Montserrat',
      body: 'Open Sans',
      rationale: 'Kombinasi klasik modern yang bersih, profesional, dan mudah dibaca di berbagai resolusi layar.',
      googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;600&display=swap',
    };
  }
  return fonts[0];
}

function getColorRecommendation(themeKey) {
  const themeColors = colorDatabase[themeKey];
  if (!themeColors) {
    if (themeKey === 'bebas') {
      return {
        primary: '#2563EB',
        secondary: '#1D4ED8',
        accent: '#F59E0B',
        background: '#0B0F19',
        text: '#F8FAFC',
        textLight: '#94A3B8',
        palette: ['#0B0F19', '#1E40AF', '#2563EB', '#60A5FA', '#F59E0B'],
        harmony: 'modern-vibrant',
        rationale: 'Kombinasi biru elektrik dinamis dan emas amber yang seimbang untuk topik bebas profesional.',
      };
    }
    return themeDefaultColors.bisnis;
  }
  
  const harmonyKeys = Object.keys(themeColors);
  return themeColors[harmonyKeys[0]];
}

function getLayoutRecommendation(themeKey) {
  const universalLayouts = layoutDatabase.universal || [];
  const themeSpecificLayouts = layoutDatabase[themeKey] || [];
  return [...themeSpecificLayouts, ...universalLayouts];
}

function getContentSuggestions(themeKey) {
  const suggestions = {
    bisnis: {
      titleSlide: 'Gunakan judul yang menyatakan value proposition atau sasaran strategis perusahaan.',
      contentSlide: 'Terapkan prinsip Piramida Minto: dahulukan pesan utama, lalu sajikan poin pendukung.',
      imageSlide: 'Sertakan visual data, infografis pasar, atau diagram alur yang relevan.',
      statSlide: 'Sajikan metrik dalam perbandingan yang nyata (misal: "Peningkatan 45% vs Kuartal Lalu").',
      closingSlide: 'Tutup dengan Call-to-Action (CTA) yang tegas dan langkah berikutnya (Next Steps).',
    },
    edukasi: {
      titleSlide: 'Mulai dengan pertanyaan provokatif yang memantik rasa ingin tahu audiens.',
      contentSlide: 'Pecah materi ke dalam konsep berulang dengan analogi sederhana dan contoh kasus.',
      imageSlide: 'Gunakan ilustrasi konsep untuk memudahkan retensi visual siswa/peserta.',
      statSlide: 'Tampilkan hasil riset atau perbandingan studi yang kredibel.',
      closingSlide: 'Sediakan rangkuman 3 poin inti dan tugas mandiri atau referensi lanjutan.',
    },
    kreatif: {
      titleSlide: 'Buat judul yang berani dan desain visual pembuka yang memorable.',
      contentSlide: 'Ceritakan narasi proses kreatif di balik karya atau inovasi yang dipaparkan.',
      imageSlide: 'Gunakan visual berukuran besar, beri ruang bernapas tanpa teks yang padat.',
      statSlide: 'Tampilkan dampak karya atau testimoni klien dengan gaya tipografi kuat.',
      closingSlide: 'Tinggalkan audiens dengan satu kalimat inspiratif atau visi masa depan.',
    },
    minimalis: {
      titleSlide: 'Satu ide kunci di slide pembuka, manfaatkan whitespace elegan.',
      contentSlide: 'Pegang teguh aturan "satu slide, satu ide pokok". Hindari kerumitan.',
      imageSlide: 'Foto monokromatis atau visual minimal dengan kontras tajam.',
      statSlide: 'Angka besar mandiri dengan label ringkas tanpa ornamen berlebihan.',
      closingSlide: 'Penutup hening dan berwibawa dengan kontak esensial.',
    },
    teknologi: {
      titleSlide: 'Tampilkan tagline futuristik atau solusi teknologi mutakhir yang diusung.',
      contentSlide: 'Fokus pada problem-solution fit dan arsitektur produk yang solid.',
      imageSlide: 'Mockup produk, tangkapan layar UI aplikasi, atau diagram sistem.',
      statSlide: 'Metrik performa nyata: latency, throughput, uptime, dan growth rate.',
      closingSlide: 'Tampilkan roadmap rilis fitur dan link dokumentasi / demo produk.',
    },
    bebas: {
      titleSlide: 'Fokus pada pesan inti yang selaras dengan topik khusus yang Anda tentukan.',
      contentSlide: 'Susun alur presentasi secara logis dari latar belakang hingga eksekusi.',
      imageSlide: 'Visual pendukung tematik yang memperkuat narasi topik Anda.',
      statSlide: 'Data pendukung untuk memvalidasi argumen yang disampaikan.',
      closingSlide: 'Kesimpulan ringkas dan ajakan kolaborasi yang jelas.',
    },
  };
  
  return suggestions[themeKey] || suggestions.bisnis;
}

/**
 * Main AI Recommendation Function
 */
function getRecommendations(themeName, customizations = {}) {
  const themeKey = normalizeTheme(themeName);
  
  const fontRec = getFontRecommendation(themeKey);
  const colorRec = getColorRecommendation(themeKey);
  const layouts = getLayoutRecommendation(themeKey);
  const contentSuggestions = getContentSuggestions(themeKey);
  
  const finalFonts = {
    heading: customizations.fontHeading || fontRec.heading,
    body: customizations.fontBody || fontRec.body,
    rationale: fontRec.rationale,
    googleFontUrl: fontRec.googleFontUrl,
  };
  
  const finalColors = {
    primary: customizations.colorPrimary || customizations.primary || colorRec.primary,
    secondary: customizations.colorSecondary || customizations.secondary || colorRec.secondary,
    accent: customizations.colorAccent || customizations.accent || colorRec.accent,
    background: colorRec.background,
    text: colorRec.text,
    textLight: colorRec.textLight,
    palette: colorRec.palette,
    harmony: colorRec.harmony,
    rationale: colorRec.rationale,
  };
  
  return {
    themeKey,
    themeName: themeName || 'Bisnis',
    fonts: finalFonts,
    colors: finalColors,
    layouts,
    contentSuggestions,
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '2.0.0',
      totalLayouts: layouts.length,
    },
  };
}

/**
 * Generate 1 to 15 structured slides with contextual placeholders
 */
function generateSlideDeck({
  themeName = 'Bisnis',
  customTitle = '',
  customDescription = '',
  slideCount = 5,
  customColors = null,
  customFonts = null,
}) {
  const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 1), 15);
  const themeKey = normalizeTheme(themeName);
  const rec = getRecommendations(themeName, {
    primary: customColors?.primary,
    secondary: customColors?.secondary,
    accent: customColors?.accent,
    fontHeading: customFonts?.heading,
    fontBody: customFonts?.body,
  });

  const headingFont = customFonts?.heading || rec.fonts.heading;
  const bodyFont = customFonts?.body || rec.fonts.body;
  const primaryColor = customColors?.primary || rec.colors.primary;
  const secondaryColor = customColors?.secondary || rec.colors.secondary;
  const accentColor = customColors?.accent || rec.colors.accent;

  const titleText = customTitle.trim() || `${themeName} - Master Template`;
  const descText = customDescription.trim() || '';

  // Slide Blueprint definitions (up to 15 unique contextual slides)
  const masterBlueprints = [
    // 1. Title Slide (Primary Theme Background, Crisp White Font)
    {
      slideType: 'title',
      layout: 'centered',
      name: 'Title Slide',
      background: { color: primaryColor, type: 'solid' },
      placeholders: [
        {
          id: 'title-1',
          type: 'text',
          name: 'Judul Utama',
          content: titleText,
          font: headingFont,
          fontSize: 40,
          color: '#FFFFFF',
          shadow: true,
          align: 'center',
          position: { x: 1, y: 1.8, w: 8, h: 1.2 },
        },
        {
          id: 'subtitle-1',
          type: 'text',
          name: 'Subjudul',
          content: descText ? descText.slice(0, 120) : 'Strategi Komprehensif & Rekomendasi Eksekutif Berbasis AI',
          font: bodyFont,
          fontSize: 20,
          color: '#F8FAFC',
          shadow: true,
          align: 'center',
          position: { x: 1.5, y: 3.2, w: 7, h: 0.8 },
        },
        {
          id: 'presenter-1',
          type: 'text',
          name: 'Presenter Info',
          content: 'Disusun oleh Tim Master PPT AI | ' + new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
          font: bodyFont,
          fontSize: 14,
          color: '#E2E8F0',
          shadow: false,
          align: 'center',
          position: { x: 2, y: 4.2, w: 6, h: 0.5 },
        },
      ],
    },
    // 2. Agenda / Outline (Secondary Theme Background, White Font)
    {
      slideType: 'agenda',
      layout: 'left-aligned',
      name: 'Agenda & Ikhtisar',
      background: { color: secondaryColor, type: 'solid' },
      placeholders: [
        {
          id: 'title-2',
          type: 'text',
          name: 'Judul Slide',
          content: 'Daftar Agenda & Pembahasan',
          font: headingFont,
          fontSize: 32,
          color: '#FFFFFF',
          shadow: true,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-2',
          type: 'text',
          name: 'Daftar Poin Agenda',
          content: '01. Latar Belakang & Analisis Masalah\n02. Pendekatan Strategis & Metodologi\n03. Rencana Eksekusi & Timeline Proyek\n04. Indikator Keberhasilan (KPI) & Metrik Dampak\n05. Alokasi Sumber Daya & Rekomendasi Akhir',
          font: bodyFont,
          fontSize: 18,
          color: '#FFFFFF',
          shadow: true,
          align: 'left',
          position: { x: 1, y: 1.5, w: 8, h: 3.2 },
        },
      ],
    },
    // 3. Problem Statement / Latar Belakang (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'left-aligned',
      name: 'Latar Belakang & Masalah',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-3',
          type: 'text',
          name: 'Judul Slide',
          content: 'Tantangan Utama & Peluang Pasar',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-3',
          type: 'text',
          name: 'Poin Tantangan',
          content: '• Dinamika industri yang bergerak cepat menuntut inovasi berkelanjutan.\n• Kebutuhan efisiensi operasional tanpa mengorbankan kualitas luaran.\n• Kesenjangan teknologi dan adopsi otomatisasi cerdas pada skala enterprise.\n• Potensi pertumbuhan eksponensial dengan penerapan solusi terintegrasi.',
          font: bodyFont,
          fontSize: 18,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.5, w: 8, h: 3.2 },
        },
      ],
    },
    // 4. Two Column / Perbandingan (White Background, Dark Font)
    {
      slideType: 'comparison',
      layout: 'two-column',
      name: 'Analisis & Perbandingan',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-4',
          type: 'text',
          name: 'Judul Slide',
          content: 'Kondisi Saat Ini vs Target Solusi',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'col-left-4',
          type: 'text',
          name: 'Kondisi Eksisting',
          content: 'Kondisi Saat Ini:\n• Proses manual memakan waktu 40% lebih lama\n• Visibilitas data performa belum tersentralisasi\n• Tingkat error operasional berkisar di 12%',
          font: bodyFont,
          fontSize: 16,
          color: '#4B5563',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.6, w: 3.8, h: 3 },
        },
        {
          id: 'col-right-4',
          type: 'text',
          name: 'Target Solusi Baru',
          content: 'Solusi Rekomendasi:\n• Otomatisasi AI memangkas siklus kerja hingga 65%\n• Dashboard analitik terpadu secara real-time\n• Akurasi proses meningkat di atas 99.2%',
          font: bodyFont,
          fontSize: 16,
          color: primaryColor,
          shadow: false,
          align: 'left',
          position: { x: 5.2, y: 1.6, w: 3.8, h: 3 },
        },
      ],
    },
    // 5. Image & Narrative Focus (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'image-right',
      name: 'Solusi Unggulan',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-5',
          type: 'text',
          name: 'Judul Slide',
          content: 'Kerangka Solusi & Nilai Tambah',
          font: headingFont,
          fontSize: 30,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-left-5',
          type: 'text',
          name: 'Deskripsi Solusi',
          content: 'Pendekatan terpadu yang memadukan keunggulan teknologi mutakhir dengan kemudahan implementasi praktis.\n\nMemungkinkan akselerasi hasil dalam hitungan minggu, bukan bulan, dengan tata kelola yang teruji.',
          font: bodyFont,
          fontSize: 17,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.6, w: 4.2, h: 3 },
        },
        {
          id: 'image-right-5',
          type: 'image',
          name: 'Area Gambar / Infografis',
          content: null,
          placeholder: 'Area Visual / Diagram Solusi Arsitektur',
          position: { x: 5.6, y: 1.6, w: 3.4, h: 3 },
        },
      ],
    },
    // 6. Statistics / Metrik Data (High Impact Dark Background, Vivid Contrast Numbers)
    {
      slideType: 'statistics',
      layout: 'centered',
      name: 'Metrik & Capaian Kunci',
      background: { color: '#0F172A', type: 'solid' },
      placeholders: [
        {
          id: 'title-6',
          type: 'text',
          name: 'Judul Slide',
          content: 'Indikator Kinerja & Dampak Terukur',
          font: headingFont,
          fontSize: 32,
          color: '#FFFFFF',
          shadow: true,
          align: 'center',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'stat-1-6',
          type: 'text',
          name: 'Statistik 1',
          content: '+185%\nPertumbuhan Efisiensi',
          font: headingFont,
          fontSize: 22,
          color: accentColor,
          shadow: true,
          align: 'center',
          position: { x: 1, y: 1.8, w: 2.4, h: 2.2 },
        },
        {
          id: 'stat-2-6',
          type: 'text',
          name: 'Statistik 2',
          content: '3.8x\nReturn on Investment (ROI)',
          font: headingFont,
          fontSize: 22,
          color: '#38BDF8',
          shadow: true,
          align: 'center',
          position: { x: 3.8, y: 1.8, w: 2.4, h: 2.2 },
        },
        {
          id: 'stat-3-6',
          type: 'text',
          name: 'Statistik 3',
          content: '99.4%\nTingkat Kepuasan Pengguna',
          font: headingFont,
          fontSize: 22,
          color: '#4ADE80',
          shadow: true,
          align: 'center',
          position: { x: 6.6, y: 1.8, w: 2.4, h: 2.2 },
        },
      ],
    },
    // 7. Timeline / Roadmap (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'left-aligned',
      name: 'Roadmap & Rencana Tahapan',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-7',
          type: 'text',
          name: 'Judul Slide',
          content: 'Tahapan Implementasi & Milestone',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-7',
          type: 'text',
          name: 'Fase Proyek',
          content: '• Fase 1 (Bulan 1): Penyelarasan Kebutuhan, Analisis & Setup Awal\n• Fase 2 (Bulan 2-3): Pengembangan Solusi, Integrasi Data & Uji Coba Alpha\n• Fase 3 (Bulan 4): Pelatihan Pengguna, UAT & Peluncuran Resmi (Go-Live)\n• Fase 4 (Bulan 5+): Monitoring Berkelanjutan, Optimasi & Evaluasi Berkala',
          font: bodyFont,
          fontSize: 17,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.5, w: 8, h: 3.2 },
        },
      ],
    },
    // 8. Team & Stakeholders (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'two-column',
      name: 'Tim & Tata Kelola',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-8',
          type: 'text',
          name: 'Judul Slide',
          content: 'Struktur Tim & Penanggung Jawab',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'col-left-8',
          type: 'text',
          name: 'Tim Pengarah',
          content: 'Pengarah Strategis:\n• Project Sponsor: Memastikan keselarasan visi perusahaan\n• Lead Strategist: Mengarahkan metodologi dan eksekusi',
          font: bodyFont,
          fontSize: 16,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.6, w: 3.8, h: 3 },
        },
        {
          id: 'col-right-8',
          type: 'text',
          name: 'Tim Operasional',
          content: 'Tim Pelaksana:\n• Technical Lead: Mengawal arsitektur teknis dan stabilitas\n• Operations Specialist: Mengawal adopsi dan kepuasan audiens',
          font: bodyFont,
          fontSize: 16,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 5.2, y: 1.6, w: 3.8, h: 3 },
        },
      ],
    },
    // 9. Key Benefits / Value Proposition (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'left-aligned',
      name: 'Manfaat & Nilai Strategis',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-9',
          type: 'text',
          name: 'Judul Slide',
          content: 'Nilai Strategis yang Diperoleh',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-9',
          type: 'text',
          name: 'Daftar Manfaat',
          content: '1. Kecepatan Eksekusi: Akselerasi proses pengambilan keputusan hingga 3x lipat.\n2. Konsistensi Mutu: Standarisasi output berkualitas tinggi di semua divisi.\n3. Skalabilitas Tinggi: Fondasi fleksibel yang siap tumbuh bersama bisnis.\n4. Keamanan & Kepatuhan: Menjamin integritas data sesuai standar industri.',
          font: bodyFont,
          fontSize: 17,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.5, w: 8, h: 3.2 },
        },
      ],
    },
    // 10. Quote / Visi (Secondary Theme Background, White Font)
    {
      slideType: 'section',
      layout: 'centered',
      name: 'Pesan Utama & Visi',
      background: { color: secondaryColor, type: 'solid' },
      placeholders: [
        {
          id: 'quote-10',
          type: 'text',
          name: 'Kutipan Visi',
          content: '"Inovasi bukan hanya tentang ide baru, melainkan keberanian mengeksekusi visi menjadi dampak nyata yang berkelanjutan."',
          font: headingFont,
          fontSize: 26,
          color: '#FFFFFF',
          shadow: true,
          align: 'center',
          position: { x: 1.5, y: 1.8, w: 7, h: 1.8 },
        },
        {
          id: 'author-10',
          type: 'text',
          name: 'Atribusi',
          content: '— Prinsip Penggerak Master PPT AI',
          font: bodyFont,
          fontSize: 16,
          color: accentColor,
          shadow: true,
          align: 'center',
          position: { x: 2, y: 3.8, w: 6, h: 0.5 },
        },
      ],
    },
    // 11. Risk & Mitigation (White Background, Contrast Badges)
    {
      slideType: 'comparison',
      layout: 'two-column',
      name: 'Manajemen Risiko',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-11',
          type: 'text',
          name: 'Judul Slide',
          content: 'Identifikasi Risiko & Mitigasi',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'col-left-11',
          type: 'text',
          name: 'Potensi Risiko',
          content: 'Potensi Risiko:\n• Hambatan adaptasi pengguna awal\n• Keterbatasan alokasi waktu tim\n• Ketergantungan pada sistem lama',
          font: bodyFont,
          fontSize: 16,
          color: '#DC2626',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.6, w: 3.8, h: 3 },
        },
        {
          id: 'col-right-11',
          type: 'text',
          name: 'Langkah Mitigasi',
          content: 'Langkah Mitigasi:\n• Sesi onboarding interaktif & panduan lengkap\n• Pendekatan implementasi bertahap (phased rollout)\n• Skema backup & sinkronisasi data dua arah',
          font: bodyFont,
          fontSize: 16,
          color: '#16A34A',
          shadow: false,
          align: 'left',
          position: { x: 5.2, y: 1.6, w: 3.8, h: 3 },
        },
      ],
    },
    // 12. Case Study / Bukti Nyata (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'image-left',
      name: 'Studi Kasus & Validasi',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-12',
          type: 'text',
          name: 'Judul Slide',
          content: 'Bukti Nyata Penerapan di Lapangan',
          font: headingFont,
          fontSize: 30,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'image-left-12',
          type: 'image',
          name: 'Area Gambar Studi Kasus',
          content: null,
          placeholder: 'Infografis Sebelum vs Sesudah Implementasi',
          position: { x: 1, y: 1.6, w: 3.6, h: 3 },
        },
        {
          id: 'content-right-12',
          type: 'text',
          name: 'Hasil Studi Kasus',
          content: 'Hasil Penerapan:\n• Waktu persiapan materi presentasi turun dari 8 jam menjadi 30 menit.\n• Konsistensi visual deck korporat tercapai 100% di seluruh divisi.\n• Respon audiens eksekutif meningkat signifikan pada rapat pitching.',
          font: bodyFont,
          fontSize: 16,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 5, y: 1.6, w: 4, h: 3 },
        },
      ],
    },
    // 13. Resource & Investment (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'left-aligned',
      name: 'Kebutuhan & Investasi',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-13',
          type: 'text',
          name: 'Judul Slide',
          content: 'Alokasi Sumber Daya & Investasi',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-13',
          type: 'text',
          name: 'Rincian Kebutuhan',
          content: '• Komitmen Waktu: Sprint persiapan 2 minggu pertama dengan review mingguan.\n• Tooling & Lisensi: Penyediaan akses software dan infrastruktur pendukung.\n• Pemberdayaan Tim: Workshop intensif untuk memastikan adopsi optimal.\n• ROI Ekspektasi: Titik impas (break-even) diproyeksikan dalam kuartal pertama.',
          font: bodyFont,
          fontSize: 17,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.5, w: 8, h: 3.2 },
        },
      ],
    },
    // 14. Action Plan / Next Steps (White Background, Dark Font)
    {
      slideType: 'content',
      layout: 'left-aligned',
      name: 'Langkah Konkret Berikutnya',
      background: { color: '#FFFFFF', type: 'solid' },
      placeholders: [
        {
          id: 'title-14',
          type: 'text',
          name: 'Judul Slide',
          content: 'Langkah Tindak Lanjut (Next Steps)',
          font: headingFont,
          fontSize: 32,
          color: '#1F2937',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 0.6, w: 8, h: 0.6 },
        },
        {
          id: 'content-14',
          type: 'text',
          name: 'Aksi Segera',
          content: '1. Persetujuan Formal: Konfirmasi ruang lingkup proyek dari para pemangku kepentingan.\n2. Kick-off Meeting: Menetapkan PIC dan jadwal kerja detail minggu ini.\n3. Aktivasi Akses: Distribusi kredensial dan materi pendukung awal.\n4. Checkpoint Pertama: Evaluasi progres pada akhir minggu kedua.',
          font: bodyFont,
          fontSize: 17,
          color: '#374151',
          shadow: false,
          align: 'left',
          position: { x: 1, y: 1.5, w: 8, h: 3.2 },
        },
      ],
    },
    // 15. Closing Slide (Primary Theme Background, Crisp White & Accent Font)
    {
      slideType: 'closing',
      layout: 'centered',
      name: 'Penutup & Tanya Jawab',
      background: { color: primaryColor, type: 'solid' },
      placeholders: [
        {
          id: 'title-15',
          type: 'text',
          name: 'Judul Penutup',
          content: 'Terima Kasih',
          font: headingFont,
          fontSize: 44,
          color: '#FFFFFF',
          shadow: true,
          align: 'center',
          position: { x: 1, y: 1.5, w: 8, h: 1 },
        },
        {
          id: 'subtitle-15',
          type: 'text',
          name: 'Pesan Penutup',
          content: 'Mari Bekerja Sama Mewujudkan Presentasi Kelas Dunia',
          font: bodyFont,
          fontSize: 22,
          color: accentColor,
          shadow: true,
          align: 'center',
          position: { x: 1.5, y: 2.7, w: 7, h: 0.8 },
        },
        {
          id: 'contact-15',
          type: 'text',
          name: 'Kontak & Informasi',
          content: 'Pertanyaan & Diskusi: contact@masterpptai.id | www.masterpptai.id',
          font: bodyFont,
          fontSize: 15,
          color: '#F1F5F9',
          shadow: false,
          align: 'center',
          position: { x: 1.5, y: 3.8, w: 7, h: 0.6 },
        },
      ],
    },
  ];

  // Assemble exact count:
  // Always start with Title (blueprint 0)
  // If count > 1, end with Closing (blueprint 14)
  // Pick (count - 2) intermediary slides
  let selected = [];
  if (count === 1) {
    selected = [masterBlueprints[0]];
  } else if (count === 2) {
    selected = [masterBlueprints[0], masterBlueprints[14]];
  } else {
    const middleCount = count - 2;
    const availableMiddle = masterBlueprints.slice(1, 14);
    // Take middleCount blueprints from available
    const middle = availableMiddle.slice(0, middleCount);
    selected = [masterBlueprints[0], ...middle, masterBlueprints[14]];
  }

  // Renumber slides & placeholders cleanly
  const finalSlides = selected.map((s, idx) => {
    const slideNumber = idx + 1;
    const remappedPlaceholders = s.placeholders.map((p) => ({
      ...p,
      id: `${p.id.split('-')[0]}-${slideNumber}`,
      font: p.font || (p.id.startsWith('title') || p.id.startsWith('stat') ? headingFont : bodyFont),
    }));

    return {
      slideNumber,
      slideType: s.slideType,
      layout: s.layout,
      name: s.name,
      background: { ...s.background },
      placeholders: remappedPlaceholders,
    };
  });

  return {
    slides: finalSlides,
    recommendations: rec,
  };
}

module.exports = {
  getRecommendations,
  generateSlideDeck,
  normalizeTheme,
  getContentSuggestions,
  getColorRecommendation,
  getFontRecommendation,
};
