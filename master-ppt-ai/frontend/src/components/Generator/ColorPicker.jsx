import { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, ArrowLeft, ArrowRight, RefreshCw, Save } from 'lucide-react';

/**
 * Generate secondary and accent colors from a single primary hex color
 */
function generatePaletteFromColor(hex) {
  // Simple brightness & hue shift helper
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) {
    return { primary: hex, secondary: '#1E40AF', accent: '#F59E0B' };
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Secondary: darker tone
  const secR = Math.max(0, Math.floor(r * 0.7)).toString(16).padStart(2, '0');
  const secG = Math.max(0, Math.floor(g * 0.7)).toString(16).padStart(2, '0');
  const secB = Math.max(0, Math.floor(b * 0.7)).toString(16).padStart(2, '0');
  const secondary = `#${secR}${secG}${secB}`;

  // Accent: golden warm accent or complementary
  const accR = Math.min(255, Math.floor(255 - r * 0.3)).toString(16).padStart(2, '0');
  const accG = Math.min(255, Math.floor(180 + g * 0.2)).toString(16).padStart(2, '0');
  const accB = Math.min(255, Math.floor(20 + b * 0.2)).toString(16).padStart(2, '0');
  const accent = `#${accR}${accG}${accB}`;

  return {
    primary: hex,
    secondary,
    accent,
  };
}

