import React, { useState } from 'react';
import { Layout, ArrowRight, Save, Globe, Hash } from 'lucide-react';

const ThemeSelector = ({ formData, setFormData, onNext, onSaveDraft }) => {
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const title = formData.customTitle || '';
    if (!title || title.trim() === '') {
      newErrors.title = 'Judul presentasi wajib diisi';
    }
    if (title && title.length > 100) {
      newErrors.title = 'Judul maksimal 100 karakter';
    }
    const desc = formData.customDescription || '';
    if (desc && desc.length > 500) {
      newErrors.description = 'Deskripsi maksimal 500 karakter';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const slideCount = formData.slideCount || 5;
  const presets = [3, 5, 8, 10, 12, 15];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-4">
          <Layout className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tema & Topik Presentasi
        </h2>
        <p className="text-gray-500">
          Masukkan judul dan deskripsi untuk membuat master PowerPoint Anda
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Judul Presentasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 form-label-contrast">
            Judul Presentasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customTitle || ''}
            onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
            placeholder="Contoh: Strategi Pemasaran Digital 2026"
            className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title
                ? 'border-red-400 bg-red-50 text-red-900'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm font-medium text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {(formData.customTitle || '').length}/100 karakter
          </p>
        </div>

        {/* Deskripsi / Topik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 form-label-contrast">
            Deskripsi / Topik
          </label>
          <textarea
            value={formData.customDescription || ''}
            onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
            placeholder="Jelaskan topik presentasi Anda secara singkat. AI akan menggunakan deskripsi ini untuk membuat konten yang relevan..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              errors.description
                ? 'border-red-400 bg-red-50 text-red-900'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm font-medium text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {(formData.customDescription || '').length}/500 karakter
          </p>
        </div>

        {/* Bahasa Output */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 form-label-contrast">
            <Globe className="w-4 h-4 inline mr-1" />
            Bahasa Output PPT
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Pilih bahasa untuk isi teks/copywriting slide
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outputLanguage: 'id' })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                (formData.outputLanguage || 'id') === 'id'
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              🇮🇩 Bahasa Indonesia
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, outputLanguage: 'en' })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 font-semibold ${
                formData.outputLanguage === 'en'
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Jumlah Slide */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 form-label-contrast">
            <Hash className="w-4 h-4 inline mr-1" />
            Jumlah Slide
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Tentukan jumlah slide yang akan dibuat (1-15)
          </p>

          {/* Slider + Number Input */}
          <div className="flex items-center gap-4 mb-3">
            <input
              type="range"
              min="1"
              max="15"
              value={slideCount}
              onChange={(e) => setFormData({ ...formData, slideCount: parseInt(e.target.value) })}
              className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
            <div className="relative">
              <input
                type="number"
                min="1"
                max="15"
                value={slideCount}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 5;
                  if (val < 1) val = 1;
                  if (val > 15) val = 15;
                  setFormData({ ...formData, slideCount: val });
                }}
                className="w-16 px-2 py-2 text-center rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:outline-none font-bold text-lg shadow-sm"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex gap-2 flex-wrap">
            {presets.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFormData({ ...formData, slideCount: num })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  slideCount === num
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num} slide
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-gray-700">Base Master Hitam & Putih</p>
              <p className="text-xs text-gray-500 mt-1">
                AI akan membuat master PowerPoint dengan desain minimalis hitam-putih.
                Layout, font, dan konten akan disesuaikan secara otomatis berdasarkan
                judul dan deskripsi yang Anda berikan.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Draft
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-black/20"
          >
            Lanjut ke Generate AI
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-white rounded-xl border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 Tips untuk hasil terbaik:</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-sm text-gray-600">Gunakan judul yang spesifik dan jelas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-sm text-gray-600">Tambahkan deskripsi detail tentang target audiens dan tujuan</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span className="text-sm text-gray-600">Pilih jumlah slide sesuai kebutuhan (5-10 untuk presentasi standar)</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ThemeSelector;
