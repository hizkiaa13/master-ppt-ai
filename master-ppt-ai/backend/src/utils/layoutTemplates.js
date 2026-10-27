/**
 * Layout Templates Library - Master PPT AI
 * Berbasis langsung dari katalog desain "Base Layout Presentasi.pdf" (One Piece Design Studio)
 * Menyediakan variasi layout untuk 1 poin s/d 6 poin, chart, testimoni, cover depan, dan cover belakang.
 */

const LAYOUT_TEMPLATES = {
  // === A. COVER DEPAN ===
  'cover-front': {
    layoutId: 'cover-front',
    layoutName: 'Cover Depan - Terpusat',
    category: 'cover',
    variant: 'centered',
    description: 'Judul besar terpusat dengan subjudul dan info presenter di bawah (Halaman 4 & 12 Base Layout).',
    usageRule: 'Slide pertama presentasi.',
    recommendedPoints: 0,
    backgroundType: 'primary',
    fontSizeRules: {
      title: { min: 40, max: 54, default: 46 },
      subtitle: { min: 18, max: 24, default: 20 },
      presenter: { min: 14, max: 18, default: 15 },
    },
    slots: {
      title: { x: 8, y: 24, w: 84, h: 22, align: 'center' },
      subtitle: { x: 12, y: 49, w: 76, h: 14, align: 'center' },
      presenter: { x: 15, y: 74, w: 70, h: 10, align: 'center' },
    },
  },

  'cover-front-editorial': {
    layoutId: 'cover-front-editorial',
    layoutName: 'Cover Depan - Editorial Kiri',
    category: 'cover',
    variant: 'editorial',
    description: 'Judul masif rata kiri dengan pengantar ringkas di atas dan presenter di sudut (Halaman 8 & 13 Base Layout).',
    usageRule: 'Slide pertama untuk nuansa modern editorial minimalis.',
    recommendedPoints: 0,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 42, max: 56, default: 48 },
      subtitle: { min: 18, max: 22, default: 19 },
      presenter: { min: 14, max: 18, default: 15 },
    },
    slots: {
      intro: { x: 6, y: 12, w: 60, h: 8, align: 'left' },
      title: { x: 6, y: 22, w: 88, h: 32, align: 'left' },
      subtitle: { x: 6, y: 68, w: 50, h: 18, align: 'left' },
      presenter: { x: 65, y: 72, w: 29, h: 14, align: 'right' },
    },
  },

  // === B. DAFTAR ISI / AGENDA ===
  'table-of-contents': {
    layoutId: 'table-of-contents',
    layoutName: 'Daftar Isi - Grid 01-06 Bergaris',
    category: 'agenda',
    variant: 'grid-lines',
    description: 'Dua kolom bernomor 01-06 dengan garis pemisah horizontal elegan (Halaman 20 & 21 Base Layout).',
    usageRule: 'Slide kedua saat total slide >= 4.',
    recommendedPoints: [3, 4, 5, 6],
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 28, max: 34, default: 32 },
      itemNumber: { min: 22, max: 28, default: 24 },
      itemText: { min: 15, max: 19, default: 16 },
    },
    slots: {
      title: { x: 6, y: 8, w: 88, h: 12, align: 'left' },
      points: [
        { x: 6, y: 26, w: 42, h: 18, number: '01', align: 'left' },
        { x: 52, y: 26, w: 42, h: 18, number: '04', align: 'left' },
        { x: 6, y: 48, w: 42, h: 18, number: '02', align: 'left' },
        { x: 52, y: 48, w: 42, h: 18, number: '05', align: 'left' },
        { x: 6, y: 70, w: 42, h: 18, number: '03', align: 'left' },
        { x: 52, y: 70, w: 42, h: 18, number: '06', align: 'left' },
      ],
    },
  },

  // === C. 1 POIN ===
  'one-point': {
    layoutId: 'one-point',
    layoutName: '1 Poin - Impact Statement Terpusat',
    category: 'content',
    variant: 'statement',
    description: 'Kalimat inspiratif masif di tengah dengan paragraf penjelas di bawahnya (Halaman 26-28 Base Layout).',
    usageRule: 'Slide dengan 1 poin penekanan pesan kunci.',
    recommendedPoints: 1,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 32, max: 40, default: 34 },
      mainPoint: { min: 28, max: 38, default: 32 },
      description: { min: 15, max: 20, default: 17 },
    },
    slots: {
      title: { x: 8, y: 10, w: 84, h: 12, align: 'left' },
      points: [
        { x: 10, y: 26, w: 80, h: 54, align: 'left' },
      ],
    },
  },

  'one-point-split': {
    layoutId: 'one-point-split',
    layoutName: '1 Poin - Split Kiri & Detail',
    category: 'content',
    variant: 'split',
    description: 'Judul besar dan deskripsi utama di kiri, poin terstruktur di kanan (Halaman 25 & 33 Base Layout).',
    usageRule: 'Slide 1 poin yang memiliki uraian detail pendukung.',
    recommendedPoints: 1,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 30, max: 38, default: 34 },
      mainPoint: { min: 18, max: 26, default: 22 },
    },
    slots: {
      title: { x: 6, y: 10, w: 42, h: 25, align: 'left' },
      points: [
        { x: 52, y: 22, w: 42, h: 62, align: 'left' },
      ],
    },
  },

  // === D. 2 POIN ===
  'two-points': {
    layoutId: 'two-points',
    layoutName: '2 Poin - Kolom Sejajar (A & B)',
    category: 'content',
    variant: 'columns',
    description: 'Dua kolom poin sejajar dengan subjudul dan penjelasan (Halaman 49 & 54 Base Layout).',
    usageRule: 'Slide dengan 2 poin utama / perbandingan.',
    recommendedPoints: 2,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 30, max: 36, default: 32 },
      pointTitle: { min: 20, max: 26, default: 22 },
      pointDesc: { min: 15, max: 19, default: 16 },
    },
    slots: {
      title: { x: 6, y: 8, w: 88, h: 12, align: 'left' },
      points: [
        { x: 6, y: 26, w: 42, h: 58, badge: 'A', align: 'left' },
        { x: 52, y: 26, w: 42, h: 58, badge: 'B', align: 'left' },
      ],
    },
  },

  'two-points-horizontal': {
    layoutId: 'two-points-horizontal',
    layoutName: '2 Poin - Baris Horizontal Bergaris',
    category: 'content',
    variant: 'rows',
    description: 'Dua baris bertingkat dengan garis pemisah tipis dan penomoran 01 / 02 (Halaman 53 & 60 Base Layout).',
    usageRule: 'Slide 2 poin dengan alur sekuensial atau komparasi atas-bawah.',
    recommendedPoints: 2,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 28, max: 34, default: 30 },
      pointTitle: { min: 20, max: 24, default: 22 },
      pointDesc: { min: 15, max: 18, default: 16 },
    },
    slots: {
      title: { x: 6, y: 8, w: 38, h: 30, align: 'left' },
      points: [
        { x: 48, y: 16, w: 46, h: 34, number: '01', align: 'left' },
        { x: 48, y: 54, w: 46, h: 36, number: '02', align: 'left' },
      ],
    },
  },

  // === E. 3 POIN ===
  'three-points': {
    layoutId: 'three-points',
    layoutName: '3 Poin - Tiga Kolom (01, 02, 03)',
    category: 'content',
    variant: 'columns',
    description: 'Tiga kolom sejajar dengan badge nomor dan kotak kartu terstruktur (Halaman 90 & 94 Base Layout).',
    usageRule: 'Slide dengan 3 poin pembahasan.',
    recommendedPoints: 3,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 28, max: 34, default: 30 },
      pointTitle: { min: 18, max: 22, default: 20 },
      pointDesc: { min: 14, max: 17, default: 15 },
    },
    slots: {
      title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
      points: [
        { x: 5, y: 26, w: 28, h: 58, number: '01', align: 'left' },
        { x: 36, y: 26, w: 28, h: 58, number: '02', align: 'left' },
        { x: 67, y: 26, w: 28, h: 58, number: '03', align: 'left' },
      ],
    },
  },

  'three-points-horizontal': {
    layoutId: 'three-points-horizontal',
    layoutName: '3 Poin - Baris Bergaris & Panah (→)',
    category: 'content',
    variant: 'rows',
    description: 'Tiga baris horizontal dengan pill badge panah hitam (→) dan garis pemisah (Halaman 104 & 108 Base Layout).',
    usageRule: 'Slide 3 poin dengan daftar aksi atau rencana kerja.',
    recommendedPoints: 3,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 28, max: 34, default: 30 },
      pointTitle: { min: 18, max: 22, default: 19 },
      pointDesc: { min: 14, max: 17, default: 15 },
    },
    slots: {
      title: { x: 6, y: 8, w: 38, h: 32, align: 'left' },
      points: [
        { x: 48, y: 12, w: 46, h: 24, badge: 'arrow', align: 'left' },
        { x: 48, y: 40, w: 46, h: 24, badge: 'arrow', align: 'left' },
        { x: 48, y: 68, w: 46, h: 24, badge: 'arrow', align: 'left' },
      ],
    },
  },

  'three-points-timeline': {
    layoutId: 'three-points-timeline',
    layoutName: '3 Poin - Timeline Berangkai',
    category: 'content',
    variant: 'timeline',
    description: 'Tiga tahapan berurutan di sepanjang garis timeline horizontal (Halaman 98 & 109 Base Layout).',
    usageRule: 'Slide 3 poin yang memuat tahapan waktu atau proses.',
    recommendedPoints: 3,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 26, max: 32, default: 28 },
      pointTitle: { min: 18, max: 22, default: 19 },
      pointDesc: { min: 13, max: 16, default: 14 },
    },
    slots: {
      title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
      points: [
        { x: 5, y: 32, w: 28, h: 52, step: 1, align: 'left' },
        { x: 36, y: 32, w: 28, h: 52, step: 2, align: 'left' },
        { x: 67, y: 32, w: 28, h: 52, step: 3, align: 'left' },
      ],
    },
  },

  // === F. 4 POIN ===
  'four-points': {
    layoutId: 'four-points',
    layoutName: '4 Poin - Grid 2x2 Kartu Panah',
    category: 'content',
    variant: 'grid',
    description: 'Empat kotak kartu tersusun dalam grid simetris 2x2 dengan badge panah (Halaman 132 & 134 Base Layout).',
    usageRule: 'Slide dengan 4 pilar pembahasan.',
    recommendedPoints: 4,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 26, max: 32, default: 28 },
      pointTitle: { min: 16, max: 20, default: 18 },
      pointDesc: { min: 13, max: 16, default: 14 },
    },
    slots: {
      title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
      points: [
        { x: 5, y: 24, w: 43, h: 32, badge: 'arrow', align: 'left' },
        { x: 52, y: 24, w: 43, h: 32, badge: 'arrow', align: 'left' },
        { x: 5, y: 60, w: 43, h: 32, badge: 'arrow', align: 'left' },
        { x: 52, y: 60, w: 43, h: 32, badge: 'arrow', align: 'left' },
      ],
    },
  },

  'four-points-steps': {
    layoutId: 'four-points-steps',
    layoutName: '4 Poin - Step 1, 2, 3, 4',
    category: 'content',
    variant: 'steps',
    description: 'Empat kuadran bertingkat dengan label Step 1 s/d Step 4 (Halaman 140 Base Layout).',
    usageRule: 'Slide 4 poin berupa metodologi atau tahapan implementasi.',
    recommendedPoints: 4,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 26, max: 32, default: 28 },
      pointTitle: { min: 20, max: 26, default: 22 },
      pointDesc: { min: 14, max: 17, default: 15 },
    },
    slots: {
      title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
      points: [
        { x: 5, y: 20, w: 43, h: 36, stepLabel: 'Step 1', align: 'left' },
        { x: 52, y: 20, w: 43, h: 36, stepLabel: 'Step 2', align: 'left' },
        { x: 5, y: 59, w: 43, h: 36, stepLabel: 'Step 3', align: 'left' },
        { x: 52, y: 59, w: 43, h: 36, stepLabel: 'Step 4', align: 'left' },
      ],
    },
  },

  // === G. 5 POIN ===
  'five-points': {
    layoutId: 'five-points',
    layoutName: '5 Poin - Kartu (3 Atas + 2 Bawah)',
    category: 'content',
    variant: 'staggered',
    description: 'Lima kartu bertingkat terpusat (Halaman 146 Base Layout).',
    usageRule: 'Slide dengan 5 poin pembahasan.',
    recommendedPoints: 5,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 24, max: 30, default: 26 },
      pointTitle: { min: 15, max: 19, default: 17 },
      pointDesc: { min: 12, max: 15, default: 13 },
    },
    slots: {
      title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
      points: [
        { x: 5, y: 20, w: 28, h: 35, align: 'left' },
        { x: 36, y: 20, w: 28, h: 35, align: 'left' },
        { x: 67, y: 20, w: 28, h: 35, align: 'left' },
        { x: 20, y: 59, w: 28, h: 34, align: 'left' },
        { x: 52, y: 59, w: 28, h: 34, align: 'left' },
      ],
    },
  },

  'five-points-timeline': {
    layoutId: 'five-points-timeline',
    layoutName: '5 Poin - Rangkaian 01-05 Horizontal',
    category: 'content',
    variant: 'horizontal-sequence',
    description: 'Lima langkah berurutan dengan nomor 01 s/d 05 di sepanjang baris (Halaman 151 Base Layout).',
    usageRule: 'Slide 5 tahapan proses atau roadmap.',
    recommendedPoints: 5,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 26, max: 32, default: 28 },
      pointNumber: { min: 22, max: 28, default: 24 },
      pointTitle: { min: 14, max: 18, default: 15 },
      pointDesc: { min: 11, max: 14, default: 12 },
    },
    slots: {
      title: { x: 5, y: 8, w: 90, h: 12, align: 'left' },
      points: [
        { x: 4, y: 28, w: 17, h: 56, number: '01', align: 'left' },
        { x: 23, y: 28, w: 17, h: 56, number: '02', align: 'left' },
        { x: 42, y: 28, w: 17, h: 56, number: '03', align: 'left' },
        { x: 61, y: 28, w: 17, h: 56, number: '04', align: 'left' },
        { x: 80, y: 28, w: 17, h: 56, number: '05', align: 'left' },
      ],
    },
  },

  // === H. 6 POIN ===
  'six-points': {
    layoutId: 'six-points',
    layoutName: '6 Poin - Grid 3x2 Kartu Terstruktur',
    category: 'content',
    variant: 'grid',
    description: 'Enam kotak kartu rapi dalam susunan 2 baris x 3 kolom (Halaman 159 Base Layout).',
    usageRule: 'Slide dengan 6 poin.',
    recommendedPoints: 6,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 24, max: 28, default: 26 },
      pointTitle: { min: 14, max: 17, default: 15 },
      pointDesc: { min: 11, max: 14, default: 13 },
    },
    slots: {
      title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
      points: [
        { x: 5, y: 20, w: 28, h: 35, align: 'left' },
        { x: 36, y: 20, w: 28, h: 35, align: 'left' },
        { x: 67, y: 20, w: 28, h: 35, align: 'left' },
        { x: 5, y: 58, w: 28, h: 35, align: 'left' },
        { x: 36, y: 58, w: 28, h: 35, align: 'left' },
        { x: 67, y: 58, w: 28, h: 35, align: 'left' },
      ],
    },
  },

  'six-points-columns': {
    layoutId: 'six-points-columns',
    layoutName: '6 Poin - 2 Kolom x 3 Baris Bergaris (→)',
    category: 'content',
    variant: 'two-columns-rows',
    description: 'Dua kolom masing-masing berisi 3 baris poin dengan badge panah (→) dan garis pemisah (Halaman 156-158 Base Layout).',
    usageRule: 'Slide 6 poin bergaya daftar eksekutif.',
    recommendedPoints: 6,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 24, max: 28, default: 26 },
      pointTitle: { min: 15, max: 18, default: 16 },
      pointDesc: { min: 12, max: 14, default: 13 },
    },
    slots: {
      title: { x: 5, y: 6, w: 90, h: 10, align: 'left' },
      points: [
        { x: 5, y: 20, w: 43, h: 23, badge: 'arrow', align: 'left' },
        { x: 52, y: 20, w: 43, h: 23, badge: 'arrow', align: 'left' },
        { x: 5, y: 46, w: 43, h: 23, badge: 'arrow', align: 'left' },
        { x: 52, y: 46, w: 43, h: 23, badge: 'arrow', align: 'left' },
        { x: 5, y: 72, w: 43, h: 23, badge: 'arrow', align: 'left' },
        { x: 52, y: 72, w: 43, h: 23, badge: 'arrow', align: 'left' },
      ],
    },
  },

  // === I. CHART & DATA ===
  'chart': {
    layoutId: 'chart',
    layoutName: 'Chart - Area Grafik & Narasi Metrik',
    category: 'data',
    variant: 'split-chart',
    description: 'Area grafik interaktif di sisi kanan dengan rincian sumber data di sisi kiri (Halaman 164-165 Base Layout).',
    usageRule: 'Slide data statistik, performa kuantitatif, dan analisis grafik.',
    recommendedPoints: [1, 2, 3, 4],
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 28, max: 34, default: 30 },
      metricNumber: { min: 24, max: 32, default: 28 },
      description: { min: 14, max: 18, default: 15 },
    },
    slots: {
      title: { x: 6, y: 8, w: 88, h: 12, align: 'left' },
      infoArea: { x: 6, y: 25, w: 38, h: 63, align: 'left' },
      chartArea: { x: 47, y: 25, w: 47, h: 63, align: 'center' },
    },
  },

  'chart-stat': {
    layoutId: 'chart-stat',
    layoutName: 'Chart - 3 Cincin Metrik Persentase (67%)',
    category: 'data',
    variant: 'percentage-rings',
    description: 'Tiga kartu angka persentase masif dalam cincin melingkar (Halaman 169 Base Layout).',
    usageRule: 'Slide yang berfokus pada 3 indikator persentase capaian utama.',
    recommendedPoints: 3,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 28, max: 34, default: 30 },
      statNumber: { min: 36, max: 48, default: 42 },
      statDesc: { min: 14, max: 18, default: 15 },
    },
    slots: {
      title: { x: 6, y: 8, w: 88, h: 12, align: 'center' },
      points: [
        { x: 6, y: 26, w: 26, h: 58, align: 'center' },
        { x: 37, y: 26, w: 26, h: 58, align: 'center' },
        { x: 68, y: 26, w: 26, h: 58, align: 'center' },
      ],
    },
  },

  // === J. TESTIMONI ===
  'testimonial-cards': {
    layoutId: 'testimonial-cards',
    layoutName: 'Testimoni - 3 Kartu Pelanggan (★★★★ 4.8/5)',
    category: 'quote',
    variant: 'cards',
    description: 'Tiga kartu testimoni pelanggan lengkap dengan avatar, nama penutur, dan rating bintang (Halaman 173-177 Base Layout).',
    usageRule: 'Slide ulasan pelanggan, validasi klien, atau social proof.',
    recommendedPoints: 3,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 26, max: 32, default: 28 },
      authorName: { min: 16, max: 20, default: 18 },
      quoteText: { min: 13, max: 16, default: 14 },
    },
    slots: {
      title: { x: 6, y: 8, w: 88, h: 10, align: 'left' },
      points: [
        { x: 6, y: 22, w: 27, h: 66, align: 'center' },
        { x: 36, y: 22, w: 27, h: 66, align: 'center' },
        { x: 66, y: 22, w: 27, h: 66, align: 'center' },
      ],
    },
  },

  'testimonial': {
    layoutId: 'testimonial',
    layoutName: 'Testimoni - Kutipan Visi Besar',
    category: 'quote',
    variant: 'single-quote',
    description: 'Kutipan sentral berukuran besar dengan atribusi nama penutur di bawah (Halaman 175 & 178 Base Layout).',
    usageRule: 'Slide kutipan penting dari narasumber atau visi pimpinan.',
    recommendedPoints: 1,
    backgroundType: 'secondary',
    fontSizeRules: {
      title: { min: 22, max: 28, default: 24 },
      quoteText: { min: 24, max: 34, default: 28 },
      author: { min: 16, max: 20, default: 17 },
    },
    slots: {
      title: { x: 10, y: 10, w: 80, h: 10, align: 'center' },
      quote: { x: 10, y: 26, w: 80, h: 42, align: 'center' },
      author: { x: 15, y: 72, w: 70, h: 16, align: 'center' },
    },
  },

  // === K. COVER BELAKANG / PENUTUP ===
  'cover-back': {
    layoutId: 'cover-back',
    layoutName: 'Cover Belakang - Kontak & Let\'s Connect',
    category: 'closing',
    variant: 'contact-grid',
    description: 'Judul ucapan terima kasih / ajakan koneksi di kiri, info kontak (Phone, Email, Web, Alamat) di kanan (Halaman 191, 194, 200, 201 Base Layout).',
    usageRule: 'Slide terakhir presentasi.',
    recommendedPoints: 0,
    backgroundType: 'light',
    fontSizeRules: {
      title: { min: 38, max: 50, default: 44 },
      subtitle: { min: 16, max: 22, default: 18 },
      contact: { min: 14, max: 18, default: 15 },
    },
    slots: {
      title: { x: 8, y: 26, w: 44, h: 28, align: 'left' },
      subtitle: { x: 8, y: 58, w: 44, h: 20, align: 'left' },
      contact: { x: 55, y: 22, w: 38, h: 62, align: 'left' },
    },
  },

  'cover-back-statement': {
    layoutId: 'cover-back-statement',
    layoutName: 'Cover Belakang - Thank You Masif Terpusat',
    category: 'closing',
    variant: 'statement',
    description: 'Tipografi "Thank You" raksasa terpusat dengan tautan media sosial dan website di bawah (Halaman 180, 186, 188 Base Layout).',
    usageRule: 'Slide terakhir untuk presentasi bernuansa bold.',
    recommendedPoints: 0,
    backgroundType: 'primary',
    fontSizeRules: {
      title: { min: 48, max: 64, default: 56 },
      subtitle: { min: 18, max: 24, default: 20 },
      contact: { min: 14, max: 18, default: 15 },
    },
    slots: {
      title: { x: 10, y: 24, w: 80, h: 26, align: 'center' },
      subtitle: { x: 12, y: 54, w: 76, h: 14, align: 'center' },
      contact: { x: 15, y: 72, w: 70, h: 16, align: 'center' },
    },
  },
};

const ALL_LAYOUTS = Object.values(LAYOUT_TEMPLATES);

module.exports = {
  LAYOUT_TEMPLATES,
  ALL_LAYOUTS,
};
