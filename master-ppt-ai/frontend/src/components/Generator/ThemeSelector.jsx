import { Check, Layout, ArrowRight, Save } from 'lucide-react';

const THEME_EMOJI = {
  Bisnis: '💼',
  Edukasi: '📚',
  Kreatif: '🎨',
  Minimalis: '✨',
  Teknologi: '🚀',
  'Tema Bebas': '🌟',
};

export default function ThemeSelector({
  formData,
  setFormData,
  themes = [],
  loadingThemes = false,
  onNext,
  onSaveDraft,
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Form Card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-dark-900/60 shadow-xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
            <Layout className="w-3.5 h-3.5" />
            Langkah 1 dari 6
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Detail Presentasi & Jumlah Slide
          </h2>
          <p className="text-sm text-dark-400 mt-1">
            Tentukan judul, konteks tema, dan jumlah slide yang ingin di-generate oleh AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Judul Presentasi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Judul Presentasi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.customTitle}
              onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
              placeholder="Masukkan judul presentasi (contoh: Strategi Pemasaran Digital 2026)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none font-medium text-sm transition-all"
            />
            <div className="flex justify-between items-center text-xs text-dark-400">
              <span>Wajib diisi untuk slide pembuka</span>
              <span className="font-mono">{formData.customTitle.length}/100</span>
            </div>
          </div>

          {/* Jumlah Slide (1-15) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Jumlah Slide (1 - 15) <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="15"
                value={formData.slideCount}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(15, parseInt(e.target.value, 10) || 1));
                  setFormData({ ...formData, slideCount: val });
                }}
                placeholder="5"
                className="w-28 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-bold text-center placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-base transition-all"
              />
              <input
                type="range"
                min="1"
                max="15"
                value={formData.slideCount}
                onChange={(e) =>
                  setFormData({ ...formData, slideCount: parseInt(e.target.value, 10) })
                }
                className="flex-1 accent-brand-500 h-2 bg-dark-800 rounded-lg cursor-pointer"
              />
            </div>
            {/* Quick buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-xs text-dark-400 mr-1">Preset:</span>
              {[3, 5, 8, 10, 12, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setFormData({ ...formData, slideCount: cnt })}
                  className={`px-2 py-0.5 text-xs rounded-md border transition-all ${
                    formData.slideCount === cnt
                      ? 'bg-brand-500 text-white border-brand-400 font-bold'
                      : 'border-white/10 text-dark-400 hover:text-white bg-dark-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Textarea Deskripsi Tema */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Deskripsi / Konteks Tema Bebas (Opsional)
          </label>
          <textarea
            rows="4"
            maxLength={500}
            value={formData.customDescription}
            onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
            placeholder="Deskripsikan tema presentasi Anda (opsional, contoh: Presentasi untuk klien startup teknologi, ingin kesan modern dan dinamis)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none font-medium text-sm transition-all"
          />
          <div className="flex justify-between items-center text-xs text-dark-400">
            <span>AI akan menyesuaikan konten slide dan tone of voice berdasarkan deskripsi ini</span>
            <span className="font-mono">{formData.customDescription.length}/500</span>
          </div>
        </div>
      </div>

      {/* Theme Cards Gallery */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>Pilih Kategori Tema Dasar</span>
        </h3>

        {loadingThemes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-dark-900/40 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map((theme) => {
              const isSelected = formData.themeId === theme.id;
              const emoji = THEME_EMOJI[theme.name] || '📊';

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      themeId: theme.id,
                      themeName: theme.name,
                      customColors: {
                        primary: theme.color_primary,
                        secondary: theme.color_secondary,
                        accent: theme.color_accent,
                      },
                    })
                  }
                  className={`text-left p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500'
                      : 'bg-dark-900/60 border-white/5 hover:border-white/20 hover:bg-dark-900'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-dark-800/80 border border-white/10">
                        {emoji}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                          {theme.name}
                        </h4>
                        <p className="text-xs text-dark-400 capitalize">{theme.category}</p>
                      </div>
                    </div>
                    <p className="text-xs text-dark-300 leading-relaxed line-clamp-2">
                      {theme.description}
                    </p>
                  </div>

                  {/* Swatches & Fonts */}
                  <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.color_primary }}
                        title="Primary"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.color_secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.color_accent }}
                        title="Accent"
                      />
                    </div>
                    <span className="text-[11px] text-dark-400 font-medium">
                      {theme.font_heading} + {theme.font_body}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
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
        </div>
        <button
          type="button"
          onClick={onNext}
          className="btn-primary flex items-center gap-2 py-3 px-8 text-base shadow-lg shadow-brand-500/25"
        >
          <span>Lanjut ke Jumlah Slide</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
