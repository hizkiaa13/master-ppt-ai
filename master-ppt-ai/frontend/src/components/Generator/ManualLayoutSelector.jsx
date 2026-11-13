import React, { useState, useMemo } from 'react';
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
  Search,
  X,
  Sliders,
  Check,
  Info,
} from 'lucide-react';
import {
  FULL_LAYOUT_CATALOG,
  CATEGORY_MAP,
  CATEGORY_LABELS,
} from '../../utils/layoutCatalog';

// ─── 1. COVER LAYOUTS (KHUSUS SLIDE 1) ────────────────────────
export const COVER_LAYOUTS = [
  {
    id: 'cover-front',
    name: 'Cover Depan Terpusat Klasik',
    points: 0,
    pageRef: 'Populer',
    desc: 'Judul besar terpusat dengan subjudul dan presenter info',
  },
  {
    id: 'cover-front-editorial',
    name: 'Cover Editorial Kiri & Split',
    points: 0,
    pageRef: 'Populer',
    desc: 'Gaya majalah modern dengan judul rata kiri dan whitespace elegan',
  },
  // 15 varian katalog studio p04 s/d p18
  ...(CATEGORY_MAP.cover || []).map((id) => {
    const l = FULL_LAYOUT_CATALOG[id];
    return {
      id: l.layoutId,
      name: l.name,
      points: l.recommendedPoints || 0,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — Cover Depan`,
    };
  }),
];

// ─── 2. CLOSING LAYOUTS (KHUSUS SLIDE TERAKHIR) ───────────────
export const CLOSING_LAYOUTS = [
  {
    id: 'cover-back',
    name: "Cover Belakang - Kontak & Let's Connect",
    points: 0,
    pageRef: 'Populer',
    desc: 'Judul penutup dengan 4 baris kontak resmi dan call-to-action',
  },
  {
    id: 'cover-back-statement',
    name: 'Cover Belakang - Thank You Masif Terpusat',
    points: 0,
    pageRef: 'Populer',
    desc: 'Tipografi Thank You besar berdampak tinggi di tengah slide',
  },
  // 23 varian katalog studio p180 s/d p202
  ...(CATEGORY_MAP.closing || []).map((id) => {
    const l = FULL_LAYOUT_CATALOG[id];
    return {
      id: l.layoutId,
      name: l.name,
      points: l.recommendedPoints || 0,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — Penutup & Kontak`,
    };
  }),
];

// ─── 3. CONTENT LAYOUTS (UNTUK SLIDE TENGAH) ──────────────────
// Agenda / Daftar Isi
const AGENDA_LAYOUTS = [
  {
    id: 'table-of-contents',
    name: 'Daftar Isi Standar (01-04)',
    points: 4,
    pageRef: 'Populer',
    desc: 'Struktur topik berurutan dengan penomoran',
  },
  ...(CATEGORY_MAP.agenda || []).map((id) => {
    const l = FULL_LAYOUT_CATALOG[id];
    return {
      id: l.layoutId,
      name: l.name,
      points: l.recommendedPoints || 4,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — Daftar Isi`,
    };
  }),
];

// 1 Poin (22 catalog + 2 core)
const POINT1_LAYOUTS = [
  { id: 'one-point', name: '1P - Impact Statement Terpusat', points: 1, pageRef: 'Populer', desc: 'Pernyataan visi atau satu ide kunci' },
  { id: 'one-point-split', name: '1P - Split Kiri & Detail', points: 1, pageRef: 'Populer', desc: 'Judul besar kiri dan rincian di kanan' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.layoutId.startsWith('point1-'))
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: 1,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — 1 Poin`,
    })),
];

// 2 Poin & Perbandingan (40 catalog + 3 core)
const POINT2_LAYOUTS = [
  { id: 'two-points', name: '2P - Kolom Sejajar (A & B)', points: 2, pageRef: 'Populer', desc: 'Dua kolom materi berdampingan' },
  { id: 'two-points-horizontal', name: '2P - Baris Horizontal 01/02', points: 2, pageRef: 'Populer', desc: 'Dua baris bernomor memanjang' },
  { id: 'comparison', name: 'Perbandingan (Sebelum vs Sesudah / A vs B)', points: 2, pageRef: 'Populer', desc: 'Dua kartu komparasi tajam' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.layoutId.startsWith('point2-'))
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: 2,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — 2 Poin`,
    })),
];

// 3 Poin (40 catalog + 3 core)
const POINT3_LAYOUTS = [
  { id: 'three-points', name: '3P - Tiga Kolom (01, 02, 03)', points: 3, pageRef: 'Populer', desc: 'Format klasik paling seimbang untuk 3 pilar' },
  { id: 'three-points-horizontal', name: '3P - Baris Panah (→)', points: 3, pageRef: 'Populer', desc: 'Tiga baris kartu panah bertingkat' },
  { id: 'three-points-timeline', name: '3P - Timeline Berangkai', points: 3, pageRef: 'Populer', desc: 'Tiga tahapan berurutan' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.layoutId.startsWith('point3-'))
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: 3,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — 3 Poin`,
    })),
];

