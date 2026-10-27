import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  RotateCcw,
  Palette,
  Layout,
  Type,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Move,
  Maximize2,
  Grid,
  Square,
  HelpCircle,
  AlertTriangle,
  Layers,
  Info,
} from 'lucide-react';
import AlignmentGuidelines from './AlignmentGuidelines';
import TextFormattingToolbar from './TextFormattingToolbar';
import { autoResizeTextarea } from '../../utils/autoResizeTextarea';
import {
  LAYOUT_OPTIONS,
  LAYOUT_DEFINITIONS,
  renderLayout,
  applyLayoutToSlide,
} from '../../utils/layoutRenderer';

/**
 * Determine if a hex color is dark or light for optimal contrast
 */
function isColorDark(hex) {
  if (!hex) return true;
  const cleanHex = hex.replace('#', '').trim();
  let r = 15, g = 23, b = 42;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  }
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

export default function SlidePreview({
  slides = [],
  originalSlides = [],
  recommendations = {},
  onEdit,
  onReset,
  onNext,
  onPrev,
  onSaveDraft,
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editedSlides, setEditedSlides] = useState(slides);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);
  const [useSnapToGrid, setUseSnapToGrid] = useState(true);

  const canvasRef = useRef(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 960, height: 540 });

  // Sync internal state if slides prop updates
  useEffect(() => {
    if (slides && slides.length > 0) {
      // Ensure each placeholder has formatting properties initialized
      const initialized = slides.map((slide) => ({
        ...slide,
        placeholders: (slide.placeholders || []).map((p) => ({
          ...p,
          originalPosition: p.originalPosition || { ...p.position },
          font: p.font || 'Montserrat',
          fontSize: p.fontSize || (p.id?.startsWith('title') ? 36 : 16),
          color: p.color || (isColorDark(slide.background?.color || '#FFFFFF') ? '#FFFFFF' : '#1F2937'),
          isBold: p.isBold || false,
          isItalic: p.isItalic || false,
          isUnderline: p.isUnderline || false,
          align: p.align || 'left',
          lineHeight: p.lineHeight || 1.5,
        })),
      }));
      setEditedSlides(initialized);
    }
  }, [slides]);

  // Clean up selection when switching slides (Prevents ghost/stale state - Fix Bug 1)
  useEffect(() => {
    setSelectedElementId(null);
    setIsEditingText(false);
    setShowFormattingToolbar(false);
  }, [currentSlideIndex]);

  // Measure canvas DOM size for responsive scaling
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasDimensions({
          width: canvasRef.current.clientWidth || 960,
          height: canvasRef.current.clientHeight || 540,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [currentSlideIndex]);

  const currentSlide = editedSlides[currentSlideIndex] || {
    slideNumber: 1,
    slideType: 'content',
    layoutId: 'three-points',
    layout: 'three-points',
    placeholders: [],
    background: { color: '#FFFFFF' },
  };

  const currentLayoutId = currentSlide.layoutId || currentSlide.layout || 'three-points';
  const layoutDef = renderLayout(currentLayoutId);

  // Hitung jumlah poin aktual pada slide (elemen non-title & non-subtitle)
  const actualPointsCount = (currentSlide.placeholders || []).filter(
    (p) => !p.id?.startsWith('title') && !p.id?.startsWith('subtitle') && !p.id?.startsWith('presenter') && !p.id?.startsWith('contact')
  ).length;

  // Cek apakah jumlah poin sesuai dengan rekomendasi layout
  let isPointMismatch = false;
  let mismatchWarning = '';
  if (layoutDef && layoutDef.recommendedPoints !== undefined) {
    const rec = layoutDef.recommendedPoints;
    if (typeof rec === 'number') {
      if (actualPointsCount !== rec && layoutDef.category === 'content') {
        isPointMismatch = true;
        mismatchWarning = `Layout "${layoutDef.name}" direkomendasikan untuk ${rec} poin, sedangkan slide ini memiliki ${actualPointsCount} poin.`;
      }
    } else if (Array.isArray(rec)) {
      if (!rec.includes(actualPointsCount) && layoutDef.category === 'content') {
        isPointMismatch = true;
        mismatchWarning = `Layout "${layoutDef.name}" direkomendasikan untuk ${rec.join('/')} poin, sedangkan slide ini memiliki ${actualPointsCount} poin.`;
      }
    }
  }

  const isDarkBg = isColorDark(currentSlide.background?.color || '#FFFFFF');

  // Slide navigation with bounds checking and selection reset
  const handleSlideChange = (newIndex) => {
    if (newIndex < 0 || newIndex >= editedSlides.length) return;
    setSelectedElementId(null);
    setIsEditingText(false);
    setCurrentSlideIndex(newIndex);
  };

  // Drag stop handler - konversi koordinat pixel ke sistem persentase (0-100%)
  const handleDragStop = (elementId, position) => {
    const cWidth = canvasDimensions.width || 960;
    const cHeight = canvasDimensions.height || 540;

    const updatedSlides = [...editedSlides];
    const slide = { ...updatedSlides[currentSlideIndex] };
    const placeholders = [...slide.placeholders];
    const pIdx = placeholders.findIndex((p) => p.id === elementId);

    if (pIdx !== -1) {
      const target = { ...placeholders[pIdx] };
      const newX = Math.max(0, Math.min(95, Number(((position.x / cWidth) * 100).toFixed(1))));
      const newY = Math.max(0, Math.min(95, Number(((position.y / cHeight) * 100).toFixed(1))));

      target.position = {
        ...target.position,
        x: newX,
        y: newY,
      };

      placeholders[pIdx] = target;
      slide.placeholders = placeholders;
      updatedSlides[currentSlideIndex] = slide;
      setEditedSlides(updatedSlides);
      if (onEdit) onEdit(updatedSlides);
    }
  };

  // Resize stop handler - konversi ukuran pixel ke sistem persentase (0-100%)
  const handleResizeStop = (elementId, size, position) => {
    const cWidth = canvasDimensions.width || 960;
    const cHeight = canvasDimensions.height || 540;

    const updatedSlides = [...editedSlides];
    const slide = { ...updatedSlides[currentSlideIndex] };
    const placeholders = [...slide.placeholders];
    const pIdx = placeholders.findIndex((p) => p.id === elementId);

    if (pIdx !== -1) {
      const target = { ...placeholders[pIdx] };
      const newW = Math.max(5, Math.min(100, Number(((size.width / cWidth) * 100).toFixed(1))));
      const newH = Math.max(3, Math.min(100, Number(((size.height / cHeight) * 100).toFixed(1))));
      const newX = Math.max(0, Math.min(95, Number(((position.x / cWidth) * 100).toFixed(1))));
      const newY = Math.max(0, Math.min(95, Number(((position.y / cHeight) * 100).toFixed(1))));

      target.position = {
        ...target.position,
        w: newW,
        h: newH,
        x: newX,
        y: newY,
      };

      placeholders[pIdx] = target;
      slide.placeholders = placeholders;
      updatedSlides[currentSlideIndex] = slide;
      setEditedSlides(updatedSlides);
      if (onEdit) onEdit(updatedSlides);
    }
  };

  // Text content edit
  const handlePlaceholderEdit = (placeholderId, newContent) => {
    const updated = [...editedSlides];
    const targetSlide = { ...updated[currentSlideIndex] };
    const placeholders = [...(targetSlide.placeholders || [])];

    const pIndex = placeholders.findIndex((p) => p.id === placeholderId);
    if (pIndex !== -1) {
      placeholders[pIndex] = {
        ...placeholders[pIndex],
        content: newContent,
      };
      targetSlide.placeholders = placeholders;
      updated[currentSlideIndex] = targetSlide;
      setEditedSlides(updated);
      if (onEdit) onEdit(updated);
    }
  };

  // Element click handler (shows toolbar if text element)
  const handleElementClick = (elementId) => {
    setSelectedElementId(elementId);
    const placeholder = currentSlide.placeholders?.find((p) => p.id === elementId);
    if (placeholder && placeholder.type === 'text') {
      setShowFormattingToolbar(true);
    } else {
      setShowFormattingToolbar(false);
    }
  };

  // Close formatting toolbar handler
  const handleCloseToolbar = () => {
    setShowFormattingToolbar(false);
    setSelectedElementId(null);
  };

  // Update element properties handler (font, size, style, align, color, line-height)
  const handleUpdateElement = (updatedElement) => {
    const updatedSlides = [...editedSlides];
    const slide = { ...updatedSlides[currentSlideIndex] };
    const placeholders = [...(slide.placeholders || [])];
    const placeholderIndex = placeholders.findIndex(
      (p) => p.id === (updatedElement.id || selectedElementId)
    );

    if (placeholderIndex !== -1) {
      placeholders[placeholderIndex] = {
        ...placeholders[placeholderIndex],
        ...updatedElement,
      };
      slide.placeholders = placeholders;
      updatedSlides[currentSlideIndex] = slide;
      setEditedSlides(updatedSlides);
      if (onEdit) onEdit(updatedSlides);
    }
  };

  // Keyboard shortcuts for formatting (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+L, Ctrl+E, Ctrl+R, Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const selectedEl = currentSlide.placeholders?.find((p) => p.id === selectedElementId);
      if (!selectedEl || selectedEl.type !== 'text') return;

      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      const key = e.key.toLowerCase();

      // Ctrl+B / Cmd+B - Bold
      if (key === 'b') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, isBold: !selectedEl.isBold });
      }
      // Ctrl+I / Cmd+I - Italic
      else if (key === 'i') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, isItalic: !selectedEl.isItalic });
      }
      // Ctrl+U / Cmd+U - Underline
      else if (key === 'u') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, isUnderline: !selectedEl.isUnderline });
      }
      // Ctrl+L / Cmd+L - Align Left
      else if (key === 'l') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, align: 'left' });
      }
      // Ctrl+E / Cmd+E - Align Center
      else if (key === 'e') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, align: 'center' });
      }
      // Ctrl+R / Cmd+R - Align Right
      else if (key === 'r') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, align: 'right' });
      }
      // Ctrl+J / Cmd+J - Align Justify
      else if (key === 'j') {
        e.preventDefault();
        handleUpdateElement({ ...selectedEl, align: 'justify' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, editedSlides, currentSlideIndex]);

  // Numeric input change for selected element's X, Y, W, H (%)
  const handleNumericPropChange = (prop, percentVal) => {
    if (!selectedElementId) return;
    const num = parseFloat(percentVal);
    if (isNaN(num)) return;

    const updated = [...editedSlides];
    const targetSlide = { ...updated[currentSlideIndex] };
    const placeholders = [...(targetSlide.placeholders || [])];
    const pIndex = placeholders.findIndex((p) => p.id === selectedElementId);

    if (pIndex !== -1) {
      const p = { ...placeholders[pIndex] };
      const clampedPercent = Math.max(0, Math.min(100, num));
      const unitVal = Number((clampedPercent / 10).toFixed(2));

      p.position = {
        ...p.position,
        [prop]: unitVal,
      };

      placeholders[pIndex] = p;
      targetSlide.placeholders = placeholders;
      updated[currentSlideIndex] = targetSlide;
      setEditedSlides(updated);
      if (onEdit) onEdit(updated);
    }
  };

  // Layout preset change - Memetakan ulang posisi poin ke layout baru
  const handleLayoutChange = (newLayoutId) => {
    const updated = [...editedSlides];
    const targetSlide = updated[currentSlideIndex];
    if (!targetSlide) return;

    const remappedSlide = applyLayoutToSlide(targetSlide, newLayoutId, {
      fonts: recommendations?.fonts,
      colors: recommendations?.colors,
    });

    updated[currentSlideIndex] = remappedSlide;
    setEditedSlides(updated);
    setSelectedElementId(null);
    setIsEditingText(false);
    if (onEdit) onEdit(updated);
  };

  // Background color change
  const handleBackgroundChange = (newColor) => {
    const updated = [...editedSlides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      background: { ...updated[currentSlideIndex].background, color: newColor },
    };
    setEditedSlides(updated);
    if (onEdit) onEdit(updated);
  };

  // Reset current slide layout
  const handleResetCurrentSlideLayout = () => {
    const updated = [...editedSlides];
    const slide = { ...updated[currentSlideIndex] };
    const original = originalSlides?.[currentSlideIndex];

    slide.placeholders = slide.placeholders.map((p, idx) => {
      const origPos = p.originalPosition || original?.placeholders?.[idx]?.position || p.position;
      return {
        ...p,
        position: { ...origPos },
      };
    });

    updated[currentSlideIndex] = slide;
    setEditedSlides(updated);
    setSelectedElementId(null);
    if (onEdit) onEdit(updated);
  };

  // Reset all slides to initial AI recommendations
  const handleResetAll = () => {
    if (onReset) {
      onReset();
    } else if (originalSlides && originalSlides.length > 0) {
      setEditedSlides(JSON.parse(JSON.stringify(originalSlides)));
      if (onEdit) onEdit(originalSlides);
    }
  };

  const selectedPlaceholder = currentSlide.placeholders?.find((p) => p.id === selectedElementId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Steps */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
            <Eye className="w-3.5 h-3.5" />
            Langkah 4 dari 5
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Preview & Custom Layout Editor</h2>
          <p className="text-sm text-dark-400 mt-1">
            Gunakan mode interaktif untuk mengatur posisi, ukuran, dan teks elemen slide secara langsung.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Snap to grid toggle */}
          {isEditMode && (
            <button
              type="button"
              onClick={() => setUseSnapToGrid(!useSnapToGrid)}
              className={`btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 transition-colors ${
                useSnapToGrid ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'text-dark-400'
              }`}
              title="Snap to Grid (10px)"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Snap Grid: {useSnapToGrid ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetCurrentSlideLayout}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-dark-300 hover:text-white"
            title="Kembalikan posisi elemen slide ini ke default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          {/* Edit Mode Toggle Switch */}
          <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-brand-500/40 bg-brand-500/10 cursor-pointer select-none hover:bg-brand-500/20 transition-all">
            <input
              type="checkbox"
              checked={isEditMode}
              onChange={(e) => {
                setIsEditMode(e.target.checked);
                if (!e.target.checked) setSelectedElementId(null);
              }}
              className="w-4 h-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-300">
              <Move className="w-3.5 h-3.5" />
              <span>Edit Mode (Drag & Resize)</span>
            </div>
          </label>
        </div>
      </div>

      {/* Slide Navigation Header & Layout Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-dark-900/60 p-3 rounded-xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-1 bg-brand-500/20 text-brand-300 text-xs font-bold rounded-lg border border-brand-500/30">
            Slide {currentSlideIndex + 1} / {editedSlides.length}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm">
            <Layout className="w-3.5 h-3.5 text-blue-400" />
            <span>Layout: {layoutDef.name}</span>
          </span>
          <span className="text-xs font-semibold text-white truncate max-w-xs">
            {currentSlide.name || `Slide #${currentSlideIndex + 1}`}
          </span>
          {isEditMode && (
            <span className="text-[11px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Move className="w-2.5 h-2.5" /> Drag & Resize Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleSlideChange(currentSlideIndex - 1)}
            disabled={currentSlideIndex === 0}
            className="p-1.5 rounded-lg border border-white/10 text-dark-300 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Slide Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleSlideChange(currentSlideIndex + 1)}
            disabled={currentSlideIndex === editedSlides.length - 1}
            className="p-1.5 rounded-lg border border-white/10 text-dark-300 hover:text-white hover:bg-dark-800 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Slide Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Warning Banner: Peringatan jika jumlah poin tidak sesuai rekomendasi layout */}
      {isPointMismatch && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs animate-fade-in shadow-lg">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium tracking-wide">{mismatchWarning}</span>
        </div>
      )}

      {/* Formatting Toolbar (Header) for Selected Text Element */}
      {showFormattingToolbar && selectedPlaceholder && selectedPlaceholder.type === 'text' && (
        <div className="w-full max-w-4xl mx-auto">
          <TextFormattingToolbar
            selectedElement={selectedPlaceholder}
            onUpdate={handleUpdateElement}
            onClose={handleCloseToolbar}
          />
        </div>
      )}

      {/* Main Slide Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-dark-950 p-3 md:p-6 flex items-center justify-center">
        <div
          key={`slide-preview-${currentSlideIndex}-${currentSlide?.slideNumber || currentSlideIndex}`}
          ref={canvasRef}
          className="w-full max-w-4xl aspect-[16/9] rounded-xl overflow-hidden relative shadow-2xl border border-white/10 transition-all select-none slide-preview-container"
          style={{
            backgroundColor: currentSlide.background?.color || '#FFFFFF',
            maxWidth: '960px',
          }}
          onClick={(e) => {
            // Deselect element if user clicks directly on slide canvas background
            if (e.target === e.currentTarget) {
              handleCloseToolbar();
            }
          }}
        >
          {/* Subtle Decorative Accent for non-title/closing slides */}
          {currentSlide.slideType !== 'title' && currentSlide.slideType !== 'closing' && (
            <div
              className="absolute left-[10%] top-[22%] w-[12%] h-[3px] rounded-full z-0 opacity-80 pointer-events-none"
              style={{ backgroundColor: recommendations?.colors?.accent || '#3B82F6' }}
            />
          )}

          {/* Visual Alignment Guidelines when dragging/editing */}
          {isEditMode && selectedElementId && (
            <AlignmentGuidelines
              placeholders={currentSlide.placeholders}
              selectedElementId={selectedElementId}
              canvasWidth={canvasDimensions.width}
              canvasHeight={canvasDimensions.height}
            />
          )}

          {/* Placeholders rendered with Rnd (React Draggable & Resizable) */}
          {currentSlide.placeholders?.map((placeholder, idx) => {
            const isText = placeholder.type === 'text';
            const isSelected = selectedElementId === placeholder.id;
            const textColor = placeholder.color || (isDarkBg ? '#FFFFFF' : '#1F2937');

            // Convert coordinate system to current canvas pixels (supports 0-100% and 0-10 units)
            const cW = canvasDimensions.width || 960;
            const cH = canvasDimensions.height || 540;

            const rawX = parseFloat(placeholder.position?.x) || 0;
            const rawY = parseFloat(placeholder.position?.y) || 0;
            const rawW = parseFloat(placeholder.position?.w) || 10;
            const rawH = parseFloat(placeholder.position?.h) || 10;

            // Check if coordinate is in percent system (0-100%) or unit system (0-10)
            const isPercent = rawW > 10 || rawH > 10 || rawX > 10 || rawY > 10 || currentSlide.layoutId;
            const pctX = isPercent ? rawX / 100 : rawX / 10;
            const pctY = isPercent ? rawY / 100 : rawY / 10;
            const pctW = isPercent ? rawW / 100 : rawW / 10;
            const pctH = isPercent ? rawH / 100 : rawH / 10;

            const pixelX = Math.round(pctX * cW);
            const pixelY = Math.round(pctY * cH);
            const pixelW = Math.max(50, Math.round(pctW * cW));
            const pixelH = Math.max(26, Math.round(pctH * cH));

            return (
              <Rnd
                key={`rnd-${placeholder.id}-${idx}-${currentSlideIndex}`}
                size={{ width: pixelW, height: pixelH }}
                position={{ x: pixelX, y: pixelY }}
                bounds="parent"
                enableResizing={
                  isEditMode
                    ? {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true,
                        topRight: true,
                        bottomRight: true,
                        bottomLeft: true,
                        topLeft: true,
                      }
                    : false
                }
                disableDragging={!isEditMode}
                snap={
                  useSnapToGrid && isEditMode
                    ? { x: 10, y: 10 }
                    : undefined
                }
                onDragStop={(e, d) => handleDragStop(placeholder.id, d)}
                onResizeStop={(e, direction, ref, delta, position) => {
                  handleResizeStop(
                    placeholder.id,
                    {
                      width: parseInt(ref.style.width, 10),
                      height: parseInt(ref.style.height, 10),
                    },
                    position
                  );
                }}
                className={`absolute group transition-shadow ${
                  isEditMode ? 'cursor-move' : 'cursor-default'
                } ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-xl z-20'
                    : isEditMode
                    ? 'hover:ring-1 hover:ring-blue-400/60 z-10'
                    : 'z-10'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleElementClick(placeholder.id);
                }}
              >
                <div
                  className={`w-full h-full p-2 rounded relative flex flex-col justify-center transition-all ${
                    isEditMode
                      ? 'border border-dashed border-blue-400/70 bg-white/10 hover:bg-white/20'
                      : 'border border-transparent'
                  }`}
                  style={{ overflow: 'hidden' }}
                >
                  {isText ? (
                    isEditMode && isSelected ? (
                      <textarea
                        value={placeholder.content || ''}
                        onChange={(e) => {
                          handlePlaceholderEdit(placeholder.id, e.target.value);
                          autoResizeTextarea(e.target);
                        }}
                        placeholder="Ketik teks slide..."
                        className="w-full h-full bg-transparent outline-none slide-text-editor select-text"
                        style={{
                          fontFamily: placeholder.font || 'Montserrat',
                          fontSize: `${placeholder.fontSize || 16}px`,
                          color: placeholder.color || textColor,
                          fontWeight: placeholder.isBold ? 'bold' : 'normal',
                          fontStyle: placeholder.isItalic ? 'italic' : 'normal',
                          textDecoration: placeholder.isUnderline ? 'underline' : 'none',
                          textAlign: placeholder.align || 'left',
                          lineHeight: placeholder.lineHeight || 1.4,
                          border: 'none',
                          padding: '4px',
                        }}
                        rows={1}
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex flex-col justify-center transition-all ${
                          placeholder.id?.startsWith('point-') &&
                          !isDarkBg &&
                          currentSlide.layoutId !== 'table-of-contents'
                            ? 'bg-white/90 rounded-xl p-3 border border-gray-200/90 shadow-sm hover:shadow-md'
                            : currentSlide.layoutId === 'table-of-contents'
                            ? 'border-b border-gray-300 pb-2 justify-end'
                            : ''
                        }`}
                      >
                        {/* 1. Header Aksesori / Badge (Sesuai Base Layout PDF) */}
                        {placeholder.badge === 'arrow' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-dark-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                              →
                            </span>
                            <span className="text-[11px] font-bold tracking-wider uppercase text-dark-400">
                              Topik
                            </span>
                          </div>
                        )}

                        {placeholder.number && currentSlide.layoutId !== 'table-of-contents' && (
                          <span className="font-mono font-extrabold text-2xl tracking-tight text-blue-600 mb-1.5">
                            {placeholder.number}
                          </span>
                        )}

                        {placeholder.stepLabel && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-dark-900 text-white mb-2 self-start shadow-xs">
                            {placeholder.stepLabel}
                          </span>
                        )}

                        {placeholder.badge === 'stat' && (
                          <div className="w-14 h-14 rounded-full border-4 border-blue-600 bg-blue-50/50 flex items-center justify-center mx-auto mb-2 font-mono font-extrabold text-lg text-blue-700 shadow-inner">
                            {placeholder.content?.split('\n')[0] || '67%'}
                          </div>
                        )}

                        {placeholder.badge === 'rating' && (
                          <div className="flex flex-col items-center mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-sm shadow-xs mb-1">
                              👤
                            </div>
                            <span className="text-amber-500 text-[11px] font-bold tracking-wider">
                              ★★★★ 4.9/5
                            </span>
                          </div>
                        )}

                        {/* 2. Isi Teks Utama */}
                        <p
                          className="whitespace-pre-wrap select-text placeholder-element w-full"
                          style={{
                            fontFamily: placeholder.font || 'Montserrat',
                            fontSize: `${placeholder.fontSize || 16}px`,
                            color: placeholder.color || textColor,
                            fontWeight: placeholder.isBold || placeholder.id?.startsWith('title') ? 'bold' : 'normal',
                            fontStyle: placeholder.isItalic ? 'italic' : 'normal',
                            textDecoration: placeholder.isUnderline ? 'underline' : 'none',
                            textAlign: placeholder.align || 'left',
                            lineHeight: placeholder.lineHeight || 1.4,
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            overflow: 'hidden',
                            textShadow: placeholder.shadow
                              ? isDarkBg
                                ? '0 2px 4px rgba(0,0,0,0.6)'
                                : '0 1px 2px rgba(0,0,0,0.12)'
                              : 'none',
                          }}
                        >
                          {placeholder.content}
                        </p>
                      </div>
                    )
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                        isDarkBg ? 'border-white/20 bg-dark-900/50' : 'border-blue-300 bg-blue-50/60'
                      }`}
                    >
                      <span className="text-2xl mb-1">📊</span>
                      <span className={`text-xs font-semibold ${isDarkBg ? 'text-white' : 'text-blue-900'}`}>
                        {placeholder.placeholder || 'Area Grafik / Visual Chart'}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        Format visual presisi berbasis Base Layout
                      </span>
                    </div>
                  )}

                  {/* Corner Resize Handles Visual Indicators (Visible in Edit Mode when selected) */}
                  {isEditMode && isSelected && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-none shadow" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-none shadow" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-none shadow" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white rounded-full pointer-events-none shadow" />
                    </>
                  )}
                </div>
              </Rnd>
            );
          })}

          {/* Empty state fallback if slide has no placeholders */}
          {(!currentSlide?.placeholders || currentSlide.placeholders.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
              <p className="text-gray-500 text-sm">Tidak ada placeholder pada slide ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Panel for Selected Element */}
      {selectedPlaceholder && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300 max-w-4xl mx-auto flex items-center justify-between gap-2 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>
              Element terpilih: <strong className="text-white capitalize">{selectedPlaceholder.type === 'text' ? 'Teks' : 'Gambar'}</strong>
              {selectedPlaceholder.type === 'text' && (
                <>
                  {selectedPlaceholder.font && (
                    <span className="ml-2 font-mono text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">
                      Font: {selectedPlaceholder.font}
                    </span>
                  )}
                  {selectedPlaceholder.fontSize && (
                    <span className="ml-2 font-mono text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">
                      Ukuran: {selectedPlaceholder.fontSize}pt
                    </span>
                  )}
                  {selectedPlaceholder.align && (
                    <span className="ml-2 font-mono text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">
                      Posisi: {selectedPlaceholder.align}
                    </span>
                  )}
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCloseToolbar}
            className="text-blue-400 hover:text-white text-xs underline font-medium ml-auto flex-shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Position & Size Controls (For Selected Element in Edit Mode) */}
      {selectedElementId && isEditMode && selectedPlaceholder && (
        <div className="glass-card p-4 rounded-xl border border-blue-500/30 bg-dark-900/80 shadow-lg animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Posisi & Ukuran Elemen Terpilih ({selectedPlaceholder.type === 'text' ? 'Teks' : 'Gambar'})
              </h3>
            </div>
            <span className="text-[11px] text-dark-400 font-mono">
              ID: {selectedPlaceholder.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-dark-300 mb-1">
                X Position (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={Math.round((selectedPlaceholder.position?.x || 0) * 10)}
                onChange={(e) => handleNumericPropChange('x', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-dark-300 mb-1">
                Y Position (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={Math.round((selectedPlaceholder.position?.y || 0) * 10)}
                onChange={(e) => handleNumericPropChange('y', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-dark-300 mb-1">
                Width (%)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                step="1"
                value={Math.round((selectedPlaceholder.position?.w || 8) * 10)}
                onChange={(e) => handleNumericPropChange('w', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-dark-300 mb-1">
                Height (%)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                step="1"
                value={Math.round((selectedPlaceholder.position?.h || 1) * 10)}
                onChange={(e) => handleNumericPropChange('h', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide Thumbnails Strip (Scrollable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-dark-400 px-1">
          <span>Daftar Slide Deck ({editedSlides.length} Slide)</span>
          <span>Klik thumbnail untuk beralih</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {editedSlides.map((slide, index) => {
            const isCurrent = index === currentSlideIndex;
            const thumbDark = isColorDark(slide.background?.color || '#FFFFFF');
            const thumbTextColor = thumbDark ? '#FFFFFF' : '#1F2937';

            return (
              <button
                key={`thumbnail-${slide.slideNumber || index}-${index}`}
                type="button"
                onClick={() => handleSlideChange(index)}
                className={`flex-shrink-0 w-36 aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all relative group text-left p-2 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-brand-500 ring-2 ring-brand-500/40 shadow-lg shadow-brand-500/20'
                    : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                }`}
                style={{ backgroundColor: slide.background?.color || '#FFFFFF' }}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      thumbDark ? 'bg-dark-950/80 text-white' : 'bg-gray-200/90 text-gray-800'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold truncate max-w-[80px] ${
                      thumbDark ? 'text-white/80' : 'text-gray-600'
                    }`}
                  >
                    {renderLayout(slide.layoutId || slide.layout)?.name || slide.layoutId || slide.layout || 'Slide'}
                  </span>
                </div>
                <p
                  className="text-[10px] font-medium truncate w-full"
                  style={{ color: thumbTextColor }}
                >
                  {slide.placeholders?.[0]?.content || slide.name || `Slide ${index + 1}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Per-Slide Controls Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/10 bg-dark-900/60 flex flex-wrap items-center justify-between gap-4">
        {/* Layout Selector */}
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-brand-400" />
          <label className="text-xs text-dark-300 font-medium">Layout Slide:</label>
          <select
            value={currentLayoutId}
            onChange={(e) => handleLayoutChange(e.target.value)}
            className="input text-xs py-1.5 px-3 bg-white text-gray-900 border-gray-300 rounded-lg font-medium shadow-sm cursor-pointer"
          >
            {['Cover & Penutup', 'Agenda', 'Konten Poin', 'Khusus'].map((grp) => (
              <optgroup key={grp} label={grp} className="font-semibold text-gray-500">
                {LAYOUT_OPTIONS.filter((opt) => opt.group === grp).map((opt) => (
                  <option key={opt.value} value={opt.value} className="font-medium text-gray-900">
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Background Color Picker per slide */}
        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-amber-400" />
          <label className="text-xs text-dark-300 font-medium">Warna Background Slide:</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentSlide.background?.color || '#FFFFFF'}
              onChange={(e) => handleBackgroundChange(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0.5"
            />
            <span className="text-xs font-mono text-dark-300 uppercase">
              {currentSlide.background?.color || '#FFFFFF'}
            </span>
          </div>
        </div>

        {/* Reset this slide */}
        <button
          type="button"
          onClick={handleResetCurrentSlideLayout}
          className="text-xs text-dark-400 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-white/5 hover:border-white/20"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Posisi Slide Ini</span>
        </button>
      </div>

      {/* Footer Navigation */}
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
              className="btn-secondary text-xs flex items-center gap-1.5 py-2.5 px-3.5"
              title="Simpan progress draft ke database (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Draft</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onEdit) onEdit(editedSlides);
            }}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            className="btn-primary flex items-center gap-2"
          >
            <span>Lanjut ke Download</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