export default function ColorPicker({ formData, setFormData, onNext, onPrev, onSaveDraft }) {
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [customColor, setCustomColor] = useState(formData.customColors?.primary || '#3B82F6');

  const predefinedPalettes = [
    {
      name: 'Ocean Blue',
      desc: 'Kepercayaan, profesional, korporat',
      colors: { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
    },
    {
      name: 'Forest Green',
      desc: 'Pertumbuhan, alam, edukasi, segar',
      colors: { primary: '#10B981', secondary: '#047857', accent: '#FBBF24' },
    },
    {
      name: 'Sunset Orange',
      desc: 'Enerjik, hangat, antusias, dinamis',
      colors: { primary: '#F97316', secondary: '#EA580C', accent: '#FCD34D' },
    },
    {
      name: 'Royal Purple',
      desc: 'Mewah, kreatif, inovatif, elegan',
      colors: { primary: '#8B5CF6', secondary: '#6D28D9', accent: '#F472B6' },
    },
    {
      name: 'Minimalist Slate',
      desc: 'Modern, tenang, bersih, esensial',
      colors: { primary: '#475569', secondary: '#1E293B', accent: '#38BDF8' },
    },
    {
      name: 'Cyberpunk Neon',
      desc: 'Futuristik, teknologi, kontras tinggi',
      colors: { primary: '#06B6D4', secondary: '#0284C7', accent: '#F43F5E' },
    },
    {
      name: 'Crimson Executive',
      desc: 'Tegas, kuat, berani, impactful',
      colors: { primary: '#BE123C', secondary: '#881337', accent: '#F59E0B' },
    },
    {
      name: 'Midnight Gold',
      desc: 'Premium, eksklusif, pitch deck',
      colors: { primary: '#0F172A', secondary: '#1E293B', accent: '#F59E0B' },
    },
  ];

  // Set default palette if not set
  useEffect(() => {
    if (!formData.customColors) {
      handleSelectPalette(predefinedPalettes[0]);
    }
  }, []);

  const handleSelectPalette = (palette) => {
    setSelectedPalette(palette.name);
    setCustomColor(palette.colors.primary);
    setFormData((prev) => ({
      ...prev,
      customColors: palette.colors,
    }));
  };

  const handleCustomColorChange = (hex) => {
    setCustomColor(hex);
    setSelectedPalette(null);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const generatedPalette = generatePaletteFromColor(hex);
      setFormData((prev) => ({
        ...prev,
        customColors: generatedPalette,
      }));
    }
  };

  const handleManualColorChange = (type, hex) => {
    setFormData((prev) => ({
      ...prev,
      customColors: {
        ...(prev.customColors || { primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' }),
        [type]: hex,
      },
    }));
  };

  const currentColors = formData.customColors || {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
            <Palette className="w-3.5 h-3.5" />
            Langkah 3 dari 6
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Pilih Skema Warna Presentasi</h2>
          <p className="text-sm text-dark-400 mt-1">
            Gunakan palet teruji harmoni warna atau tentukan warna brand Anda sendiri secara presisi.
          </p>
        </div>
      </div>

      {/* Pre-defined Palettes */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-300 mb-3 flex items-center gap-2">
          <span>Pilihan Palet Harmonis Siap Pakai</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {predefinedPalettes.map((palette) => {
            const isSelected = selectedPalette === palette.name;
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => handleSelectPalette(palette)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 relative group ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500'
                    : 'bg-dark-900/60 border-white/5 hover:border-white/20 hover:bg-dark-900'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                {/* 3 Color swatch bars */}
                <div className="flex h-10 w-full rounded-lg overflow-hidden border border-white/10 shadow-inner mb-3">
                  <div
                    className="flex-[2] transition-transform group-hover:scale-105"
                    style={{ backgroundColor: palette.colors.primary }}
                    title={`Primary: ${palette.colors.primary}`}
                  />
                  <div
                    className="flex-1 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: palette.colors.secondary }}
                    title={`Secondary: ${palette.colors.secondary}`}
                  />
                  <div
                    className="flex-1 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: palette.colors.accent }}
                    title={`Accent: ${palette.colors.accent}`}
                  />
                </div>
                <p className="font-semibold text-white text-sm">{palette.name}</p>
                <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{palette.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Picker Section */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-dark-900/40">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-dark-300 mb-3 flex items-center gap-2">
          <span>Kustomisasi Warna Presisi (Hex Code)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300 flex items-center justify-between">
              <span>Warna Utama (Primary)</span>
              <span className="font-mono text-dark-400">{currentColors.primary}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentColors.primary}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15 p-1"
              />
              <input
                type="text"
                value={currentColors.primary}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#3B82F6"
                className="input font-mono uppercase text-sm py-2 flex-1"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-dark-500">Mendominasi background slide pembuka & aksen judul.</p>
          </div>

          {/* Secondary */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300 flex items-center justify-between">
              <span>Warna Sekunder</span>
              <span className="font-mono text-dark-400">{currentColors.secondary}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentColors.secondary}
                onChange={(e) => handleManualColorChange('secondary', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15 p-1"
              />
              <input
                type="text"
                value={currentColors.secondary}
                onChange={(e) => handleManualColorChange('secondary', e.target.value)}
                placeholder="#1E40AF"
                className="input font-mono uppercase text-sm py-2 flex-1"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-dark-500">Digunakan untuk box kontras, card, dan sub-elemen.</p>
          </div>

          {/* Accent */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300 flex items-center justify-between">
              <span>Warna Aksen (Highlight)</span>
              <span className="font-mono text-dark-400">{currentColors.accent}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentColors.accent}
                onChange={(e) => handleManualColorChange('accent', e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/15 p-1"
              />
              <input
                type="text"
                value={currentColors.accent}
                onChange={(e) => handleManualColorChange('accent', e.target.value)}
                placeholder="#F59E0B"
                className="input font-mono uppercase text-sm py-2 flex-1"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-dark-500">Menyorot angka kunci, bullet icon, dan call-to-action.</p>
          </div>
        </div>
      </div>

      {/* Real-time Palette Live Preview Card */}
      <div className="p-5 rounded-2xl border border-white/10 bg-dark-950/60 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">Live Preview Palet Terpilih:</span>
          </div>
          <span className="text-xs text-dark-400">Akan diterapkan langsung ke master slide</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-white/10 text-center" style={{ backgroundColor: currentColors.primary }}>
            <p className="text-xs font-semibold text-white/90 drop-shadow">Primary</p>
            <p className="text-xs font-mono text-white/80 font-medium mt-1 drop-shadow">{currentColors.primary}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 text-center" style={{ backgroundColor: currentColors.secondary }}>
            <p className="text-xs font-semibold text-white/90 drop-shadow">Secondary</p>
            <p className="text-xs font-mono text-white/80 font-medium mt-1 drop-shadow">{currentColors.secondary}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 text-center" style={{ backgroundColor: currentColors.accent }}>
            <p className="text-xs font-semibold text-dark-950 font-bold">Accent</p>
            <p className="text-xs font-mono text-dark-900 font-bold mt-1">{currentColors.accent}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onPrev}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
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
            className="btn-primary flex items-center gap-2"
          >
            <span>Lanjut ke Generate AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
