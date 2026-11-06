import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { pptxService } from '../services/pptx';
import { generateAIContent } from '../services/ai';
import { mapAIResultToSlides } from '../utils/aiMapper';
import { generateFinalPPTX } from '../utils/pptxGenerator';
import ThemeSelector from '../components/Generator/ThemeSelector';
import SlidePreview from '../components/Generator/SlidePreview';
import ExitConfirmation from '../components/Generator/ExitConfirmation';
import { useDraft } from '../hooks/useDraft';
import toast from 'react-hot-toast';
import {
  Sparkles, Download, Type, Layout, CheckCircle,
  Loader2, Eye, ArrowRight, ArrowLeft, Check,
  RefreshCw, Save, X, Globe, Layers,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Tema & Topik',   icon: Layout    },
  { id: 2, label: 'Generate AI',    icon: Sparkles  },
  { id: 3, label: 'Preview & Edit', icon: Eye       },
  { id: 4, label: 'Download PPTX',  icon: Download  },
];

/** Build the draft payload from current generator state */
function buildDraftPayload({ formData, step, slides, recommendations, generatedData }) {
  return {
    customTitle: formData.customTitle,
    customDescription: formData.customDescription,
    outputLanguage: formData.outputLanguage || 'id',
    slideCount: formData.slideCount || (slides.length > 0 ? slides.length : 5),
    currentStep: step,
    status: 'in_progress',
    formData: {
      customTitle: formData.customTitle,
      customDescription: formData.customDescription,
      outputLanguage: formData.outputLanguage || 'id',
      slideCount: formData.slideCount,
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
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        isSaving
          ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm'
      }`}
    >
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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeDraftId = searchParams.get('draft');

  const [step, setStep] = useState(1);

  // Form State (Hanya judul, deskripsi, bahasa, dan slideCount otomatis)
  const [formData, setFormData] = useState({
    customTitle: '',
    customDescription: '',
    outputLanguage: 'id',
    slideCount: 5,
  });

  // Generation & AI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [masterId, setMasterId] = useState(null);
  const [slides, setSlides] = useState([]);
  const [originalSlides, setOriginalSlides] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [designRecommendation, setDesignRecommendation] = useState(null);

  // Download state
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Exit confirmation state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitTarget, setExitTarget] = useState(null);

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
      if (!data) {
        toast.error('Draft tidak ditemukan.');
        return;
      }

      // Restore form state
      if (data.formData) {
        setFormData((prev) => ({
          ...prev,
          customTitle: data.formData.customTitle || data.customTitle || prev.customTitle,
          customDescription: data.formData.customDescription || data.customDescription || prev.customDescription,
          outputLanguage: data.formData.outputLanguage || data.outputLanguage || prev.outputLanguage,
          slideCount: data.formData.slideCount || data.slideCount || prev.slideCount,
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

      // Map step lama (1..6) ke step baru (1..4)
      let targetStep = data.currentStep || 1;
      if (targetStep > 4) {
        if (targetStep === 5) targetStep = 3; // Preview & Edit
        else if (targetStep === 6) targetStep = 4; // Download
        else targetStep = 2;
      }
      targetStep = Math.max(1, Math.min(targetStep, 4));
      setStep(targetStep);
      toast.success(`Draft dilanjutkan dari Step ${targetStep}: ${STEPS[targetStep - 1]?.label}`);
    })();
  }, [resumeDraftId]); // eslint-disable-line

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
      if (step < 4 && (slides.length > 0 || formData.customTitle.trim())) {
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
    if (step < 4 && (slides.length > 0 || formData.customTitle.trim())) {
      setExitTarget(path);
      setShowExitConfirm(true);
    } else {
      navigate(path);
    }
  };

  // ─── Step navigation ────────────────────────────────────────
  const handleProceedToStep2 = () => {
    if (!formData.customTitle.trim()) {
      toast.error('Judul presentasi wajib diisi.');
      return;
    }
    if (formData.customTitle.trim().length > 100) {
      toast.error('Judul maksimal 100 karakter.');
      return;
    }
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
        description: formData.customDescription ? formData.customDescription.trim() : '',
        outputLanguage: formData.outputLanguage || 'id',
        slideCount: formData.slideCount || 5,
      });

      if (response && response.success && response.data) {
        const mappedSlides = mapAIResultToSlides(response.data);

        setGeneratedData(response.data);
        setSlides(mappedSlides);
        setOriginalSlides(JSON.parse(JSON.stringify(mappedSlides)));
        setDesignRecommendation(response.data.designRecommendation);
        setRecommendations({
          fonts: response.data.designRecommendation?.fonts,
          layouts: response.data.designRecommendation?.layouts,
        });

        // Simpan jumlah slide yang ditentukan AI ke form data
        setFormData((prev) => ({
          ...prev,
          slideCount: mappedSlides.length,
        }));

        if (response.isFallback) {
          toast(
            '⚠️ Menggunakan template master cadangan. Anda dapat klik "Regenerate Ulang" kapan saja untuk memuat ulang.',
            { icon: '⚠️', duration: 6000 }
          );
        } else {
          toast.success(
            `Berhasil menghasilkan ${mappedSlides.length} slide dengan AI (${
              formData.outputLanguage === 'en' ? 'English' : 'Bahasa Indonesia'
            })!`
          );
        }

        // Auto-save draft
        if (formData.customTitle.trim()) {
          draft.scheduleSave(
            buildDraftPayload({
              formData: { ...formData, slideCount: mappedSlides.length },
              step: 3,
              slides: mappedSlides,
              recommendations: response.data.designRecommendation,
              generatedData: response.data,
            })
          );
        }

        setStep(3); // Langsung lanjut ke Preview & Edit
      } else {
        const errText = response?.error || 'Gagal menghasilkan konten AI';
        setError(errText);
        toast.error(errText);
      }
    } catch (err) {
      console.error('AI Generate error:', err);
      const errText =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Terjadi kesalahan saat menghubungi layanan AI. Silakan coba lagi.';
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  // ─── Slide edits ────────────────────────────────────────────
  const handleSlideEdit = useCallback(
    async (updatedSlides) => {
      setSlides(updatedSlides);
      if (masterId) {
        try {
          await pptxService.updateSlide(masterId, { slides: updatedSlides });
        } catch (err) {
          console.error('Auto-save slide edit error:', err);
        }
      }
      draft.scheduleSave(buildDraftPayload({ ...stateRef.current, slides: updatedSlides }));
    },
    [masterId, draft]
  );

  // ─── Final download ─────────────────────────────────────────
  const handleFinalizeAndDownload = async () => {
    setIsFinalizing(true);
    try {
      let currentMasterId = masterId;
      if (!currentMasterId) {
        try {
          const genRes = await pptxService.generate({
            title: formData.customTitle,
            description: formData.customDescription,
            outputLanguage: formData.outputLanguage || 'id',
            slides,
          });
          if (genRes?.data?.masterId) {
            currentMasterId = genRes.data.masterId;
            setMasterId(currentMasterId);
          }
        } catch (serverGenErr) {
          console.warn('Backend history record save:', serverGenErr);
        }
      }

      if (currentMasterId) {
        await pptxService.finalize(currentMasterId, { slides, title: formData.customTitle });
        const fileName = `${(formData.customTitle || 'presentasi').replace(/[^a-zA-Z0-9_-]/g, '_')}-master.pptx`;
        await pptxService.download(currentMasterId, fileName, true);
      } else {
        await generateFinalPPTX(slides, recommendations, formData.customTitle);
      }
      setDownloadSuccess(true);
      toast.success('File PPTX Base Master berhasil diunduh!');
      await draft.markCompleted();
    } catch (err) {
      console.error('Download error:', err);
      try {
        await generateFinalPPTX(slides, recommendations, formData.customTitle);
        setDownloadSuccess(true);
        toast.success('File PPTX Base Master berhasil diekspor!');
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
      customTitle: '',
      customDescription: '',
      outputLanguage: 'id',
      slideCount: 5,
    });
    setGeneratedData(null);
    setSlides([]);
    setOriginalSlides([]);
    setRecommendations(null);
    setDesignRecommendation(null);
    setError(null);
    setDownloadSuccess(false);
  };

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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Sedang Menyusun Master Deck</h3>
            <p className="text-gray-600 text-sm">
              Menganalisis topik &ldquo;{formData.customTitle}&rdquo;, menentukan jumlah slide terbaik, dan menghasilkan copywriting profesional dalam {formData.outputLanguage === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia'}...
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1 flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Base Master <span className="gradient-text">PowerPoint Cerdas</span>
          </h1>
          <p className="text-dark-400 text-sm sm:text-base">
            Hasilkan master PowerPoint hitam-putih berkelas studio dengan copywriting AI dan jumlah slide otomatis.
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

      {/* Stepper Progress Bar (4 STEPS) */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-dark-900/60 shadow-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-brand-500/15 border border-brand-500/40 text-brand-300'
                    : isCompleted
                    ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                    : 'text-dark-500 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-800 text-dark-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">
                    Step {s.id}
                  </span>
                  <span className="text-xs font-semibold truncate text-white">
                    {s.label}
                  </span>
                </div>
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
          onNext={handleProceedToStep2}
          onSaveDraft={handleManualSave}
        />
      )}

      {/* ─── STEP 2: AI Generate ─── */}
      {step === 2 && (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={handleGenerateAI}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 ml-3"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {isGenerating ? (
            <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-6 bg-dark-900/80 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-ping" />
                <div className="w-16 h-16 rounded-full bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">AI Sedang Menyusun Slide Master...</h3>
                <p className="text-sm text-dark-400">
                  Menganalisis topik &ldquo;{formData.customTitle}&rdquo;, menentukan jumlah slide optimal (maksimal 15), dan membuat copywriting dalam {formData.outputLanguage === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia'}.
                </p>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-gradient h-2.5 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          ) : generatedData && slides.length > 0 ? (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-white/10 bg-dark-900/70 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 mb-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Hasil AI Siap ({slides.length} Slide)
                    </span>
                    <h2 className="text-xl font-bold text-white">Rekomendasi Master Telah Dibuat</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate Ulang
                  </button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Font Pairing */}
                  <div className="p-4 rounded-xl bg-dark-800/80 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs">
                      <Type className="w-4 h-4" />
                      <span>Font Pairing AI (Text Toolkit)</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{recommendations?.fonts?.heading || 'Montserrat'}</p>
                      <p className="text-xs text-dark-400">Heading Font</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark-200">{recommendations?.fonts?.body || 'Open Sans'}</p>
                      <p className="text-xs text-dark-400">Body Font</p>
                    </div>
                    <p className="text-[11px] text-dark-400 italic pt-1 border-t border-white/5">
                      &ldquo;{recommendations?.fonts?.rationale}&rdquo;
                    </p>
                  </div>

                  {/* Slide Structure */}
                  <div className="p-4 rounded-xl bg-dark-800/80 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                      <Layers className="w-4 h-4" />
                      <span>Struktur Slide ({slides.length} Slide)</span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {slides.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-dark-900/60 border border-white/5"
                        >
                          <span className="font-medium text-white truncate max-w-[170px]">
                            #{idx + 1} {s.title || s.name || `Slide ${idx + 1}`}
                          </span>
                          <span className="text-[10px] uppercase font-mono text-dark-400">{s.layoutId || s.layout}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Ubah Topik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary flex items-center gap-2 py-3 px-6 text-sm font-semibold shadow-lg shadow-brand-500/25"
                  >
                    <span>Lanjut ke Preview & Edit Slide</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-white/10 text-center space-y-6 bg-dark-900/60 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Siap Generate Master AI</h3>
                <p className="text-sm text-dark-400">
                  AI akan menentukan jumlah slide secara otomatis berdasarkan judul dan deskripsi Anda, menyusun copywriting profesional, dan menerapkan pairing tipografi Base Master.
                </p>
              </div>

              {/* Summary box */}
              <div className="p-4 rounded-xl bg-dark-800/80 border border-white/10 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-dark-400">Judul Presentasi:</span>
                  <span className="text-white font-semibold truncate max-w-[280px]">{formData.customTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Desain:</span>
                  <span className="text-white font-medium">Base Master (Hitam & Putih)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Bahasa Output:</span>
                  <span className="text-brand-300 font-semibold">
                    {formData.outputLanguage === 'en' ? '🇬🇧 Bahasa Inggris (English)' : '🇮🇩 Bahasa Indonesia'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Jumlah Slide:</span>
                  <span className="text-white font-medium">Otomatis oleh AI (Maksimal 15)</span>
                </div>
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

              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-dark-400 hover:text-white inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Detail Topik</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 3: Preview & Edit ─── */}
      {step === 3 && (
        <SlidePreview
          slides={slides}
          originalSlides={originalSlides}
          recommendations={recommendations}
          onEdit={handleSlideEdit}
          onReset={() => {
            setSlides(JSON.parse(JSON.stringify(originalSlides)));
            toast.success('Slide dikembalikan ke rekomendasi awal.');
          }}
          onPrev={() => setStep(2)}
          onNext={() => setStep(4)}
          onSaveDraft={handleManualSave}
        />
      )}

      {/* ─── STEP 4: Download PPTX ─── */}
      {step === 4 && (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-3xl border border-white/15 bg-dark-900/60 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-xl shadow-brand-500/30">
              <Download className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Presentasi Siap Diunduh!</h2>
              <p className="text-sm text-dark-300">
                Master slide <span className="text-white font-semibold">&ldquo;{formData.customTitle}&rdquo;</span> telah siap dalam format Base Master (Hitam & Putih).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-dark-950/60 border border-white/10 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Judul:</span>
                <span className="text-white font-semibold truncate max-w-[280px]">{formData.customTitle}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Desain:</span>
                <span className="text-brand-300 font-medium">Base Master (Hitam & Putih)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Bahasa Output:</span>
                <span className="text-white font-medium">
                  {formData.outputLanguage === 'en' ? 'Bahasa Inggris (English)' : 'Bahasa Indonesia'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Total Slide:</span>
                <span className="text-white font-bold">{slides.length} Slide Deck</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-dark-400">Tipografi:</span>
                <span className="text-dark-300">
                  {recommendations?.fonts?.heading || 'Montserrat'} & {recommendations?.fonts?.body || 'Open Sans'}
                </span>
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
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengekspor Dokumen PPTX...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Master PPTX (.pptx)</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
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
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-brand-400 hover:text-brand-300 underline"
            >
              + Buat Master Presentasi Baru
            </button>
            <span className="text-dark-600">•</span>
            <button
              type="button"
              onClick={() => triggerExit('/dashboard')}
              className="text-xs text-dark-400 hover:text-white underline"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
