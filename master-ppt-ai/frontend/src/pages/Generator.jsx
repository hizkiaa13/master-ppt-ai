import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { pptxService } from '../services/pptx';
import { generateAIContent } from '../services/ai';
import { mapAIResultToSlides } from '../utils/aiMapper';
import { generateFinalPPTX } from '../utils/pptxGenerator';
import { validateSlideDeckBeforeExport } from '../utils/slideContentValidator';
import ThemeSelector from '../components/Generator/ThemeSelector';
import ManualLayoutSelector, { getDefaultLayoutSelections } from '../components/Generator/ManualLayoutSelector';
import SlidePreview from '../components/Generator/SlidePreview';
import ExitConfirmation from '../components/Generator/ExitConfirmation';
import { useDraft } from '../hooks/useDraft';
import toast from 'react-hot-toast';
import {
  Sparkles, Download, Type, Layout, CheckCircle,
  Loader2, Eye, ArrowRight, ArrowLeft, Check,
  RefreshCw, Save, X, Globe, Layers, AlertTriangle,
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
    layoutMode: formData.layoutMode || 'auto',
    layoutSelections: formData.layoutSelections || [],
    currentStep: step,
    status: 'in_progress',
    formData: {
      customTitle: formData.customTitle,
      customDescription: formData.customDescription,
      outputLanguage: formData.outputLanguage || 'id',
      slideCount: formData.slideCount,
      layoutMode: formData.layoutMode || 'auto',
      layoutSelections: formData.layoutSelections || [],
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
          ? 'bg-gray-100 border-gray-200 text-gray-700'
          : 'bg-gray-100 border-gray-200 text-gray-800 shadow-2xs'
      }`}
    >
      {isSaving ? (
        <>
          <span className="w-3 h-3 rounded-full border border-gray-400 border-t-gray-900 animate-spin" />
          Menyimpan draft...
        </>
      ) : (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-gray-800" />
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

  // Form State (mendukung auto & manual layout mode)
  const [formData, setFormData] = useState({
    customTitle: '',
    customDescription: '',
    outputLanguage: 'id',
    slideCount: 5,
    layoutMode: 'auto', // 'auto' | 'manual'
    layoutSelections: getDefaultLayoutSelections(5),
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

  // Download & Validation state
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState([]);

  // Exit confirmation state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitTarget, setExitTarget] = useState(null);

  // Draft hook
  const draft = useDraft();

  // Ref to current state for use in callbacks
  const stateRef = useRef({});
  stateRef.current = { formData, step, slides, originalSlides, recommendations, generatedData };

  // Sinkronisasi jumlah slide ke layoutSelections jika diubah
  useEffect(() => {
    const currentSelections = formData.layoutSelections || [];
    const targetCount = formData.slideCount || 5;

    if (currentSelections.length !== targetCount) {
      const defaultList = getDefaultLayoutSelections(targetCount);
      const updated = defaultList.map((def, i) => {
        if (currentSelections[i]) {
          return { slideNumber: i + 1, layoutId: currentSelections[i].layoutId };
        }
        return def;
      });
      setFormData((prev) => ({ ...prev, layoutSelections: updated }));
    }
  }, [formData.slideCount]); // eslint-disable-line

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
        const restoredSlideCount = data.formData.slideCount || data.slideCount || 5;
        setFormData((prev) => ({
          ...prev,
          customTitle: data.formData.customTitle || data.customTitle || prev.customTitle,
          customDescription: data.formData.customDescription || data.customDescription || prev.customDescription,
          outputLanguage: data.formData.outputLanguage || data.outputLanguage || prev.outputLanguage,
          slideCount: restoredSlideCount,
          layoutMode: data.formData.layoutMode || data.layoutMode || 'auto',
          layoutSelections:
            data.formData.layoutSelections || data.layoutSelections || getDefaultLayoutSelections(restoredSlideCount),
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

      let targetStep = data.currentStep || 1;
      if (targetStep > 4) {
        if (targetStep === 5) targetStep = 3;
        else if (targetStep === 6) targetStep = 4;
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
  }, [formData, slides]); // eslint-disable-line

  // ─── beforeunload Guard ──────────────────────────────────────
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
        layoutMode: formData.layoutMode || 'auto',
        layoutSelections: formData.layoutSelections || [],
      });

      if (response && response.success && response.data) {
        const mappedSlides = mapAIResultToSlides(response.data, formData.outputLanguage || 'id');

        setGeneratedData(response.data);
        setSlides(mappedSlides);
        setOriginalSlides(JSON.parse(JSON.stringify(mappedSlides)));
        setDesignRecommendation(response.data.designRecommendation);
        setRecommendations({
          fonts: response.data.designRecommendation?.fonts,
          layouts: response.data.designRecommendation?.layouts,
        });

        setFormData((prev) => ({
          ...prev,
          slideCount: mappedSlides.length,
        }));

        if (response.isFallback) {
          toast(
            '⚠️ Menggunakan template master cadangan terarah. Anda dapat klik "Regenerate Ulang" kapan saja.',
            { icon: '⚠️', duration: 6000 }
          );
        } else {
          toast.success(
            `Berhasil menghasilkan ${mappedSlides.length} slide (${
              formData.layoutMode === 'manual' ? 'Layout Manual' : 'Auto AI'
            }) dalam ${formData.outputLanguage === 'en' ? 'English' : 'Bahasa Indonesia'}!`
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

  // ─── Final download with History Save & Validation Check ───────────────
  const handleFinalizeAndDownload = async (forceDownload = false) => {
    // Validasi konten slide sebelum unduh
    if (!forceDownload) {
      const validation = validateSlideDeckBeforeExport(slides, formData.customTitle);
      if (!validation.isValid) {
        setValidationWarnings(validation.invalidSlides);
        setShowWarningModal(true);
        return;
      }
    }

    setShowWarningModal(false);
    setIsFinalizing(true);

    try {
      const fileName = `${(formData.customTitle || 'presentasi').replace(/[^a-zA-Z0-9_-]/g, '_')}-master.pptx`;
      let savedHistoryId = masterId;

      // STEP 1: Simpan data ke Riwayat Master (/api/history/save)
      try {
        const saveRes = await pptxService.saveHistory({
          title: formData.customTitle || 'Base Master PowerPoint',
          slideCount: slides.length,
          outputLanguage: formData.outputLanguage || 'id',
          layoutMode: formData.layoutMode || 'auto',
          layoutSelections: formData.layoutSelections || [],
          finalData: slides,
          slides,
        });

        if (saveRes?.success && saveRes?.data?.historyId) {
          savedHistoryId = saveRes.data.historyId;
          setMasterId(savedHistoryId);
        }
      } catch (saveErr) {
        console.warn('Gagal menyimpan riwayat ke backend:', saveErr);
      }

      // STEP 2: Unduh file PPTX
      if (savedHistoryId) {
        try {
          await pptxService.finalize(savedHistoryId, { slides, title: formData.customTitle });
        } catch (finalizeErr) {
          console.warn('Finalize call notice:', finalizeErr.message);
        }
        await pptxService.download(savedHistoryId, fileName, true);
      } else {
        await generateFinalPPTX(slides, recommendations, formData.customTitle);
      }

      setDownloadSuccess(true);
      toast.success('Master berhasil disimpan ke Riwayat & diunduh!');
      await draft.markCompleted();
    } catch (err) {
      console.error('Download error:', err);
      try {
        await generateFinalPPTX(slides, recommendations, formData.customTitle);
        setDownloadSuccess(true);
        toast.success('File PPTX Base Master berhasil diekspor!');
        await draft.markCompleted();
      } catch (clientErr) {
        toast.error('Gagal mengunduh: ' + (clientErr.message || err.message));
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
      layoutMode: 'auto',
      layoutSelections: getDefaultLayoutSelections(5),
    });
    setGeneratedData(null);
    setSlides([]);
    setOriginalSlides([]);
    setRecommendations(null);
    setDesignRecommendation(null);
    setError(null);
    setDownloadSuccess(false);
    setShowWarningModal(false);
    setValidationWarnings([]);
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

      {/* Validation Warning Modal Sebelum Ekspor PPTX */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 max-w-lg w-full text-left shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Peringatan Kualitas Slide</h3>
                <p className="text-xs text-gray-500">
                  Ditemukan {validationWarnings.length} slide yang masih kosong atau berupa dummy text.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 max-h-48 overflow-y-auto space-y-2 text-xs">
              {validationWarnings.map((item, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                  <span className="font-semibold text-gray-900">Slide #{item.slideNumber}:</span>{' '}
                  <span className="text-gray-800 font-medium">{item.slideTitle}</span>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-0.5">
                    {item.reasons.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Anda disarankan mengedit slide tersebut terlebih dahulu agar hasil presentasi 100% siap pakai.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowWarningModal(false);
                  setStep(3); // kembali ke preview & edit
                }}
                className="w-full sm:w-auto btn-primary py-2.5 px-4 text-xs font-semibold"
              >
                ✏️ Perbaiki di Editor Slide
              </button>
              <button
                type="button"
                onClick={() => handleFinalizeAndDownload(true)}
                className="w-full sm:w-auto btn-secondary py-2.5 px-4 text-xs text-gray-600 hover:text-gray-900"
              >
                Tetap Unduh dengan Peringatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI Sedang Menyusun Master Deck</h3>
            <p className="text-gray-600 text-sm">
              Menganalisis topik &ldquo;{formData.customTitle}&rdquo;,{' '}
              {formData.layoutMode === 'manual'
                ? 'menerapkan layout pilihan Anda,'
                : 'menentukan jumlah slide terbaik,'}{' '}
              dan menghasilkan copywriting bebas dummy text dalam {formData.outputLanguage === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia'}...
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Base Master PowerPoint Cerdas
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            Hasilkan master PowerPoint hitam-putih berkelas studio dengan copywriting AI bebas dummy text dan pilihan mode layout.
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
            className="btn-ghost text-xs py-2 px-2.5 flex items-center gap-1 text-gray-500 hover:text-gray-900"
            title="Kembali ke Dashboard"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar (4 STEPS) */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STEPS.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            const labelText =
              s.id === 2 && formData.layoutMode === 'manual'
                ? 'Pilih Layout & AI'
                : s.label;

            return (
              <div
                key={s.id}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-gray-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-gray-100 text-gray-900 border border-gray-200'
                    : 'text-gray-400 bg-gray-50 border border-gray-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-white text-gray-900'
                      : isCompleted
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-[9px] uppercase font-mono tracking-wider ${isCurrent ? 'text-gray-300' : 'text-gray-400'}`}>
                    Step {s.id}
                  </span>
                  <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {labelText}
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

      {/* ─── STEP 2: Generate AI / Manual Layout Selector ─── */}
      {step === 2 && (
        <div className="space-y-8 animate-fade-in">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center justify-between max-w-2xl mx-auto">
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
            <div className="bg-white p-10 sm:p-12 rounded-2xl border border-gray-200 text-center space-y-6 shadow-sm max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gray-900 mx-auto flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">AI Sedang Menyusun Slide Master...</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Menganalisis topik &ldquo;{formData.customTitle}&rdquo;,{' '}
                  {formData.layoutMode === 'manual'
                    ? 'menerapkan layout yang Anda tentukan,'
                    : 'menentukan variasi layout terbaik,'}{' '}
                  dan memastikan copywriting bebas dummy text ({formData.outputLanguage === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia'}).
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gray-900 h-2 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          ) : formData.layoutMode === 'manual' && !generatedData ? (
            /* Mode Manual: Tampilkan Pemilih Layout per Slide */
            <ManualLayoutSelector
              slideCount={formData.slideCount || 5}
              layoutSelections={formData.layoutSelections}
              onUpdateLayoutSelections={(newSelections) =>
                setFormData((prev) => ({ ...prev, layoutSelections: newSelections }))
              }
              onBack={() => setStep(1)}
              onGenerate={handleGenerateAI}
              userTitle={formData.customTitle}
              outputLanguage={formData.outputLanguage || 'id'}
            />
          ) : generatedData && slides.length > 0 ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-gray-900" />
                      Hasil AI Siap ({slides.length} Slide)
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">Rekomendasi Master Telah Dibuat</h2>
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
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs">
                      <Type className="w-4 h-4" />
                      <span>Font Pairing AI (Text Toolkit)</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{recommendations?.fonts?.heading || 'Montserrat'}</p>
                      <p className="text-xs text-gray-500">Heading Font</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{recommendations?.fonts?.body || 'Open Sans'}</p>
                      <p className="text-xs text-gray-500">Body Font</p>
                    </div>
                    <p className="text-[11px] text-gray-500 italic pt-1 border-t border-gray-200">
                      &ldquo;{recommendations?.fonts?.rationale}&rdquo;
                    </p>
                  </div>

                  {/* Slide Structure */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs">
                      <Layers className="w-4 h-4" />
                      <span>Struktur Slide ({slides.length} Slide)</span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {slides.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white border border-gray-200"
                        >
                          <span className="font-medium text-gray-900 truncate max-w-[170px]">
                            #{idx + 1} {s.title || s.name || `Slide ${idx + 1}`}
                          </span>
                          <span className="text-[10px] uppercase font-mono text-gray-500">{s.layoutId || s.layout}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
            /* Mode Auto: Tampilkan Konfirmasi Generate */
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-6 shadow-xs max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-xl bg-gray-900 mx-auto flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-7 h-7 text-white" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900">Siap Generate Master AI</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  AI akan menentukan variasi layout paling pas, menyusun copywriting materi nyata bebas dummy text, dan menerapkan tipografi Base Master.
                </p>
              </div>

              {/* Summary box */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Judul Presentasi:</span>
                  <span className="text-gray-900 font-semibold truncate max-w-[280px]">{formData.customTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode Layout:</span>
                  <span className="text-gray-900 font-semibold">Auto Generate AI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Desain:</span>
                  <span className="text-gray-900 font-medium">Base Master (Hitam & Putih)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bahasa Output:</span>
                  <span className="text-gray-900 font-semibold">
                    {formData.outputLanguage === 'en' ? '🇬🇧 Bahasa Inggris (English)' : '🇮🇩 Bahasa Indonesia'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Slide:</span>
                  <span className="text-gray-900 font-semibold">{formData.slideCount || 5} Slide</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Mulai Generate dengan AI</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 font-medium"
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
        <div className="space-y-6 animate-fade-in max-w-[500px] mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-5">
            {/* Thumbnail Preview Slide 1 */}
            <div className="w-full aspect-[16/9] bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col justify-center items-center text-center shadow-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold mb-1">
                Slide 1 (Cover Depan)
              </span>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 px-2">
                {formData.customTitle || slides[0]?.title || 'Judul Presentasi'}
              </h3>
              {slides[0]?.subtitle && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 px-4">
                  {slides[0]?.subtitle}
                </p>
              )}
              <span className="text-[10px] text-gray-400 mt-2 font-medium">
                ⚪ Base Master (Hitam & Putih)
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">Presentasi Siap Diunduh!</h2>
              <p className="text-xs text-gray-500">
                Master slide <span className="text-gray-900 font-semibold">&ldquo;{formData.customTitle}&rdquo;</span> telah selesai diproses.
              </p>
            </div>

            {/* Ringkasan Presentasi */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Judul:</span>
                <span className="text-gray-900 font-semibold truncate max-w-[220px]">{formData.customTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Jumlah Slide:</span>
                <span className="text-gray-900 font-semibold">{slides.length} Slide Deck</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Bahasa Output:</span>
                <span className="text-gray-900 font-medium">
                  {formData.outputLanguage === 'en' ? 'Bahasa Inggris (English)' : 'Bahasa Indonesia'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tanggal Dibuat:</span>
                <span className="text-gray-900 font-medium">
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Keterangan Otomatis Tersimpan ke Riwayat */}
            <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5 bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-200">
              <span>ℹ</span>
              <span>File akan otomatis tersimpan ke Riwayat Master saat diunduh</span>
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={isFinalizing}
                onClick={() => handleFinalizeAndDownload(false)}
                className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isFinalizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mengekspor Dokumen PPTX...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Download PPTX</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-secondary w-full py-2.5 text-xs text-gray-700 font-medium"
              >
                ← Kembali ke Editor Slide
              </button>
            </div>

            {downloadSuccess && (
              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>File PPTX berhasil diunduh dan tersimpan ke Riwayat Master!</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="w-full btn-secondary py-2 text-xs flex items-center justify-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-gray-700" />
                  <span>Buka Riwayat Master</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-gray-900 hover:text-gray-600 underline font-semibold"
            >
              + Buat Presentasi Baru
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => triggerExit('/dashboard')}
              className="text-xs text-gray-500 hover:text-gray-900 underline"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
