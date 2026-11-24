import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

/**
 * Logo position constants with coordinate mapping.
 * Coordinates are in PPTX inches (slide = 10 x 5.625 inches).
 */
const LOGO_POSITIONS = [
  { id: 'top-left',     label: 'Kiri Atas',   row: 'top',    col: 'left'  },
  { id: 'top-right',    label: 'Kanan Atas',  row: 'top',    col: 'right' },
  { id: 'bottom-left',  label: 'Kiri Bawah',  row: 'bottom', col: 'left'  },
  { id: 'bottom-right', label: 'Kanan Bawah', row: 'bottom', col: 'right' },
];

const LOGO_SIZES = [
  { id: 'small',  label: 'Kecil',  maxW: 0.8,  maxH: 0.45 },
  { id: 'medium', label: 'Sedang', maxW: 1.2,  maxH: 0.65 },
  { id: 'large',  label: 'Besar',  maxW: 1.8,  maxH: 1.0  },
];

/**
 * Read a File as a base64 data URI string.
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate that a data URI is actually a valid image by loading it into an Image element.
 */
function validateImageData(dataUri) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('File bukan gambar yang valid atau gambar rusak.'));
    img.src = dataUri;
  });
}

/**
 * Compute the logo bounding box in PPTX inches (contain strategy).
 */
export function computeLogoBounds(logoConfig) {
  if (!logoConfig?.enabled || !logoConfig?.dataUri) return null;

  const sizeDef = LOGO_SIZES.find(s => s.id === logoConfig.size) || LOGO_SIZES[1];
  const { naturalWidth = 200, naturalHeight = 100 } = logoConfig;
  const aspectRatio = naturalWidth / naturalHeight;

  // Contain the logo inside the bounding box
  let w = sizeDef.maxW;
  let h = w / aspectRatio;
  if (h > sizeDef.maxH) {
    h = sizeDef.maxH;
    w = h * aspectRatio;
  }

  const margin = 0.25; // inches from edge
  const position = logoConfig.position || 'top-right';

  let x, y;
  if (position.includes('left')) {
    x = margin;
  } else {
    x = 10 - margin - w;
  }
  if (position.includes('top')) {
    y = margin;
  } else {
    y = 5.625 - margin - h;
  }

  return { x, y, w, h };
}

/**
 * Compute logo bounds as percentages (0-100) for the preview canvas.
 */
export function computeLogoPercent(logoConfig) {
  const bounds = computeLogoBounds(logoConfig);
  if (!bounds) return null;
  return {
    x: (bounds.x / 10) * 100,
    y: (bounds.y / 5.625) * 100,
    w: (bounds.w / 10) * 100,
    h: (bounds.h / 5.625) * 100,
  };
}

/**
 * Get the safe-area rectangle that the logo occupies (in percent 0-100).
 * Layout engine should avoid placing content in this area.
 */
export function getLogoSafeArea(logoConfig) {
  const pct = computeLogoPercent(logoConfig);
  if (!pct) return null;
  const pad = 1; // 1% padding around the logo
  return {
    x: Math.max(0, pct.x - pad),
    y: Math.max(0, pct.y - pad),
    w: Math.min(100, pct.w + pad * 2),
    h: Math.min(100, pct.h + pad * 2),
    right: Math.min(100, pct.x + pct.w + pad),
    bottom: Math.min(100, pct.y + pct.h + pad),
  };
}

/**
 * Check if a placeholder overlaps with the logo safe area.
 */
export function doesOverlapLogo(placeholder, logoConfig) {
  const safeArea = getLogoSafeArea(logoConfig);
  if (!safeArea || !placeholder?.position) return false;

  const p = placeholder.position;
  const rawX = parseFloat(p.x) || 0;
  const rawY = parseFloat(p.y) || 0;
  const rawW = parseFloat(p.w) || 10;
  const rawH = parseFloat(p.h) || 10;

  const isPercent = rawW > 10 || rawH > 10 || rawX > 10 || rawY > 10;
  const pctX = isPercent ? rawX : rawX * 10;
  const pctY = isPercent ? rawY : rawY * 10;
  const pctW = isPercent ? rawW : rawW * 10;
  const pctH = isPercent ? rawH : rawH * 10;

  const pRight = pctX + pctW;
  const pBottom = pctY + pctH;

  // Check overlap
  return !(pctX >= safeArea.right || pRight <= safeArea.x || pctY >= safeArea.bottom || pBottom <= safeArea.y);
}


