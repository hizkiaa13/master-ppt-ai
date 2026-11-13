import React from 'react';
import {
  Layout,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Columns,
  Grid,
  BarChart2,
  Quote,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export const CORE_LAYOUT_OPTIONS = [
  {
    id: 'cover-front',
    name: 'Cover Depan (Judul & Subjudul)',
    category: 'cover',
    points: 0,
    icon: FileText,
    desc: 'Slide pembuka utama dengan judul besar terpusat dan identitas presenter',
  },
  {
    id: 'table-of-contents',
    name: 'Daftar Isi / Agenda (01-04)',
    category: 'agenda',
    points: 4,
    icon: Grid,
    desc: 'Daftar topik bahasan utama terstruktur dengan penomoran',
  },
  {
    id: 'one-point',
    name: '1 Poin - Pernyataan Dampak Besar',
    category: 'content',
    points: 1,
    icon: FileText,
    desc: 'Fokus pada satu pesan kunci atau callout fakta penting',
  },
  {
    id: 'two-points',
    name: '2 Poin - Dua Kolom Berdampingan',
    category: 'content',
    points: 2,
    icon: Columns,
    desc: 'Dua pilar pembahasan sejajar dengan ruang penjelasan luas',
  },
  {
    id: 'comparison',
    name: 'Perbandingan (Sebelum vs Sesudah / A vs B)',
    category: 'content',
    points: 2,
    icon: Columns,
    desc: 'Dua kolom komparasi tajam untuk membandingkan pendekatan',
  },
  {
    id: 'three-points',
    name: '3 Poin - Tiga Kolom Sejajar (01, 02, 03)',
    category: 'content',
    points: 3,
    icon: Columns,
    desc: 'Struktur paling populer untuk tiga pilar utama atau strategi',
  },
  {
    id: 'four-points',
    name: '4 Poin - Grid 2x2 Kartu Panah',
    category: 'content',
    points: 4,
    icon: Grid,
    desc: 'Empat area pembahasan seimbang dalam susunan kuadran',
  },
  {
    id: 'steps',
    name: 'Langkah / Tahapan Proses (Step 1-4)',
    category: 'content',
    points: 4,
    icon: ArrowRight,
    desc: 'Roadmap alur kerja berurutan dari tahap awal hingga evaluasi',
  },
  {
    id: 'five-points',
    name: '5 Poin - Susunan Berimbang (3 Atas + 2 Bawah)',
    category: 'content',
    points: 5,
    icon: Grid,
    desc: 'Menampung lima poin materi dengan keterbacaan tinggi',
  },
  {
    id: 'six-points',
    name: '6 Poin - Grid 3x2 Kartu Terstruktur',
    category: 'content',
    points: 6,
    icon: Grid,
    desc: 'Grid komprehensif untuk matriks fitur, taktik, atau modul',
  },
  {
    id: 'chart',
    name: 'Grafik & Analisis Data Metrik',
    category: 'data',
    points: 2,
    icon: BarChart2,
    desc: 'Area visual chart di kanan dan poin analisis kinerja di kiri',
  },
  {
    id: 'testimonial',
    name: 'Testimoni & Kutipan Eksekutif',
    category: 'quote',
    points: 1,
    icon: Quote,
    desc: 'Kutipan dampak kuat dengan atribusi nama dan jabatan',
  },
  {
    id: 'image-text',
    name: 'Gambar & Teks Naratif',
    category: 'content',
    points: 2,
    icon: ImageIcon,
    desc: 'Pemaparan narasi di kiri didukung foto/diagram di kanan',
  },
  {
    id: 'cover-back',
    name: 'Cover Belakang (Kontak & Penutup)',
    category: 'closing',
    points: 0,
    icon: FileText,
    desc: 'Slide penutup dengan ajakan kolaborasi dan detail kontak resmi',
  },
];

/**
 * Helper menghasilkan daftar layout default berdasarkan jumlah slide
 */
export function getDefaultLayoutSelections(slideCount = 5) {
  const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 1), 15);
  const selections = [];

  for (let i = 1; i <= count; i++) {
    if (i === 1) {
      selections.push({ slideNumber: 1, layoutId: 'cover-front' });
    } else if (i === count) {
      selections.push({ slideNumber: count, layoutId: 'cover-back' });
    } else if (i === 2 && count >= 4) {
      selections.push({ slideNumber: 2, layoutId: 'table-of-contents' });
    } else {
      // Rotasi layout tengah yang variatif
      const pool = ['three-points', 'comparison', 'steps', 'two-points', 'four-points', 'chart'];
      const picked = pool[(i - 2) % pool.length];
      selections.push({ slideNumber: i, layoutId: picked });
    }
  }

  return selections;
}