// 4 Poin & Steps (15 catalog + 2 core)
const POINT4_LAYOUTS = [
  { id: 'four-points', name: '4P - Grid 2x2 Kartu Panah', points: 4, pageRef: 'Populer', desc: 'Empat kuadran seimbang' },
  { id: 'steps', name: 'Langkah / Tahapan Proses (Step 1-4)', points: 4, pageRef: 'Populer', desc: 'Empat tahap alur kerja berurutan' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.layoutId.startsWith('point4-'))
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: 4,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — 4 Poin`,
    })),
];

// 5 Poin (9 catalog + 1 core)
const POINT5_LAYOUTS = [
  { id: 'five-points', name: '5P - Susunan Berimbang (3+2)', points: 5, pageRef: 'Populer', desc: 'Susunan tiga kolom atas dan dua kolom bawah' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.layoutId.startsWith('point5-'))
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: 5,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — 5 Poin`,
    })),
];

// 6 Poin (6 catalog + 1 core)
const POINT6_LAYOUTS = [
  { id: 'six-points', name: '6P - Grid 3x2 Kartu Terstruktur', points: 6, pageRef: 'Populer', desc: 'Grid 6 modul terstruktur' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.layoutId.startsWith('point6-'))
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: 6,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — 6 Poin`,
    })),
];

// Grafik / Data (9 catalog + 2 core)
const CHART_LAYOUTS = [
  { id: 'chart', name: 'Chart - Area Grafik Split & Data', points: 2, pageRef: 'Populer', desc: 'Grafik visual kanan dan narasi kiri' },
  { id: 'chart-stat', name: 'Chart - 3 Cincin Donat Metrik (67%)', points: 3, pageRef: 'Populer', desc: 'Tiga cincin persentase capaian' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.category === 'data')
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: l.recommendedPoints || 2,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — Grafik & Metrik`,
    })),
];

// Testimoni (6 catalog + 2 core)
const TESTI_LAYOUTS = [
  { id: 'testimonial-cards', name: 'Testimoni - 3 Kartu Review (4.9/5)', points: 3, pageRef: 'Populer', desc: 'Tiga review pelanggan berperingkat' },
  { id: 'testimonial', name: 'Testimoni - Kutipan Visi Besar', points: 1, pageRef: 'Populer', desc: 'Satu kutipan inspiratif dan atribusi' },
  ...Object.values(FULL_LAYOUT_CATALOG)
    .filter((l) => l.category === 'quote')
    .map((l) => ({
      id: l.layoutId,
      name: l.name,
      points: l.recommendedPoints || 1,
      pageRef: (l.pageRef || '').toUpperCase(),
      desc: `Katalog Studio ${l.pageRef?.toUpperCase() || ''} — Testimoni`,
    })),
];

// Visual / Gambar
const VISUAL_LAYOUTS = [
  { id: 'image-text', name: 'Area Gambar & Teks Naratif', points: 2, pageRef: 'Populer', desc: 'Pemaparan naratif dengan foto/diagram' },
];

/**
 * Helper default selections
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
      const pool = ['three-points', 'comparison', 'steps', 'two-points', 'four-points', 'chart'];
      const picked = pool[(i - 2) % pool.length];
      selections.push({ slideNumber: i, layoutId: picked });
    }
  }

  return selections;
}

/**
 * Komponen Modal Katalog Visual
 */
