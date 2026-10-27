import { Sliders, ArrowLeft, ArrowRight, Save, Layers, CheckCircle } from 'lucide-react';

export default function SlideCountSelector({
  formData,
  setFormData,
  onNext,
  onPrev,
  onSaveDraft,
}) {
  const currentCount = Math.max(1, Math.min(15, parseInt(formData.slideCount, 10) || 5));

  const presets = [
    { count: 3, label: '3 Slide', desc: 'Elevator Pitch & Ringkasan' },
    { count: 5, label: '5 Slide', desc: 'Presentasi Eksekutif Cepat' },
    { count: 8, label: '8 Slide', desc: 'Standar Bisnis & Strategi' },
    { count: 10, label: '10 Slide', desc: 'Deck Lengkap & Edukasi' },
    { count: 12, label: '12 Slide', desc: 'Laporan Proyek Terperinci' },
    { count: 15, label: '15 Slide', desc: 'Master Deck Komprehensif' },
  ];

  const handleCountChange = (val) => {
    const num = Math.max(1, Math.min(15, parseInt(val, 10) || 1));
    setFormData((prev) => ({
      ...prev,
      slideCount: num,
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Top Card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-dark-900/60 shadow-xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            Langkah 2 dari 6
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Pilih Jumlah Slide (1 - 15)
          </h2>
          <p className="text-sm text-dark-400 mt-1">
            Tentukan berapa slide yang akan di-generate oleh AI Gemini dengan copywriting dan layout terstruktur.
          </p>
        </div>

        {/* Selected Context Summary */}
        <div className="p-4 rounded-xl bg-dark-800/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-dark-400">Judul Terpilih: </span>
            <span className="text-white font-semibold">{formData.customTitle || 'Tanpa Judul'}</span>
          </div>
          <div>
            <span className="text-dark-400">Kategori Tema: </span>
            <span className="text-brand-300 font-semibold">{formData.themeName || formData.theme || 'Bisnis'}</span>
          </div>
        </div>

        {/* Number Display & Slider */}
        <div className="space-y-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-6xl sm:text-7xl font-extrabold text-white font-mono tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                {currentCount}
              </div>
              <div className="text-xs uppercase tracking-wider text-dark-400 font-semibold mt-1">
                Slide Presentasi
              </div>
            </div>

            <div className="flex-1 w-full max-w-md space-y-3">
              <input
                type="range"
                min="1"
                max="15"
                value={currentCount}
                onChange={(e) => handleCountChange(e.target.value)}
                className="w-full h-3 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
              <div className="flex justify-between text-xs text-dark-400 font-mono">
                <span>1 Slide (Minimal)</span>
                <span>8 Slide (Ideal)</span>
                <span>15 Slide (Maksimal)</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider">
              Pilihan Cepat (Preset)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {presets.map((p) => {
                const isSelected = currentCount === p.count;
                return (
                  <button
                    key={p.count}
                    type="button"
                    onClick={() => handleCountChange(p.count)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                        : 'bg-dark-800/60 border-white/5 text-dark-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{p.label}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-dark-400 mt-1 line-clamp-2">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onPrev}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Tema</span>
        </button>

        <div className="flex items-center gap-3">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
              title="Simpan progress Anda saat ini (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="btn-primary flex items-center gap-2 py-3 px-8 text-base shadow-lg shadow-brand-500/25"
          >
            <span>Lanjut ke Pilih Warna</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
