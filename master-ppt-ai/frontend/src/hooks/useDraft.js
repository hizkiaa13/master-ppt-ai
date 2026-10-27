import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { draftService } from '../services/draft';

const AUTO_SAVE_INTERVAL_MS = 30 * 1000; // 30 seconds

/**
 * useDraft hook - manages draft lifecycle for the Generator page
 *
 * Usage:
 *   const draft = useDraft();
 *   draft.draftId            // current draft ID (null if not saved yet)
 *   draft.lastSavedAt        // Date object of last save (null if never saved)
 *   draft.isSaving           // true while save request is in-flight
 *   draft.save(payload)      // manually trigger save
 *   draft.initDraft(id)      // load an existing draft by ID
 *   draft.markCompleted()    // set status to 'completed'
 */
export function useDraft() {
  const [draftId, setDraftId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Keep a ref to the current draftId so auto-save closure doesn't go stale
  const draftIdRef = useRef(null);
  useEffect(() => { draftIdRef.current = draftId; }, [draftId]);

  // Pending payload ref for auto-save coalescence
  const pendingPayloadRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  /**
   * Core save function - debounced by pendingPayload pattern
   */
  const save = useCallback(async (payload) => {
    if (!payload) return null;
    setIsSaving(true);
    setSaveError(null);
    try {
      const currentId = draftIdRef.current;
      const res = await draftService.save(currentId, payload);
      if (res.success) {
        const newId = res.data?.id || currentId;
        setDraftId(newId);
        draftIdRef.current = newId;
        setLastSavedAt(new Date());
        pendingPayloadRef.current = null;
        return newId;
      } else {
        throw new Error(res.message || 'Gagal menyimpan draft');
      }
    } catch (err) {
      setSaveError(err.message);
      console.error('[useDraft] save error:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Schedule an auto-save 30s after the last change
   */
  const scheduleSave = useCallback((payload) => {
    pendingPayloadRef.current = payload;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      const p = pendingPayloadRef.current;
      if (!p) return;
      const savedId = await save(p);
      if (savedId) {
        toast.success('Draft otomatis tersimpan', {
          id: 'auto-save',
          duration: 2000,
          icon: '💾',
          style: { fontSize: '13px' },
        });
      }
    }, AUTO_SAVE_INTERVAL_MS);
  }, [save]);

  /**
   * Manual save - saves immediately and shows toast
   */
  const saveNow = useCallback(async (payload) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    pendingPayloadRef.current = null;

    const toastId = toast.loading('Menyimpan draft...', { duration: 10000 });
    const savedId = await save(payload);
    if (savedId) {
      toast.success('Draft tersimpan!', { id: toastId, duration: 2500, icon: '✅' });
    } else {
      toast.error('Gagal menyimpan draft.', { id: toastId, duration: 3000 });
    }
    return savedId;
  }, [save]);

  /**
   * Load draft data from server
   */
  const loadDraft = useCallback(async (id) => {
    try {
      const res = await draftService.getById(id);
      if (res.success && res.data) {
        setDraftId(id);
        draftIdRef.current = id;
        return res.data;
      }
    } catch (err) {
      console.error('[useDraft] loadDraft error:', err);
    }
    return null;
  }, []);

  /**
   * Mark draft as completed on final download
   */
  const markCompleted = useCallback(async () => {
    const currentId = draftIdRef.current;
    if (!currentId) return;
    try {
      await draftService.update(currentId, { status: 'completed' });
    } catch (err) {
      console.error('[useDraft] markCompleted error:', err);
    }
  }, []);

  /**
   * Delete draft
   */
  const deleteDraft = useCallback(async (id) => {
    try {
      await draftService.delete(id || draftIdRef.current);
      if (!id || id === draftIdRef.current) {
        setDraftId(null);
        draftIdRef.current = null;
        setLastSavedAt(null);
      }
      return true;
    } catch (err) {
      console.error('[useDraft] deleteDraft error:', err);
      return false;
    }
  }, []);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const [drafts, setDrafts] = useState([]);
  const [currentDraft, setCurrentDraft] = useState(null);

  const loadDrafts = useCallback(async () => {
    try {
      const res = await draftService.getAll();
      if (res.success && res.data) {
        setDrafts(res.data);
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
    }
  }, []);

  const createDraft = useCallback(async (initialData) => {
    try {
      const res = await draftService.create(initialData);
      if (res.success) {
        setDraftId(res.data.id);
        draftIdRef.current = res.data.id;
        setCurrentDraft({ id: res.data.id, data: initialData });
        return res.data.id;
      }
    } catch (err) {
      console.error('Failed to create draft:', err);
      return null;
    }
  }, []);

  const resumeDraft = useCallback((id) => {
    window.location.href = `/generator?draft=${id}`;
  }, []);

  const deleteDraftById = useCallback(async (id) => {
    try {
      await draftService.delete(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success('Draft dihapus');
    } catch (err) {
      toast.error('Gagal menghapus draft');
    }
  }, []);

  const saveCurrentDraft = useCallback(async (payload) => {
    return saveNow(payload || pendingPayloadRef.current);
  }, [saveNow]);

  return {
    draftId,
    drafts,
    currentDraft,
    isSaving,
    lastSavedAt,
    saveError,
    save,
    saveNow,
    saveCurrentDraft,
    scheduleSave,
    loadDraft,
    loadDrafts,
    createDraft,
    resumeDraft,
    markCompleted,
    deleteDraft,
    deleteDraftById,
  };
}