function LayoutCatalogModal({
  isOpen,
  onClose,
  slideNumber,
  slideCount,
  currentLayoutId,
  onSelectLayout,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const isCover = slideNumber === 1;
  const isClosing = slideNumber === slideCount;

  // Tentukan kategori tab yang tersedia untuk slide ini
  const availableTabs = useMemo(() => {
    if (isCover) {
      return [{ id: 'cover', label: 'Cover Depan (17)', list: COVER_LAYOUTS }];
    }
    if (isClosing) {
      return [{ id: 'closing', label: 'Cover Penutup (25)', list: CLOSING_LAYOUTS }];
    }
    return [
      { id: 'all', label: 'Semua Layout', list: [
        ...AGENDA_LAYOUTS, ...POINT1_LAYOUTS, ...POINT2_LAYOUTS, ...POINT3_LAYOUTS,
        ...POINT4_LAYOUTS, ...POINT5_LAYOUTS, ...POINT6_LAYOUTS, ...CHART_LAYOUTS,
        ...TESTI_LAYOUTS, ...VISUAL_LAYOUTS
      ]},
      { id: 'agenda', label: 'Agenda (5)', list: AGENDA_LAYOUTS },
      { id: 'point1', label: '1 Poin (24)', list: POINT1_LAYOUTS },
      { id: 'point2', label: '2 Poin (43)', list: POINT2_LAYOUTS },
      { id: 'point3', label: '3 Poin (43)', list: POINT3_LAYOUTS },
      { id: 'point4', label: '4 Poin (17)', list: POINT4_LAYOUTS },
      { id: 'point5', label: '5 Poin (10)', list: POINT5_LAYOUTS },
      { id: 'point6', label: '6 Poin (7)', list: POINT6_LAYOUTS },
      { id: 'chart', label: 'Grafik & Data (11)', list: CHART_LAYOUTS },
      { id: 'quote', label: 'Testimoni (8)', list: TESTI_LAYOUTS },
    ];
  }, [isCover, isClosing]);

  const [activeTab, setActiveTab] = useState(availableTabs[0].id);

  if (!isOpen) return null;

  const currentTabObj = availableTabs.find((t) => t.id === activeTab) || availableTabs[0];
  const filteredList = currentTabObj.list.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      (item.pageRef && item.pageRef.toLowerCase().includes(q)) ||
      (item.desc && item.desc.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-900 border border-white/15 rounded-3xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-dark-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {isCover ? 'Slide #1 (Cover)' : isClosing ? `Slide #${slideNumber} (Penutup)` : `Slide #${slideNumber} (Materi Isi)`}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {isCover
                  ? 'Pilih Layout Cover Depan'
                  : isClosing
                  ? 'Pilih Layout Cover Penutup'
                  : 'Pilih Layout Materi & Pembahasan'}
              </h3>
            </div>
            <p className="text-xs text-dark-400 mt-1">
              {isCover
                ? 'Slide pertama khusus menampilkan judul utama dan identitas presentasi.'
                : isClosing
                ? 'Slide terakhir khusus memuat kontak resmi, ucapan terima kasih, dan call to action.'
                : 'Pilih tata letak yang paling sesuai dengan kedalaman materi slide ini.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 border-b border-white/10 bg-dark-900/90 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between flex-shrink-0">
          {/* Category Tabs (hanya untuk slide tengah) */}
          {!isCover && !isClosing && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Box */}
          <div className="relative sm:w-64 flex-shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dark-400" />
            <input
              type="text"
              placeholder="Cari nama atau halaman (mis: p48)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white text-xs placeholder-dark-400 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-dark-950/40">
          {filteredList.length === 0 ? (
            <div className="col-span-full text-center py-12 text-dark-400 text-sm">
              Tidak ada layout yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredList.map((layout) => {
              const isSelected = layout.id === currentLayoutId;

              return (
                <div
                  key={layout.id}
                  onClick={() => {
                    onSelectLayout(slideNumber, layout.id);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/30 shadow-lg'
                      : 'bg-dark-900 border-white/10 hover:border-white/30 hover:bg-dark-850'
                  }`}
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-dark-800 text-brand-300 border border-white/5">
                        {layout.pageRef}
                      </span>
                      <span className="text-[10px] font-semibold text-dark-400">
                        {layout.points > 0 ? `${layout.points} Poin` : 'Cover / Kontak'}
                      </span>
                    </div>

                    {/* Judul Layout */}
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2">
                      {layout.name}
                    </h4>
                    <p className="text-xs text-dark-400 mt-1 line-clamp-2 leading-relaxed">
                      {layout.desc}
                    </p>
                  </div>

                  {/* Footer Card */}
                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-dark-500 truncate max-w-[150px]">
                      {layout.id}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-green-400 font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Terpilih
                      </span>
                    ) : (
                      <span className="text-brand-400 opacity-0 group-hover:opacity-100 font-semibold text-[11px] transition-opacity">
                        Pilih Layout →
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3.5 px-6 border-t border-white/10 bg-dark-950/80 flex items-center justify-between text-xs text-dark-400 flex-shrink-0">
          <span>
            Menampilkan <strong className="text-white">{filteredList.length}</strong> pilihan layout berstandar studio.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponen Utama: ManualLayoutSelector
 */
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
  const [modalSlideNumber, setModalSlideNumber] = useState(null);

  const handleSelectLayout = (slideNumber, newLayoutId) => {
    const updated = layoutSelections.map((item) =>
      item.slideNumber === slideNumber ? { ...item, layoutId: newLayoutId } : item
    );
    onUpdateLayoutSelections(updated);
  };

  const getLayoutDetails = (id, slideNumber) => {
    if (slideNumber === 1) {
      return COVER_LAYOUTS.find((l) => l.id === id) || COVER_LAYOUTS[0];
    }
    if (slideNumber === slideCount) {
      return CLOSING_LAYOUTS.find((l) => l.id === id) || CLOSING_LAYOUTS[0];
    }
    // Middle slide lookup
    const allMiddle = [
      ...AGENDA_LAYOUTS, ...POINT1_LAYOUTS, ...POINT2_LAYOUTS, ...POINT3_LAYOUTS,
      ...POINT4_LAYOUTS, ...POINT5_LAYOUTS, ...POINT6_LAYOUTS, ...CHART_LAYOUTS,
      ...TESTI_LAYOUTS, ...VISUAL_LAYOUTS
    ];
    return allMiddle.find((l) => l.id === id) || allMiddle[0];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Modal Penjelajah Katalog Visual */}
      {modalSlideNumber !== null && (
        <LayoutCatalogModal
          isOpen={modalSlideNumber !== null}
          onClose={() => setModalSlideNumber(null)}
          slideNumber={modalSlideNumber}
          slideCount={slideCount}
          currentLayoutId={
            layoutSelections.find((s) => s.slideNumber === modalSlideNumber)?.layoutId
          }
          onSelectLayout={handleSelectLayout}
        />
      )}

      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5" />
          <span>Mode Susun Layout Sendiri (189 Studio Catalog)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Pilih Layout untuk {slideCount} Slide Anda
        </h2>
        <p className="text-sm text-dark-400 max-w-xl mx-auto">
          Tentukan tata letak setiap slide dengan rapi. Slide 1 khusus <strong className="text-white">Cover Depan</strong>, slide terakhir khusus <strong className="text-white">Cover Penutup</strong>, dan slide tengah untuk <strong className="text-white">Materi & Data</strong>.
        </p>
      </div>

      {/* Grid Kartu Slide */}
      <div className="space-y-4">
        {layoutSelections.map((item, index) => {
          const slideNumber = item.slideNumber || index + 1;
          const isCover = slideNumber === 1;
          const isClosing = slideNumber === slideCount;
          const layoutDetail = getLayoutDetails(item.layoutId, slideNumber);

          return (
            <div
              key={slideNumber}
              className={`p-5 rounded-2xl border transition-all ${
                isCover
                  ? 'bg-dark-900/90 border-blue-500/40 shadow-lg'
                  : isClosing
                  ? 'bg-dark-900/90 border-emerald-500/40 shadow-lg'
                  : 'bg-dark-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Info Slide & Status */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-bold text-base flex-shrink-0 shadow-inner ${
                      isCover
                        ? 'bg-blue-600 text-white shadow-blue-600/30'
                        : isClosing
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-dark-800 text-white border border-white/10'
                    }`}
                  >
                    #{slideNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs uppercase font-mono tracking-wider font-bold ${
                          isCover
                            ? 'text-blue-400'
                            : isClosing
                            ? 'text-emerald-400'
                            : 'text-dark-400'
                        }`}
                      >
                        {isCover
                          ? (isEn ? 'Cover Slide (Front Only)' : 'Slide #1 (Khusus Cover Depan)')
                          : isClosing
                          ? (isEn ? `Slide #${slideNumber} (Closing Only)` : `Slide #${slideNumber} (Khusus Cover Penutup)`)
                          : (isEn ? `Slide #${slideNumber} (Content)` : `Slide #${slideNumber} (Materi & Pembahasan)`)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 border border-white/10 text-dark-300">
                        {layoutDetail.pageRef}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 border border-white/10 text-dark-300">
                        {layoutDetail.points > 0 ? `${layoutDetail.points} Poin` : 'Cover / Kontak'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white mt-0.5">
                      {layoutDetail.name}
                    </p>
                    <p className="text-xs text-dark-400 mt-0.5 hidden sm:block">
                      {layoutDetail.desc}
                    </p>
                  </div>
                </div>

                {/* Dropdown Selector & Tombol Katalog Visual */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 sm:w-auto">
                  {/* Dropdown Terstruktur & Terpisah */}
                  <select
                    value={item.layoutId}
                    onChange={(e) => handleSelectLayout(slideNumber, e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-inner sm:w-64"
                  >
                    {isCover ? (
                      /* KHUSUS SLIDE 1 (HANYA COVER) */
                      <>
                        <optgroup label="⭐ Cover Populer">
                          <option value="cover-front">Cover Depan Terpusat Klasik</option>
                          <option value="cover-front-editorial">Cover Editorial Kiri & Split</option>
                        </optgroup>
                        <optgroup label="📐 Katalog Studio (Halaman 04 - 18)">
                          {(CATEGORY_MAP.cover || []).map((id) => {
                            const l = FULL_LAYOUT_CATALOG[id];
                            return (
                              <option key={id} value={id}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            );
                          })}
                        </optgroup>
                      </>
                    ) : isClosing ? (
                      /* KHUSUS SLIDE TERAKHIR (HANYA PENUTUP) */
                      <>
                        <optgroup label="⭐ Penutup Populer">
                          <option value="cover-back">Cover Belakang (Kontak & Let's Connect)</option>
                          <option value="cover-back-statement">Cover Belakang (Thank You Masif)</option>
                        </optgroup>
                        <optgroup label="📐 Katalog Studio (Halaman 180 - 202)">
                          {(CATEGORY_MAP.closing || []).map((id) => {
                            const l = FULL_LAYOUT_CATALOG[id];
                            return (
                              <option key={id} value={id}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            );
                          })}
                        </optgroup>
                      </>
                    ) : (
                      /* KHUSUS SLIDE TENGAH (HANYA MATERI KONTEN, TANPA COVER & CLOSING) */
                      <>
                        <optgroup label="⭐ Populer & Standar">
                          <option value="table-of-contents">Daftar Isi Standar (01-04)</option>
                          <option value="three-points">3 Poin - Tiga Kolom (01, 02, 03)</option>
                          <option value="two-points">2 Poin - Dua Kolom Berdampingan</option>
                          <option value="comparison">Perbandingan (Sebelum vs Sesudah / A vs B)</option>
                          <option value="four-points">4 Poin - Grid 2x2 Kartu Panah</option>
                          <option value="steps">Langkah / Tahapan Proses (Step 1-4)</option>
                          <option value="chart">Grafik & Analisis Data Metrik</option>
                          <option value="testimonial">Testimoni & Kutipan Eksekutif</option>
                          <option value="one-point">1 Poin - Statement Terpusat</option>
                          <option value="five-points">5 Poin - Susunan Berimbang (3+2)</option>
                          <option value="six-points">6 Poin - Grid 3x2 Kartu Terstruktur</option>
                          <option value="image-text">Gambar & Teks Naratif</option>
                        </optgroup>
                        <optgroup label="📌 Agenda / Daftar Isi (p20 - p23)">
                          {(CATEGORY_MAP.agenda || []).map((id) => {
                            const l = FULL_LAYOUT_CATALOG[id];
                            return (
                              <option key={id} value={id}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            );
                          })}
                        </optgroup>
                        <optgroup label="1️⃣ 1 Poin (p25 - p46)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.layoutId.startsWith('point1-'))
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="2️⃣ 2 Poin & Perbandingan (p48 - p87)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.layoutId.startsWith('point2-'))
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="3️⃣ 3 Poin (p89 - p128)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.layoutId.startsWith('point3-'))
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="4️⃣ 4 Poin & Steps (p130 - p144)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.layoutId.startsWith('point4-'))
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="5️⃣ 5 Poin (p146 - p154)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.layoutId.startsWith('point5-'))
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="6️⃣ 6 Poin (p156 - p161)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.layoutId.startsWith('point6-'))
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="📊 Grafik & Data (p163 - p171)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.category === 'data')
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="💬 Testimoni (p173 - p178)">
                          {Object.values(FULL_LAYOUT_CATALOG)
                            .filter((l) => l.category === 'quote')
                            .map((l) => (
                              <option key={l.layoutId} value={l.layoutId}>
                                [{l.pageRef?.toUpperCase()}] {l.name}
                              </option>
                            ))}
                        </optgroup>
                      </>
                    )}
                  </select>

                  {/* Tombol Buka Katalog Visual */}
                  <button
                    type="button"
                    onClick={() => setModalSlideNumber(slideNumber)}
                    title="Buka Penjelajah Katalog Visual Lengkap"
                    className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-white/10 text-dark-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5 text-brand-400" />
                    <span>Katalog Visual</span>
                  </button>
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
