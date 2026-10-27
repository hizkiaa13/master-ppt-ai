import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { themeService, pptxService } from '../services/pptx';
import { generateAIContent } from '../services/ai';
import { mapAIResultToSlides } from '../utils/aiMapper';
import { generateFinalPPTX } from '../utils/pptxGenerator';
import ThemeSelector from '../components/Generator/ThemeSelector';
import SlideCountSelector from '../components/Generator/SlideCountSelector';
import ColorPicker from '../components/Generator/ColorPicker';
import SlidePreview from '../components/Generator/SlidePreview';
import ExitConfirmation from '../components/Generator/ExitConfirmation';
import { useDraft } from '../hooks/useDraft';
import toast from 'react-hot-toast';
import {
  Sparkles, ChevronRight, ChevronLeft, Download, Palette,
  Type, Layout, CheckCircle, Loader2, FileText, Eye, Sliders,
  Layers, ArrowRight, ArrowLeft, Check, RefreshCw, Share2,
  Save, Cloud, CloudOff, X, AlertTriangle,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Tema & Topik',   icon: Layout    },
  { id: 2, label: 'Jumlah Slide',   icon: Sliders   },
  { id: 3, label: 'Pilih Warna',    icon: Palette   },
  { id: 4, label: 'Generate AI',    icon: Sparkles  },
  { id: 5, label: 'Preview & Edit', icon: Eye       },
  { id: 6, label: 'Download PPTX',  icon: Download  },
];

const THEME_EMOJI = {
  Bisnis: '💼', Edukasi: '📚', Kreatif: '🎨',
  Minimalis: '✨', Teknologi: '🚀', 'Tema Bebas': '🌟',
};

/** Build the draft payload from current generator state */
function buildDraftPayload({ formData, step, slides, originalSlides, recommendations, generatedData }) {
  return {
    themeId: formData.themeId || null,
    customTitle: formData.customTitle,
    customDescription: formData.customDescription,
    slideCount: formData.slideCount,
    customColors: formData.customColors,
    currentStep: step,
    status: 'in_progress',
    formData: {
      themeId: formData.themeId,
      themeName: formData.themeName,
      customTitle: formData.customTitle,
      customDescription: formData.customDescription,
      slideCount: formData.slideCount,
      customColors: formData.customColors,
    },
    generatedSlides: slides.length > 0 ? slides : null,
    editedSlides: slides.length > 0 ? slides : null,
    recommendations: recommendations || null,
  };
}

