import React, { useState } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import LogoUploader from './LogoUploader';

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
    <div className="max-w-[600px] mx-auto">
      {/* Card di Tengah */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Tema & Topik Presentasi
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Lengkapi informasi awal untuk menyusun kerangka slide master Anda.
          </p>
        </div>

        {/* 1. Judul Presentasi * */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Judul Presentasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.customTitle || ''}
            onChange={(e) => setFormData({ ...formData, customTitle: e.target.value })}
            placeholder="Masukkan judul presentasi Anda..."
            className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
              errors.title ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-300'
            } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.title}</p>
          )}
          <p className="mt-1 text-[11px] text-gray-400 text-right">
            {(formData.customTitle || '').length}/100 karakter
          </p>
        </div>

        {/* 2. Deskripsi Topik */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Deskripsi Topik (Opsional)
          </label>
          <textarea
            value={formData.customDescription || ''}
            onChange={(e) => setFormData({ ...formData, customDescription: e.target.value })}
            placeholder="Deskripsikan topik presentasi Anda..."
            rows={3}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none transition-all"
          />
          <p className="mt-1 text-[11px] text-gray-400 text-right">
            {(formData.customDescription || '').length}/500 karakter
          </p>
        </div>

        {/* 3. Dropdown Bahasa Output PPT */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Bahasa Output PPT
          </label>
          <select
            value={formData.outputLanguage || 'id'}
            onChange={(e) => setFormData({ ...formData, outputLanguage: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all cursor-pointer"
          >
            <option value="id">Indonesia (Bahasa Indonesia)</option>
            <option value="en">Inggris (English)</option>
          </select>
        </div>

        {/* 4. Input / Slider Jumlah Slide */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Jumlah Slide (1 - 15)
            </label>
            <span className="text-xs font-bold text-gray-900">{slideCount} Slide</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="15"
              value={slideCount}
              onChange={(e) => setFormData({ ...formData, slideCount: parseInt(e.target.value, 10) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
            <input
              type="number"
              min="1"
              max="15"
              value={slideCount}
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 5;
                if (val < 1) val = 1;
                if (val > 15) val = 15;
                setFormData({ ...formData, slideCount: val });
              }}
              className="w-14 px-2 py-1.5 text-center text-sm font-bold bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {presets.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFormData({ ...formData, slideCount: num })}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  slideCount === num
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num} slide
              </button>
            ))}
          </div>
        </div>

        {/* 5. Logo Presentasi (Opsional) */}
        <LogoUploader
          logoConfig={formData.logoConfig || null}
          onLogoChange={(newConfig) => setFormData({ ...formData, logoConfig: newConfig })}
        />

        {/* 6. Pilihan Mode Layout: Radio Button */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Mode Layout
          </label>
          <div className="space-y-2.5">
            <label
              className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                (formData.layoutMode || 'auto') === 'auto'
                  ? 'border-gray-900 bg-[#F9FAFB]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="layoutMode"
                value="auto"
                checked={(formData.layoutMode || 'auto') === 'auto'}
                onChange={() => setFormData({ ...formData, layoutMode: 'auto' })}
                className="mt-0.5 accent-gray-900"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-gray-900 block">Auto Generate AI</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  AI menentukan layout setiap slide secara otomatis dan proporsional.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-all ${
                formData.layoutMode === 'manual'
                  ? 'border-gray-900 bg-[#F9FAFB]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name="layoutMode"
                value="manual"
                checked={formData.layoutMode === 'manual'}
                onChange={() => setFormData({ ...formData, layoutMode: 'manual' })}
                className="mt-0.5 accent-gray-900"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-gray-900 block">Susun Layout Sendiri</span>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Pilih sendiri tata letak setiap slide secara manual sebelum AI menghasilkan konten.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Draft</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 px-5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>{formData.layoutMode === 'manual' ? 'Lanjut ke Pilih Layout' : 'Lanjut ke Generate AI'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