export default function ManualLayoutSelector({
  slideCount,
  layoutSelections,
  onUpdateLayoutSelections,
  onBack,
  onGenerate,
  userTitle,
  outputLanguage = 'id',
}) {
  const isEn = outputLanguage === 'en';

  const handleSelectLayout = (slideNumber, newLayoutId) => {
    const updated = layoutSelections.map((item) =>
      item.slideNumber === slideNumber ? { ...item, layoutId: newLayoutId } : item
    );
    onUpdateLayoutSelections(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Layout className="w-3.5 h-3.5" />
          <span>Mode Susun Layout Sendiri</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pilih Layout untuk {slideCount} Slide Anda
        </h2>
        <p className="text-sm text-dark-400 max-w-xl mx-auto">
          Tentukan tata letak setiap slide sesuai alur cerita presentasi Anda. AI akan menghormati pilihan Anda dan membuatkan copywriting yang pas.
        </p>
      </div>

      {/* Grid Kartu Slide */}
      <div className="space-y-4">
        {layoutSelections.map((item, index) => {
          const slideNumber = item.slideNumber || index + 1;
          const currentLayout =
            CORE_LAYOUT_OPTIONS.find((opt) => opt.id === item.layoutId) || CORE_LAYOUT_OPTIONS[0];
          const Icon = currentLayout.icon || FileText;
          const isCover = slideNumber === 1;
          const isClosing = slideNumber === slideCount;

          return (
            <div
              key={slideNumber}
              className={`p-5 rounded-2xl border transition-all ${
                isCover
                  ? 'bg-dark-900/90 border-blue-500/30 shadow-md'
                  : isClosing
                  ? 'bg-dark-900/90 border-green-500/30 shadow-md'
                  : 'bg-dark-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info Slide */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-base flex-shrink-0 ${
                      isCover
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : isClosing
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/30'
                        : 'bg-dark-800 text-white border border-white/10'
                    }`}
                  >
                    #{slideNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono tracking-wider font-semibold text-dark-400">
                        {isCover
                          ? (isEn ? 'Opening Cover' : 'Slide Pembuka')
                          : isClosing
                          ? (isEn ? 'Closing Slide' : 'Slide Penutup')
                          : (isEn ? `Slide ${slideNumber}` : `Slide Isi #${slideNumber}`)}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-dark-800 border border-white/10 text-dark-300">
                        {currentLayout.points > 0 ? `${currentLayout.points} Poin` : 'Judul & Subjudul'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {currentLayout.name}
                    </p>
                    <p className="text-xs text-dark-400 mt-0.5 hidden sm:block">
                      {currentLayout.desc}
                    </p>
                  </div>
                </div>

                {/* Dropdown Layout Picker */}
                <div className="sm:w-72 flex-shrink-0">
                  <select
                    value={item.layoutId}
                    onChange={(e) => handleSelectLayout(slideNumber, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner"
                  >
                    <optgroup label="Slide Khusus">
                      <option value="cover-front">Cover Depan (Judul & Subjudul)</option>
                      <option value="table-of-contents">Daftar Isi / Agenda (01-04)</option>
                      <option value="cover-back">Cover Belakang (Kontak & Penutup)</option>
                    </optgroup>
                    <optgroup label="Layout Poin Konten">
                      <option value="one-point">1 Poin - Pernyataan Dampak Besar</option>
                      <option value="two-points">2 Poin - Dua Kolom Berdampingan</option>
                      <option value="comparison">Perbandingan (Sebelum vs Sesudah / A vs B)</option>
                      <option value="three-points">3 Poin - Tiga Kolom Sejajar (01, 02, 03)</option>
                      <option value="four-points">4 Poin - Grid 2x2 Kartu Panah</option>
                      <option value="steps">Langkah / Tahapan Proses (Step 1-4)</option>
                      <option value="five-points">5 Poin - Susunan Berimbang (3+2)</option>
                      <option value="six-points">6 Poin - Grid 3x2 Kartu Terstruktur</option>
                    </optgroup>
                    <optgroup label="Visual, Data & Testimoni">
                      <option value="chart">Grafik & Analisis Data Metrik</option>
                      <option value="testimonial">Testimoni & Kutipan Eksekutif</option>
                      <option value="image-text">Gambar & Teks Naratif</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Tema & Topik</span>
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 text-sm font-bold shadow-xl shadow-brand-500/30"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Generate Konten dengan Layout Ini</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