// ─── Save Status Indicator ────────────────────────────────────
function SaveIndicator({ isSaving, lastSavedAt, draftId }) {
  if (!draftId && !isSaving) return null;
  const timeStr = lastSavedAt
    ? lastSavedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
      isSaving
        ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm'
    }`}>
      {isSaving ? (
        <>
          <span className="w-3 h-3 rounded-full border border-brand-400/40 border-t-brand-400 animate-spin" />
          Menyimpan draft...
        </>
      ) : (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Draft tersimpan{timeStr ? ` (${timeStr})` : ''}</span>
        </>
      )}
    </div>
  );
}

export default function Generator() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeDraftId  = searchParams.get('draft');

  const [step,            setStep           ] = useState(1);
  const [themes,          setThemes         ] = useState([]);
  const [loadingThemes,   setLoadingThemes  ] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    themeId:           location.state?.themeId || '',
    themeName:         '',
    customTitle:       '',
    customDescription: '',
    slideCount:        5,
    customColors:      null,
  });

  // Generation & AI state
  const [loading,               setLoading              ] = useState(false);
  const [error,                 setError                ] = useState(null);
  const [isGenerating,          setIsGenerating         ] = useState(false);
  const [generatedData,         setGeneratedData        ] = useState(null);
  const [masterId,              setMasterId             ] = useState(null);
  const [slides,                setSlides               ] = useState([]);
  const [originalSlides,        setOriginalSlides       ] = useState([]);
  const [recommendations,       setRecommendations      ] = useState(null);
  const [designRecommendation,  setDesignRecommendation ] = useState(null);

  // Download state
  const [isFinalizing,    setIsFinalizing  ] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Exit confirmation state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitTarget,      setExitTarget    ] = useState(null);

  // Draft hook
  const draft = useDraft();

  // Ref to current state for use in callbacks
  const stateRef = useRef({});
  stateRef.current = { formData, step, slides, originalSlides, recommendations, generatedData };

  // ─── Load draft from URL param ──────────────────────────────
  useEffect(() => {
    if (!resumeDraftId) return;
    (async () => {
      const data = await draft.loadDraft(resumeDraftId);
      if (!data) { toast.error('Draft tidak ditemukan.'); return; }

      // Restore form state
      if (data.formData) {
        setFormData(prev => ({
          ...prev,
          themeId:           data.formData.themeId           || prev.themeId,
          themeName:         data.formData.themeName          || prev.themeName,
          customTitle:       data.formData.customTitle        || prev.customTitle,
          customDescription: data.formData.customDescription  || prev.customDescription,
          slideCount:        data.formData.slideCount         || prev.slideCount,
          customColors:      data.formData.customColors       || prev.customColors,
        }));
      }

      // Restore slides
      if (data.editedSlides?.length > 0) {
        setSlides(data.editedSlides);
        setOriginalSlides(JSON.parse(JSON.stringify(data.editedSlides)));
      } else if (data.generatedSlides?.length > 0) {
        setSlides(data.generatedSlides);
        setOriginalSlides(JSON.parse(JSON.stringify(data.generatedSlides)));
      }

      if (data.recommendations) {
        setRecommendations(data.recommendations);
        setDesignRecommendation(data.recommendations);
      }
      if (data.generatedSlides?.length > 0) {
        setGeneratedData({ slides: data.generatedSlides, designRecommendation: data.recommendations });
      }

      // Resume to correct step (1 to 6)
      const targetStep = Math.max(1, Math.min(data.currentStep || 1, 6));
      setStep(targetStep);
      toast.success(`Draft dilanjutkan dari Step ${targetStep}: ${STEPS[targetStep - 1]?.label}`);
    })();
  }, [resumeDraftId]); // eslint-disable-line

  // ─── Fetch available themes on mount ───────────────────────
  useEffect(() => {
    async function loadThemes() {
      try {
        setLoadingThemes(true);
        const res = await themeService.getAll();
        if (res.success && res.data) {
          setThemes(res.data);
          if (!resumeDraftId) {
            // Pre-select: from navigation state or first theme
            const preselected = res.data.find(t => t.id === location.state?.themeId);
            const defaultTheme = preselected || res.data[0];
            if (defaultTheme) {
              setFormData(prev => ({
                ...prev,
                themeId: prev.themeId || defaultTheme.id,
                themeName: prev.themeName || defaultTheme.name,
                customColors: prev.customColors || {
                  primary:   defaultTheme.color_primary,
                  secondary: defaultTheme.color_secondary,
                  accent:    defaultTheme.color_accent,
                },
              }));
            }
          }
        }
      } catch (err) {
        console.error('Load themes error:', err);
        toast.error('Gagal memuat daftar tema.');
      } finally {
        setLoadingThemes(false);
      }
    }
    loadThemes();
  }, [location.state, resumeDraftId]); // eslint-disable-line

  // ─── Auto-schedule draft save on form changes ───────────────
  useEffect(() => {
    if (!formData.customTitle.trim()) return;
    draft.scheduleSave(buildDraftPayload(stateRef.current));
  }, [formData, slides]); // eslint-disable-line

  // ─── Keyboard shortcut: Ctrl+S / Cmd+S ─────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!formData.customTitle.trim()) {
          toast.error('Isi judul presentasi terlebih dahulu untuk menyimpan draft.');
          return;
        }
        draft.saveNow(buildDraftPayload(stateRef.current));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line

  // ─── beforeunload guard ─────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step < 6 && (slides.length > 0 || formData.customTitle.trim())) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, slides, formData.customTitle]);

  // ─── Helpers ────────────────────────────────────────────────
  const handleManualSave = async () => {
    if (!formData.customTitle.trim()) {
      toast.error('Isi judul presentasi terlebih dahulu untuk menyimpan draft.');
      return;
    }
    await draft.saveNow(buildDraftPayload(stateRef.current));
  };

  const handleExitWithSave = async () => {
    await draft.saveNow(buildDraftPayload(stateRef.current));
    setShowExitConfirm(false);
    navigate(exitTarget || '/dashboard');
  };

  const handleExitDiscard = () => {
    setShowExitConfirm(false);
    navigate(exitTarget || '/dashboard');
  };

  const triggerExit = (path = '/dashboard') => {
    if (step < 6 && (slides.length > 0 || formData.customTitle.trim())) {
      setExitTarget(path);
      setShowExitConfirm(true);
    } else {
      navigate(path);
    }
  };

  // ─── Step navigation ────────────────────────────────────────
  const handleProceedToStep2 = () => {
    if (!formData.themeId)                    { toast.error('Pilih tema presentasi.'); return; }
    if (!formData.customTitle.trim())          { toast.error('Judul presentasi wajib diisi.'); return; }
    if (formData.customTitle.trim().length > 100) { toast.error('Judul maksimal 100 karakter.'); return; }
    setStep(2);
  };

  // ─── AI generation ──────────────────────────────────────────
  const handleGenerateAI = async () => {
    setLoading(true);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await generateAIContent({
        title: formData.customTitle.trim(),
        theme: formData.themeName || formData.theme || 'Bisnis',
        description: formData.customDescription ? formData.customDescription.trim() : '',
        slideCount: parseInt(formData.slideCount, 10) || 5,
        customColors: formData.customColors,
      });

      if (response && response.success && response.data) {
        const mappedSlides = mapAIResultToSlides(
          response.data,
          formData.customColors
        );

        setGeneratedData(response.data);
        setSlides(mappedSlides);
        setOriginalSlides(JSON.parse(JSON.stringify(mappedSlides)));
        setDesignRecommendation(response.data.designRecommendation);
        setRecommendations({
          fonts: response.data.designRecommendation?.fonts,
          colors: response.data.designRecommendation?.colors,
          layouts: response.data.designRecommendation?.layouts,
        });

        toast.success(`Berhasil membuat ${mappedSlides.length} slide dengan AI!`);

        // Auto-save draft at Step 5
        if (formData.customTitle.trim()) {
          draft.scheduleSave(buildDraftPayload({
            formData,
            step: 5,
            slides: mappedSlides,
            originalSlides: [],
            recommendations: response.data.designRecommendation,
            generatedData: response.data,
          }));
        }

        setStep(5); // lanjut ke preview
      } else {
        const errText = response?.error || 'Gagal generate konten AI';
        setError(errText);
        toast.error(errText);
      }
    } catch (err) {
      console.error('AI Generate error:', err);
      const errText =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.';
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // ─── Slide edits ────────────────────────────────────────────
  const handleSlideEdit = useCallback(async (updatedSlides) => {
    setSlides(updatedSlides);
    if (masterId) {
      try { await pptxService.updateSlide(masterId, { slides: updatedSlides }); }
      catch (err) { console.error('Auto-save slide edit error:', err); }
    }
    // Schedule draft save after slide edit
    draft.scheduleSave(buildDraftPayload({ ...stateRef.current, slides: updatedSlides }));
  }, [masterId, draft]); // eslint-disable-line

  // ─── Final download ─────────────────────────────────────────
  const handleFinalizeAndDownload = async () => {
    setIsFinalizing(true);
    try {
      if (masterId) {
        await pptxService.finalize(masterId, { slides, title: formData.customTitle });
        const fileName = `${formData.customTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}-master.pptx`;
        await pptxService.download(masterId, fileName, true);
      } else {
        await generateFinalPPTX(slides, recommendations, formData.customTitle);
      }
      setDownloadSuccess(true);
      toast.success('File PPTX berhasil diunduh!');
      await draft.markCompleted();
    } catch (err) {
      console.error('Download error:', err);
      try {
        await generateFinalPPTX(slides, recommendations, formData.customTitle);
        setDownloadSuccess(true);
        toast.success('File PPTX berhasil diekspor!');
        await draft.markCompleted();
      } catch (clientErr) {
        toast.error('Gagal mengunduh: ' + clientErr.message);
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  // ─── Reset generator ────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setFormData({
      themeId: themes[0]?.id || '', themeName: themes[0]?.name || '',
      customTitle: '', customDescription: '', slideCount: 5, customColors: null,
    });
    setGeneratedData(null); setSlides([]); setOriginalSlides([]); setRecommendations(null);
    setDesignRecommendation(null);
    setError(null);
    setDownloadSuccess(false);
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <ExitConfirmation
          isSaving={draft.isSaving}
          onSaveAndExit={handleExitWithSave}
          onDiscard={handleExitDiscard}
          onContinue={() => setShowExitConfirm(false)}
        />
      )}

      {/* Loading State Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Sedang Bekerja</h3>
            <p className="text-gray-600 text-sm">
              Membuat copywriting, rekomendasi font, warna, dan layout untuk {formData.slideCount} slide...
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1 flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Master PowerPoint <span className="gradient-text">Cerdas Berbasis AI</span>
          </h1>
          <p className="text-dark-400 text-sm sm:text-base">
            Bangun master template presentasi berkelas studio dengan copywriting dan rekomendasi Gemini AI.
          </p>
        </div>

        {/* Top-right: Save indicator + Manual Save + Exit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SaveIndicator
            isSaving={draft.isSaving}
            lastSavedAt={draft.lastSavedAt}
            draftId={draft.draftId}
          />
          <button
            type="button"
            onClick={handleManualSave}
            disabled={draft.isSaving}
            title="Simpan Draft (Ctrl+S)"
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={() => triggerExit('/dashboard')}
            className="btn-ghost text-xs py-2 px-2.5 flex items-center gap-1 text-dark-400"
            title="Kembali ke Dashboard"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar (6 STEPS) */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-dark-900/60 shadow-xl">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent   = step === s.id;
            return (
              <div
                key={s.id}
                className={`flex flex-col sm:flex-row items-center gap-2 p-2 sm:p-2.5 rounded-xl transition-all ${
                  isCurrent   ? 'bg-brand-500/15 border border-brand-500/40 text-brand-300'
                  : isCompleted ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                  : 'text-dark-500 opacity-60'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isCurrent   ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : isCompleted ? 'bg-green-500 text-white'
                  : 'bg-dark-800 text-dark-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                </div>
                <span className="text-xs font-semibold text-center sm:text-left truncate hidden sm:inline">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── STEP 1: Tema & Topik ─── */}
      {step === 1 && (
        <ThemeSelector
          formData={formData}
          setFormData={setFormData}
          themes={themes}
          loadingThemes={loadingThemes}
          onNext={handleProceedToStep2}
          onSaveDraft={handleManualSave}
        />
      )}

      {/* ─── STEP 2: Jumlah Slide (1-15) ─── */}
      {step === 2 && (
        <SlideCountSelector
          formData={formData}
          setFormData={setFormData}
          onPrev={() => setStep(1)}
          onNext={() => setStep(3)}
          onSaveDraft={handleManualSave}
        />
      )}

      {/* ─── STEP 3: Pilih Warna ─── */}
      {step === 3 && (
        <ColorPicker
          formData={formData}
          setFormData={setFormData}
          onPrev={() => setStep(2)}
          onNext={() => setStep(4)}
          onSaveDraft={handleManualSave}
        />
      )}

      {/* ─── STEP 4: AI Generate ─── */}
      {step === 4 && (
        <div className="space-y-8 animate-fade-in">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={handleGenerateAI}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {isGenerating ? (
            <div className="glass-card p-12 rounded-3xl border border-white/10 text-center max-w-xl mx-auto space-y-6 bg-dark-900/80 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">AI Sedang Menyusun Slide Master...</h3>
                <p className="text-sm text-dark-400">
                  Menganalisis topik &ldquo;{formData.customTitle}&rdquo;, menghasilkan copywriting lengkap, harmoni warna, dan layout untuk {formData.slideCount} slide.
                </p>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-gradient h-2.5 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          ) : generatedData && slides.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 mb-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Generasi Berhasil
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Rekomendasi AI Siap</h2>
                  <p className="text-sm text-dark-400 mt-1">
                    Berikut susunan slide dan copywriting yang telah dipersiapkan oleh AI.
                  </p>
                </div>
                <button type="button" onClick={handleGenerateAI} className="btn-secondary text-xs flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate Ulang
                </button>
              </div>

              {/* Recommendations Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fonts */}
                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-dark-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm">
                    <Type className="w-4 h-4" /><span>Font Pairing AI</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{recommendations?.fonts?.heading || 'Montserrat'}</p>
                    <p className="text-xs text-dark-400">Heading Text</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-dark-200">{recommendations?.fonts?.body || 'Open Sans'}</p>
                    <p className="text-xs text-dark-400">Body Text</p>
                  </div>
                  <p className="text-xs text-dark-400 italic pt-2 border-t border-white/5">
                    &ldquo;{recommendations?.fonts?.rationale}&rdquo;
                  </p>
                </div>
                {/* Colors */}
                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-dark-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                    <Palette className="w-4 h-4" /><span>Palet Warna</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-2 rounded-lg text-center" style={{ backgroundColor: recommendations?.colors?.primary }}>
                      <span className="text-[10px] font-bold text-white drop-shadow">Primary</span>
                    </div>
                    <div className="flex-1 p-2 rounded-lg text-center" style={{ backgroundColor: recommendations?.colors?.secondary }}>
                      <span className="text-[10px] font-bold text-white drop-shadow">Secondary</span>
                    </div>
                    <div className="flex-1 p-2 rounded-lg text-center" style={{ backgroundColor: recommendations?.colors?.accent }}>
                      <span className="text-[10px] font-bold text-dark-950">Accent</span>
                    </div>
                  </div>
                  <p className="text-xs text-dark-400 italic pt-2 border-t border-white/5">
                    &ldquo;{recommendations?.colors?.rationale}&rdquo;
                  </p>
                </div>
                {/* Slides Overview */}
                <div className="glass-card p-5 rounded-2xl border border-white/10 bg-dark-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                    <Layers className="w-4 h-4" /><span>Struktur Slide ({slides.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {slides.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-dark-800/60 border border-white/5">
                        <span className="font-semibold text-white truncate max-w-[180px]">#{idx + 1} {s.name || s.slideType}</span>
                        <span className="text-[10px] uppercase text-dark-400 font-mono">{s.layout}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /><span>Ubah Warna</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleManualSave}
                    disabled={draft.isSaving}
                    className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5"
                    title="Simpan progress Anda saat ini (Ctrl+S)"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Draft</span>
                  </button>
                  <button type="button" onClick={() => setStep(5)} className="btn-primary flex items-center gap-2 py-3 px-8 text-base shadow-lg shadow-brand-500/25">
                    <span>Lihat & Edit Preview Slide</span><ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-white/10 max-w-xl mx-auto text-center space-y-6 bg-dark-900/60 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Generate Copywriting & Desain AI</h3>
                <p className="text-sm text-dark-400">
                  AI akan menyusun {formData.slideCount} slide secara otomatis untuk topik &ldquo;{formData.customTitle}&rdquo; dengan copywriting profesional, pairing font, dan tata letak optimal.
                </p>
              </div>

              {/* Summary of inputs */}
              <div className="p-4 rounded-xl bg-dark-800/60 border border-white/5 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-400">Judul:</span>
                  <span className="text-white font-semibold">{formData.customTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Tema:</span>
                  <span className="text-brand-300 font-semibold">{formData.themeName || 'Bisnis'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Jumlah Slide:</span>
                  <span className="text-white font-semibold">{formData.slideCount} Slide</span>
                </div>
                {formData.customColors && (
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400">Warna Dipilih:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: formData.customColors.primary }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: formData.customColors.secondary }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: formData.customColors.accent }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 font-semibold"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Mulai Generate dengan AI</span>
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs text-dark-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Pilih Warna</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 5: Preview & Edit ─── */}
      {step === 5 && (
        <SlidePreview
          slides={slides}
          originalSlides={originalSlides}
          recommendations={recommendations}
          onEdit={handleSlideEdit}
          onReset={() => {
            setSlides(JSON.parse(JSON.stringify(originalSlides)));
            toast.success('Slide dikembalikan ke rekomendasi awal.');
          }}
          onPrev={() => setStep(4)}
          onNext={() => setStep(6)}
          onSaveDraft={handleManualSave}
        />
      )}

      {/* ─── STEP 6: Download ─── */}
      {step === 6 && (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-3xl border border-white/15 bg-dark-900/60 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-xl shadow-brand-500/30">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Presentasi Siap Diunduh!</h2>
              <p className="text-sm text-dark-300">
                Master slide <span className="text-white font-semibold">&ldquo;{formData.customTitle}&rdquo;</span> telah selesai dipersiapkan dengan {slides.length} slide.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-dark-950/60 border border-white/10 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Judul:</span>
                <span className="text-white font-semibold">{formData.customTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Tema Dasar:</span>
                <span className="text-brand-300 font-medium">{formData.themeName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Total Slide:</span>
                <span className="text-white font-bold">{slides.length} Slide Deck</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Tipografi:</span>
                <span className="text-dark-300">{recommendations?.fonts?.heading} & {recommendations?.fonts?.body}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isFinalizing}
                onClick={handleFinalizeAndDownload}
                className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 disabled:opacity-50"
              >
                {isFinalizing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Mengekspor Dokumen PPTX...</span></>
                ) : (
                  <><Download className="w-5 h-5" /><span>Download Master PPTX (.pptx)</span></>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="btn-secondary w-full py-2.5 text-xs text-dark-300 hover:text-white"
              >
                ← Kembali ke Editor Slide
              </button>
            </div>

            {downloadSuccess && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>File PPTX berhasil diunduh. Buka di PowerPoint atau Google Slides!</span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button type="button" onClick={handleReset} className="text-xs text-brand-400 hover:text-brand-300 underline">
              + Buat Master Presentasi Baru
            </button>
            <span className="text-dark-600">•</span>
            <button type="button" onClick={() => triggerExit('/dashboard')} className="text-xs text-dark-400 hover:text-white underline">
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
