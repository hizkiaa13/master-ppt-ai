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
  Minimize2,
  X,
  Grid,
  Square,
  HelpCircle,
  AlertTriangle,
  Layers,
  Info,
  Loader2,
} from 'lucide-react';
import AlignmentGuidelines from './AlignmentGuidelines';
import TextFormattingToolbar from './TextFormattingToolbar';
import PlaceholderModal from './PlaceholderModal';
import TypographyPanel from './TypographyPanel';
import LayoutThumbnail from './LayoutThumbnail';
import { LayoutCatalogModal } from './ManualLayoutSelector';
import toast from 'react-hot-toast';
import { autoResizeTextarea } from '../../utils/autoResizeTextarea';
import {
  LAYOUT_OPTIONS,
  LAYOUT_DEFINITIONS,
  renderLayout,
  applyLayoutToSlide,
} from '../../utils/layoutRenderer';
import { isDummyText } from '../../utils/slideContentValidator';
import { generateTopicDerivedSubtopics } from '../../utils/topicSubtopicsGenerator';
import { regenerateSlideContent } from '../../services/ai';
import { computeLogoPercent, doesOverlapLogo, LOGO_POSITIONS, LOGO_SIZES } from './LogoUploader';
import {
  resolvePlaceholderTypography,
  resolveSpacingConfig,
  equalizePointCardHeights,
  DEFAULT_TYPOGRAPHY_CONFIG,
} from '../../utils/typographySystem';

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
  presentationTitle = '',
  logoConfig = null,
  onLogoChange,
  typographyConfig = DEFAULT_TYPOGRAPHY_CONFIG,
  onTypographyChange,
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
  const [showPlaceholderModal, setShowPlaceholderModal] = useState(false);
  const [isRegeneratingLayout, setIsRegeneratingLayout] = useState(false);
  const [zoomMode, setZoomMode] = useState('fit'); // 'fit' | '75' | '100'
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showLayoutCatalogModal, setShowLayoutCatalogModal] = useState(false);

  const handleInsertPlaceholder = (placeholderText) => {
    const currentSlide = editedSlides[currentSlideIndex];
    if (!currentSlide || !currentSlide.placeholders || currentSlide.placeholders.length === 0) return;

    let targetId = selectedElementId;
    if (!targetId) {
      const firstTextP = currentSlide.placeholders.find((p) => p.type === 'text');
      targetId = firstTextP?.id;
    }

    if (!targetId) {
      toast.error('Tidak ada elemen teks pada slide ini.');
      return;
    }

    const target = currentSlide.placeholders.find((p) => p.id === targetId);
    if (!target) return;

    const newContent = target.content && target.content.trim() !== ''
      ? `${target.content} ${placeholderText}`
      : placeholderText;

    handlePlaceholderEdit(targetId, newContent);
    toast.success(`Placeholder disisipkan: "${placeholderText.length > 25 ? placeholderText.slice(0, 25) + '...' : placeholderText}"`);
  };

  const containerRef = useRef(null);
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

  // Measure container DOM size and compute optimal 16:9 slide size with balanced padding
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const cW = container.clientWidth;
      const cH = container.clientHeight;
      if (cW <= 0 || cH <= 0) return;

      if (zoomMode === '100') {
        setCanvasDimensions({ width: 1200, height: 675 });
        return;
      }

      // Balanced padding around slide: generous on desktop, compact on mobile
      const paddingX = cW > 768 ? 48 : 20;
      const paddingY = cH > 600 ? 40 : 20;

      let availW = Math.max(280, cW - paddingX * 2);
      let availH = Math.max(160, cH - paddingY * 2);

      if (zoomMode === '75') {
        availW = availW * 0.75;
        availH = availH * 0.75;
      }

      let targetW, targetH;
      // 16:9 aspect ratio = 1.7777777778
      if (availW / availH > 16 / 9) {
        // Container is wider than 16:9 -> height is limiting factor
        targetH = Math.round(availH);
        targetW = Math.round(targetH * (16 / 9));
      } else {
        // Container is taller than 16:9 -> width is limiting factor
        targetW = Math.round(availW);
        targetH = Math.round(targetW * (9 / 16));
      }

      setCanvasDimensions({
        width: Math.max(300, targetW),
        height: Math.max(169, targetH),
      });
    };

    updateSize();

    let observer = null;
    if (window.ResizeObserver && containerRef.current) {
      observer = new ResizeObserver(() => {
        updateSize();
      });
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [currentSlideIndex, zoomMode]);

  // Keyboard navigation & ESC close for Fullscreen Modal
  useEffect(() => {
    if (!isFullscreenOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreenOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => Math.min(editedSlides.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, editedSlides.length]);

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

  // Layout preset change - Memetakan ulang posisi poin ke layout baru + AI regeneration jika poin bertambah
  const handleLayoutChange = async (newLayoutId) => {
    const updated = [...editedSlides];
    const targetSlide = updated[currentSlideIndex];
    if (!targetSlide) return;

    const currentLayoutDef = renderLayout(targetSlide.layoutId || 'three-points');
    const newLayoutDef = renderLayout(newLayoutId);
    const oldPointCount = currentLayoutDef.points?.length || 0;
    const newPointCount = newLayoutDef.points?.length || 0;

    // Kumpulkan konten yang sudah ada
    const existingContent = [];
    if (Array.isArray(targetSlide.content) && targetSlide.content.length > 0) {
      targetSlide.content.forEach((item) => {
        const text = typeof item === 'string' ? item : (item?.text || item?.content || '');
        const cleaned = text.replace(/^[•\-\*→]\s*/, '').replace(/^\d{1,2}\.\s*/, '').trim();
        if (cleaned && !isDummyText(cleaned)) existingContent.push(cleaned);
      });
    }
    if (existingContent.length === 0 && Array.isArray(targetSlide.placeholders)) {
      targetSlide.placeholders.forEach((p) => {
        if (p.id?.startsWith('point-') && p.type === 'text') {
          let raw = (p.content || '').replace(/^(→\s+|[•\-\*]\s+|\d{1,2}\.\s+|0\d\s+)/, '').trim();
          raw = raw.replace(/^(STEP\s+\d|Phase\s+\d|Tahap\s+\d)[:\n]+/i, '').trim();
          if (raw && !isDummyText(raw)) existingContent.push(raw);
        }
      });
    }

    // Jika poin bertambah → panggil AI regeneration dengan konteks penuh
    const slideTitle = targetSlide.title || targetSlide.placeholders?.find(p => p.id?.startsWith('title'))?.content || '';
    const presentationTopic = presentationTitle || recommendations?.title || slideTitle;

    if (newPointCount > oldPointCount && newPointCount > existingContent.length) {
      setIsRegeneratingLayout(true);

      try {
        const res = await regenerateSlideContent({
          slideNumber: targetSlide.slideNumber,
          currentLayoutId: targetSlide.layoutId,
          newLayoutId,
          slideTitle,
          slideTheme: presentationTopic,
          outputLanguage: targetSlide.outputLanguage || 'id',
          existingContent,
          newPointCount,
        });

        if (res?.success && res?.data?.points && Array.isArray(res.data.points)) {
          targetSlide.content = res.data.points.slice(0, newPointCount);
          if (res.data.isFallback) {
            toast('Konten disesuaikan secara lokal berdasarkan topik slide.', { icon: '💡' });
          } else {
            toast.success(`AI berhasil menyesuaikan ${newPointCount} poin konten!`);
          }
        } else {
          // AI tidak mengembalikan format yang valid → fallback dinamis berbasis kata kunci topik
          const fallbackPoints = generateTopicDerivedSubtopics({
            slideTitle,
            presentationTopic,
            existingPoints: existingContent,
            targetCount: newPointCount,
            isEn: (targetSlide.outputLanguage || 'id').toLowerCase() === 'en',
          });
          targetSlide.content = fallbackPoints;
          toast('Konten disesuaikan secara lokal berdasarkan topik slide.', { icon: '💡' });
        }
      } catch (aiErr) {
        console.warn('AI layout regeneration fallback:', aiErr.message);
        // Fallback dinamis langsung di client side agar tidak pernah muncul dummy text
        const fallbackPoints = generateTopicDerivedSubtopics({
          slideTitle,
          presentationTopic,
          existingPoints: existingContent,
          targetCount: newPointCount,
          isEn: (targetSlide.outputLanguage || 'id').toLowerCase() === 'en',
        });
        targetSlide.content = fallbackPoints;
        toast('Konten disesuaikan secara lokal berdasarkan topik slide.', { icon: '💡' });
      } finally {
        setIsRegeneratingLayout(false);
      }
    }

    // Jika poin berkurang → trim dari bawah, pertahankan poin teratas
    if (newPointCount < oldPointCount && newPointCount > 0 && existingContent.length > newPointCount) {
      targetSlide.content = existingContent.slice(0, newPointCount);
    }

    const remappedSlide = applyLayoutToSlide(targetSlide, newLayoutId, {
      fonts: recommendations?.fonts,
      colors: { primary: '#000000', secondary: '#1F2937', accent: '#000000' },
      outputLanguage: targetSlide.outputLanguage || 'id',
      presentationTopic,
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

  // Check if any placeholder in current slide overlaps with the logo
  const overlappingPlaceholders = logoConfig?.enabled
    ? (currentSlide.placeholders || []).filter((p) => doesOverlapLogo(p, logoConfig))
    : [];
  const hasLogoOverlap = overlappingPlaceholders.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Warning Banner: Peringatan jika jumlah poin tidak sesuai rekomendasi layout */}
      {isPointMismatch && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs animate-fade-in shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium tracking-wide">{mismatchWarning}</span>
        </div>
      )}

      {/* Warning Banner: Peringatan jika ada elemen yang bertabrakan dengan area logo */}
      {hasLogoOverlap && (
        <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-3 text-orange-900 text-xs animate-fade-in shadow-xs">
          <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
          <div>
            <span className="font-bold">Peringatan Area Logo:</span> Ada elemen teks/konten (
            {overlappingPlaceholders.map((p) => p.name || p.id).join(', ')}
            ) yang mendekati atau menutupi logo di sudut{' '}
            <span className="font-semibold">{logoConfig.position || 'kanan atas'}</span>. Silakan geser elemen secara manual agar tidak tumpang tindih.
          </div>
        </div>
      )}

      {/* Grid 2 Kolom (Preview ~75% Kiri, Kontrol ~25% Kanan di Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ==================== KOLOM KIRI (75%): PREVIEW SLIDE ==================== */}
        <div className="lg:col-span-9 flex flex-col space-y-3">
          {/* Formatting Toolbar (Sticky di atas slide saat elemen teks dipilih) */}
          {showFormattingToolbar && selectedPlaceholder && selectedPlaceholder.type === 'text' && (
            <div className="w-full animate-fade-in">
              <TextFormattingToolbar
                selectedElement={selectedPlaceholder}
                onUpdate={handleUpdateElement}
                onClose={handleCloseToolbar}
                onOpenPlaceholderModal={() => setShowPlaceholderModal(true)}
              />
            </div>
          )}

          {/* Top Bar Preview: Judul Slide, Zoom Mode & Fullscreen */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-lg bg-gray-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                #{currentSlideIndex + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-sm lg:max-w-md">
                  {currentSlide.placeholders?.find((p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul'))?.content || currentSlide.name || `Slide ${currentSlideIndex + 1}`}
                </h3>
                <span className="text-[10px] text-gray-500 font-medium">
                  Layout: <span className="text-gray-800 font-semibold">{layoutDef.name || currentLayoutId}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Mode Selector */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
                {[
                  { id: 'fit', label: 'Fit' },
                  { id: '75', label: '75%' },
                  { id: '100', label: '100%' },
                ].map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setZoomMode(z.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      zoomMode === z.id
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>

              {/* Fullscreen Expand Button */}
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(true)}
                className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs text-gray-800 font-semibold shadow-xs hover:bg-gray-100"
                title="Perbesar Penuh (Fullscreen Modal)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-gray-800" />
                <span className="hidden sm:inline">Perbesar Penuh</span>
              </button>
            </div>
          </div>

          {/* Canvas Container Slide — area abu terang, slide terpusat */}
          <div
            ref={containerRef}
            className={`relative rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center ${
              zoomMode === '100' ? 'overflow-auto' : 'overflow-hidden'
            }`}
            style={{
              backgroundColor: '#F9FAFB',
              height: 'calc(100vh - 240px)',
              minHeight: '360px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseToolbar();
              }
            }}
          >
            <div
              key={`slide-preview-${currentSlideIndex}-${currentSlide?.slideNumber || currentSlideIndex}`}
              ref={canvasRef}
              className="rounded-lg overflow-hidden relative select-none slide-preview-container bg-white flex-shrink-0"
              style={{
                backgroundColor: currentSlide.background?.color || '#FFFFFF',
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid #E5E7EB',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCloseToolbar();
                }
              }}
            >
              {/* Subtle Loading Indicator saat regenerasi sub-bab */}
              {isRegeneratingLayout && (
                <div className="absolute top-3 right-3 z-30 bg-white/95 backdrop-blur-xs border border-gray-300 rounded-full px-3 py-1 shadow-sm flex items-center gap-2 pointer-events-none animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-900" />
                  <span className="text-[11px] font-semibold text-gray-800">Menyesuaikan sub-bab topik...</span>
                </div>
              )}

              {/* Visual Alignment Guidelines saat dragging/editing */}
              {isEditMode && selectedElementId && (
                <AlignmentGuidelines
                  placeholders={currentSlide.placeholders}
                  selectedElementId={selectedElementId}
                  canvasWidth={canvasDimensions.width}
                  canvasHeight={canvasDimensions.height}
                />
              )}

              {/* Global Presentation Logo */}
              {logoConfig?.enabled && logoConfig?.dataUri && (() => {
                const logoPct = computeLogoPercent(logoConfig);
                if (!logoPct) return null;
                return (
                  <div
                    key="global-slide-logo"
                    className="absolute pointer-events-none select-none z-10 flex items-center justify-center"
                    style={{
                      left: `${logoPct.x}%`,
                      top: `${logoPct.y}%`,
                      width: `${logoPct.w}%`,
                      height: `${logoPct.h}%`,
                    }}
                    title={`Logo Presentasi (${logoConfig.originalName || 'Logo'})`}
                  >
                    <img
                      src={logoConfig.dataUri}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                );
              })()}

              {/* Placeholders rendered with Rnd (Tinggi kartu di baris yang sama disetarakan) */}
              {(() => {
                const spacing = resolveSpacingConfig(typographyConfig);
                const displayPlaceholders = equalizePointCardHeights(
                  currentSlide.placeholders || [],
                  typographyConfig,
                  currentSlide.layoutId,
                  canvasDimensions.width || 960,
                  canvasDimensions.height || 540
                );

                return displayPlaceholders.map((placeholder, idx) => {
                  const isText = placeholder.type === 'text';
                  const isSelected = selectedElementId === placeholder.id;

                  // Resolve typography token from global typographyConfig
                  const typo = resolvePlaceholderTypography(placeholder, typographyConfig, isDarkBg);
                  const textColor = typo.color;

                  const cW = canvasDimensions.width || 960;
                  const cH = canvasDimensions.height || 540;

                  const rawX = parseFloat(placeholder.position?.x) || 0;
                  const rawY = parseFloat(placeholder.position?.y) || 0;
                  const rawW = parseFloat(placeholder.position?.w) || 10;
                  const rawH = parseFloat(placeholder.position?.h) || 10;

                  const isPercent = rawW > 10 || rawH > 10 || rawX > 10 || rawY > 10 || currentSlide.layoutId;
                  const pctX = isPercent ? rawX / 100 : rawX / 10;
                  const pctY = isPercent ? rawY / 100 : rawY / 10;
                  const pctW = isPercent ? rawW / 100 : rawW / 10;
                  const pctH = isPercent ? rawH / 100 : rawH / 10;

                  const pixelX = Math.round(pctX * cW);
                  const pixelY = Math.round(pctY * cH);
                  const pixelW = Math.max(50, Math.round(pctW * cW));
                  const pixelH = Math.max(26, Math.round(pctH * cH));

                  const isPointCard =
                    placeholder.id?.startsWith('point-') &&
                    !isDarkBg &&
                    currentSlide.layoutId !== 'table-of-contents';

                  return (
                    <Rnd
                      key={`rnd-${placeholder.id}-${idx}-${currentSlideIndex}`}
                      size={{ width: pixelW, height: pixelH }}
                      position={{ x: pixelX, y: pixelY }}
                      bounds="parent"
                      enableResizing={
                        isEditMode
                          ? {
                              top: true, right: true, bottom: true, left: true,
                              topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
                            }
                          : false
                      }
                      disableDragging={!isEditMode}
                      snap={useSnapToGrid && isEditMode ? { x: Math.max(8, Math.round(cW / 48)), y: Math.max(8, Math.round(cH / 27)) } : undefined}
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
                          ? 'ring-1 ring-gray-500 shadow-md z-20'
                          : isEditMode
                          ? 'hover:ring-1 hover:ring-gray-300 z-10'
                          : 'z-10'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleElementClick(placeholder.id);
                      }}
                    >
                      <div
                        className={`w-full h-full p-2 rounded relative flex flex-col justify-start transition-all ${
                          isEditMode
                            ? isSelected
                              ? 'border border-solid border-gray-400 bg-white/80'
                              : 'border border-dashed border-gray-300/60 bg-transparent'
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
                                fontFamily: typo.fontFamily,
                                fontSize: `${typo.fontSize}px`,
                                color: typo.color,
                                fontWeight: typo.fontWeight,
                                fontStyle: placeholder.isItalic ? 'italic' : 'normal',
                                textDecoration: placeholder.isUnderline ? 'underline' : 'none',
                                textAlign: placeholder.align || typo.align || 'left',
                                lineHeight: spacing.lineHeightBody,
                                letterSpacing: typo.letterSpacing ? `${typo.letterSpacing}px` : undefined,
                                border: 'none',
                                padding: '4px',
                              }}
                              rows={1}
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex flex-col justify-start text-left transition-all ${
                                isPointCard
                                  ? 'bg-white rounded-lg border border-gray-200 shadow-xs'
                                  : currentSlide.layoutId === 'table-of-contents'
                                  ? 'border-b border-gray-200 pb-2 justify-end'
                                  : ''
                              }`}
                              style={{
                                padding: isPointCard ? `${spacing.cardPadding}px` : '4px',
                                overflow: 'hidden',
                              }}
                            >
                              {/* Header Aksesori / Badge */}
                              {placeholder.badge === 'arrow' && (
                                <div
                                  className="flex items-center gap-2"
                                  style={{ marginBottom: `${spacing.gapTitleToBody}px` }}
                                >
                                  <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                    →
                                  </span>
                                  <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500">
                                    Topik
                                  </span>
                                </div>
                              )}

                              {placeholder.number && currentSlide.layoutId !== 'table-of-contents' && (
                                <span
                                  className="font-mono font-bold text-xl tracking-tight text-gray-900"
                                  style={{ marginBottom: `${spacing.gapTitleToBody}px` }}
                                >
                                  {placeholder.number}
                                </span>
                              )}

                              {placeholder.stepLabel && (
                                <span
                                  className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-900 text-white self-start shadow-xs"
                                  style={{ marginBottom: `${spacing.gapTitleToBody}px` }}
                                >
                                  {placeholder.stepLabel}
                                </span>
                              )}

                              {placeholder.badge === 'stat' && (
                                <div
                                  className="w-12 h-12 rounded-full border-2 border-gray-900 bg-gray-50 flex items-center justify-center mx-auto font-mono font-bold text-base text-gray-900 shadow-xs"
                                  style={{ marginBottom: `${spacing.gapTitleToBody}px` }}
                                >
                                  {placeholder.content?.split('\n')[0] || '67%'}
                                </div>
                              )}

                              {placeholder.badge === 'rating' && (
                                <div
                                  className="flex flex-col items-center"
                                  style={{ marginBottom: `${spacing.gapTitleToBody}px` }}
                                >
                                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm mb-1">
                                    👤
                                  </div>
                                  <span className="text-gray-800 text-[11px] font-semibold tracking-wider">
                                    ★★★★ 4.9/5
                                  </span>
                                </div>
                              )}

                              {/* Isi Teks Utama dengan reset margin & jarak paragraf konsisten */}
                              <div className="w-full flex-1 overflow-hidden flex flex-col">
                                {(placeholder.content || '').split(/\n\n+/).map((para, pIdx, arr) => {
                                  const colonMatch = isPointCard && typeof para === 'string' && para.match(/^([^:\n]{2,45}):\s*([\s\S]+)$/);
                                  return (
                                    <div
                                      key={pIdx}
                                      className="whitespace-pre-wrap select-text placeholder-element w-full m-0 p-0"
                                      style={{
                                        fontFamily: typo.fontFamily,
                                        fontSize: `${typo.fontSize}px`,
                                        color: typo.color,
                                        fontWeight: typo.fontWeight,
                                        fontStyle: placeholder.isItalic ? 'italic' : 'normal',
                                        textDecoration: placeholder.isUnderline ? 'underline' : 'none',
                                        textAlign: placeholder.align || typo.align || 'left',
                                        lineHeight: spacing.lineHeightBody,
                                        letterSpacing: typo.letterSpacing ? `${typo.letterSpacing}px` : undefined,
                                        marginBottom: pIdx < arr.length - 1 ? `${spacing.gapBetweenParagraphs}px` : '0px',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {colonMatch ? (
                                        <>
                                          <strong className="font-bold text-gray-900 block mb-0.5">{colonMatch[1]}:</strong>
                                          <span>{colonMatch[2]}</span>
                                        </>
                                      ) : (
                                        para
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        ) : (
                          <div
                            className="w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50"
                          >
                            <span className="text-xl mb-1">📊</span>
                            <span className="text-xs font-semibold text-gray-800">
                              {placeholder.placeholder || 'Area Grafik / Visual Chart'}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              Format visual presisi hitam-putih
                            </span>
                          </div>
                        )}

                        {/* Corner Resize Handles */}
                        {isEditMode && isSelected && (
                          <>
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-gray-600 rounded-sm pointer-events-none shadow-sm" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-gray-600 rounded-sm pointer-events-none shadow-sm" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-gray-600 rounded-sm pointer-events-none shadow-sm" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-gray-600 rounded-sm pointer-events-none shadow-sm" />
                          </>
                        )}
                      </div>
                    </Rnd>
                  );
                });
              })()}

              {/* Empty state fallback */}
              {(!currentSlide?.placeholders || currentSlide.placeholders.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <p className="text-gray-400 text-xs">Tidak ada elemen pada slide ini</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigasi Slide Bawah: Prev / Slide Info / Next */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
            <button
              type="button"
              onClick={() => handleSlideChange(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
              className="btn-secondary py-2 px-3.5 flex items-center gap-2 text-xs font-semibold text-gray-800 disabled:opacity-40"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">
                Slide {currentSlideIndex + 1} dari {editedSlides.length}
              </span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="hidden sm:inline text-xs text-gray-500 font-mono">
                {Math.round(((currentSlideIndex + 1) / editedSlides.length) * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSlideChange(currentSlideIndex + 1)}
              disabled={currentSlideIndex === editedSlides.length - 1}
              className="btn-secondary py-2 px-3.5 flex items-center gap-2 text-xs font-semibold text-gray-800 disabled:opacity-40"
              title="Slide Berikutnya"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Carousel Horizontal Thumbnail Slide */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 pb-1 border-b border-gray-100">
              <span className="font-semibold text-gray-700">Daftar Slide ({editedSlides.length})</span>
              <span className="text-[11px] text-gray-400">Pilih slide untuk beralih</span>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-thin">
              {editedSlides.map((slide, index) => {
                const isCurrent = index === currentSlideIndex;
                const placeholders = slide.placeholders || [];
                const titleP = placeholders.find(
                  (p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul')
                );
                const titleText = titleP?.content || slide.name || `Slide ${index + 1}`;
                return (
                  <button
                    key={`carousel-thumb-${index}`}
                    type="button"
                    onClick={() => handleSlideChange(index)}
                    className={`flex-shrink-0 w-36 sm:w-44 text-left p-2 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-2 border-gray-900 bg-gray-50 shadow-xs ring-1 ring-gray-900/10'
                        : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className="text-[9px] text-gray-400 truncate max-w-[80px]">
                        {renderLayout(slide.layoutId || slide.layout)?.name || 'Layout'}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-900 line-clamp-1 truncate">
                      {titleText}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Posisi & Ukuran Elemen (Edit Mode) */}
          {selectedElementId && isEditMode && selectedPlaceholder && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-gray-700" />
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Posisi & Ukuran ({selectedPlaceholder.type === 'text' ? 'Teks' : 'Gambar'})
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  ID: {selectedPlaceholder.id}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">X (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round((selectedPlaceholder.position?.x || 0) * 10)}
                    onChange={(e) => handleNumericPropChange('x', e.target.value)}
                    className="w-full px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-900 text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Y (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round((selectedPlaceholder.position?.y || 0) * 10)}
                    onChange={(e) => handleNumericPropChange('y', e.target.value)}
                    className="w-full px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-900 text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Lebar (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="1"
                    value={Math.round((selectedPlaceholder.position?.w || 8) * 10)}
                    onChange={(e) => handleNumericPropChange('w', e.target.value)}
                    className="w-full px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-900 text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">Tinggi (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="1"
                    value={Math.round((selectedPlaceholder.position?.h || 1) * 10)}
                    onChange={(e) => handleNumericPropChange('h', e.target.value)}
                    className="w-full px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-900 text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== KOLOM KANAN (25%): PANEL KONTROL & THUMBNAIL (SCROLL MANDIRI) ==================== */}
        <div className="lg:col-span-3 flex flex-col space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
          {/* Panel Kontrol Slide Aktif */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                  Slide {currentSlideIndex + 1} Aktif
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  {layoutDef.name || 'Layout Slide'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                ⚪ Base Master
              </span>
            </div>

            {/* AI Recommendation Reason */}
            {currentSlide.layoutReason && (
              <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <Info className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{currentSlide.layoutReason}</span>
              </div>
            )}

            {/* Layout Selector & Pratinjau Visual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Layout Slide Ini:
                </label>
                <button
                  type="button"
                  onClick={() => setShowLayoutCatalogModal(true)}
                  className="text-[11px] font-semibold text-gray-900 hover:text-gray-600 underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>Katalog Visual</span>
                </button>
              </div>

              {/* Pratinjau Sketsa Layout Aktif */}
              <div
                onClick={() => setShowLayoutCatalogModal(true)}
                className="cursor-pointer group relative rounded-lg overflow-hidden border border-gray-200 hover:border-gray-900 transition-all shadow-2xs"
                title="Klik untuk membuka katalog visual layout"
              >
                <LayoutThumbnail
                  layoutId={currentLayoutId}
                  logoConfig={logoConfig}
                  showPageNum={currentSlideIndex !== 0 && currentSlideIndex !== editedSlides.length - 1}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded bg-gray-900 text-white text-[10px] font-semibold transition-opacity shadow-xs">
                    Ganti Layout Secara Visual →
                  </span>
                </div>
              </div>

              {/* Dropdown Selector */}
              <select
                value={currentLayoutId}
                onChange={(e) => handleLayoutChange(e.target.value)}
                disabled={isRegeneratingLayout}
                className="w-full text-xs py-2 px-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer disabled:opacity-50"
              >
                {Array.from(new Set(LAYOUT_OPTIONS.map((opt) => opt.group))).map((grp) => (
                  <optgroup key={grp} label={grp} className="font-semibold text-gray-500">
                    {LAYOUT_OPTIONS.filter((opt) => opt.group === grp).map((opt) => (
                      <option key={opt.value} value={opt.value} className="font-medium text-gray-900">
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {isRegeneratingLayout && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI menyesuaikan konten...</span>
                </div>
              )}
            </div>

            {/* Toggle Edit Mode & Snap Grid */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isEditMode}
                  onChange={(e) => {
                    setIsEditMode(e.target.checked);
                    if (!e.target.checked) setSelectedElementId(null);
                  }}
                  className="w-4 h-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900"
                />
                <span className="text-xs font-semibold text-gray-900">Edit Layout (Drag & Resize)</span>
              </label>

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setUseSnapToGrid(!useSnapToGrid)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    useSnapToGrid
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  Snap Grid: {useSnapToGrid ? 'ON' : 'OFF'}
                </button>
              )}
            </div>

            {/* Tombol Sisipkan Placeholder */}
            <button
              type="button"
              onClick={() => setShowPlaceholderModal(true)}
              className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span>📋 Sisipkan Placeholder (Canva Ipsum)</span>
            </button>

            {/* Panel Pengaturan Logo Presentasi (Global) */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900">Logo Presentasi</span>
                {logoConfig?.enabled && (
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {logoConfig.position}
                  </span>
                )}
              </div>

              {logoConfig?.enabled && logoConfig?.dataUri ? (
                <div className="space-y-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-7 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={logoConfig.dataUri} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-gray-900 truncate">{logoConfig.originalName || 'Logo'}</p>
                      <p className="text-[9px] text-gray-400">{logoConfig.size || 'medium'} • {logoConfig.position || 'top-right'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onLogoChange && onLogoChange(null)}
                      className="text-[10px] text-red-600 hover:text-red-800 font-medium px-1.5 py-0.5 rounded border border-red-200 bg-red-50"
                      title="Hapus logo dari presentasi"
                    >
                      Hapus
                    </button>
                  </div>

                  {/* Fast position toggle buttons */}
                  <div>
                    <label className="block text-[9px] font-semibold text-gray-500 mb-1">Ubah Posisi:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {LOGO_POSITIONS.map((pos) => {
                        const isActive = logoConfig.position === pos.id;
                        return (
                          <button
                            key={pos.id}
                            type="button"
                            onClick={() => onLogoChange && onLogoChange({ ...logoConfig, position: pos.id })}
                            className={`py-1 text-[9px] rounded border font-medium transition-colors ${
                              isActive
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                            title={pos.label}
                          >
                            {pos.id.replace('top-', 'Atas-').replace('bottom-', 'Bwh-').replace('left', 'Ki').replace('right', 'Ka')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fast size toggle */}
                  <div>
                    <label className="block text-[9px] font-semibold text-gray-500 mb-1">Ukuran:</label>
                    <div className="flex gap-1">
                      {LOGO_SIZES.map((sz) => {
                        const isActive = (logoConfig.size || 'medium') === sz.id;
                        return (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => onLogoChange && onLogoChange({ ...logoConfig, size: sz.id })}
                            className={`flex-1 py-1 text-[9px] rounded border font-medium transition-colors ${
                              isActive
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {sz.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  <p className="text-[11px] text-gray-500 mb-1.5">Belum ada logo terpasang.</p>
                  <label className="inline-block cursor-pointer px-2.5 py-1 text-xs font-semibold bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors">
                    <span>+ Unggah Logo</span>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!['image/png', 'image/jpeg'].includes(file.type)) {
                          toast.error('Gunakan file PNG atau JPEG.');
                          return;
                        }
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error('Ukuran file maksimal 2 MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          const img = new Image();
                          img.onload = () => {
                            if (onLogoChange) {
                              onLogoChange({
                                enabled: true,
                                dataUri: reader.result,
                                position: 'top-right',
                                size: 'medium',
                                originalName: file.name,
                                mimeType: file.type,
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight,
                              });
                              toast.success('Logo berhasil dipasang pada semua slide!');
                            }
                          };
                          img.src = reader.result;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Panel Tipografi Konsisten (Otomatis & Manual) */}
          <TypographyPanel
            typographyConfig={typographyConfig}
            onTypographyChange={onTypographyChange}
            slides={editedSlides}
            selectedPlaceholder={selectedPlaceholder}
          />

          {/* Daftar Thumbnail Vertikal (Scrollable) */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 pb-1 border-b border-gray-100">
              <span className="font-semibold text-gray-700">Daftar Slide ({editedSlides.length})</span>
              <span>Klik untuk beralih</span>
            </div>

            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {editedSlides.map((slide, index) => {
                const isCurrent = index === currentSlideIndex;
                const placeholders = slide.placeholders || [];
                const titleP = placeholders.find(
                  (p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul')
                );
                const hasEmptyOrDummy = (() => {
                  if (placeholders.length === 0) return true;
                  if (!titleP?.content || isDummyText(titleP.content)) return true;
                  const isCover = slide.slideType === 'cover' || index === 0;
                  const isClosing = slide.slideType === 'closing' || index === editedSlides.length - 1;
                  if (!isCover && !isClosing) {
                    const pointPs = placeholders.filter((p) => p.id?.startsWith('point-'));
                    if (pointPs.length > 0 && pointPs.every((p) => isDummyText(p.content))) return true;
                  }
                  return false;
                })();

                return (
                  <div
                    key={`thumb-vert-${index}`}
                    onClick={() => handleSlideChange(index)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-2 border-gray-900 bg-gray-50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[11px] font-bold ${
                        isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {titleP?.content || slide.name || `Slide ${index + 1}`}
                          </p>
                          {logoConfig?.enabled && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-gray-100 text-gray-500 font-mono" title="Logo terpasang">
                              logo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">
                          {renderLayout(slide.layoutId || slide.layout)?.name || slide.layoutId || 'Layout'}
                        </p>
                      </div>
                    </div>
                    {hasEmptyOrDummy && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0" title="Slide kosong atau dummy">
                        !
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons Panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onEdit) onEdit(editedSlides);
                  toast.success('Perubahan berhasil disimpan');
                }}
                className="btn-secondary flex-1 py-2 text-xs font-semibold"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={handleResetCurrentSlideLayout}
                className="btn-secondary py-2 px-3 text-xs text-gray-600 hover:text-gray-900"
                title="Reset layout slide ini"
              >
                Reset Layout
              </button>
            </div>

            {onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Draft</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Download</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Toolkit Teks Placeholder (Canva Ipsum) */}
      <PlaceholderModal
        isOpen={showPlaceholderModal}
        onClose={() => setShowPlaceholderModal(false)}
        onInsert={handleInsertPlaceholder}
      />

      {/* Modal Katalog Layout Visual dengan Pratinjau 16:9 */}
      {showLayoutCatalogModal && (
        <LayoutCatalogModal
          isOpen={showLayoutCatalogModal}
          onClose={() => setShowLayoutCatalogModal(false)}
          slideNumber={currentSlideIndex + 1}
          slideCount={editedSlides.length}
          currentLayoutId={currentLayoutId}
          onSelectLayout={(_, newId) => handleLayoutChange(newId)}
          logoConfig={logoConfig}
        />
      )}

      {/* Modal Perbesar Penuh (Fullscreen Slide Viewer) */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded bg-white text-gray-900 font-mono text-xs font-bold flex items-center justify-center">
                #{currentSlideIndex + 1}
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {currentSlide.placeholders?.find((p) => p.id?.startsWith('title') || p.name?.toLowerCase().includes('judul'))?.content || currentSlide.name || `Slide ${currentSlideIndex + 1}`}
                </h2>
                <span className="text-[11px] text-gray-400">
                  Slide {currentSlideIndex + 1} dari {editedSlides.length} • {renderLayout(currentSlide.layoutId || currentSlide.layout)?.name || 'Layout'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-gray-400">Tekan panah ← → untuk beralih</span>
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tutup (ESC)</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Canvas Center */}
          <div className="relative flex-1 flex items-center justify-center py-4 max-w-7xl w-full mx-auto">
            {/* Floating Left Button */}
            <button
              type="button"
              disabled={currentSlideIndex === 0}
              onClick={() => handleSlideChange(currentSlideIndex - 1)}
              className="absolute left-2 sm:left-4 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-20 transition-all backdrop-blur-sm cursor-pointer"
              title="Slide Sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Large 16:9 Slide Display */}
            <div
              className="aspect-[16/9] w-full max-w-[92vw] max-h-[80vh] rounded-xl overflow-hidden relative shadow-2xl border border-white/20 bg-white"
              style={{
                backgroundColor: currentSlide.background?.color || '#FFFFFF',
              }}
            >
              {/* Logo in fullscreen */}
              {logoConfig?.enabled && logoConfig?.dataUri && (() => {
                const logoPct = computeLogoPercent(logoConfig);
                if (!logoPct) return null;
                return (
                  <div
                    className="absolute pointer-events-none select-none z-10 flex items-center justify-center"
                    style={{
                      left: `${logoPct.x}%`,
                      top: `${logoPct.y}%`,
                      width: `${logoPct.w}%`,
                      height: `${logoPct.h}%`,
                    }}
                  >
                    <img src={logoConfig.dataUri} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                );
              })()}

              {/* Placeholders in fullscreen */}
              {(() => {
                const spacing = resolveSpacingConfig(typographyConfig);
                const displayPlaceholders = equalizePointCardHeights(
                  currentSlide.placeholders || [],
                  typographyConfig,
                  currentSlide.layoutId,
                  1280,
                  720
                );
                return displayPlaceholders.map((placeholder, idx) => {
                  const isText = placeholder.type === 'text';
                  const typo = resolvePlaceholderTypography(placeholder, typographyConfig, isDarkBg);
                  const isPointCard =
                    placeholder.id?.startsWith('point-') &&
                    !isDarkBg &&
                    currentSlide.layoutId !== 'table-of-contents';

                  const rawX = parseFloat(placeholder.position?.x) || 0;
                  const rawY = parseFloat(placeholder.position?.y) || 0;
                  const rawW = parseFloat(placeholder.position?.w) || 10;
                  const rawH = parseFloat(placeholder.position?.h) || 10;
                  const isPercent = rawW > 10 || rawH > 10 || rawX > 10 || rawY > 10 || currentSlide.layoutId;
                  const pctX = isPercent ? rawX : rawX * 10;
                  const pctY = isPercent ? rawY : rawY * 10;
                  const pctW = isPercent ? rawW : rawW * 10;
                  const pctH = isPercent ? rawH : rawH * 10;

                  return (
                    <div
                      key={`fullscreen-elem-${placeholder.id}-${idx}`}
                      className="absolute"
                      style={{
                        left: `${pctX}%`,
                        top: `${pctY}%`,
                        width: `${pctW}%`,
                        height: `${pctH}%`,
                        padding: '4px',
                      }}
                    >
                      {isText ? (
                        <div
                          className={`w-full h-full flex flex-col justify-start text-left ${
                            isPointCard
                              ? 'bg-white rounded-lg border border-gray-200 shadow-sm p-4'
                              : currentSlide.layoutId === 'table-of-contents'
                              ? 'border-b border-gray-200 pb-2 justify-end'
                              : 'p-1'
                          }`}
                        >
                          {placeholder.badge === 'arrow' && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
                                →
                              </span>
                              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500">
                                Topik
                              </span>
                            </div>
                          )}
                          {placeholder.number && currentSlide.layoutId !== 'table-of-contents' && (
                            <span className="font-mono font-bold text-2xl tracking-tight text-gray-900 mb-2">
                              {placeholder.number}
                            </span>
                          )}
                          {placeholder.stepLabel && (
                            <span className="inline-block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded bg-gray-900 text-white self-start mb-2">
                              {placeholder.stepLabel}
                            </span>
                          )}
                          {placeholder.badge === 'stat' && (
                            <div className="w-14 h-14 rounded-full border-2 border-gray-900 bg-gray-50 flex items-center justify-center mx-auto font-mono font-bold text-lg text-gray-900 mb-2">
                              {placeholder.content?.split('\n')[0] || '67%'}
                            </div>
                          )}
                          {placeholder.badge === 'rating' && (
                            <div className="flex flex-col items-center mb-2">
                              <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-base mb-1">
                                👤
                              </div>
                              <span className="text-gray-800 text-xs font-semibold tracking-wider">
                                ★★★★ 4.9/5
                              </span>
                            </div>
                          )}
                          <div className="w-full flex-1 overflow-hidden flex flex-col">
                            {(placeholder.content || '').split(/\n\n+/).map((para, pIdx, arr) => {
                              const colonMatch = isPointCard && typeof para === 'string' && para.match(/^([^:\n]{2,45}):\s*([\s\S]+)$/);
                              return (
                                <div
                                  key={pIdx}
                                  className="whitespace-pre-wrap select-text w-full m-0 p-0"
                                  style={{
                                    fontFamily: typo.fontFamily,
                                    fontSize: `${typo.fontSize * 1.15}px`,
                                    color: typo.color,
                                    fontWeight: typo.fontWeight,
                                    fontStyle: placeholder.isItalic ? 'italic' : 'normal',
                                    textDecoration: placeholder.isUnderline ? 'underline' : 'none',
                                    textAlign: placeholder.align || typo.align || 'left',
                                    lineHeight: spacing.lineHeightBody,
                                    marginBottom: pIdx < arr.length - 1 ? `${spacing.gapBetweenParagraphs}px` : '0px',
                                    wordWrap: 'break-word',
                                  }}
                                >
                                  {colonMatch ? (
                                    <>
                                      <strong className="font-bold text-gray-900 block mb-0.5">{colonMatch[1]}:</strong>
                                      <span>{colonMatch[2]}</span>
                                    </>
                                  ) : (
                                    para
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg p-3 text-center bg-gray-50">
                          <span className="text-2xl mb-1">📊</span>
                          <span className="text-xs font-semibold text-gray-800">
                            {placeholder.placeholder || 'Area Visual'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Floating Right Button */}
            <button
              type="button"
              disabled={currentSlideIndex === editedSlides.length - 1}
              onClick={() => handleSlideChange(currentSlideIndex + 1)}
              className="absolute right-2 sm:right-4 z-30 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-20 transition-all backdrop-blur-sm cursor-pointer"
              title="Slide Berikutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Fullscreen Footer: Quick Thumbnails */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-7xl w-full mx-auto scrollbar-thin">
            {editedSlides.map((slide, idx) => (
              <button
                key={`fs-thumb-${idx}`}
                type="button"
                onClick={() => handleSlideChange(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'bg-white text-gray-900 shadow-lg scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
