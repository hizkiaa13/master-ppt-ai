import React from 'react';
import { Layout, ArrowRight, Save, Globe } from 'lucide-react';

export default function ThemeSelector({
  formData,
  setFormData,
  onNext,
  onSaveDraft,
}) {
  const currentLang = formData.outputLanguage || 'id';

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-dark-900/60 shadow-xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
            <Layout className="w-3.5 h-3.5" />
            Langkah 1 dari 4
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Tema & Topik Presentasi
          </h2>
          <p className="text-sm text-dark-400 mt-1">
            Masukkan judul, konteks topik, dan pilih bahasa output presentasi Anda.
          </p>
        </div>

        {/* Info Box: Base Master Hitam-Putih */}
        <div className="p-4 rounded-xl bg-dark-800/80 border border-white/10 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs border border-white/20">
            B&W
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-white">Konsep Base Master (Hitam & Putih)</p>
            <p className="text-dark-300 leading-relaxed">
              Aplikasi menghasilkan master PowerPoint berdesain profesional dengan background putih murni (#FFFFFF), teks hitam (#000000) dan abu gelap (#1F2937). Jumlah slide akan ditentukan secara cerdas dan otomatis oleh AI (maksimal 15 slide).
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Judul Presentasi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Judul Presentasi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.customTitle || ''}
              onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
              placeholder="Masukkan judul presentasi (contoh: Strategi Pemasaran Digital 2026)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none font-medium text-sm transition-all shadow-sm"
            />
            <div className="flex justify-between items-center text-xs text-dark-400">
              <span>Wajib diisi untuk slide pembuka</span>
              <span className="font-mono">{(formData.customTitle || '').length}/100</span>
            </div>
          </div>

          {/* Textarea Deskripsi / Topik */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Deskripsi / Topik Tambahan (Opsional)
            </label>
            <textarea
              rows="4"
              maxLength={500}
              value={formData.customDescription || ''}
              onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
              placeholder="Deskripsikan konteks presentasi Anda (contoh: Presentasi untuk klien startup teknologi, memuat analisis pasar, timeline eksekusi, dan indikator KPI)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none resize-none font-medium text-sm transition-all shadow-sm"
            />
            <div className="flex justify-between items-center text-xs text-dark-400">
              <span>AI akan menyusun poin pembahasan dan menentukan jumlah slide berdasarkan deskripsi ini</span>
              <span className="font-mono">{(formData.customDescription || '').length}/500</span>
            </div>
          </div>

          {/* Pilihan Bahasa Output PPT */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-gray-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-400" />
              <span>Bahasa Output PPT</span>
              <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bahasa Indonesia */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, outputLanguage: 'id' })}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentLang === 'id'
                    ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500 shadow-lg shadow-brand-500/10'
                    : 'bg-dark-800/60 border-white/10 text-dark-300 hover:border-white/20 hover:bg-dark-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇮🇩</span>
                  <div>
                    <p className="font-bold text-white text-sm">Bahasa Indonesia</p>
                    <p className="text-xs text-dark-400">Gaya formal, profesional & persuasif</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentLang === 'id' ? 'border-brand-400 bg-brand-500' : 'border-white/20'
                }`}>
                  {currentLang === 'id' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, outputLanguage: 'en' })}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  currentLang === 'en'
                    ? 'bg-brand-500/15 border-brand-500 text-white ring-1 ring-brand-500 shadow-lg shadow-brand-500/10'
                    : 'bg-dark-800/60 border-white/10 text-dark-300 hover:border-white/20 hover:bg-dark-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <p className="font-bold text-white text-sm">Bahasa Inggris (English)</p>
                    <p className="text-xs text-dark-400">Professional executive English</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  currentLang === 'en' ? 'border-brand-400 bg-brand-500' : 'border-white/20'
                }`}>
                  {currentLang === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
            <p className="text-xs text-dark-400">
              *Bahasa yang dipilih hanya memengaruhi isi copywriting slide, bukan antarmuka aplikasi.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onSaveDraft}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="btn-primary flex items-center gap-2 py-3 px-6 text-sm font-semibold shadow-lg shadow-brand-500/25"
          >
            <span>Lanjut ke Generate AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