// ─── Main Component ───────────────────────────────────────────
export default function LogoUploader({ logoConfig, onLogoChange }) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(async (file) => {
    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan PNG atau JPEG.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Ukuran file terlalu besar (maks 2 MB). File Anda: ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }

    setIsLoading(true);
    try {
      const dataUri = await readFileAsDataURL(file);
      const dimensions = await validateImageData(dataUri);

      onLogoChange({
        enabled: true,
        dataUri,
        position: logoConfig?.position || 'top-right',
        size: logoConfig?.size || 'medium',
        originalName: file.name,
        mimeType: file.type,
        naturalWidth: dimensions.width,
        naturalHeight: dimensions.height,
      });

      toast.success('Logo berhasil diunggah!');
    } catch (err) {
      toast.error(err.message || 'Gagal memproses file logo.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [logoConfig, onLogoChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemoveLogo = () => {
    onLogoChange(null);
    toast.success('Logo dihapus.');
  };

  const handlePositionChange = (pos) => {
    if (!logoConfig?.enabled) return;
    onLogoChange({ ...logoConfig, position: pos });
  };

  const handleSizeChange = (sz) => {
    if (!logoConfig?.enabled) return;
    onLogoChange({ ...logoConfig, size: sz });
  };

  const hasLogo = logoConfig?.enabled && logoConfig?.dataUri;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Logo Presentasi
        </label>
        <p className="text-[11px] text-gray-400">
          Opsional. Logo akan ditampilkan pada seluruh slide. Sarankan PNG transparan agar hasil lebih rapi.
        </p>
      </div>

      {/* Upload Area or Preview */}
      {!hasLogo ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Memproses file...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Unggah Logo</span>
              <span className="text-[10px] text-gray-400">PNG atau JPEG, maks 2 MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Logo Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <div className="w-16 h-12 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={logoConfig.dataUri}
                alt="Logo preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{logoConfig.originalName}</p>
              <p className="text-[10px] text-gray-400">
                {logoConfig.naturalWidth}×{logoConfig.naturalHeight}px · {logoConfig.mimeType === 'image/png' ? 'PNG' : 'JPEG'}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                title="Ganti Logo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="p-1.5 rounded border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                title="Hapus Logo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>

          {/* Position Selector - Radio Cards */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              Posisi Logo pada Semua Slide
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LOGO_POSITIONS.map((pos) => {
                const isActive = logoConfig.position === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handlePositionChange(pos.id)}
                    className={`relative p-2.5 rounded-lg border transition-all text-left ${
                      isActive
                        ? 'border-gray-900 bg-gray-50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Mini slide illustration */}
                    <div className="w-full aspect-[16/9] bg-white border border-gray-200 rounded mb-1.5 relative overflow-hidden">
                      <div
                        className={`absolute w-3 h-2 bg-gray-900 rounded-sm ${
                          pos.row === 'top' ? 'top-1' : 'bottom-1'
                        } ${pos.col === 'left' ? 'left-1' : 'right-1'}`}
                      />
                      {/* Content placeholder lines */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="space-y-0.5">
                          <div className="w-6 h-0.5 bg-gray-200 rounded" />
                          <div className="w-5 h-0.5 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {pos.label}
                    </span>
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-gray-900 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              Ukuran Logo
            </label>
            <div className="flex gap-2">
              {LOGO_SIZES.map((sz) => {
                const isActive = (logoConfig.size || 'medium') === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => handleSizeChange(sz.id)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info tip */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Logo akan muncul di preview slide dan tertanam dalam file PPTX hasil unduhan. Warna asli logo dipertahankan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { LOGO_POSITIONS, LOGO_SIZES };
