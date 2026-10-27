/**
 * Layout Pattern Database
 * 10+ slide layout types per theme category
 */
const layoutDatabase = {
  universal: [
    {
      slideType: 'title',
      name: 'Title Slide',
      description: 'Slide pembuka presentasi',
      layout: 'centered',
      elements: ['title', 'subtitle', 'presenter'],
      placeholders: {
        title: 'Judul Presentasi Anda',
        subtitle: 'Subjudul atau tagline yang menarik',
        presenter: 'Nama Presenter | Jabatan | Tanggal',
      },
      tips: 'Gunakan judul yang singkat, kuat, dan mencerminkan isi presentasi. Tambahkan visual latar yang relevan.',
    },
    {
      slideType: 'agenda',
      name: 'Agenda/Daftar Isi',
      description: 'Outline presentasi',
      layout: 'numbered-list',
      elements: ['title', 'agenda-items'],
      placeholders: {
        title: 'Agenda Hari Ini',
        items: ['Pendahuluan', 'Analisis Situasi', 'Solusi Usulan', 'Implementasi', 'Kesimpulan'],
      },
      tips: 'Batasi agenda 4-6 item. Gunakan nomor atau ikon untuk setiap poin.',
    },
    {
      slideType: 'content',
      name: 'Content Slide',
      description: 'Slide konten utama dengan bullet points',
      layout: 'title-bullets',
      elements: ['title', 'bullet-points', 'image'],
      placeholders: {
        title: 'Judul Konten Utama',
        bullets: [
          'Poin utama pertama yang ingin disampaikan',
          'Poin kedua dengan detail pendukung',
          'Poin ketiga untuk memperkuat argumen',
          'Kesimpulan poin yang memukau',
        ],
      },
      tips: 'Maksimal 5-6 bullet points per slide. Gunakan aturan 6×6: 6 baris, 6 kata per baris.',
    },
    {
      slideType: 'two-column',
      name: 'Two Column',
      description: 'Slide dengan dua kolom untuk perbandingan',
      layout: 'two-column',
      elements: ['title', 'column-left', 'column-right'],
      placeholders: {
        title: 'Perbandingan & Analisis',
        columnLeft: { heading: 'Kolom Kiri', points: ['Poin A1', 'Poin A2', 'Poin A3'] },
        columnRight: { heading: 'Kolom Kanan', points: ['Poin B1', 'Poin B2', 'Poin B3'] },
      },
      tips: 'Ideal untuk perbandingan Pro/Kontra, Sebelum/Sesudah, atau dua topik berbeda.',
    },
    {
      slideType: 'image-focus',
      name: 'Image Focus',
      description: 'Slide dengan gambar sebagai elemen utama',
      layout: 'image-right',
      elements: ['title', 'text', 'image'],
      placeholders: {
        title: 'Visual yang Bercerita',
        text: 'Deskripsi singkat yang melengkapi gambar dan memperkuat pesan utama Anda.',
        imageCaption: 'Keterangan gambar atau sumber',
      },
      tips: 'Gunakan gambar berkualitas tinggi. Pastikan teks dan gambar saling melengkapi, bukan bertumpang tindih.',
    },
    {
      slideType: 'quote',
      name: 'Quote Slide',
      description: 'Slide kutipan yang impresif',
      layout: 'centered-quote',
      elements: ['quote', 'author', 'role'],
      placeholders: {
        quote: '"Inovasi adalah kemampuan untuk melihat perubahan sebagai kesempatan, bukan ancaman."',
        author: '— Steve Jobs',
        role: 'Co-founder Apple Inc.',
      },
      tips: 'Pilih kutipan yang relevan dan resonan. Berikan whitespace yang cukup agar kutipan "bernapas".',
    },
    {
      slideType: 'statistics',
      name: 'Statistics/Data',
      description: 'Slide menampilkan angka dan statistik kunci',
      layout: 'three-stats',
      elements: ['title', 'stat-1', 'stat-2', 'stat-3'],
      placeholders: {
        title: 'Angka yang Berbicara',
        stats: [
          { value: '85%', label: 'Tingkat Kepuasan Pelanggan' },
          { value: '3.2x', label: 'Pertumbuhan Revenue YoY' },
          { value: '50K+', label: 'Pengguna Aktif' },
        ],
      },
      tips: 'Tampilkan maksimal 3 angka kunci. Gunakan ukuran font besar dan warna aksen untuk angka.',
    },
    {
      slideType: 'timeline',
      name: 'Timeline',
      description: 'Slide kronologi atau roadmap',
      layout: 'horizontal-timeline',
      elements: ['title', 'timeline-items'],
      placeholders: {
        title: 'Perjalanan & Roadmap',
        items: [
          { year: '2022', event: 'Fase Inisiasi & Riset' },
          { year: '2023', event: 'Pengembangan Produk' },
          { year: '2024', event: 'Peluncuran & Skalasi' },
          { year: '2025', event: 'Ekspansi Global' },
        ],
      },
      tips: 'Gunakan ikon visual untuk setiap tahap. Highlight fase saat ini dengan warna aksen.',
    },
    {
      slideType: 'team',
      name: 'Team Slide',
      description: 'Perkenalan tim dan anggota',
      layout: 'team-grid',
      elements: ['title', 'team-members'],
      placeholders: {
        title: 'Tim Kami',
        members: [
          { name: 'Nama Anggota 1', role: 'CEO & Co-Founder', photo: 'placeholder' },
          { name: 'Nama Anggota 2', role: 'CTO & Arsitek', photo: 'placeholder' },
          { name: 'Nama Anggota 3', role: 'Head of Design', photo: 'placeholder' },
        ],
      },
      tips: 'Sertakan foto profesional. Sebutkan expertise utama, bukan hanya jabatan.',
    },
    {
      slideType: 'closing',
      name: 'Thank You / Closing',
      description: 'Slide penutup dan ajakan bertindak',
      layout: 'centered-cta',
      elements: ['title', 'message', 'cta', 'contact'],
      placeholders: {
        title: 'Terima Kasih!',
        message: 'Kami siap menjawab pertanyaan Anda',
        cta: 'Hubungi kami untuk diskusi lebih lanjut',
        contact: 'email@perusahaan.com | +62-XXX-XXXX-XXXX | www.website.com',
      },
      tips: 'Sertakan informasi kontak yang lengkap. Tambahkan CTA yang jelas untuk tindakan selanjutnya.',
    },
  ],
  // Theme-specific layouts
  bisnis: [
    {
      slideType: 'executive-summary',
      name: 'Executive Summary',
      description: 'Ringkasan eksekutif untuk pengambil keputusan',
      layout: 'summary-box',
      elements: ['title', 'problem', 'solution', 'impact'],
      placeholders: {
        title: 'Executive Summary',
        problem: 'Masalah: Penurunan market share 15% dalam Q3',
        solution: 'Solusi: Strategi ekspansi digital dan repositioning brand',
        impact: 'Dampak: Proyeksi kenaikan revenue 30% dalam 12 bulan',
      },
      tips: 'Eksekutif butuh keputusan cepat. Sajikan masalah, solusi, dan dampak dalam satu slide.',
    },
  ],
  edukasi: [
    {
      slideType: 'learning-objectives',
      name: 'Learning Objectives',
      description: 'Tujuan pembelajaran yang jelas',
      layout: 'objectives-list',
      elements: ['title', 'objectives'],
      placeholders: {
        title: 'Setelah Sesi Ini, Anda Akan:',
        objectives: [
          'Memahami konsep dasar topik ini',
          'Mampu mengaplikasikan teori dalam praktik',
          'Menganalisis studi kasus relevan',
          'Mengembangkan solusi mandiri',
        ],
      },
      tips: 'Gunakan kata kerja operasional (Bloom\'s Taxonomy): memahami, menganalisis, mengevaluasi, menciptakan.',
    },
  ],
  kreatif: [
    {
      slideType: 'portfolio',
      name: 'Portfolio Showcase',
      description: 'Tampilan karya dengan visual kuat',
      layout: 'masonry-grid',
      elements: ['title', 'portfolio-items'],
      placeholders: {
        title: 'Karya Pilihan Kami',
        items: ['Proyek 1: Brand Identity', 'Proyek 2: UI/UX Design', 'Proyek 3: Motion Graphics'],
      },
      tips: 'Biarkan karya yang berbicara. Minimal teks, maksimal visual impact.',
    },
  ],
  teknologi: [
    {
      slideType: 'product-demo',
      name: 'Product Demo',
      description: 'Demonstrasi fitur produk teknologi',
      layout: 'screen-mockup',
      elements: ['title', 'mockup', 'features'],
      placeholders: {
        title: 'Platform Kami dalam Aksi',
        features: ['Fitur Utama 1', 'Fitur Utama 2', 'Fitur Utama 3'],
        description: 'Solusi end-to-end yang mengotomasi proses bisnis Anda.',
      },
      tips: 'Gunakan screenshot atau mockup nyata. Fokus pada manfaat pengguna, bukan fitur teknis.',
    },
    {
      slideType: 'metrics-dashboard',
      name: 'Metrics Dashboard',
      description: 'Dashboard metrik performa produk',
      layout: 'dashboard-grid',
      elements: ['title', 'kpi-cards'],
      placeholders: {
        title: 'Key Performance Indicators',
        kpis: [
          { metric: '99.9%', label: 'Uptime SLA' },
          { metric: '<50ms', label: 'Response Time' },
          { metric: '1M+', label: 'API Calls/Day' },
          { metric: '4.9★', label: 'User Rating' },
        ],
      },
      tips: 'Visualisasikan data dengan chart mini atau sparklines. Gunakan warna hijau untuk positif, merah untuk negatif.',
    },
  ],
};

module.exports = layoutDatabase;
