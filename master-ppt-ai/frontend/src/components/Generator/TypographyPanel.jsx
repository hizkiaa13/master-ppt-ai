import React, { useState } from 'react';
import {
  Type,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Info,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  SAFE_FONTS,
  FONT_WEIGHT_OPTIONS,
  TYPOGRAPHY_COLORS,
  DEFAULT_TYPOGRAPHY_CONFIG,
  checkTypographyConsistency,
} from '../../utils/typographySystem';

export default function TypographyPanel({
  typographyConfig = DEFAULT_TYPOGRAPHY_CONFIG,
  onTypographyChange,
  slides = [],
  selectedPlaceholder = null,
}) {
  const currentConfig = typographyConfig || DEFAULT_TYPOGRAPHY_CONFIG;
  const isAuto = currentConfig.mode === 'auto';
  const [activeRoleTab, setActiveRoleTab] = useState('title'); // 'title' | 'subtitle' | 'body' | 'caption'

  const consistencyWarnings = checkTypographyConsistency(slides, currentConfig);

  const handleModeChange = (newMode) => {
    if (newMode === 'auto') {
      // Re-sinkronisasi semua peran ke font family utama
      const baseFont = currentConfig.fontFamily || 'Inter';
      onTypographyChange({
        ...currentConfig,
        mode: 'auto',
        fontFamily: baseFont,
        scale: {
          title: { ...DEFAULT_TYPOGRAPHY_CONFIG.scale.title, fontFamily: baseFont },
          subtitle: { ...DEFAULT_TYPOGRAPHY_CONFIG.scale.subtitle, fontFamily: baseFont },
          body: { ...DEFAULT_TYPOGRAPHY_CONFIG.scale.body, fontFamily: baseFont },
          caption: { ...DEFAULT_TYPOGRAPHY_CONFIG.scale.caption, fontFamily: baseFont },
        },
      });
    } else {
      onTypographyChange({
        ...currentConfig,
        mode: 'manual',
      });
    }
  };

  const handleAutoFontFamilyChange = (font) => {
    onTypographyChange({
      ...currentConfig,
      fontFamily: font,
      scale: {
        title: { ...currentConfig.scale.title, fontFamily: font },
        subtitle: { ...currentConfig.scale.subtitle, fontFamily: font },
        body: { ...currentConfig.scale.body, fontFamily: font },
        caption: { ...currentConfig.scale.caption, fontFamily: font },
      },
    });
  };

  const handleRolePropChange = (role, key, value) => {
    onTypographyChange({
      ...currentConfig,
      scale: {
        ...currentConfig.scale,
        [role]: {
          ...currentConfig.scale[role],
          [key]: value,
        },
      },
    });
  };

  const handleResetToAuto = () => {
    onTypographyChange(DEFAULT_TYPOGRAPHY_CONFIG);
  };

  const currentRoleConfig = currentConfig.scale?.[activeRoleTab] || DEFAULT_TYPOGRAPHY_CONFIG.scale[activeRoleTab];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-4">
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-900" />
          <h3 className="text-xs font-bold text-gray-900">Pengaturan Tipografi</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
          {isAuto ? 'Otomatis' : 'Manual'}
        </span>
      </div>

      {/* Mode Switcher: Otomatis vs Manual */}
      <div>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => handleModeChange('auto')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              isAuto
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            Otomatis
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('manual')}
            className={`py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
              !isAuto
                ? 'bg-gray-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            Manual
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
          {isAuto
            ? 'Seluruh slide memakai jenis font, ukuran, dan ketebalan yang sama agar konsisten.'
            : 'Atur tipografi per peran teks (judul, subjudul, body, caption) dengan kontrol presisi.'}
        </p>
      </div>

      {/* Konten Mode Otomatis */}
      {isAuto ? (
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">
              Jenis Font Global (Seluruh Slide)
            </label>
            <div className="relative">
              <select
                value={currentConfig.fontFamily || 'Inter'}
                onChange={(e) => handleAutoFontFamilyChange(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
              >
                {SAFE_FONTS.map((font) => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                    {font.label} ({font.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pratinjau Font Aktif */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5" style={{ fontFamily: currentConfig.fontFamily || 'Inter' }}>
            <p className="text-sm font-bold text-gray-900 truncate">
              The Quick Brown Fox Jumps Over The Lazy Dog
            </p>
            <p className="text-xs text-gray-600 truncate">
              Pratinjau Tipografi Global: Judul 32pt · Subjudul 20pt · Body 15pt
            </p>
          </div>

          {/* Scale Summary Badges */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-semibold text-gray-800 block">Judul Slide</span>
              <span>{currentConfig.scale?.title?.size || 32}pt · Bold (700)</span>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-semibold text-gray-800 block">Subjudul</span>
              <span>{currentConfig.scale?.subtitle?.size || 20}pt · Semibold (600)</span>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-semibold text-gray-800 block">Isi / Poin</span>
              <span>{currentConfig.scale?.body?.size || 15}pt · Regular (400)</span>
            </div>
            <div className="p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-semibold text-gray-800 block">Caption / Footer</span>
              <span>{currentConfig.scale?.caption?.size || 12}pt · Regular (400)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Konten Mode Manual */
        <div className="space-y-3 pt-1">
          {/* Role Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Pilih Peran Teks:
            </label>
            <div className="flex gap-1">
              {[
                { id: 'title', label: 'Judul' },
                { id: 'subtitle', label: 'Subjudul' },
                { id: 'body', label: 'Isi (Body)' },
                { id: 'caption', label: 'Caption' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRoleTab(tab.id)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md border transition-colors ${
                    activeRoleTab === tab.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Pengaturan Peran Aktif */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            {/* Font Family per Role */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-600 mb-1">Jenis Font</label>
              <select
                value={currentRoleConfig.fontFamily || currentConfig.fontFamily || 'Inter'}
                onChange={(e) => handleRolePropChange(activeRoleTab, 'fontFamily', e.target.value)}
                className="w-full text-xs py-1.5 px-2.5 bg-white text-gray-900 border border-gray-300 rounded font-medium focus:ring-1 focus:ring-gray-900"
              >
                {SAFE_FONTS.map((font) => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                    {font.label} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Ukuran & Ketebalan */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Ukuran (pt)</label>
                <input
                  type="number"
                  min="10"
                  max="60"
                  value={currentRoleConfig.size || 16}
                  onChange={(e) => handleRolePropChange(activeRoleTab, 'size', parseInt(e.target.value, 10) || 16)}
                  className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 border border-gray-300 rounded font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Ketebalan</label>
                <select
                  value={currentRoleConfig.weight || 400}
                  onChange={(e) => {
                    const wt = parseInt(e.target.value, 10) || 400;
                    handleRolePropChange(activeRoleTab, 'weight', wt);
                    handleRolePropChange(activeRoleTab, 'isBold', wt >= 600);
                  }}
                  className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 border border-gray-300 rounded font-medium"
                >
                  {FONT_WEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line Height & Perataan */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Line Height</label>
                <select
                  value={currentRoleConfig.lineHeight || 1.4}
                  onChange={(e) => handleRolePropChange(activeRoleTab, 'lineHeight', parseFloat(e.target.value) || 1.4)}
                  className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 border border-gray-300 rounded font-medium"
                >
                  <option value={1.1}>1.1 (Padat)</option>
                  <option value={1.2}>1.2 (Standar Judul)</option>
                  <option value={1.3}>1.3 (Subjudul)</option>
                  <option value={1.4}>1.4 (Sedang)</option>
                  <option value={1.5}>1.5 (Longgar / Body)</option>
                  <option value={1.8}>1.8 (Sangat Longgar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Warna Teks</label>
                <div className="flex gap-1.5 items-center mt-1">
                  {TYPOGRAPHY_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleRolePropChange(activeRoleTab, 'color', c.hex)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        currentRoleConfig.color === c.hex ? 'ring-2 ring-gray-900 ring-offset-1' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {currentRoleConfig.color === c.hex && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Kembalikan ke Otomatis */}
          <button
            type="button"
            onClick={handleResetToAuto}
            className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan ke Otomatis</span>
          </button>
        </div>
      )}

      {/* Peringatan Inkonsistensi Variasi Ukuran (jika mode manual) */}
      {consistencyWarnings.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Peringatan Variasi Tipografi:</span>
          </div>
          {consistencyWarnings.map((w, idx) => (
            <p key={idx} className="leading-relaxed pl-5">
              • {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
